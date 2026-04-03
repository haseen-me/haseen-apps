const BASE = '/api/v1';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || res.statusText);
  }
  return res.json();
}

import type { DriveFile, Folder, FolderContents, Share } from '@/types/drive';

export const api = {
  // Files
  listFiles: () => request<{ files: DriveFile[]; total: number }>('/files'),

  getFile: (id: string) => request<DriveFile>(`/files/${id}`),

  uploadFile: async (file: File, folderId?: string): Promise<DriveFile> => {
    const form = new FormData();
    form.append('file', file);
    if (folderId) form.append('folderId', folderId);
    const res = await fetch(BASE + '/files/upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error('upload failed');
    return res.json();
  },

  updateFile: (id: string, data: { name?: string; folderId?: string }) =>
    request<DriveFile>(`/files/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteFile: (id: string) =>
    request<{ ok: boolean }>(`/files/${id}`, { method: 'DELETE' }),

  moveFile: (id: string, folderId: string | null) =>
    request<DriveFile>(`/files/${id}/move`, { method: 'POST', body: JSON.stringify({ folderId }) }),

  downloadFile: (id: string) => BASE + `/files/${id}/download`,

  shareFile: (id: string, email: string, permission: string) =>
    request<Share>(`/files/${id}/share`, { method: 'POST', body: JSON.stringify({ email, permission }) }),

  // Folders
  getFolder: (id: string) => request<FolderContents>(`/folders/${id}`),

  createFolder: (name: string, parentId?: string) =>
    request<Folder>('/folders', { method: 'POST', body: JSON.stringify({ name, parentId }) }),

  deleteFolder: (id: string) =>
    request<{ ok: boolean }>(`/folders/${id}`, { method: 'DELETE' }),

  // Search
  search: (query: string) =>
    request<{ files: DriveFile[]; folders: Folder[] }>('/search', { method: 'POST', body: JSON.stringify({ query }) }),
};
