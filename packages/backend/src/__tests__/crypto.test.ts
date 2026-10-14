import { describe, it, expect } from 'vitest';
import { generatePublicToken, hashToken } from '../utils/crypto.js';

describe('Token Cryptography & Lifecycle', () => {
  it('generates 128-bit cryptographically secure tokens with high entropy', () => {
    const pair1 = generatePublicToken();
    const pair2 = generatePublicToken();

    expect(pair1.rawToken).toHaveLength(32); // 16 bytes in hex = 32 characters
    expect(pair2.rawToken).toHaveLength(32);
    expect(pair1.rawToken).not.toBe(pair2.rawToken);
    expect(/^[a-f0-9]{32}$/.test(pair1.rawToken)).toBe(true);
    expect(pair1.tokenHash).toHaveLength(64); // SHA-256
  });

  it('generates 1,000 distinct tokens without collision', () => {
    const tokenSet = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      tokenSet.add(generatePublicToken().rawToken);
    }
    expect(tokenSet.size).toBe(1000);
  });

  it('produces deterministic SHA-256 hashes for storage at rest', () => {
    const token = 'abcdef0123456789abcdef0123456789';
    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 produces 64 hex characters
    expect(/^[a-f0-9]{64}$/.test(hash1)).toBe(true);
  });

  it('verifies raw token against stored hash accurately', () => {
    const pair = generatePublicToken();
    const computedHash = hashToken(pair.rawToken);

    expect(computedHash).toBe(pair.tokenHash);
    expect(hashToken('tampered-token-value')).not.toBe(pair.tokenHash);
  });
});
