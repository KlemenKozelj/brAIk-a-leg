import { validateLine, isValidEmotion } from '@/lib/validation';
import { EMOTIONS } from '@/types';

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

describe('isValidEmotion', () => {
  it('returns true for valid emotions', () => {
    expect(isValidEmotion('caught-naked')).toBe(true);
    expect(isValidEmotion('farted-loudly')).toBe(true);
    expect(isValidEmotion('laughed-at-funeral')).toBe(true);
  });

  it('returns false for invalid emotions', () => {
    expect(isValidEmotion('nonexistent')).toBe(false);
    expect(isValidEmotion('')).toBe(false);
  });
});
