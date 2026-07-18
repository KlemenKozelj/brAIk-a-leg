export interface ScenePool {
  poolId: string;
  lines: string[];
  emotions: string[];
  expiresAt: number; // Unix timestamp ms
}

export interface RouletteResult {
  line: string;
  emotion: string;
}

export interface Exercise {
  id: string;
  poolId: string;
  line: string;
  emotion: string;
  attempt: 1 | 2;
  createdAt: number;
}

export interface PerformanceScores {
  emotion: number; // 1-5
  clarity: number; // 1-5
  pace: number;    // 1-5
}

export interface Feedback {
  scores: PerformanceScores;
  strength: string;
  retryCue: string;
}

export interface ScoreComparison {
  deltas: {
    emotion: number;
    clarity: number;
    pace: number;
  };
}

export interface AnalysisResult {
  feedback: Feedback;
  comparison?: ScoreComparison;
}

export interface TakeSubmission {
  exerciseId: string;
  attempt: 1 | 2;
  video: File | Blob;
}

export interface SessionData {
  accessGranted: boolean;
  accessCode: string;
  poolId?: string;
  currentExercise?: string;
  firstTakeScores?: PerformanceScores;
  rateLimit: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export const EMOTIONS = [
  'delighted',
  'furious',
  'terrified',
  'smug',
  'heartbroken',
  'suspicious',
  'embarrassed',
  'ecstatic',
  'confused',
  'deadpan',
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const SCORE_LABELS: Record<string, string> = {
  emotion: 'Emotion',
  clarity: 'Clarity',
  pace: 'Pace',
};

export const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_DURATION = 5; // seconds
export const EXERCISE_TTL = 20 * 60 * 1000; // 20 minutes
export const RATE_LIMIT_MAX = 20;
export const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
