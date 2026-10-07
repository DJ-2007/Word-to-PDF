import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { ConversionAdapter, ConvertedOutput } from '../types';
import { ConversionJob } from '@/types';
import { getOutputPath, createZipArchive } from '@/lib/storage';

import { getToolBySlug } from '@/lib/format-registry';

export class ImageAdapter implements ConversionAdapter {
  name = 'SharpImageAdapter';

  private supportedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'];

  canHandle(slug: string, inputExts: string[], outputExt: string): boolean {
    const isImageOutput = this.supportedExtensions.includes(outputExt.toLowerCase());
    const areImageInputs = inputExts.every((ext) =>
      this.supportedExtensions.includes(ext.toLowerCase())
    );

    // If both input and output are images, Sharp handles it
    return areImageInputs && isImageOutput && slug !== 'jpg-to-pdf' && slug !== 'png-to-pdf' && slug !== 'images-to-pdf';
  }

  async convert(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput> {
    const { inputFiles, options, slug } = job;
    const toolDef = getToolBySlug(slug);
    const outputFormat = (
      options.outputFormat ||
      toolDef?.defaultOutputFormat ||
      (slug.includes('-to-') ? slug.split('-to-').pop() : 'jpg') ||
      'jpg'
    ).toLowerCase();
    const quality = options.quality ? parseInt(options.quality, 10) : 90;

    onProgress?.(30, 'Processing image formats...');

    // Single file conversion
    if (inputFiles.length === 1) {
      const input = inputFiles[0];
      const baseName = path.parse(input.originalName).name;
      const targetFilename = `${baseName}.${outputFormat}`;
      const { fullPath } = getOutputPath(targetFilename);

      let pipeline = sharp(input.storedPath);

      // If converting to JPG, flatten alpha transparency with clean white
      if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
        pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality });
      } else if (outputFormat === 'png') {
        pipeline = pipeline.png({ compressionLevel: 8 });
      } else if (outputFormat === 'webp') {
        pipeline = pipeline.webp({ quality });
      } else if (outputFormat === 'avif') {
        pipeline = pipeline.avif({ quality });
      }

      onProgress?.(60, 'Encoding output file...');
      await pipeline.toFile(fullPath);

      const stats = await fs.promises.stat(fullPath);
      onProgress?.(90, 'Finalizing image...');

      return {
        filename: targetFilename,
        path: fullPath,
        mimeType: `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`,
        size: stats.size,
        isZip: false,
      };
    }

    // Batch conversion: convert each image and package into ZIP
    onProgress?.(40, `Converting ${inputFiles.length} images...`);
    const convertedItems: { filename: string; path: string }[] = [];

    for (let i = 0; i < inputFiles.length; i++) {
      const input = inputFiles[i];
      const baseName = path.parse(input.originalName).name;
      const targetFilename = `${baseName}_converted.${outputFormat}`;
      const { fullPath } = getOutputPath(targetFilename);

      let pipeline = sharp(input.storedPath);
      if (outputFormat === 'jpg' || outputFormat === 'jpeg') {
        pipeline = pipeline.flatten({ background: '#ffffff' }).jpeg({ quality });
      } else if (outputFormat === 'png') {
        pipeline = pipeline.png();
      } else if (outputFormat === 'webp') {
        pipeline = pipeline.webp({ quality });
      }

      await pipeline.toFile(fullPath);
      convertedItems.push({ filename: targetFilename, path: fullPath });

      const pct = Math.round(40 + (i / inputFiles.length) * 45);
      onProgress?.(pct, `Converted image ${i + 1} of ${inputFiles.length}...`);
    }

    onProgress?.(90, 'Creating ZIP archive...');
    const zipResult = await createZipArchive(convertedItems, 'converted_images.zip');

    return {
      filename: 'converted_images.zip',
      path: zipResult.path,
      mimeType: 'application/zip',
      size: zipResult.size,
      isZip: true,
    };
  }
}
