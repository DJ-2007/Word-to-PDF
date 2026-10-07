import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/storage';
import { createJob } from '@/lib/jobs';
import { conversionEngine } from '@/lib/conversion-engine/engine';
import { getToolBySlug } from '@/lib/format-registry';
import { APP_CONFIG } from '@/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const toolSlug = formData.get('toolSlug') as string;
    const optionsRaw = formData.get('options') as string;
    const options = optionsRaw ? JSON.parse(optionsRaw) : {};

    if (!toolSlug) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_REQUEST', message: 'Missing toolSlug parameter' } },
        { status: 400 }
      );
    }

    const tool = getToolBySlug(toolSlug);
    if (!tool) {
      return NextResponse.json(
        { success: false, error: { code: 'UNSUPPORTED_CONVERSION', message: `Unknown tool '${toolSlug}'` } },
        { status: 404 }
      );
    }

    const fileEntries = formData.getAll('files') as File[];
    if (!fileEntries || fileEntries.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FILE', message: 'No files uploaded.' } },
        { status: 400 }
      );
    }

    if (!tool.allowMultiple && fileEntries.length > 1) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_FILE', message: 'This tool only accepts a single file.' } },
        { status: 400 }
      );
    }

    if (fileEntries.length > (tool.maxFiles || APP_CONFIG.maxBatchFiles)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FILE_TOO_LARGE',
            message: `Maximum allowed batch size is ${tool.maxFiles || APP_CONFIG.maxBatchFiles} files.`,
          },
        },
        { status: 400 }
      );
    }

    const savedFiles: {
      id: string;
      originalName: string;
      size: number;
      mimeType: string;
      storedPath: string;
    }[] = [];

    for (const file of fileEntries) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!tool.inputFormats.includes(ext)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_FILE_TYPE',
              message: `File '${file.name}' has format '.${ext}' which is not supported for ${tool.name}. Supported formats: ${tool.inputFormats.join(', ')}`,
            },
          },
          { status: 400 }
        );
      }

      const saved = await saveUploadedFile(buffer, file.name);
      savedFiles.push({
        id: saved.id,
        originalName: saved.originalName,
        size: saved.size,
        mimeType: file.type || 'application/octet-stream',
        storedPath: saved.storedPath,
      });
    }

    // Create tracking job
    const job = createJob(toolSlug, savedFiles, options);

    // Kick off conversion asynchronously in background
    conversionEngine.processJob(job).catch((err) => {
      console.error(`Background conversion error for job ${job.id}:`, err);
    });

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        expiresAt: job.expiresAt,
      },
    });
  } catch (err: any) {
    console.error('API /api/convert error:', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CONVERSION_FAILED',
          message: err.message || 'Failed to process file conversion request.',
        },
      },
      { status: 500 }
    );
  }
}
