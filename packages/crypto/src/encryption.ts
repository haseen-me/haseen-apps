import nacl from 'tweetnacl';
import type { EncryptedData } from './types';
import { generateNonce } from './session';

/** Asymmetric encrypt (NaCl box): sender's secret + recipient's public key. */
export function encrypt(
  message: Uint8Array,
  recipientPublicKey: Uint8Array,
  senderSecretKey: Uint8Array,
): EncryptedData {
  const nonce = generateNonce();
  const ciphertext = nacl.box(message, nonce, recipientPublicKey, senderSecretKey);
  return { ciphertext, nonce };
}

/** Asymmetric decrypt (NaCl box.open). */
export function decrypt(
  encrypted: EncryptedData,
  senderPublicKey: Uint8Array,
  recipientSecretKey: Uint8Array,
): Uint8Array {
  const result = nacl.box.open(
    encrypted.ciphertext,
    encrypted.nonce,
    senderPublicKey,
    recipientSecretKey,
  );
  if (!result) {
    throw new Error('Decryption failed: invalid ciphertext or wrong keys');
  }
  return result;
}

/** Symmetric encrypt (NaCl secretbox) using a shared session key. */
export function encryptSymmetric(
  message: Uint8Array,
  key: Uint8Array,
): EncryptedData {
  const nonce = generateNonce();
  const ciphertext = nacl.secretbox(message, nonce, key);
  return { ciphertext, nonce };
}

/** Symmetric decrypt (NaCl secretbox.open). */
export function decryptSymmetric(
  encrypted: EncryptedData,
  key: Uint8Array,
): Uint8Array {
  const result = nacl.secretbox.open(encrypted.ciphertext, encrypted.nonce, key);
  if (!result) {
    throw new Error('Decryption failed: invalid ciphertext or wrong key');
  }
  return result;
}
