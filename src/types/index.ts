export interface RouletteResult {
  line: string;
  emotion: string;
}

export interface Exercise {
  id: string;
  line: string;
  emotion: string;
  attempt: 1 | 2;
}

export interface PerformanceScores {
  emotion: number;
  clarity: number;
  pace: number;
}

export interface Feedback {
  scores: PerformanceScores;
  strength: string;
  retryCue: string;
  /** A funny roast of your performance — you've been warned */
  roast: string;
  /** How viral-worthy this take is (1–10) */
  viralScore: number;
  /** Warning shown when using mock/simulated feedback instead of real AI analysis */
  warning?: string;
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

export const EMOTIONS = [
  'angry', 'embarrassed', 'fearful', 'sad', 'happy',
  'surprised', 'disgusted', 'jealous', 'guilty', 'proud',
  'bored', 'anxious', 'hopeful', 'playful', 'suspicious',
  'smug', 'heartbroken', 'ecstatic', 'confused', 'relieved',
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const SCORE_LABELS: Record<string, string> = {
  emotion: 'Emotion',
  clarity: 'Clarity',
  pace: 'Pace',
};

export const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_DURATION = 5;
