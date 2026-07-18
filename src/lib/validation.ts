import { EMOTIONS } from '@/types';

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

export function isValidEmotion(emotion: string): boolean {
  return EMOTIONS.includes(emotion as typeof EMOTIONS[number]);
}
