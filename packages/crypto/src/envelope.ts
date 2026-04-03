import nacl from 'tweetnacl';
import { decodeUTF8, encodeUTF8 } from 'tweetnacl-util';
import { encrypt, decrypt, encryptSymmetric, decryptSymmetric } from './encryption';
import { sign, verify } from './signing';
import { deriveSessionKey } from './session';
import type { EncryptedEnvelope, KeyPair } from './types';

/**
 * Seal an encrypted envelope for one or more recipients.
 *
 * Flow (per CLAUDE.md):
 * 1. Generate random session key
 * 2. Encrypt plaintext with session key (symmetric, NaCl secretbox)
 * 3. For each recipient, encrypt the session key with their X25519 public key (asymmetric)
 * 4. Sign the encrypted payload with sender's Ed25519 signing key
 * 5. Return envelope + per-recipient encrypted session keys
 */
export function sealEnvelope(
  plaintext: string,
  senderEncryptionKeyPair: KeyPair,
  senderSigningKeyPair: KeyPair,
  recipientPublicKeys: Uint8Array[],
): { envelope: EncryptedEnvelope; encryptedSessionKeys: Map<string, Uint8Array> } {
  // 1. Generate session key
  const sessionKey = deriveSessionKey();

  // 2. Encrypt plaintext with session key
  const plaintextBytes = decodeUTF8(plaintext);
  const encryptedPayload = encryptSymmetric(plaintextBytes, sessionKey);

  // 3. Encrypt session key for each recipient
  const encryptedSessionKeys = new Map<string, Uint8Array>();
  for (const recipientPk of recipientPublicKeys) {
    const encrypted = encrypt(sessionKey, recipientPk, senderEncryptionKeyPair.secretKey);
    // Store as: nonce + ciphertext concatenated, keyed by hex of recipient pubkey
    const combined = new Uint8Array(encrypted.nonce.length + encrypted.ciphertext.length);
    combined.set(encrypted.nonce);
    combined.set(encrypted.ciphertext, encrypted.nonce.length);
    const keyHex = toHex(recipientPk);
    encryptedSessionKeys.set(keyHex, combined);
  }

  // Also encrypt session key for sender (so sender can read their own sent messages)
  const senderEncSessionKey = encrypt(
    sessionKey,
    senderEncryptionKeyPair.publicKey,
    senderEncryptionKeyPair.secretKey,
  );

  // 4. Sign the encrypted payload ciphertext
  const signed = sign(encryptedPayload.ciphertext, senderSigningKeyPair.secretKey);

  // 5. Assemble envelope
  const envelope: EncryptedEnvelope = {
    version: 1,
    senderPublicKey: toHex(senderEncryptionKeyPair.publicKey),
    encryptedSessionKey: senderEncSessionKey,
    encryptedPayload,
    signature: signed,
  };

  return { envelope, encryptedSessionKeys };
}

/**
 * Open an encrypted envelope as a recipient.
 *
 * Flow:
 * 1. Find recipient's encrypted session key
 * 2. Decrypt session key using recipient's private key + sender's public key
 * 3. Verify sender signature on encrypted payload
 * 4. Decrypt payload with session key (symmetric)
 * 5. Return plaintext
 */
export function openEnvelope(
  envelope: EncryptedEnvelope,
  encryptedSessionKeyBytes: Uint8Array,
  recipientEncryptionKeyPair: KeyPair,
  senderSigningPublicKey: Uint8Array,
): string {
  const senderPublicKey = fromHex(envelope.senderPublicKey);

  // 1-2. Decrypt session key
  const nonceLen = nacl.box.nonceLength;
  const nonce = encryptedSessionKeyBytes.slice(0, nonceLen);
  const ciphertext = encryptedSessionKeyBytes.slice(nonceLen);
  const sessionKey = decrypt(
    { ciphertext, nonce },
    senderPublicKey,
    recipientEncryptionKeyPair.secretKey,
  );

  // 3. Verify signature
  const isValid = verify(
    envelope.encryptedPayload.ciphertext,
    envelope.signature.signature,
    senderSigningPublicKey,
  );
  if (!isValid) {
    throw new Error('Envelope signature verification failed');
  }

  // 4. Decrypt payload
  const plaintext = decryptSymmetric(envelope.encryptedPayload, sessionKey);

  // 5. Decode and return
  return encodeUTF8(plaintext);
}

// --- Hex helpers ---

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}
