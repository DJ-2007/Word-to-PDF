import { NextRequest, NextResponse } from 'next/server';
import { getJob, deleteJob } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const job = getJob(id);

  if (!job) {
    return NextResponse.json(
      { success: false, error: { code: 'JOB_EXPIRED', message: 'Job not found or has expired.' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: job.id,
      slug: job.slug,
      status: job.status,
      progress: job.progress,
      statusMessage: job.statusMessage,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      expiresAt: job.expiresAt,
      outputFile: job.outputFile
        ? {
            filename: job.outputFile.filename,
            size: job.outputFile.size,
            mimeType: job.outputFile.mimeType,
            isZip: job.outputFile.isZip,
          }
        : undefined,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const success = deleteJob(id);

  if (!success) {
    return NextResponse.json(
      { success: false, error: { code: 'JOB_EXPIRED', message: 'Job not found or already deleted.' } },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { message: 'Files and job deleted successfully.' },
  });
}
