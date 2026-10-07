import path from 'path';

export const APP_CONFIG = {
  name: 'Convertly',
  tagline: 'Universal Fast & Secure File Converter',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  description: 'Convert PDF, Word, Excel, PowerPoint, JPG, PNG, WebP, CSV and more in seconds. Private, secure, client-friendly, and free.',
  
  // Storage & Limits
  maxFreeFileSize: parseInt(process.env.MAX_FREE_FILE_SIZE || '52428800', 10), // 50 MB
  maxBatchFiles: parseInt(process.env.MAX_BATCH_FILES || '20', 10),
  fileRetentionHours: parseInt(process.env.FILE_RETENTION_HOURS || '24', 10),
  conversionTimeoutMs: parseInt(process.env.CONVERSION_TIMEOUT_MS || '60000', 10), // 60s
  
  // Storage paths
  tempStorageDir: process.env.TEMP_STORAGE_DIR || path.join(process.cwd(), '.temp_storage'),
  
  // System executables
  pythonPath: process.env.PYTHON_PATH || 'python',
  edgePath: process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  libreOfficePath: process.env.LIBREOFFICE_PATH || 'soffice',
  
  // Rate limiting (requests per minute per IP)
  rateLimitPerMinute: parseInt(process.env.RATE_LIMIT_PER_MINUTE || '30', 10),
};
