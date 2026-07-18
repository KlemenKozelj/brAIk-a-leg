import { encodeSession, decodeSession, verifySession } from '@/lib/session';
import type { SessionPayload } from '@/lib/session';

// Set the secret for testing
process.env.SESSION_SECRET = 'test-secret-that-is-at-least-32-characters-long!!';

describe('session', () => {
  const testPayload: SessionPayload = {
    accessGranted: true,
    accessCode: 'ACTOR24',
    createdAt: Date.now(),
  };

  it('encodes and decodes a session', () => {
    const token = encodeSession(testPayload);
    const decoded = decodeSession(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.accessGranted).toBe(true);
    expect(decoded!.accessCode).toBe('ACTOR24');
  });

  it('verifySession works with valid cookie', () => {
    const token = encodeSession(testPayload);
    const decoded = verifySession(token);
    expect(decoded).not.toBeNull();
    expect(decoded!.accessGranted).toBe(true);
  });

  it('verifySession returns null for undefined', () => {
    expect(verifySession(undefined)).toBeNull();
  });

  it('rejects tampered tokens', () => {
    const token = encodeSession(testPayload);
    const [payload] = token.split('.');
    const tampered = `${payload}.tampered-signature`;
    expect(decodeSession(tampered)).toBeNull();
  });

  it('rejects invalid tokens', () => {
    expect(decodeSession('invalid')).toBeNull();
    expect(decodeSession('')).toBeNull();
    expect(decodeSession('a.b.c')).toBeNull();
  });

  it('preserves optional fields', () => {
    const withPool: SessionPayload = {
      ...testPayload,
      poolId: 'pool_123',
      currentExercise: 'ex_456',
    };
    const token = encodeSession(withPool);
    const decoded = decodeSession(token);
    expect(decoded!.poolId).toBe('pool_123');
    expect(decoded!.currentExercise).toBe('ex_456');
  });
});
