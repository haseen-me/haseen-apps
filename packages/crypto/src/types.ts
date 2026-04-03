export interface KeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface EncryptedData {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  ephemeralPublicKey?: Uint8Array;
}

export interface SignedData {
  message: Uint8Array;
  signature: Uint8Array;
}

export interface EncryptedEnvelope {
  version: number;
  senderPublicKey: string;
  encryptedSessionKey: EncryptedData;
  encryptedPayload: EncryptedData;
  signature: SignedData;
}
