const API_BASE = '/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface RegisterPayload {
  email: string;
  srpVerifier: string;
  srpSalt: string;
  publicKey: string;
  signingKey: string;
  encryptedPrivateKey: string;
}

export interface LoginInitPayload {
  email: string;
  srpA: string;
}

export interface LoginVerifyPayload {
  email: string;
  srpM1: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
    mfaEnabled: boolean;
    createdAt: string;
  };
  recoveryKey?: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    request<AuthResponse>('/register', { method: 'POST', body: JSON.stringify(data) }),

  loginInit: (data: LoginInitPayload) =>
    request<{ srpB: string; srpSalt: string }>('/login/init', { method: 'POST', body: JSON.stringify(data) }),

  loginVerify: (data: LoginVerifyPayload) =>
    request<AuthResponse>('/login/verify', { method: 'POST', body: JSON.stringify(data) }),

  logout: (token: string) =>
    request<{ ok: boolean }>('/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  getAccount: (token: string) =>
    request<AuthResponse['user']>('/account', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateAccount: (token: string, data: { displayName?: string }) =>
    request<AuthResponse['user']>('/account', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteAccount: (token: string) =>
    request<{ ok: boolean }>('/account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  setupMfa: (token: string) =>
    request<{ secret: string; qrUri: string }>('/mfa/setup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),

  verifyMfa: (token: string, code: string) =>
    request<{ ok: boolean }>('/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: { Authorization: `Bearer ${token}` },
    }),

  disableMfa: (token: string) =>
    request<{ ok: boolean }>('/mfa', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),

  generateRecoveryKey: (token: string) =>
    request<{ recoveryKey: string }>('/account/recovery-key', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
};
