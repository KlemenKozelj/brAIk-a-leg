import { FALLBACK_LINES, getFallbackLines, getFallbackEmotions } from '@/lib/fallbackPool';
import { EMOTIONS } from '@/types';

describe('fallbackPool', () => {
  describe('FALLBACK_LINES', () => {
    it('contains at least 20 lines', () => {
      expect(FALLBACK_LINES.length).toBeGreaterThanOrEqual(20);
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

    it('contains no forbidden content', () => {
      const forbidden = [/slur/i, /sexual/i, /cruel/i, /politics/i, /racial/i];
      FALLBACK_LINES.forEach((line) => {
        forbidden.forEach((re) => {
          expect(re.test(line)).toBe(false);
        });
      });
    });
  });

  describe('getFallbackLines', () => {
    it('returns the requested number of lines', () => {
      expect(getFallbackLines(8)).toHaveLength(8);
    });

    it('returns at most the total pool size', () => {
      expect(getFallbackLines(100).length).toBeLessThanOrEqual(FALLBACK_LINES.length);
    });

    it('returns unique lines', () => {
      const lines = getFallbackLines(8);
      expect(new Set(lines).size).toBe(8);
    });
  });

  describe('getFallbackEmotions', () => {
    it('returns all emotions', () => {
      const emotions = getFallbackEmotions();
      expect(emotions).toEqual([...EMOTIONS]);
    });
  });
});
