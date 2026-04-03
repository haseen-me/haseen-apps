import { useMemo } from 'react';
import { useCryptoStore } from '@/store/crypto';
import { openEnvelope } from '@haseen-me/crypto';
import type { EncryptedEnvelope } from '@haseen-me/crypto';

/**
 * Attempt to decrypt an encrypted envelope JSON string.
 * Returns the plaintext if successful, or the original string if it's not an envelope.
 */
export function useDecrypt(encryptedText: string): string {
  const encryptionKeyPair = useCryptoStore((s) => s.encryptionKeyPair);
  const signingKeyPair = useCryptoStore((s) => s.signingKeyPair);

  return useMemo(() => {
    if (!encryptionKeyPair || !signingKeyPair) return encryptedText;
    try {
      const envelope: EncryptedEnvelope = JSON.parse(encryptedText);
      if (!envelope.version || !envelope.encryptedSessionKey || !envelope.encryptedPayload) {
        return encryptedText;
      }
      const sk = envelope.encryptedSessionKey;
      const nonceArr = sk.nonce instanceof Uint8Array ? sk.nonce : new Uint8Array(Object.values(sk.nonce));
      const ctArr = sk.ciphertext instanceof Uint8Array ? sk.ciphertext : new Uint8Array(Object.values(sk.ciphertext));
      const combined = new Uint8Array(nonceArr.length + ctArr.length);
      combined.set(nonceArr);
      combined.set(ctArr, nonceArr.length);

      return openEnvelope(
        envelope,
        combined,
        encryptionKeyPair,
        signingKeyPair.publicKey,
      );
    } catch {
      return encryptedText;
    }
  }, [encryptedText, encryptionKeyPair, signingKeyPair]);
}
