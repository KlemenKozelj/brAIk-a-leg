import { FALLBACK_LINES, getFallbackLines, getFallbackEmotions, getHardcodedPool } from '@/lib/fallbackPool';
import { EMOTIONS } from '@/types';

describe('fallbackPool', () => {
  describe('FALLBACK_LINES', () => {
    it('contains at least 50 lines', () => {
      expect(FALLBACK_LINES.length).toBeGreaterThanOrEqual(50);
    });

    it('all lines are 3-200 characters', () => {
      FALLBACK_LINES.forEach((line) => {
        expect(line.length).toBeGreaterThanOrEqual(3);
        expect(line.length).toBeLessThanOrEqual(200);
      });
    });

    it('all lines are unique', () => {
      const unique = new Set(FALLBACK_LINES);
      expect(unique.size).toBe(FALLBACK_LINES.length);
    });
  });

  describe('getFallbackLines', () => {
    it('returns the requested number', () => {
      expect(getFallbackLines(8)).toHaveLength(8);
    });

    it('returns unique lines', () => {
      expect(new Set(getFallbackLines(8)).size).toBe(8);
    });
  });

  describe('getFallbackEmotions', () => {
    it('returns all 20 emotions', () => {
      expect(getFallbackEmotions()).toHaveLength(20);
      expect(getFallbackEmotions()).toEqual([...EMOTIONS]);
    });
  });

  describe('getHardcodedPool', () => {
    it('returns 8 lines and 20 emotions', () => {
      const pool = getHardcodedPool();
      expect(pool.lines).toHaveLength(8);
      expect(pool.emotions).toHaveLength(20);
    });
  });
});
