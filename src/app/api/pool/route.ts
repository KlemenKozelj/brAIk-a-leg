import { NextRequest, NextResponse } from 'next/server';
import { generateSentencePool } from '@/lib/ai';
import { verifySession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    // Verify session from cookie
    const cookie = request.cookies.get('actor-coach-session')?.value;
    const session = verifySession(cookie);
    if (!session?.accessGranted) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { lines, emotions } = await generateSentencePool();
    const poolId = `pool_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      data: {
        poolId,
        lines,
        emotions,
        expiresAt: Date.now() + 20 * 60 * 1000,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
