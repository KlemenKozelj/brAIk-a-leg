import { z } from 'zod';
import { MAX_VIDEO_SIZE, MAX_VIDEO_DURATION, EMOTIONS } from '@/types';

export const accessSchema = z.object({
  confirmedAge: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you are 18+' }),
  }),
  consentVideo: z.literal(true, {
    errorMap: () => ({ message: 'You must consent to video processing' }),
  }),
});

export const exerciseSubmissionSchema = z.object({
  exerciseId: z.string().min(1),
  attempt: z.union([z.literal(1), z.literal(2)]),
  poolId: z.string().min(1),
  line: z.string().min(1).max(200),
  emotion: z.enum(EMOTIONS as unknown as [string, ...string[]]),
});

export function validateVideo(
  file: File | Blob,
  durationSeconds: number
): string | null {
  if (!file.type.startsWith('video/')) {
    return 'Invalid file type. Only video files are accepted.';
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return `File too large. Maximum size is ${MAX_VIDEO_SIZE / 1024 / 1024}MB.`;
  }
  if (durationSeconds > MAX_VIDEO_DURATION) {
    return `Video too long. Maximum duration is ${MAX_VIDEO_DURATION} seconds.`;
  }
  if (durationSeconds < 0.5) {
    return 'Video is too short. Please record at least 0.5 seconds.';
  }
  return null;
}

export function validateLine(line: string): boolean {
  const forbidden = [
    /slur/i, /sexual/i, /cruel/i, /political/i, /racial/i,
    /fuck/i, /shit/i, /damn/i, /ass/i, /bitch/i,
    /copyright/i, /trademark/i, /proprietary/i,
  ];
  if (line.length < 3 || line.length > 200) return false;
  if (forbidden.some((re) => re.test(line))) return false;
  return true;
}

export function sanitizeString(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}
