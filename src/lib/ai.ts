// AI stubs — returns mock feedback until OpenAI credentials are added.
import { Feedback, PerformanceScores } from '@/types';

export async function analyzeTake(
  _line: string,
  emotion: string
): Promise<Feedback> {
  const scores: PerformanceScores = {
    emotion: Math.floor(Math.random() * 3) + 3,
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
