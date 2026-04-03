import { describe, it, expect } from 'vitest';
import {
  generateKeyPair,
  generateSigningKeyPair,
  sealEnvelope,
  openEnvelope,
} from '../index';

describe('E2E Envelope (sealEnvelope / openEnvelope)', () => {
  it('encrypts and decrypts a message for a single recipient', () => {
    const senderEnc = generateKeyPair();
    const senderSign = generateSigningKeyPair();
    const recipientEnc = generateKeyPair();

    const plaintext = 'Hello from Haseen Mail!';
    const { envelope, encryptedSessionKeys } = sealEnvelope(
      plaintext,
      senderEnc,
      senderSign,
      [recipientEnc.publicKey],
    );

    expect(envelope.version).toBe(1);
    expect(envelope.encryptedPayload.ciphertext).toBeInstanceOf(Uint8Array);
    expect(envelope.signature.signature).toBeInstanceOf(Uint8Array);

    // Recipient decrypts using their encrypted session key
    const recipientKeyHex = Array.from(recipientEnc.publicKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const encSessionKey = encryptedSessionKeys.get(recipientKeyHex);
    expect(encSessionKey).toBeDefined();

    const decrypted = openEnvelope(
      envelope,
      encSessionKey!,
      recipientEnc,
      senderSign.publicKey,
    );
    expect(decrypted).toBe(plaintext);
  });

  it('sender can also decrypt their own envelope', () => {
    const senderEnc = generateKeyPair();
    const senderSign = generateSigningKeyPair();

    const plaintext = 'Self-readable sent message';
    const { envelope } = sealEnvelope(plaintext, senderEnc, senderSign, []);

    // Sender decrypts using the envelope's encryptedSessionKey (sender copy)
    const senderSessionKey = envelope.encryptedSessionKey;
    const combined = new Uint8Array(senderSessionKey.nonce.length + senderSessionKey.ciphertext.length);
    combined.set(senderSessionKey.nonce);
    combined.set(senderSessionKey.ciphertext, senderSessionKey.nonce.length);

    const decrypted = openEnvelope(
      envelope,
      combined,
      senderEnc,
      senderSign.publicKey,
    );
    expect(decrypted).toBe(plaintext);
  });

  it('encrypts for multiple recipients', () => {
    const senderEnc = generateKeyPair();
    const senderSign = generateSigningKeyPair();
    const r1 = generateKeyPair();
    const r2 = generateKeyPair();
    const r3 = generateKeyPair();

    const plaintext = 'Group message';
    const { envelope, encryptedSessionKeys } = sealEnvelope(
      plaintext,
      senderEnc,
      senderSign,
      [r1.publicKey, r2.publicKey, r3.publicKey],
    );

    expect(encryptedSessionKeys.size).toBe(3);

    // Each recipient can decrypt
    for (const [recipientEnc, label] of [[r1, 'r1'], [r2, 'r2'], [r3, 'r3']] as const) {
      const keyHex = Array.from(recipientEnc.publicKey)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const encKey = encryptedSessionKeys.get(keyHex);
      expect(encKey, `${label} session key should exist`).toBeDefined();

      const decrypted = openEnvelope(envelope, encKey!, recipientEnc, senderSign.publicKey);
      expect(decrypted).toBe(plaintext);
    }
  });

  it('rejects envelope with wrong signing key (impersonation)', () => {
    const senderEnc = generateKeyPair();
    const senderSign = generateSigningKeyPair();
    const recipientEnc = generateKeyPair();
    const imposterSign = generateSigningKeyPair();

    const { envelope, encryptedSessionKeys } = sealEnvelope(
      'secret',
      senderEnc,
      senderSign,
      [recipientEnc.publicKey],
    );

    const keyHex = Array.from(recipientEnc.publicKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Attempt to open with imposter's signing key → signature fails
    expect(() =>
      openEnvelope(envelope, encryptedSessionKeys.get(keyHex)!, recipientEnc, imposterSign.publicKey),
    ).toThrow('signature verification failed');
  });

  it('rejects envelope opened by unauthorized recipient', () => {
    const senderEnc = generateKeyPair();
    const senderSign = generateSigningKeyPair();
    const recipient = generateKeyPair();
    const unauthorized = generateKeyPair();

    const { encryptedSessionKeys } = sealEnvelope(
      'for recipient only',
      senderEnc,
      senderSign,
      [recipient.publicKey],
    );

    // Unauthorized party doesn't have their session key at all
    const unauthKeyHex = Array.from(unauthorized.publicKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    expect(encryptedSessionKeys.get(unauthKeyHex)).toBeUndefined();
  });

  it('handles empty plaintext', () => {
    const senderEnc = generateKeyPair();
    const senderSign = generateSigningKeyPair();
    const recipientEnc = generateKeyPair();

    const { envelope, encryptedSessionKeys } = sealEnvelope(
      '',
      senderEnc,
      senderSign,
      [recipientEnc.publicKey],
    );

    const keyHex = Array.from(recipientEnc.publicKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const decrypted = openEnvelope(
      envelope,
      encryptedSessionKeys.get(keyHex)!,
      recipientEnc,
      senderSign.publicKey,
    );
    expect(decrypted).toBe('');
  });

  it('handles unicode plaintext', () => {
    const senderEnc = generateKeyPair();
    const senderSign = generateSigningKeyPair();
    const recipientEnc = generateKeyPair();

    const plaintext = '🔒 Encrypted message: مرحبا العالم — 你好世界';
    const { envelope, encryptedSessionKeys } = sealEnvelope(
      plaintext,
      senderEnc,
      senderSign,
      [recipientEnc.publicKey],
    );

    const keyHex = Array.from(recipientEnc.publicKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const decrypted = openEnvelope(
      envelope,
      encryptedSessionKeys.get(keyHex)!,
      recipientEnc,
      senderSign.publicKey,
    );
    expect(decrypted).toBe(plaintext);
  });
});
