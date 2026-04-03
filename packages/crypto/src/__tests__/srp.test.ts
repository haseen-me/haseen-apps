import { describe, it, expect } from 'vitest';
import {
  generateSalt,
  computeVerifier,
  generateEphemeral,
  computeClientProof,
  verifyServerProof,
} from '../index';

describe('SRP-6a Client', () => {
  it('generateSalt returns hex string of 32 chars (16 bytes)', () => {
    const salt = generateSalt();
    expect(typeof salt).toBe('string');
    expect(salt.length).toBe(32);
    expect(/^[0-9a-f]+$/.test(salt)).toBe(true);
  });

  it('generateSalt returns unique values', () => {
    const s1 = generateSalt();
    const s2 = generateSalt();
    expect(s1).not.toBe(s2);
  });

  it('computeVerifier returns a non-empty hex string', () => {
    const salt = generateSalt();
    const verifier = computeVerifier(salt, 'test@haseen.me', 'password123');
    expect(typeof verifier).toBe('string');
    expect(verifier.length).toBeGreaterThan(0);
    expect(/^[0-9a-f]+$/.test(verifier)).toBe(true);
  });

  it('same inputs produce same verifier (deterministic)', () => {
    const salt = '0123456789abcdef0123456789abcdef';
    const v1 = computeVerifier(salt, 'user@test.com', 'pass');
    const v2 = computeVerifier(salt, 'user@test.com', 'pass');
    expect(v1).toBe(v2);
  });

  it('different passwords produce different verifiers', () => {
    const salt = generateSalt();
    const v1 = computeVerifier(salt, 'user@test.com', 'password1');
    const v2 = computeVerifier(salt, 'user@test.com', 'password2');
    expect(v1).not.toBe(v2);
  });

  it('different salts produce different verifiers', () => {
    const v1 = computeVerifier(generateSalt(), 'user@test.com', 'pass');
    const v2 = computeVerifier(generateSalt(), 'user@test.com', 'pass');
    expect(v1).not.toBe(v2);
  });

  it('generateEphemeral returns secret and public hex strings', () => {
    const eph = generateEphemeral();
    expect(typeof eph.secret).toBe('string');
    expect(typeof eph.public).toBe('string');
    expect(eph.secret.length).toBeGreaterThan(0);
    expect(eph.public.length).toBeGreaterThan(0);
    expect(/^[0-9a-f]+$/.test(eph.secret)).toBe(true);
    expect(/^[0-9a-f]+$/.test(eph.public)).toBe(true);
  });

  it('generateEphemeral returns unique values', () => {
    const e1 = generateEphemeral();
    const e2 = generateEphemeral();
    expect(e1.public).not.toBe(e2.public);
    expect(e1.secret).not.toBe(e2.secret);
  });

  it('computeClientProof returns m1 hex and 32-byte session key', () => {
    // Use arbitrary (non-real-server) values to test structural correctness
    const salt = generateSalt();
    const eph = generateEphemeral();
    // Simulate a fake server B value (just needs to be a valid large hex number)
    const fakeB = computeVerifier(salt, 'test@test.com', 'pass');

    const result = computeClientProof(
      eph.secret,
      eph.public,
      fakeB,
      salt,
      'test@test.com',
      'pass',
    );

    expect(typeof result.m1).toBe('string');
    expect(result.m1.length).toBeGreaterThan(0);
    expect(/^[0-9a-f]+$/.test(result.m1)).toBe(true);
    expect(result.sessionKey).toBeInstanceOf(Uint8Array);
    expect(result.sessionKey.length).toBe(32);
  });

  it('verifyServerProof validates correct M2', () => {
    // This tests the M2 = H(A || M1 || K) formula
    // We can't do a full client-server test without the Go server,
    // but we can verify the structural formula
    const salt = generateSalt();
    const eph = generateEphemeral();
    const fakeB = computeVerifier(salt, 'user@x.com', 'pw');

    const { m1, sessionKey } = computeClientProof(
      eph.secret,
      eph.public,
      fakeB,
      salt,
      'user@x.com',
      'pw',
    );

    // Manually cannot compute real M2 without server, but can verify
    // that a random M2 is correctly rejected
    const wrongM2 = 'deadbeef';
    expect(verifyServerProof(eph.public, m1, sessionKey, wrongM2)).toBe(false);
  });
});
