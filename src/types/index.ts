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
  'delighted', 'furious', 'terrified', 'smug', 'heartbroken',
  'suspicious', 'embarrassed', 'ecstatic', 'confused', 'deadpan',
  'anxious', 'bored', 'jealous', 'guilty', 'hopeful',
  'offended', 'playful', 'proud', 'regretful', 'relieved',
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const SCORE_LABELS: Record<string, string> = {
  emotion: 'Emotion',
  clarity: 'Clarity',
  pace: 'Pace',
};

export const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_DURATION = 5;
