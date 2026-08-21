import { timingSafeEqual } from 'crypto';

/**
 * Timing-safe string comparison to prevent timing side-channel attacks.
 * Use this instead of `===` when comparing secrets (API keys, tokens, etc.).
 */
export function safeCompare(a: string, b: string): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Compare lengths in a way that doesn't short-circuit on the result
    // but still returns false for different lengths
    timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Verify a Bearer token matches an expected secret in a timing-safe way.
 */
export function verifyBearerToken(authorizationHeader: string | null, expectedSecret: string | undefined): boolean {
  if (!authorizationHeader || !expectedSecret) return false;
  const token = authorizationHeader.replace(/^Bearer\s+/i, '');
  return safeCompare(token, expectedSecret);
}
