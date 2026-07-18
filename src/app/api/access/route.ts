import { NextRequest, NextResponse } from 'next/server';
import { accessSchema } from '@/lib/validation';
import { encodeSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = accessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    // Create signed session
    const payload = {
      accessGranted: true,
      accessCode: '',
      createdAt: Date.now(),
    };

    const token = encodeSession(payload);

    const response = NextResponse.json({ success: true, data: { granted: true } });
    response.cookies.set('actor-coach-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7200, // 2 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
