/**
 * Integration tests for API routes.
 * In a real environment, these would use a test server.
 * Here we test the validation logic that the APIs depend on.
 */
import {
  exerciseSubmissionSchema,
  accessSchema,
  validateVideo,
} from '@/lib/validation';
import { EMOTIONS } from '@/types';

describe('API Integration: Access', () => {
  it('validates access with age and consent', () => {
    const result = accessSchema.safeParse({
      confirmedAge: true,
      consentVideo: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing consent', () => {
    const result = accessSchema.safeParse({
      confirmedAge: true,
      consentVideo: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('API Integration: Exercise', () => {
  it('validates exercise submission', () => {
    const result = exerciseSubmissionSchema.safeParse({
      exerciseId: 'ex_123',
      attempt: 1,
      poolId: 'pool_456',
      line: 'Test funny line',
      emotion: 'delighted',
    });
    expect(result.success).toBe(true);
  });

  it('rejects third attempt', () => {
    const result = exerciseSubmissionSchema.safeParse({
      exerciseId: 'ex_123',
      attempt: 3,
      poolId: 'pool_456',
      line: 'Test line',
      emotion: 'smug',
    });
    expect(result.success).toBe(false);
  });
});

describe('API Integration: Video Validation', () => {
  it('rejects oversized files', () => {
    const file = new File([''], 'test.webm', { type: 'video/webm' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    const error = validateVideo(file, 3);
    expect(error).toContain('too large');
  });

  it('rejects files over 5 seconds', () => {
    const file = new File([''], 'test.webm', { type: 'video/webm' });
    const error = validateVideo(file, 6);
    expect(error).toContain('Maximum duration');
  });
});

describe('API Integration: Emotions', () => {
  it('all valid emotions are accepted', () => {
    EMOTIONS.forEach((emotion) => {
      const result = exerciseSubmissionSchema.safeParse({
        exerciseId: 'ex',
        attempt: 1,
        poolId: 'pool',
        line: 'Test line',
        emotion,
      });
      expect(result.success).toBe(true);
    });
  });
});
