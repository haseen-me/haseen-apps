import nacl from 'tweetnacl';
import type { SignedData } from './types';

/** Sign a message with an Ed25519 secret key. */
export function sign(message: Uint8Array, secretKey: Uint8Array): SignedData {
  const signature = nacl.sign.detached(message, secretKey);
  return { message, signature };
}

/** Verify a detached Ed25519 signature. */
export function verify(
  message: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array,
): boolean {
  return nacl.sign.detached.verify(message, signature, publicKey);
}
