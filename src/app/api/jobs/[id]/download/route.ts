import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { getJob } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const job = getJob(id);

  if (!job) {
    return new NextResponse('Conversion job not found or expired', { status: 404 });
  }

  if (job.status !== 'completed' || !job.outputFile) {
    return new NextResponse('File is not ready for download', { status: 400 });
  }

  const filePath = job.outputFile.storedPath;
  if (!fs.existsSync(filePath)) {
    return new NextResponse('File was removed or cleaned up from server storage', { status: 410 });
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const rawFilename = job.outputFile.filename;
  // Clean ASCII fallback plus RFC 5987 / RFC 6266 UTF-8 encoded filename
  const asciiFilename = rawFilename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  const encodedFilename = encodeURIComponent(rawFilename);

  const headers = new Headers();
  headers.set('Content-Type', job.outputFile.mimeType || 'application/octet-stream');
  headers.set(
    'Content-Disposition',
    `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`
  );
  headers.set('Content-Length', fileBuffer.length.toString());
  headers.set('Cache-Control', 'no-store, must-revalidate');

  return new NextResponse(fileBuffer, {
    status: 200,
    headers,
  });
}
