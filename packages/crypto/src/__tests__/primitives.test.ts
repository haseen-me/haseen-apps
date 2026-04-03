import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  generateSigningKeyPair,
  encrypt,
  decrypt,
  encryptSymmetric,
  decryptSymmetric,
  sign,
  verify,
  deriveSessionKey,
  generateNonce,
} from '../index';

describe('Key Generation', () => {
  it('generateKeyPair returns 32-byte public and secret keys', () => {
    const kp = generateKeyPair();
    expect(kp.publicKey).toBeInstanceOf(Uint8Array);
    expect(kp.secretKey).toBeInstanceOf(Uint8Array);
    expect(kp.publicKey.length).toBe(32);
    expect(kp.secretKey.length).toBe(32);
  });

  it('generateKeyPair returns unique keypairs each time', () => {
    const kp1 = generateKeyPair();
    const kp2 = generateKeyPair();
    expect(kp1.publicKey).not.toEqual(kp2.publicKey);
    expect(kp1.secretKey).not.toEqual(kp2.secretKey);
  });

  it('generateSigningKeyPair returns correct key lengths', () => {
    const kp = generateSigningKeyPair();
    expect(kp.publicKey).toBeInstanceOf(Uint8Array);
    expect(kp.secretKey).toBeInstanceOf(Uint8Array);
    expect(kp.publicKey.length).toBe(32);
    expect(kp.secretKey.length).toBe(64);
  });
});

describe('Asymmetric Encryption (NaCl box)', () => {
  it('encrypts and decrypts a message between two parties', () => {
    const sender = generateKeyPair();
    const recipient = generateKeyPair();

    const message = new TextEncoder().encode('Hello, Haseen!');
    const encrypted = encrypt(message, recipient.publicKey, sender.secretKey);

    expect(encrypted.ciphertext).toBeInstanceOf(Uint8Array);
    expect(encrypted.nonce).toBeInstanceOf(Uint8Array);
    expect(encrypted.nonce.length).toBe(24);
    expect(encrypted.ciphertext).not.toEqual(message);

    const decrypted = decrypt(encrypted, sender.publicKey, recipient.secretKey);
    expect(decrypted).toEqual(message);
  });

  it('fails to decrypt with wrong recipient key', () => {
    const sender = generateKeyPair();
    const recipient = generateKeyPair();
    const imposter = generateKeyPair();

    const message = new TextEncoder().encode('secret data');
    const encrypted = encrypt(message, recipient.publicKey, sender.secretKey);

    expect(() => decrypt(encrypted, sender.publicKey, imposter.secretKey)).toThrow(
      'Decryption failed',
    );
  });

  it('fails to decrypt with wrong sender key (sender identity)', () => {
    const sender = generateKeyPair();
    const recipient = generateKeyPair();
    const imposter = generateKeyPair();

    const message = new TextEncoder().encode('secret data');
    const encrypted = encrypt(message, recipient.publicKey, sender.secretKey);

    expect(() => decrypt(encrypted, imposter.publicKey, recipient.secretKey)).toThrow(
      'Decryption failed',
    );
  });

  it('produces different ciphertext for the same message (random nonce)', () => {
    const sender = generateKeyPair();
    const recipient = generateKeyPair();

    const message = new TextEncoder().encode('same message');
    const e1 = encrypt(message, recipient.publicKey, sender.secretKey);
    const e2 = encrypt(message, recipient.publicKey, sender.secretKey);

    expect(e1.nonce).not.toEqual(e2.nonce);
    expect(e1.ciphertext).not.toEqual(e2.ciphertext);
  });
});

describe('Symmetric Encryption (NaCl secretbox)', () => {
  it('encrypts and decrypts with a session key', () => {
    const key = deriveSessionKey();
    const message = new TextEncoder().encode('symmetric secret');
    const encrypted = encryptSymmetric(message, key);

    expect(encrypted.ciphertext).not.toEqual(message);

    const decrypted = decryptSymmetric(encrypted, key);
    expect(decrypted).toEqual(message);
  });

  it('fails to decrypt with wrong key', () => {
    const key1 = deriveSessionKey();
    const key2 = deriveSessionKey();
    const message = new TextEncoder().encode('data');
    const encrypted = encryptSymmetric(message, key1);

    expect(() => decryptSymmetric(encrypted, key2)).toThrow('Decryption failed');
  });

  it('handles empty message', () => {
    const key = deriveSessionKey();
    const message = new Uint8Array(0);
    const encrypted = encryptSymmetric(message, key);
    const decrypted = decryptSymmetric(encrypted, key);
    expect(decrypted).toEqual(message);
  });

  it('handles large message', () => {
    const key = deriveSessionKey();
    const message = new Uint8Array(50_000);
    // Fill in 64KB chunks (crypto.getRandomValues limit)
    for (let i = 0; i < message.length; i += 65536) {
      const chunk = message.subarray(i, Math.min(i + 65536, message.length));
      crypto.getRandomValues(chunk);
    }
    const encrypted = encryptSymmetric(message, key);
    const decrypted = decryptSymmetric(encrypted, key);
    expect(decrypted).toEqual(message);
  });
});

describe('Digital Signatures (Ed25519)', () => {
  it('signs and verifies a message', () => {
    const kp = generateSigningKeyPair();
    const message = new TextEncoder().encode('sign this');
    const signed = sign(message, kp.secretKey);

    expect(signed.signature).toBeInstanceOf(Uint8Array);
    expect(signed.signature.length).toBe(64);

    const valid = verify(message, signed.signature, kp.publicKey);
    expect(valid).toBe(true);
  });

  it('rejects a tampered message', () => {
    const kp = generateSigningKeyPair();
    const message = new TextEncoder().encode('original');
    const signed = sign(message, kp.secretKey);

    const tampered = new TextEncoder().encode('modified');
    expect(verify(tampered, signed.signature, kp.publicKey)).toBe(false);
  });

  it('rejects a forged signature (wrong signing key)', () => {
    const kp1 = generateSigningKeyPair();
    const kp2 = generateSigningKeyPair();
    const message = new TextEncoder().encode('data');
    const signed = sign(message, kp1.secretKey);

    expect(verify(message, signed.signature, kp2.publicKey)).toBe(false);
  });

  it('rejects a corrupted signature', () => {
    const kp = generateSigningKeyPair();
    const message = new TextEncoder().encode('data');
    const signed = sign(message, kp.secretKey);

    const corrupted = new Uint8Array(signed.signature);
    corrupted[0] ^= 0xff;
    expect(verify(message, corrupted, kp.publicKey)).toBe(false);
  });
});

describe('Session Key & Nonce', () => {
  it('deriveSessionKey returns 32 bytes', () => {
    const key = deriveSessionKey();
    expect(key).toBeInstanceOf(Uint8Array);
    expect(key.length).toBe(32);
  });

  it('generateNonce returns 24 bytes', () => {
    const nonce = generateNonce();
    expect(nonce).toBeInstanceOf(Uint8Array);
    expect(nonce.length).toBe(24);
  });

  it('derives unique keys each time', () => {
    const k1 = deriveSessionKey();
    const k2 = deriveSessionKey();
    expect(k1).not.toEqual(k2);
  });
});
