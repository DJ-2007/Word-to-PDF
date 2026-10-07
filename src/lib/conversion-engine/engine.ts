import { ConversionJob } from '@/types';
import { ConversionAdapter, ConvertedOutput } from './types';
import { ImageAdapter } from './adapters/image-adapter';
import { PdfManipulationAdapter } from './adapters/pdf-manipulation-adapter';
import { SpreadsheetAdapter } from './adapters/spreadsheet-adapter';
import { PythonBridgeAdapter } from './adapters/python-bridge-adapter';
import { updateJobStatus } from '@/lib/jobs';
import { getToolBySlug } from '@/lib/format-registry';

export class ConversionEngine {
  private adapters: ConversionAdapter[] = [];

  constructor() {
    // Register adapters in priority order
    this.adapters.push(new ImageAdapter());
    this.adapters.push(new PdfManipulationAdapter());
    this.adapters.push(new SpreadsheetAdapter());
    this.adapters.push(new PythonBridgeAdapter());
  }

  private findAdapter(
    slug: string,
    inputExts: string[],
    outputExt: string
  ): ConversionAdapter | undefined {
    return this.adapters.find((adapter) => adapter.canHandle(slug, inputExts, outputExt));
  }

  async processJob(job: ConversionJob): Promise<ConvertedOutput> {
    try {
      updateJobStatus(job.id, 'processing', 20, 'Analyzing file headers and initializing engine...');

      const inputExts = job.inputFiles.map((f) =>
        f.originalName.split('.').pop()?.toLowerCase() || ''
      );
      const toolDef = getToolBySlug(job.slug);
      const outputExt = (
        job.options.outputFormat ||
        toolDef?.defaultOutputFormat ||
        (job.slug.includes('-to-') ? job.slug.split('-to-').pop() : 'pdf') ||
        'pdf'
      ).toLowerCase();

      const adapter = this.findAdapter(job.slug, inputExts, outputExt);

      if (!adapter) {
        throw new Error(
          `No converter adapter found for tool '${job.slug}' with formats [${inputExts.join(', ')}] -> ${outputExt}`
        );
      }

      updateJobStatus(job.id, 'converting', 40, `Converting via ${adapter.name}...`);

      const result = await adapter.convert(job, (progress, message) => {
        updateJobStatus(job.id, 'converting', progress, message);
      });

      updateJobStatus(job.id, 'finalizing', 95, 'Finalizing output file...');

      updateJobStatus(job.id, 'completed', 100, 'Your file is ready for download.', {
        outputFile: {
          filename: result.filename,
          size: result.size,
          mimeType: result.mimeType,
          storedPath: result.path,
          isZip: result.isZip,
        },
      });

      return result;
    } catch (err: any) {
      console.error(`Conversion error in job ${job.id}:`, err);
      updateJobStatus(job.id, 'failed', 0, 'Conversion failed.', {
        errorCode: 'CONVERSION_FAILED',
        errorMessage: err.message || 'An unexpected error occurred during file conversion.',
      });
      throw err;
    }
  }
}

// Global singleton instance
const globalForEngine = global as unknown as {
  conversionEngineInstance: ConversionEngine;
};

export const conversionEngine =
  globalForEngine.conversionEngineInstance || new ConversionEngine();
if (process.env.NODE_ENV !== 'production') {
  globalForEngine.conversionEngineInstance = conversionEngine;
}
