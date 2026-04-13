import type { CustomDomain, DomainResponse, DomainMailbox, DomainDNSRecords, DNSCheckLog } from '@/types/domain';

const API_BASE = '/api/v1';

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
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const domainsApi = {
  list: () => request<CustomDomain[]>('/mail/domains'),

  add: (domain: string) =>
    request<DomainResponse>('/mail/domains', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    }),

  get: (domainId: string) => request<DomainResponse>(`/mail/domains/${domainId}`),

  delete: (domainId: string) =>
    request<{ ok: boolean }>(`/mail/domains/${domainId}`, { method: 'DELETE' }),

  verify: (domainId: string) =>
    request<CustomDomain>(`/mail/domains/${domainId}/verify`, { method: 'POST' }),

  getDNSRecords: (domainId: string) =>
    request<DomainDNSRecords>(`/mail/domains/${domainId}/dns`),

  getDNSLogs: (domainId: string) =>
    request<DNSCheckLog[]>(`/mail/domains/${domainId}/dns/logs`),

  addMailbox: (domainId: string, localPart: string, displayName: string, isCatchAll: boolean) =>
    request<DomainMailbox>(`/mail/domains/${domainId}/mailboxes`, {
      method: 'POST',
      body: JSON.stringify({ localPart, displayName, isCatchAll }),
    }),

  listMailboxes: (domainId: string) =>
    request<DomainMailbox[]>(`/mail/domains/${domainId}/mailboxes`),

  deleteMailbox: (domainId: string, mailboxId: string) =>
    request<{ ok: boolean }>(`/mail/domains/${domainId}/mailboxes/${mailboxId}`, {
      method: 'DELETE',
    }),
};
