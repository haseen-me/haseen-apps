import type { Thread, Message, SystemLabel, UserLabel, ComposeMessage } from '@/types/mail';

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

export const mailApi = {
  /* Mailbox */
  getMailbox: (label: SystemLabel) =>
    request<{ threads: Thread[]; total: number }>(`/mailbox/${label}`),

  /* Messages */
  getMessage: (id: string) =>
    request<Message>(`/messages/${id}`),

  sendMessage: (msg: ComposeMessage) =>
    request<{ id: string }>('/messages/send', { method: 'POST', body: JSON.stringify(msg) }),

  updateMessage: (id: string, updates: Partial<Pick<Message, 'read' | 'starred' | 'labels'>>) =>
    request<Message>(`/messages/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  deleteMessage: (id: string) =>
    request<{ ok: boolean }>(`/messages/${id}`, { method: 'DELETE' }),

  moveMessage: (id: string, label: string) =>
    request<Message>(`/messages/${id}/move`, { method: 'POST', body: JSON.stringify({ label }) }),

  /* Threads */
  getThread: (id: string) =>
    request<Thread>(`/threads/${id}`),

  /* Labels */
  createLabel: (label: Pick<UserLabel, 'name' | 'color'>) =>
    request<UserLabel>('/labels', { method: 'POST', body: JSON.stringify(label) }),

  updateLabel: (id: string, updates: Partial<Pick<UserLabel, 'name' | 'color'>>) =>
    request<UserLabel>(`/labels/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

  deleteLabel: (id: string) =>
    request<{ ok: boolean }>(`/labels/${id}`, { method: 'DELETE' }),

  /* Attachments */
  getAttachmentUrl: (id: string) => `${API_BASE}/attachments/${id}`,

  /* Search */
  search: (query: string) =>
    request<{ threads: Thread[] }>('/search', { method: 'POST', body: JSON.stringify({ query }) }),
};
