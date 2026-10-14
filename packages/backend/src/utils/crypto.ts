import crypto from 'crypto';

export interface GeneratedToken {
  rawToken: string;
  tokenHash: string;
}

/**
 * Generates a cryptographically secure random token with >= 128 bits of entropy
 * and its corresponding SHA-256 hash for database storage.
 */
export function generatePublicToken(): GeneratedToken {
  // 16 bytes = 128 bits of entropy -> 32 hex characters
  const rawToken = crypto.randomBytes(16).toString('hex');
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Computes the SHA-256 hash of a raw token for lookup at rest.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}
