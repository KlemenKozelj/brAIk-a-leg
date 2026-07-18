import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { createExercise, getExercise } from '@/lib/exerciseStore';

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get('actor-coach-session')?.value;
    const session = verifySession(cookie);
    if (!session?.accessGranted) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { poolId, line, emotion } = body;

    if (!poolId || !line || !emotion) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: poolId, line, emotion' },
        { status: 400 }
      );
    }

    try {
      const exercise = createExercise(poolId, line, emotion);
      return NextResponse.json({
        success: true,
        data: {
          id: exercise.id,
          line: exercise.line,
          emotion: exercise.emotion,
          attempt: exercise.attempt,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid exercise data';
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookie = request.cookies.get('actor-coach-session')?.value;
    const session = verifySession(cookie);
    if (!session?.accessGranted) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Exercise ID required' },
        { status: 400 }
      );
    }

    const exercise = getExercise(id);
    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found or expired' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exercise });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
