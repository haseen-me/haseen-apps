/**
 * Client-side SRP-6a implementation matching the Go server.
 *
 * Protocol flow:
 *   Register: salt = random(16), x = H(salt || H(email:pass)), v = g^x mod N
 *   Login step 1: a = random(256-bit), A = g^a mod N → send {email, A}
 *   Server returns: {B, salt}
 *   Login step 2: u = H(A || B), x = H(salt || H(email:pass)),
 *                  S = (B - k*g^x)^(a + u*x) mod N, K = H(S)
 *                  M1 = H(A || B || K) → send {email, M1}
 *   Server returns: {M2, token}
 *   Verify: M2 == H(A || M1 || K)
 *
 * Wire format: all big-integer values are hex strings (lowercase).
 * Hash function: SHA-256 throughout (matching Go's crypto/sha256).
 */

// 2048-bit group from RFC 5054 Appendix A — must match server exactly
const N_HEX =
  'AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC3192943DB56050A37329CBB4' +
  'A099ED8193E0757767A13DD52312AB4B03310DCD7F48A9DA04FD50E8083969EDB767B0CF60' +
  '95179A163AB3661A05FBD5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF' +
  '747359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A436C6481F1D2B907' +
  '8717461A5B9D32E688F87748544523B524B0D57D5EA77A2775D2ECFA032CFBDBF52FB37861' +
  '60279004E57AE6AF874E7303CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DB' +
  'FBB694B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F9E4AFF73';

const N = BigInt('0x' + N_HEX);
const g = 2n;

// k = H(N || PAD(g))
const k = computeK(N, g);

function computeK(n: bigint, gen: bigint): bigint {
  const nBytes = bigToBytes(n);
  const gPadded = padBytes(bigToBytes(gen), nBytes.length);
  return bytesToBig(sha256Sync(concatBytes(nBytes, gPadded)));
}

// --- Public API ---

/** Generate a random 16-byte SRP salt as hex. */
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/** Compute SRP verifier: x = H(salt || H(email:password)), v = g^x mod N */
export function computeVerifier(saltHex: string, email: string, password: string): string {
  const x = computeX(saltHex, email, password);
  const v = modPow(g, x, N);
  return bigToHex(v);
}

/** Generate client ephemeral: a = random(256-bit), A = g^a mod N */
export function generateEphemeral(): { secret: string; public: string } {
  const aBytes = new Uint8Array(32);
  crypto.getRandomValues(aBytes);
  const a = bytesToBig(aBytes);
  const A = modPow(g, a, N);
  return { secret: bigToHex(a), public: bigToHex(A) };
}

/**
 * Compute client proof M1 after receiving server's B and salt.
 * Returns { m1, sessionKey } where m1 is the hex proof and sessionKey is K bytes.
 */
export function computeClientProof(
  aSecretHex: string,
  aPublicHex: string,
  bPublicHex: string,
  saltHex: string,
  email: string,
  password: string,
): { m1: string; sessionKey: Uint8Array } {
  const a = hexToBig(aSecretHex);
  const A = hexToBig(aPublicHex);
  const B = hexToBig(bPublicHex);

  // u = H(A || B)
  const u = bytesToBig(sha256Sync(concatBytes(bigToBytes(A), bigToBytes(B))));

  // x = H(salt || H(email:password))
  const x = computeX(saltHex, email, password);

  // S = (B - k * g^x)^(a + u*x) mod N
  const gx = modPow(g, x, N);
  const kgx = (k * gx) % N;
  let base = B - kgx;
  // Ensure positive mod
  base = ((base % N) + N) % N;
  const exp = (a + u * x) % (N - 1n);
  const S = modPow(base, exp, N);

  // K = H(S)
  const K = sha256Sync(bigToBytes(S));

  // M1 = H(A || B || K)
  const M1 = bytesToBig(sha256Sync(concatBytes(bigToBytes(A), bigToBytes(B), K)));

  return { m1: bigToHex(M1), sessionKey: K };
}

