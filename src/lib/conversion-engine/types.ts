import { ConversionJob } from '@/types';

export interface ConvertedOutput {
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  isZip?: boolean;
}

export interface ConversionAdapter {
  name: string;
  canHandle(slug: string, inputExts: string[], outputExt: string): boolean;
  convert(
    job: ConversionJob,
    onProgress?: (progress: number, message: string) => void
  ): Promise<ConvertedOutput>;
}
