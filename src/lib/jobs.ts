import { ConversionJob, JobStatus, ErrorCode } from '@/types';
import { APP_CONFIG } from '@/config';
import fs from 'fs';
import path from 'path';

// Store jobs in global for HMR persistence during development
const globalForJobs = global as unknown as {
  convertlyJobs: Map<string, ConversionJob>;
};

export const jobsMap = globalForJobs.convertlyJobs || new Map<string, ConversionJob>();
if (process.env.NODE_ENV !== 'production') globalForJobs.convertlyJobs = jobsMap;

export function createJob(
  slug: string,
  inputFiles: {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
    storedPath: string;
  }[],
  options: Record<string, any> = {}
): ConversionJob {
  const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = Date.now();
  const expiresAt = now + APP_CONFIG.fileRetentionHours * 60 * 60 * 1000;

  const job: ConversionJob = {
    id,
    slug,
    status: 'queued',
    progress: 10,
    statusMessage: 'Queued for processing',
    inputFiles,
    options,
    createdAt: now,
    expiresAt,
  };

  jobsMap.set(id, job);
  return job;
}

export function getJob(id: string): ConversionJob | undefined {
  const job = jobsMap.get(id);
  if (!job) return undefined;

  // Check if expired
  if (Date.now() > job.expiresAt) {
    job.status = 'expired';
    job.statusMessage = 'Job has expired and files were cleaned up.';
  }

  return job;
}

export function updateJobStatus(
  id: string,
  status: JobStatus,
  progress: number,
  statusMessage: string,
  extra: Partial<ConversionJob> = {}
): ConversionJob | undefined {
  const job = jobsMap.get(id);
  if (!job) return undefined;

  job.status = status;
  job.progress = progress;
  job.statusMessage = statusMessage;

  if (extra.outputFile) job.outputFile = extra.outputFile;
  if (extra.errorCode) job.errorCode = extra.errorCode;
  if (extra.errorMessage) job.errorMessage = extra.errorMessage;
  if (status === 'completed' || status === 'failed') {
    job.completedAt = Date.now();
  }

  jobsMap.set(id, job);
  return job;
}

export function deleteJob(id: string): boolean {
  const job = jobsMap.get(id);
  if (!job) return false;

  // Remove input files from disk
  for (const f of job.inputFiles) {
    if (fs.existsSync(f.storedPath)) {
      try {
        fs.unlinkSync(f.storedPath);
      } catch (e) {}
    }
  }

  // Remove output file from disk
  if (job.outputFile && fs.existsSync(job.outputFile.storedPath)) {
    try {
      fs.unlinkSync(job.outputFile.storedPath);
    } catch (e) {}
  }

  jobsMap.delete(id);
  return true;
}

export function getRecentJobs(limit = 10): ConversionJob[] {
  return Array.from(jobsMap.values())
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}
