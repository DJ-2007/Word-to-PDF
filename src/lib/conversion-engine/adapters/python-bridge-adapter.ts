import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { ConversionAdapter, ConvertedOutput } from '../types';
import { ConversionJob } from '@/types';
import { runPythonService } from '@/lib/python-runner';
import { getOutputPath, createZipArchive } from '@/lib/storage';
import { APP_CONFIG } from '@/config';

const execFileAsync = promisify(execFile);

export class PythonBridgeAdapter implements ConversionAdapter {
  name = 'PythonBridgeAdapter';

  private pythonSlugs = [
    'pdf-to-word',
    'pdf-to-jpg',
    'pdf-to-png',
    'pdf-to-txt',
    'pdf-to-html',
    'compress-pdf',
    'word-to-pdf',
    'powerpoint-to-pdf',
    'excel-to-pdf',
    'csv-to-pdf',
    'txt-to-pdf',
    'markdown-to-pdf',
    'html-to-pdf',
  ];

  canHandle(slug: string, _inputExts: string[], _outputExt: string): boolean {
    return this.pythonSlugs.includes(slug);
  }

  async convert(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput> {
    const { slug, inputFiles, options } = job;
    const input = inputFiles[0];
    const baseName = path.parse(input.originalName).name;

    switch (slug) {
      case 'pdf-to-word': {
        onProgress?.(30, 'Reconstructing document layout and paragraphs...');
        const targetFilename = `${baseName}.docx`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('pdf_to_docx', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        onProgress?.(100, 'Word document generated.');
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          size: stats.size,
          isZip: false,
        };
      }

      case 'pdf-to-jpg':
      case 'pdf-to-png': {
        const fmt = slug === 'pdf-to-jpg' ? 'jpg' : 'png';
        const dpi = options.dpi ? parseInt(options.dpi, 10) : 150;
        onProgress?.(35, `Rendering PDF pages to high-resolution ${fmt.toUpperCase()}...`);

        const tempOutputDir = path.join(
          APP_CONFIG.tempStorageDir,
          'outputs',
          `pages_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
        );

        const result: { page_count: number; files: { page: number; filename: string; path: string; size: number }[] } =
          await runPythonService('pdf_to_images', {
            input_path: input.storedPath,
            output_dir: tempOutputDir,
            format: fmt,
            dpi,
          });

        if (result.files.length === 1) {
          const single = result.files[0];
          const targetFilename = `${baseName}_page_1.${fmt}`;
          const { fullPath } = getOutputPath(targetFilename);
          await fs.promises.copyFile(single.path, fullPath);
          const stats = await fs.promises.stat(fullPath);

          return {
            filename: targetFilename,
            path: fullPath,
            mimeType: `image/${fmt === 'jpg' ? 'jpeg' : fmt}`,
            size: stats.size,
            isZip: false,
          };
        }

        onProgress?.(80, `Archiving ${result.files.length} rendered pages into ZIP...`);
        const zipResult = await createZipArchive(
          result.files.map((f) => ({ filename: f.filename, path: f.path })),
          `${baseName}_pages_${fmt}.zip`
        );

        return {
          filename: `${baseName}_pages_${fmt}.zip`,
          path: zipResult.path,
          mimeType: 'application/zip',
          size: zipResult.size,
          isZip: true,
        };
      }

      case 'pdf-to-txt': {
        onProgress?.(40, 'Extracting document text and Unicode strings...');
        const targetFilename = `${baseName}.txt`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('pdf_to_text', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'text/plain',
          size: stats.size,
          isZip: false,
        };
      }

      case 'pdf-to-html': {
        onProgress?.(40, 'Converting document to structured HTML...');
        const targetFilename = `${baseName}.html`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('pdf_to_html', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'text/html',
          size: stats.size,
          isZip: false,
        };
      }

      case 'compress-pdf': {
        onProgress?.(35, 'Optimizing streams and recompressing PDF...');
        const targetFilename = `${baseName}_compressed.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        const result: { original_size: number; compressed_size: number; reduction_percentage: number } =
          await runPythonService('pdf_compress', {
            input_path: input.storedPath,
            output_path: fullPath,
            level: options.level || 'medium',
          });

        onProgress?.(95, `Compressed by ${result.reduction_percentage}%`);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: result.compressed_size,
          isZip: false,
        };
      }

      case 'word-to-pdf': {
        onProgress?.(40, 'Converting Word document to PDF layout...');
        const targetFilename = `${baseName}.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('docx_to_pdf', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: stats.size,
          isZip: false,
        };
      }

      case 'powerpoint-to-pdf': {
        onProgress?.(40, 'Rendering presentation slides into PDF...');
        const targetFilename = `${baseName}.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('pptx_to_pdf', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: stats.size,
          isZip: false,
        };
      }

      case 'excel-to-pdf': {
        onProgress?.(40, 'Converting spreadsheet tables to PDF report...');
        const targetFilename = `${baseName}.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('xlsx_to_pdf', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: stats.size,
          isZip: false,
        };
      }

      case 'csv-to-pdf': {
        onProgress?.(40, 'Generating tabular PDF document from CSV...');
        const targetFilename = `${baseName}.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('csv_to_pdf', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: stats.size,
          isZip: false,
        };
      }

      case 'txt-to-pdf': {
        onProgress?.(40, 'Formatting plain text to PDF pages...');
        const targetFilename = `${baseName}.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('txt_to_pdf', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: stats.size,
          isZip: false,
        };
      }

      case 'markdown-to-pdf': {
        onProgress?.(40, 'Parsing markdown and rendering publication PDF...');
        const targetFilename = `${baseName}.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        await runPythonService('markdown_to_pdf', {
          input_path: input.storedPath,
          output_path: fullPath,
        });

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: stats.size,
          isZip: false,
        };
      }

      case 'html-to-pdf': {
        onProgress?.(40, 'Printing HTML document to PDF...');
        const targetFilename = `${baseName}.pdf`;
        const { fullPath } = getOutputPath(targetFilename);

        // If Edge browser exists, use headless printing for pixel-perfect fidelity
        if (fs.existsSync(APP_CONFIG.edgePath)) {
          const fileUri = `file:///${input.storedPath.replace(/\\/g, '/')}`;
          await execFileAsync(APP_CONFIG.edgePath, [
            '--headless',
            '--disable-gpu',
            `--print-to-pdf=${fullPath}`,
            '--no-pdf-header-footer',
            fileUri,
          ]);
        } else {
          // Fallback to text / reportlab
          await runPythonService('txt_to_pdf', {
            input_path: input.storedPath,
            output_path: fullPath,
          });
        }

        const stats = await fs.promises.stat(fullPath);
        return {
          filename: targetFilename,
          path: fullPath,
          mimeType: 'application/pdf',
          size: stats.size,
          isZip: false,
        };
      }

      default:
        throw new Error(`Unsupported conversion tool: ${slug}`);
    }
  }
}
