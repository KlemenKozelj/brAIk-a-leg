// AI module stubs — replace with real OpenAI calls when credentials are provided.
import { Feedback, PerformanceScores, ScenePool } from '@/types';
import { getFallbackLines } from './fallbackPool';

const FALLBACK_MODE = true; // Toggle to false when OpenAI is configured

/**
 * Generate a pool of funny sentences for the roulette.
 * Currently returns fallback pool. When AI is enabled, calls OpenAI.
 */
export async function generateSentencePool(): Promise<{
  lines: string[];
  emotions: string[];
}> {
  if (FALLBACK_MODE) {
    return {
      lines: getFallbackLines(8),
      emotions: [
        'delighted', 'furious', 'terrified', 'smug',
        'heartbroken', 'suspicious', 'embarrassed',
      ],
    };
  }

  // TODO: Replace with real OpenAI call using GPT-5 mini
  // const response = await openai.chat.completions.create({...});
  throw new Error('AI not configured. Set FALLBACK_MODE=false and add OpenAI key.');
}

/**
 * Analyze a take: extract frames, transcribe audio, get structured feedback.
 * Currently returns mock feedback. When AI is enabled, processes video frames + audio.
 */
export async function analyzeTake(
  videoPath: string,
  targetLine: string,
  targetEmotion: string,
  framePaths: string[],
  transcript: string
): Promise<Feedback> {
  if (FALLBACK_MODE) {
    return getMockFeedback(targetEmotion);
  }

  // TODO: Replace with real AI pipeline:
  // 1. Extract frames with FFmpeg
  // 2. Transcribe with gpt-4o-mini-transcribe
  // 3. Analyze with GPT-5 mini (image + text)
  throw new Error('AI not configured. Set FALLBACK_MODE=false and add OpenAI key.');
}

function getMockFeedback(emotion: string): Feedback {
  const scores: PerformanceScores = {
    emotion: Math.floor(Math.random() * 3) + 3, // 3-5
    clarity: Math.floor(Math.random() * 3) + 3,
    pace: Math.floor(Math.random() * 3) + 3,
  };

  const strengths = [
    'Great emotional range in your delivery.',
    'Strong vocal projection and presence.',
    'Good physical engagement with the emotion.',
    'Natural timing in your performance.',
    'Clear commitment to the character.',
  ];

  const cues = [
    `Try varying your tempo to better express "${emotion}".`,
    `Consider pausing before the key word for more impact.`,
    `Your eyes could convey more of the "${emotion}" feeling.`,
    `Try a lower register to ground the emotion.`,
    `Experiment with a sharper attack on the opening.`,
  ];

  return {
    scores,
    strength: strengths[Math.floor(Math.random() * strengths.length)],
    retryCue: cues[Math.floor(Math.random() * cues.length)],
  };
}

/**
 * Transcribe audio using gpt-4o-mini-transcribe.
 * Stub returns empty transcript until configured.
 */
export async function transcribeAudio(audioPath: string): Promise<string> {
  if (FALLBACK_MODE) {
    return '[mock transcript placeholder]';
  }
  throw new Error('AI not configured.');
}

/**
 * Extract three evenly spaced frames from a video.
 */
export async function extractFrames(
  videoPath: string,
  outputDir: string
): Promise<string[]> {
  // Stub: return placeholder paths
  return [
    `${outputDir}/frame_1.jpg`,
    `${outputDir}/frame_2.jpg`,
    `${outputDir}/frame_3.jpg`,
  ];
}
