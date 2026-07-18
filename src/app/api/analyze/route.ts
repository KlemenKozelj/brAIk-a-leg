import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { analyzeTake, transcribeAudio, extractFrames } from '@/lib/ai';
import { validateVideo, exerciseSubmissionSchema } from '@/lib/validation';
import {
  getExercise,
  setFirstTakeScores,
  getFirstTakeScores,
  deleteExercise,
  deleteFirstTakeScores,
} from '@/lib/exerciseStore';
import { ScoreComparison } from '@/types';

export async function POST(request: NextRequest) {
  let tempDir: string | null = null;

  try {
    const cookie = request.cookies.get('actor-coach-session')?.value;
    const session = verifySession(cookie);
    if (!session?.accessGranted) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const exerciseId = formData.get('exerciseId') as string;
    const attempt = parseInt(formData.get('attempt') as string, 10) as 1 | 2;
    const poolId = formData.get('poolId') as string;
    const line = formData.get('line') as string;
    const emotion = formData.get('emotion') as string;

    // Validate exercise exists
    const exercise = getExercise(exerciseId);
    if (!exercise) {
      return NextResponse.json(
        { success: false, error: 'Exercise not found or expired' },
        { status: 404 }
      );
    }

    // Validate attempt
    if (attempt !== 1 && attempt !== 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid attempt. Must be 1 or 2.' },
        { status: 400 }
      );
    }

    if (attempt === 2 && !getFirstTakeScores(exerciseId)) {
      return NextResponse.json(
        { success: false, error: 'No first take found. Complete attempt 1 first.' },
        { status: 400 }
      );
    }

    // Validate submission data
    const parsed = exerciseSubmissionSchema.safeParse({
      exerciseId,
      attempt,
      poolId,
      line,
      emotion,
    });
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    // Validate video
    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: 'Video file is required' },
        { status: 400 }
      );
    }

    const duration = parseFloat(formData.get('duration') as string) || 0;
    const videoError = validateVideo(videoFile, duration);
    if (videoError) {
      return NextResponse.json(
        { success: false, error: videoError },
        { status: 400 }
      );
    }

    // Create temp directory for processing
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'actor-coach-'));
    const videoPath = path.join(tempDir, 'take.webm');

    // Save video
    const buffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(videoPath, buffer);

    // Extract frames, transcribe, and analyze
    const framePaths = await extractFrames(videoPath, tempDir);
    const audioPath = path.join(tempDir, 'audio.wav');
    // Stub: copy video as audio (real impl uses FFmpeg)
    await fs.writeFile(audioPath, buffer);
    const transcript = await transcribeAudio(audioPath);
    const feedback = await analyzeTake(videoPath, line, emotion, framePaths, transcript);

    let comparison: ScoreComparison | undefined;

    if (attempt === 2) {
      const firstScores = getFirstTakeScores(exerciseId);
      if (firstScores) {
        comparison = {
          deltas: {
            emotion: feedback.scores.emotion - firstScores.emotion,
            clarity: feedback.scores.clarity - firstScores.clarity,
            pace: feedback.scores.pace - firstScores.pace,
          },
        };
      }
      // Cleanup exercise data
      deleteExercise(exerciseId);
      deleteFirstTakeScores(exerciseId);
    } else {
      // Store first take scores
      setFirstTakeScores(exerciseId, feedback.scores);
    }

    // Cleanup temp files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      success: true,
      data: {
        feedback,
        ...(comparison ? { comparison } : {}),
      },
    });
  } catch (error) {
    // Cleanup on error
    if (tempDir) {
      try {
        const fs = await import('fs/promises');
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // Ignore
      }
    }
    const message = error instanceof Error ? error.message : 'Internal server error';
    if (message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Analysis failed. Please try again.' },
      { status: 500 }
    );
  }
}
