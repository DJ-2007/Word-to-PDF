import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import { APP_CONFIG } from '@/config';
import { SUPPORTED_FORMATS } from '@/lib/format-registry';

// Ensure storage root directories exist
const TEMP_ROOT = APP_CONFIG.tempStorageDir;
const UPLOAD_DIR = path.join(TEMP_ROOT, 'uploads');
const OUTPUT_DIR = path.join(TEMP_ROOT, 'outputs');

export function initStorage() {
  if (!fs.existsSync(TEMP_ROOT)) fs.mkdirSync(TEMP_ROOT, { recursive: true });
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function sanitizeFilename(filename: string): string {
  // Strip path traversal characters and dangerous symbols
  const base = path.basename(filename);
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export function validateMagicBytes(buffer: Buffer, expectedExtension: string): boolean {
  const format = SUPPORTED_FORMATS[expectedExtension.toLowerCase()];
  if (!format || !format.magicBytes) return true; // Format has no strict magic byte rule

  if (buffer.length < format.magicBytes.length) return false;

  for (let i = 0; i < format.magicBytes.length; i++) {
    if (buffer[i] !== format.magicBytes[i]) {
      return false;
    }
  }
  return true;
}

export async function saveUploadedFile(
  fileBuffer: Buffer,
  originalFilename: string
): Promise<{
  id: string;
  originalName: string;
  storedPath: string;
  size: number;
  extension: string;
}> {
  initStorage();

  const cleanName = sanitizeFilename(originalFilename);
  const ext = path.extname(cleanName).replace('.', '').toLowerCase();

  // Validate size
  if (fileBuffer.length > APP_CONFIG.maxFreeFileSize) {
    throw new Error(`File size exceeds maximum allowed of ${APP_CONFIG.maxFreeFileSize / (1024 * 1024)}MB`);
  }

  // Validate format registration
  if (!SUPPORTED_FORMATS[ext]) {
    throw new Error(`Unsupported file extension: .${ext}`);
  }

  // Validate magic bytes where applicable
  if (!validateMagicBytes(fileBuffer, ext)) {
    throw new Error(`Corrupted file or mismatched file content for .${ext}`);
  }

  const id = uuidv4();
  const storedFilename = `${id}.${ext}`;
  const storedPath = path.join(UPLOAD_DIR, storedFilename);

  await fs.promises.writeFile(storedPath, fileBuffer);

  return {
    id,
    originalName: cleanName,
    storedPath,
    size: fileBuffer.length,
    extension: ext,
  };
}

export function getOutputPath(filename: string): { id: string; fullPath: string } {
  initStorage();
  const id = uuidv4();
  const cleanName = sanitizeFilename(filename);
  const storedName = `${id}_${cleanName}`;
  return {
    id,
    fullPath: path.join(OUTPUT_DIR, storedName),
  };
}

export async function createZipArchive(
  files: { filename: string; path: string }[],
  zipFilename: string
): Promise<{ path: string; size: number }> {
  initStorage();
  const { fullPath } = getOutputPath(zipFilename);

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(fullPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve({
        path: fullPath,
        size: archive.pointer(),
      });
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    for (const f of files) {
      if (fs.existsSync(f.path)) {
        archive.file(f.path, { name: f.filename });
      }
    }

    archive.finalize();
  });
}

export function cleanupExpiredFiles(): { deletedCount: number } {
  initStorage();
  const now = Date.now();
  const maxAgeMs = APP_CONFIG.fileRetentionHours * 60 * 60 * 1000;
  let count = 0;

  for (const dir of [UPLOAD_DIR, OUTPUT_DIR]) {
    try {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(fullPath);
          count++;
        }
      }
    } catch (e) {
      // Ignore directory read errors during cleanup
    }
  }

  return { deletedCount: count };
}
