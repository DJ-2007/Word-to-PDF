import { NextResponse } from 'next/server';
import { cleanupExpiredFiles } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST() {
  const result = cleanupExpiredFiles();
  return NextResponse.json({
    success: true,
    data: {
      deletedFiles: result.deletedCount,
      timestamp: new Date().toISOString(),
    },
  });
}
