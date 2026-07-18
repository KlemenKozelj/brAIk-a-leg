// Session management using signed cookies
// Uses a simple HMAC-like signing pattern (Base64 payload + secret-based signature)

const SESSION_COOKIE = 'actor-coach-session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production-minimum-32-chars!!';

export interface SessionPayload {
  accessGranted: boolean;
  accessCode: string;
  poolId?: string;
  currentExercise?: string;
  firstTakeScores?: string; // JSON stringified
  createdAt: number;
}

export function encodeSession(data: SessionPayload): string {
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = Buffer.from(
    `${payload}.${SESSION_SECRET}`
  ).toString('base64url');
  return `${payload}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    const expectedSig = Buffer.from(`${payload}.${SESSION_SECRET}`).toString('base64url');
    if (signature !== expectedSig) return null;
    const decoded = Buffer.from(payload, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Extract and verify session from a cookie string.
 * Used in API routes and middleware.
 */
export function verifySession(cookieValue: string | undefined): SessionPayload | null {
  if (!cookieValue) return null;
  return decodeSession(cookieValue);
}

/**
 * Require a valid session, throwing if not found.
 * Used in API routes after middleware has verified the cookie exists.
 */
export function requireSessionFromCookie(cookieValue: string): SessionPayload {
  const session = decodeSession(cookieValue);
  if (!session || !session.accessGranted) {
    throw new Error('Unauthorized');
  }
  return session;
}


