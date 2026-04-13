import { decryptSymmetric, deriveSessionKey, encryptSymmetric } from '@haseen-me/crypto';
import type { ContactPayload, DecryptedContact, EncryptedContactRecord } from '@/types/contacts';
import { buildSearchIndex } from '@/lib/contacts';

const STORAGE_KEY = 'haseen-contacts-vault-key';

interface SerializedEnvelope {
  version: number;
  algorithm: 'nacl.secretbox';
  nonce: string;
  ciphertext: string;
}

export function getOrCreateVaultKey(): Uint8Array {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return base64ToBytes(stored);
  }

  const key = deriveSessionKey();
  localStorage.setItem(STORAGE_KEY, bytesToBase64(key));
  return key;
}

export function encryptPayload(payload: ContactPayload, key: Uint8Array): string {
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const encrypted = encryptSymmetric(plaintext, key);
  const envelope: SerializedEnvelope = {
    version: 1,
    algorithm: 'nacl.secretbox',
    nonce: bytesToBase64(encrypted.nonce),
    ciphertext: bytesToBase64(encrypted.ciphertext),
  };

  return bytesToBase64(new TextEncoder().encode(JSON.stringify(envelope)));
}

export function decryptPayload(encoded: string, key: Uint8Array): ContactPayload {
  const envelopeBytes = base64ToBytes(encoded);
  const envelope = JSON.parse(new TextDecoder().decode(envelopeBytes)) as SerializedEnvelope;
  const plaintext = decryptSymmetric(
    {
      nonce: base64ToBytes(envelope.nonce),
      ciphertext: base64ToBytes(envelope.ciphertext),
    },
    key,
  );

  return JSON.parse(new TextDecoder().decode(plaintext)) as ContactPayload;
}

export function decryptRecord(record: EncryptedContactRecord, key: Uint8Array): DecryptedContact {
  const payload = decryptPayload(record.encryptedData, key);
  return {
    ...record,
    payload,
    searchIndex: buildSearchIndex(payload),
  };
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
