const API_BASE = '/api/v1/auth';

async function parseError(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({ error: 'Request failed' }));
  return (body as { error?: string }).error || `HTTP ${res.status}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  /** Base64-encoded raw public key bytes */
  publicKey: string;
  signingKey: string;
  signature: string;
}

export interface UserDTO {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  mfaEnforced?: boolean;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  createdAt: string;
}

export interface RegisterResponse {
  user: UserDTO;
  recoveryKey: string;
  emailVerified: boolean;
  verifyUrl: string;
}

export interface LoginResponse {
  user: UserDTO;
  mfaRequired?: boolean;
  mfaToken?: string;
  emailVerified: boolean;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    request<RegisterResponse>('/register', {
      method: 'POST',
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
        publicKey: data.publicKey,
        signingKey: data.signingKey,
        signature: data.signature,
      }),
    }),

  login: (email: string, password: string) =>
    request<LoginResponse>('/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  loginMfa: (mfaToken: string, code: string) =>
    request<LoginResponse>('/login/mfa', { method: 'POST', body: JSON.stringify({ mfaToken, code }) }),

  logout: () => request<{ ok: boolean }>('/logout', { method: 'POST' }),

  me: () => request<{ user: UserDTO }>('/me'),

  verifyEmail: (token: string) =>
    fetch(`${API_BASE}/verify-email?token=${encodeURIComponent(token)}`, { credentials: 'include' }).then(async (res) => {
      if (!res.ok) throw new Error(await parseError(res));
      return res.json() as Promise<{ ok: boolean }>;
    }),

  getAccount: () =>
    request<{ user: UserDTO; mfaEnabled: boolean; hasRecoveryKey: boolean }>('/account'),

  updateAccount: (data: { displayName?: string; email?: string; avatarUrl?: string }) =>
    request<UserDTO>('/account', { method: 'PUT', body: JSON.stringify(data) }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>('/account/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  deleteAccount: () => request<{ ok: boolean }>('/account', { method: 'DELETE' }),

  setupMfa: () =>
    request<{ secret: string; qrCode: string; otpAuthUrl: string }>('/mfa/setup', { method: 'POST' }),

  verifyMfa: (code: string) =>
    request<{ ok: boolean }>('/mfa/verify', { method: 'POST', body: JSON.stringify({ code }) }),

  disableMfa: () => request<{ ok: boolean }>('/mfa', { method: 'DELETE' }),

  generateRecoveryKey: () =>
    request<{ recoveryKey: string }>('/account/recovery-key', { method: 'POST' }),

  listSessions: () =>
    request<Array<{ id: string; userAgent: string; ipAddress: string; expiresAt: string; createdAt: string; current: boolean }>>(
      '/sessions',
    ),

  revokeSession: (sessionID: string) =>
    request<{ ok: boolean }>(`/sessions/${sessionID}`, { method: 'DELETE' }),

  forgotPassword: (email: string) =>
    request<{ ok: boolean; resetUrl?: string }>('/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, newPassword: string) =>
    request<{ ok: boolean }>('/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  webauthnRegisterBegin: () =>
    request<unknown>('/webauthn/register/begin', { method: 'POST', body: JSON.stringify({}) }),

  webauthnRegisterFinish: (credential: unknown, name?: string) => {
    const q = name ? `?name=${encodeURIComponent(name)}` : '';
    return request<{ ok: boolean }>(`/webauthn/register/finish${q}`, {
      method: 'POST',
      body: JSON.stringify(credential ?? {}),
    });
  },

  webauthnLoginBegin: (email: string) =>
    request<unknown>('/webauthn/login/begin', { method: 'POST', body: JSON.stringify({ email }) }),

  webauthnLoginFinish: (credential: unknown) =>
    request<LoginResponse>('/webauthn/login/finish', {
      method: 'POST',
      body: JSON.stringify(credential ?? {}),
    }),

  listPasskeys: () => request<Array<{ id: string; name: string; createdAt: string; credentialId: string }>>('/webauthn/credentials'),

  deletePasskey: (credID: string) =>
    request<{ ok: boolean }>(`/webauthn/credentials/${encodeURIComponent(credID)}`, { method: 'DELETE' }),

  adminUsers: (params?: { q?: string; limit?: number; offset?: number }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.limit != null) qs.set('limit', String(params.limit));
    if (params?.offset != null) qs.set('offset', String(params.offset));
    const q = qs.toString();
    return request<{ users: unknown[]; total: number }>(`/admin/users${q ? `?${q}` : ''}`);
  },

  adminUser: (id: string) => request<unknown>(`/admin/users/${id}`),

  adminSuspend: (id: string) =>
    request<{ ok: boolean }>(`/admin/users/${id}/suspend`, { method: 'POST', body: '{}' }),

  adminReactivate: (id: string) =>
    request<{ ok: boolean }>(`/admin/users/${id}/reactivate`, { method: 'POST', body: '{}' }),

  adminVerifyEmail: (id: string) =>
    request<{ ok: boolean }>(`/admin/users/${id}/verify-email`, { method: 'POST', body: '{}' }),

  adminMfaEnforce: (id: string, enforced: boolean) =>
    request<{ ok: boolean }>(`/admin/users/${id}/mfa-enforce`, {
      method: 'POST',
      body: JSON.stringify({ enforced }),
    }),

  adminSetQuotas: (id: string, quotas: { mailQuotaBytes: number; driveQuotaBytes: number }) =>
    request<{ ok: boolean }>(`/admin/users/${id}/quotas`, {
      method: 'POST',
      body: JSON.stringify(quotas),
    }),

  adminDomains: () => request<{ domains: unknown[] }>('/admin/domains'),

  adminDomainOverride: (id: string) =>
    request<{ ok: boolean }>(`/admin/domains/${id}/verify-override`, { method: 'POST', body: '{}' }),

  adminSmtpQueue: () => request<Record<string, unknown>>('/admin/metrics/smtp-queue'),

  adminAttachments: () => request<Record<string, unknown>>('/admin/metrics/attachments'),

  adminPool: () => request<Record<string, unknown>>('/admin/metrics/pool'),

  adminLatency: () => request<Record<string, unknown>>('/admin/metrics/latency'),

  adminOverview: () => request<Record<string, unknown>>('/admin/metrics/overview'),

  adminAudit: () => request<{ events: unknown[] }>('/admin/audit'),
};
