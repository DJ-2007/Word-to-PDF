export type FileCategory =
  | 'pdf'
  | 'document'
  | 'image'
  | 'spreadsheet'
  | 'presentation'
  | 'data'
  | 'utility';

export type JobStatus =
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'converting'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'expired';

export type ErrorCode =
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'
  | 'INVALID_FILE'
  | 'CONVERSION_FAILED'
  | 'CONVERSION_TIMEOUT'
  | 'STORAGE_ERROR'
  | 'RATE_LIMITED'
  | 'JOB_EXPIRED'
  | 'CORRUPT_INPUT'
  | 'UNSUPPORTED_CONVERSION';

export interface FileFormatDefinition {
  extension: string;
  name: string;
  mimeType: string;
  category: FileCategory;
  magicBytes?: number[];
  inputSupported: boolean;
  outputSupported: boolean;
  description: string;
}

export interface ConversionToolDefinition {
  slug: string;
  name: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  category: FileCategory;
  inputFormats: string[];
  outputFormats: string[];
  defaultOutputFormat: string;
  allowMultiple: boolean;
  maxFiles?: number;
  options?: ToolOption[];
  howItWorks: string[];
  faqs: { question: string; answer: string }[];
  popular?: boolean;
}

export interface ToolOption {
  id: string;
  label: string;
  type: 'select' | 'range' | 'boolean' | 'radio';
  defaultValue: string | number | boolean;
  options?: { label: string; value: string | number }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface ConversionJob {
  id: string;
  slug: string;
  status: JobStatus;
  progress: number; // 0 - 100
  statusMessage: string;
  inputFiles: {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    storedPath: string;
  }[];
  outputFile?: {
    filename: string;
    size: number;
    mimeType: string;
    storedPath: string;
    isZip?: boolean;
  };
  options: Record<string, any>;
  createdAt: number;
  completedAt?: number;
  expiresAt: number;
  errorCode?: ErrorCode;
  errorMessage?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
  };
}
