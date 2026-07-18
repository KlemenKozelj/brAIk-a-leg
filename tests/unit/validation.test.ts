import {
  validateVideo,
  validateLine,
  sanitizeString,
  accessSchema,
  exerciseSubmissionSchema,
} from '@/lib/validation';

describe('validateVideo', () => {
  const createMockFile = (type: string, size: number): File =>
    new File([''], 'test.webm', { type });

  it('accepts a valid video file', () => {
    const file = createMockFile('video/webm', 1024 * 1024);
    expect(validateVideo(file, 3)).toBeNull();
  });

  it('rejects non-video files', () => {
    const file = createMockFile('image/png', 1024);
    expect(validateVideo(file, 3)).toBe('Invalid file type. Only video files are accepted.');
  });

  it('rejects oversized files', () => {
    const file = createMockFile('video/webm', 0);
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });
    expect(validateVideo(file, 3)).toContain('too large');
  });

  it('rejects videos over 5 seconds', () => {
    const file = createMockFile('video/webm', 1024);
    expect(validateVideo(file, 6)).toContain('Maximum duration');
  });

  it('rejects videos under 0.5 seconds', () => {
    const file = createMockFile('video/webm', 1024);
    expect(validateVideo(file, 0.3)).toContain('too short');
  });
});

describe('validateLine', () => {
  it('accepts safe funny lines', () => {
    expect(validateLine('I married a penguin last night')).toBe(true);
    expect(validateLine('My shoe is filing a lawsuit')).toBe(true);
    expect(validateLine('I am the emperor of potatoes')).toBe(true);
  });

  it('rejects lines with forbidden content', () => {
    expect(validateLine('This is sexual content')).toBe(false);
    expect(validateLine('A cruel remark')).toBe(false);
    expect(validateLine('Political statement')).toBe(false);
    expect(validateLine('Racial slur here')).toBe(false);
  });

  it('rejects lines that are too short or long', () => {
    expect(validateLine('ab')).toBe(false);
    expect(validateLine('a'.repeat(201))).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('removes HTML tags', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('alert("xss")');
  });

  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });
});

describe('accessSchema', () => {
  it('validates with both consent fields true', () => {
    const result = accessSchema.safeParse({
      confirmedAge: true,
      consentVideo: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects unconfirmed age', () => {
    const result = accessSchema.safeParse({
      confirmedAge: false,
      consentVideo: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing video consent', () => {
    const result = accessSchema.safeParse({
      confirmedAge: true,
      consentVideo: false,
    });
    expect(result.success).toBe(false);
  });
});

describe('exerciseSubmissionSchema', () => {
  it('validates correct submission data', () => {
    const result = exerciseSubmissionSchema.safeParse({
      exerciseId: 'abc123',
      attempt: 1,
      poolId: 'pool_1',
      line: 'I married a penguin',
      emotion: 'delighted',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid attempt number', () => {
    const result = exerciseSubmissionSchema.safeParse({
      exerciseId: 'abc123',
      attempt: 3,
      poolId: 'pool_1',
      line: 'Test line',
      emotion: 'delighted',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid emotion', () => {
    const result = exerciseSubmissionSchema.safeParse({
      exerciseId: 'abc123',
      attempt: 1,
      poolId: 'pool_1',
      line: 'Test line',
      emotion: 'nonexistent',
    });
    expect(result.success).toBe(false);
  });
});
