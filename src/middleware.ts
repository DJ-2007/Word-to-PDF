import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory sliding window rate limiter
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '30', 10);

export function middleware(request: NextRequest) {
  // Only rate-limit API routes
  if (request.nextUrl.pathname.startsWith('/api/convert')) {
    const ip =
      request.ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      '127.0.0.1';

    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const limit = RATE_LIMIT_PER_MINUTE;

    const record = ipRequestCounts.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
    }

    ipRequestCounts.set(ip, record);

    if (record.count > limit) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Rate limit exceeded. Maximum ${limit} conversions per minute. Please wait.`,
          },
        },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
