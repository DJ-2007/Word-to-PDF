import { NextResponse } from 'next/server';
import { CONVERSION_TOOLS, SUPPORTED_FORMATS } from '@/lib/format-registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      tools: CONVERSION_TOOLS,
      formats: SUPPORTED_FORMATS,
    },
  });
}
