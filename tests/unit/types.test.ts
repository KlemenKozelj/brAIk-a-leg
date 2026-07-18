import { EMOTIONS, SCORE_LABELS, MAX_VIDEO_SIZE, MAX_VIDEO_DURATION, EXERCISE_TTL } from '@/types';

describe('types and constants', () => {
  it('EMOTIONS has exactly 10 entries', () => {
    expect(EMOTIONS).toHaveLength(10);
  });

  it('EMOTIONS contains all expected values', () => {
    expect(EMOTIONS).toContain('delighted');
    expect(EMOTIONS).toContain('furious');
    expect(EMOTIONS).toContain('deadpan');
  });

  it('SCORE_LABELS has correct keys', () => {
    expect(SCORE_LABELS).toHaveProperty('emotion');
    expect(SCORE_LABELS).toHaveProperty('clarity');
    expect(SCORE_LABELS).toHaveProperty('pace');
  });

  it('MAX_VIDEO_SIZE is 10MB', () => {
    expect(MAX_VIDEO_SIZE).toBe(10 * 1024 * 1024);
  });

  it('MAX_VIDEO_DURATION is 5 seconds', () => {
    expect(MAX_VIDEO_DURATION).toBe(5);
  });

  it('EXERCISE_TTL is 20 minutes', () => {
    expect(EXERCISE_TTL).toBe(20 * 60 * 1000);
  });
});
