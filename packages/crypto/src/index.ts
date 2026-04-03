/**
 * @haseen-me/crypto
 *
 * Client-side E2E encryption primitives for Haseen.
 * Uses NaCl (TweetNaCl) for asymmetric + symmetric encryption.
 *
 * Architecture:
 * - Each user has a long-term keypair (signing + encryption)
 * - Session keys are derived per-conversation/document
 * - All encryption/decryption happens client-side
 * - Server never sees plaintext or private keys
 */

export { generateKeyPair, generateSigningKeyPair } from './keys';
export { encrypt, decrypt, encryptSymmetric, decryptSymmetric } from './encryption';
export { sign, verify } from './signing';
export { deriveSessionKey, generateNonce } from './session';
export { sealEnvelope, openEnvelope } from './envelope';
export type { KeyPair, EncryptedData, SignedData, EncryptedEnvelope } from './types';
