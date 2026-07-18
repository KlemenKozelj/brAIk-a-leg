import { EMOTIONS, SCORE_LABELS, MAX_VIDEO_SIZE, MAX_VIDEO_DURATION } from '@/types';

describe('types and constants', () => {
  it('EMOTIONS has exactly 20 entries', () => {
    expect(EMOTIONS).toHaveLength(20);
  });

  it('EMOTIONS contains key values', () => {
    expect(EMOTIONS).toContain('angry');
    expect(EMOTIONS).toContain('embarrassed');
    expect(EMOTIONS).toContain('fearful');
    expect(EMOTIONS).toContain('playful');
  });

  it('SCORE_LABELS has correct keys', () => {
    expect(SCORE_LABELS).toHaveProperty('emotion');
    expect(SCORE_LABELS).toHaveProperty('clarity');
    expect(SCORE_LABELS).toHaveProperty('pace');
  });

  it('MAX_VIDEO_SIZE is 10MB and MAX_VIDEO_DURATION is 5s', () => {
    expect(MAX_VIDEO_SIZE).toBe(10 * 1024 * 1024);
    expect(MAX_VIDEO_DURATION).toBe(5);
  });
});
