/**
 * Password-based key derivation for encrypting private keys at rest.
 *
 * Uses PBKDF2-SHA256 via Web Crypto API (available in all modern browsers).
 * The derived key encrypts the user's private NaCl keys so they can be
 * stored safely in localStorage/IndexedDB without exposing them if storage is compromised.
 */

import nacl from 'tweetnacl';
import { decodeUTF8 } from 'tweetnacl-util';

const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommendation for SHA-256
const SALT_LENGTH = 32;
const KEY_LENGTH = 32; // NaCl secretbox key length

/** Generate a random 32-byte KDF salt. */
export function generateKdfSalt(): Uint8Array {
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);
  return salt;
}

/** Derive a 32-byte symmetric key from password + salt using PBKDF2-SHA256. */
export async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const passwordBytes = decodeUTF8(password);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes as unknown as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as unknown as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    KEY_LENGTH * 8,
  );

  return new Uint8Array(derivedBits);
}

/** Encrypt private keys with a password-derived key. Returns salt + nonce + ciphertext. */
export async function encryptPrivateKeys(
  password: string,
  encryptionSecretKey: Uint8Array,
  signingSecretKey: Uint8Array,
): Promise<Uint8Array> {
  const salt = generateKdfSalt();
  const derivedKey = await deriveKeyFromPassword(password, salt);

  // Concatenate both secret keys
  const combined = new Uint8Array(encryptionSecretKey.length + signingSecretKey.length);
  combined.set(encryptionSecretKey);
  combined.set(signingSecretKey, encryptionSecretKey.length);

  // Encrypt with NaCl secretbox
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const ciphertext = nacl.secretbox(combined, nonce, derivedKey);

  // Pack: salt(32) + nonce(24) + ciphertext
  const packed = new Uint8Array(salt.length + nonce.length + ciphertext.length);
  packed.set(salt);
  packed.set(nonce, salt.length);
  packed.set(ciphertext, salt.length + nonce.length);

  return packed;
}

/** Decrypt private keys from packed blob using password. Returns { encryptionSecretKey, signingSecretKey }. */
export async function decryptPrivateKeys(
  password: string,
  packed: Uint8Array,
): Promise<{ encryptionSecretKey: Uint8Array; signingSecretKey: Uint8Array }> {
  const salt = packed.slice(0, SALT_LENGTH);
  const nonce = packed.slice(SALT_LENGTH, SALT_LENGTH + nacl.secretbox.nonceLength);
  const ciphertext = packed.slice(SALT_LENGTH + nacl.secretbox.nonceLength);

  const derivedKey = await deriveKeyFromPassword(password, salt);
  const combined = nacl.secretbox.open(ciphertext, nonce, derivedKey);

  if (!combined) {
    throw new Error('Failed to decrypt private keys — wrong password?');
  }

  // NaCl box secret key = 32 bytes, Ed25519 secret key = 64 bytes
  const encryptionSecretKey = combined.slice(0, nacl.box.secretKeyLength);
  const signingSecretKey = combined.slice(nacl.box.secretKeyLength);

  return { encryptionSecretKey, signingSecretKey };
}
