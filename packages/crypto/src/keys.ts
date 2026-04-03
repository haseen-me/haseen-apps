import nacl from 'tweetnacl';
import type { KeyPair } from './types';

/** Generate an X25519 keypair for asymmetric encryption. */
export function generateKeyPair(): KeyPair {
  return nacl.box.keyPair();
}

/** Generate an Ed25519 keypair for digital signatures. */
export function generateSigningKeyPair(): KeyPair {
  return nacl.sign.keyPair();
}
