import { create } from 'zustand';
import { generateKeyPair, generateSigningKeyPair, sign } from '@haseen-me/crypto';
import type { KeyPair } from '@haseen-me/crypto';
import { keysApi } from '@/api/client';

interface CryptoState {
  encryptionKeyPair: KeyPair | null;
  signingKeyPair: KeyPair | null;
  initialized: boolean;
  initializeKeys: () => void;
}

const STORAGE_KEY = 'haseen-mail-keypairs';

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

function storeKeys(enc: KeyPair, sig: KeyPair) {
  const data = {
    enc: { pub: toHex(enc.publicKey), sec: toHex(enc.secretKey) },
    sig: { pub: toHex(sig.publicKey), sec: toHex(sig.secretKey) },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadKeys(): { enc: KeyPair; sig: KeyPair } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return {
      enc: { publicKey: fromHex(data.enc.pub), secretKey: fromHex(data.enc.sec) },
      sig: { publicKey: fromHex(data.sig.pub), secretKey: fromHex(data.sig.sec) },
    };
  } catch {
    return null;
  }
}

export const useCryptoStore = create<CryptoState>((set) => ({
  encryptionKeyPair: null,
  signingKeyPair: null,
  initialized: false,
  initializeKeys: () => {
    const stored = loadKeys();
    if (stored) {
      set({ encryptionKeyPair: stored.enc, signingKeyPair: stored.sig, initialized: true });
      return;
    }
    const enc = generateKeyPair();
    const sig = generateSigningKeyPair();
    storeKeys(enc, sig);
    set({ encryptionKeyPair: enc, signingKeyPair: sig, initialized: true });

    // Publish keys to keyserver (fire-and-forget)
    const selfSig = sign(enc.publicKey, sig.secretKey).signature;
    keysApi.publishKey({
      encryptionPublicKey: btoa(String.fromCharCode(...enc.publicKey)),
      signingPublicKey: btoa(String.fromCharCode(...sig.publicKey)),
      selfSignature: btoa(String.fromCharCode(...selfSig)),
    }).catch(() => {});
  },
}));
