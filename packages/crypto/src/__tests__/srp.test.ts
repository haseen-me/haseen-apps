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

  it('matches the Go-compatible proof vector used by the auth service', () => {
    const salt = 'abcdef0123456789abcdef0123456789';
    const email = 'alice@haseen.me';
    const password = 'correct horse battery staple';
    const aSecret = '1f2e3d4c5b6a79887766554433221100ffeeddccbbaa99887766554433221100';
    const aPublic = 'a2b3f86489b5b349e8b5ad6c4f3fdc5b9522507b1c215906a6eb24d94139036eabc7028d010e78176932f22630aeeeb4c757aa5fca6937b773573f93664a9d322a9add2d54d9b63eb17805ce432c32e5166e237b53fbdca8703020089935c8befbaed787607ea90e66fdb64f856ff017065ee8812fddd6c0c6ac4f6159afcb843ca8bd7aa899ff177e69b69880518855bb624090259ced4b49134d5d473c5a1aca6f88923efe91a6ea706d409d7a360888bb7ea2f3b2fc6afded854199f19fe15824b670fc77f9e4ee3700133fc877b2714ddd77d75b3f6af00536098181a7362a2b64a1fef5f752f5e5d4d1720366732534628376f69f3f1ead47083cc29162';
    const bPublic = '98f7c1e0679f9d7e5a6b24a8a4e6a9240f5d8f4bb0c2fd1f8a76138b5c678fd7';

    expect(computeVerifier(salt, email, password)).toBe(
      '6d0ea185279494836a266a82c5ed7800350257b9e0887b8697f44743cc41b2f6dcb32bd2801ef89130edb19dfd491d3af2fd79d0ab63083406a2bae87ed44e1d9a5fd1c89dd7b179f499514f977f119f32c97d60409475da4bcc70a1eaf621eabf6397f62f7808af28437f4cbe1c566bfce4425360c867921ba0e8e80b5eda6040c3d0c36b1276fd0e72895596ce966cfc08050fde5aa05e82f34a934054a2e56153f513252bbde65b74a0970fa495f5ef0bcfa06c349d0980b9fc055d67d9e4984c29ec892f18d82101185ec840abecf55c2f8ab062b421261eac32c1653ad4d2849df6eca3e9f677876e95aa0e07d1ef8f2867ee15b4ccea0266a72df4959e',
    );

    expect(computeClientProof(aSecret, aPublic, bPublic, salt, email, password).m1).toBe(
      '9dc406dfc2c7ea6407d8ba30c49334961576b41059487e43a09d34ffd0fb6c4a',
    );
  });
});
