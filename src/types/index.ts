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
  'caught-naked', 'farted-loudly', 'drunk-texting-my-ex', 'walked-in-on-parents', 'peed-my-pants-laughing',
  'cried-at-a-commercial', 'mistook-stranger-for-friend', 'texted-the-wrong-group-chat', 'forgot-my-lines-onstage', 'spilled-wine-on-the-boss',
  'caught-singing-in-mirror', 'pants-ripped-in-public', 'sneezed-in-someones-face', 'called-teacher-mom', 'tripped-on-red-carpet',
  'burped-during-wedding-toast', 'waved-back-at-no-one', 'showed-up-naked-to-zoom', 'laughed-at-funeral', 'missed-a-high-five',
] as const;

export type Emotion = (typeof EMOTIONS)[number];

export const SCORE_LABELS: Record<string, string> = {
  emotion: 'Emotion',
  clarity: 'Clarity',
  pace: 'Pace',
};

export const MAX_VIDEO_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_DURATION = 5;