/** Verify server proof M2 = H(A || M1 || K) */
export function verifyServerProof(
  aPublicHex: string,
  m1Hex: string,
  sessionKey: Uint8Array,
  m2Hex: string,
): boolean {
  const A = hexToBig(aPublicHex);
  const M1 = hexToBig(m1Hex);
  const expected = bytesToBig(sha256Sync(concatBytes(bigToBytes(A), bigToBytes(M1), sessionKey)));
  return expected === hexToBig(m2Hex);
}

// --- Internal computation helpers ---

function computeX(saltHex: string, email: string, password: string): bigint {
  // inner = H(email:password)
  const inner = sha256Sync(new TextEncoder().encode(email + ':' + password));
  // x = H(salt || inner)
  const salt = hexToBytes(saltHex);
  return bytesToBig(sha256Sync(concatBytes(salt, inner)));
}

// --- Modular exponentiation (BigInt) ---

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  // Use the built-in BigInt exponentiation with modular reduction via square-and-multiply
  let result = 1n;
  base = base % mod;
  if (base < 0n) base = base + mod;
  while (exp > 0n) {
    if (exp & 1n) {
      result = (result * base) % mod;
    }
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

// --- SHA-256 (synchronous via SubtleCrypto workaround: use js-sha256 pattern) ---
// We use a synchronous SHA-256 implementation since the SRP math is sequential.
// This is a minimal, correct SHA-256 using the same algorithm as the standard.

function sha256Sync(data: Uint8Array): Uint8Array {
  // Standard SHA-256 constants
  const K: number[] = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  // Pre-processing: pad message
  const msgLen = data.length;
  const bitLen = msgLen * 8;
  // Padding: 1 bit, then zeros, then 64-bit big-endian length
  const padLen = (64 - ((msgLen + 9) % 64)) % 64;
  const padded = new Uint8Array(msgLen + 1 + padLen + 8);
  padded.set(data);
  padded[msgLen] = 0x80;
  // Write 64-bit big-endian bit length
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen, false);

  // Process each 64-byte block
  const w = new Int32Array(64);
  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = dv.getInt32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(w[i - 15]!, 7) ^ rotr(w[i - 15]!, 18) ^ (w[i - 15]! >>> 3)) | 0;
      const s1 = (rotr(w[i - 2]!, 17) ^ rotr(w[i - 2]!, 19) ^ (w[i - 2]! >>> 10)) | 0;
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) | 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, gg = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) | 0;
      const ch = ((e & f) ^ (~e & gg)) | 0;
      const temp1 = (h + S1 + ch + K[i]! + w[i]!) | 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) | 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) | 0;
      const temp2 = (S0 + maj) | 0;
      h = gg; gg = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + gg) | 0; h7 = (h7 + h) | 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setInt32(0, h0, false); outView.setInt32(4, h1, false);
  outView.setInt32(8, h2, false); outView.setInt32(12, h3, false);
  outView.setInt32(16, h4, false); outView.setInt32(20, h5, false);
  outView.setInt32(24, h6, false); outView.setInt32(28, h7, false);
  return out;
}

function rotr(n: number, s: number): number {
  return (n >>> s) | (n << (32 - s));
}

// --- Byte/hex/BigInt conversion helpers ---

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function padBytes(bytes: Uint8Array, length: number): Uint8Array {
  if (bytes.length >= length) return bytes;
  const padded = new Uint8Array(length);
  padded.set(bytes, length - bytes.length);
  return padded;
}

function bigToBytes(n: bigint): Uint8Array {
  let hex = n.toString(16);
  if (hex.length % 2) hex = '0' + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToBig(bytes: Uint8Array): bigint {
  let hex = '';
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return hex.length === 0 ? 0n : BigInt('0x' + hex);
}

function bigToHex(n: bigint): string {
  return n.toString(16);
}

function hexToBig(hex: string): bigint {
  return hex.length === 0 ? 0n : BigInt('0x' + hex);
}

function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2) hex = '0' + hex;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return hex;
}
