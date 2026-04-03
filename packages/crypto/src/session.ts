import nacl from 'tweetnacl';

/** Generate a random 24-byte nonce for NaCl box/secretbox. */
export function generateNonce(): Uint8Array {
  return nacl.randomBytes(nacl.box.nonceLength);
}

/** Generate a random 32-byte symmetric key for session encryption. */
export function deriveSessionKey(): Uint8Array {
  return nacl.randomBytes(nacl.secretbox.keyLength);
}
