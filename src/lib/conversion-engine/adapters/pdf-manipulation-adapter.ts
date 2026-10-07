import { PDFDocument, rgb } from 'pdf-lib';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ConversionAdapter, ConvertedOutput } from '../types';
import { ConversionJob } from '@/types';
import { getOutputPath, createZipArchive } from '@/lib/storage';

export class PdfManipulationAdapter implements ConversionAdapter {
  name = 'PdfLibManipulationAdapter';

  canHandle(slug: string, inputExts: string[], outputExt: string): boolean {
    const isImageToPdf =
      (slug === 'jpg-to-pdf' || slug === 'png-to-pdf' || slug === 'images-to-pdf') &&
      outputExt.toLowerCase() === 'pdf';

    const isMergePdf = slug === 'merge-pdf';
    const isSplitPdf = slug === 'split-pdf';

    return isImageToPdf || isMergePdf || isSplitPdf;
  }

  async convert(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput> {
    const { slug, inputFiles, options } = job;

    if (slug === 'merge-pdf') {
      return this.handleMergePdf(job, onProgress);
    }

    if (slug === 'split-pdf') {
      return this.handleSplitPdf(job, onProgress);
    }

    // Default: Image(s) to PDF
    return this.handleImagesToPdf(job, onProgress);
  }

  private async handleImagesToPdf(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput> {
    const { inputFiles, options } = job;
    onProgress?.(25, 'Initializing PDF document...');

    const pdfDoc = await PDFDocument.create();
    const pageSize = options.pageSize || 'a4';
    const orientation = options.orientation || 'portrait';
    const marginOption = options.margin || 'none';

    let margin = 0;
    if (marginOption === 'small') margin = 15;
    else if (marginOption === 'big' || marginOption === 'standard') margin = 30;

    // Dimensions in standard PDF points (72 points = 1 inch)
    let standardWidth = 595.28; // A4 portrait
    let standardHeight = 841.89;

    if (pageSize === 'letter') {
      standardWidth = 612;
      standardHeight = 792;
    }

    if (orientation === 'landscape') {
      const temp = standardWidth;
      standardWidth = standardHeight;
      standardHeight = temp;
    }

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      onProgress?.(
        Math.round(25 + (i / inputFiles.length) * 55),
        `Processing image ${i + 1} of ${inputFiles.length}...`
      );

      // Pre-process image with sharp to guarantee standard PNG/JPEG buffer
      const imageMetadata = await sharp(file.storedPath).metadata();
      const isPng = file.mimeType === 'image/png' || file.storedPath.endsWith('.png');

      let embeddedImage;
      if (isPng) {
        const pngBuffer = await sharp(file.storedPath).png().toBuffer();
        embeddedImage = await pdfDoc.embedPng(pngBuffer);
      } else {
        const jpgBuffer = await sharp(file.storedPath).jpeg({ quality: 95 }).toBuffer();
        embeddedImage = await pdfDoc.embedJpg(jpgBuffer);
      }

      let pageWidth = standardWidth;
      let pageHeight = standardHeight;

      if (pageSize === 'fit' && imageMetadata.width && imageMetadata.height) {
        pageWidth = imageMetadata.width;
        pageHeight = imageMetadata.height;
      }

      const page = pdfDoc.addPage([pageWidth, pageHeight]);

      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;

      // Scale proportionally to fit within available space
      const imgWidth = embeddedImage.width;
      const imgHeight = embeddedImage.height;

      const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
      const renderWidth = imgWidth * scale;
      const renderHeight = imgHeight * scale;

      const x = margin + (availableWidth - renderWidth) / 2;
      const y = margin + (availableHeight - renderHeight) / 2;

      page.drawImage(embeddedImage, {
        x,
        y,
        width: renderWidth,
        height: renderHeight,
      });
    }

    onProgress?.(85, 'Saving compiled PDF document...');
    const pdfBytes = await pdfDoc.save();

    const outputName =
      inputFiles.length === 1
        ? `${path.parse(inputFiles[0].originalName).name}.pdf`
        : 'combined_images.pdf';

    const { fullPath } = getOutputPath(outputName);
    await fs.promises.writeFile(fullPath, pdfBytes);

    onProgress?.(100, 'PDF ready for download.');
    return {
      filename: outputName,
      path: fullPath,
      mimeType: 'application/pdf',
      size: pdfBytes.length,
      isZip: false,
    };
  }

  private async handleMergePdf(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput> {
    const { inputFiles } = job;
    onProgress?.(20, 'Creating merged PDF document...');

    const mergedPdf = await PDFDocument.create();

    for (let i = 0; i < inputFiles.length; i++) {
      onProgress?.(
        Math.round(20 + (i / inputFiles.length) * 60),
        `Merging document ${i + 1} of ${inputFiles.length}...`
      );

      const fileData = await fs.promises.readFile(inputFiles[i].storedPath);
      const sourcePdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
      const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());

      for (const page of copiedPages) {
        mergedPdf.addPage(page);
      }
    }

    onProgress?.(85, 'Finalizing merged file...');
    const mergedBytes = await mergedPdf.save();

    const targetName = 'merged_documents.pdf';
    const { fullPath } = getOutputPath(targetName);
    await fs.promises.writeFile(fullPath, mergedBytes);

    return {
      filename: targetName,
      path: fullPath,
      mimeType: 'application/pdf',
      size: mergedBytes.length,
      isZip: false,
    };
  }

  private async handleSplitPdf(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput> {
    const { inputFiles } = job;
    const input = inputFiles[0];
    onProgress?.(25, 'Loading source PDF pages...');

    const fileData = await fs.promises.readFile(input.storedPath);
    const sourcePdf = await PDFDocument.load(fileData, { ignoreEncryption: true });
    const pageCount = sourcePdf.getPageCount();

    if (pageCount === 0) {
      throw new Error('PDF file has no pages to split.');
    }

    const baseName = path.parse(input.originalName).name;
    const generatedPages: { filename: string; path: string }[] = [];

    for (let i = 0; i < pageCount; i++) {
      onProgress?.(
        Math.round(25 + (i / pageCount) * 55),
        `Extracting page ${i + 1} of ${pageCount}...`
      );

      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(sourcePdf, [i]);
      newDoc.addPage(copiedPage);

      const pageBytes = await newDoc.save();
      const pageFilename = `${baseName}_page_${i + 1}.pdf`;
      const { fullPath } = getOutputPath(pageFilename);

      await fs.promises.writeFile(fullPath, pageBytes);
      generatedPages.push({ filename: pageFilename, path: fullPath });
    }

    // If only 1 page was in the document, return it directly
    if (generatedPages.length === 1) {
      const single = generatedPages[0];
      const stats = await fs.promises.stat(single.path);
      return {
        filename: single.filename,
        path: single.path,
        mimeType: 'application/pdf',
        size: stats.size,
        isZip: false,
      };
    }

    onProgress?.(85, 'Packaging pages into ZIP...');
    const zipResult = await createZipArchive(generatedPages, `${baseName}_split_pages.zip`);

    return {
      filename: `${baseName}_split_pages.zip`,
      path: zipResult.path,
      mimeType: 'application/zip',
      size: zipResult.size,
      isZip: true,
    };
  }
}
