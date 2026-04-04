import type { ApiClient } from './client';
import type { AuthApi, MailApi, DriveApi, KeysApi, CalendarApi, ContactsApi } from './services';

export function createAuthApi(client: ApiClient): AuthApi {
  return {
    register: (params) => client.post('/auth/register', params),
    loginInit: (params) => client.post('/auth/login/init', params),
    loginVerify: (params) => client.post('/auth/login/verify', params),
    logout: () => client.post('/auth/logout'),
    getAccount: () => client.get('/auth/account'),
  };
}

export function createMailApi(client: ApiClient): MailApi {
  return {
    getMailbox: (label) => client.get(`/mail/mailbox${label ? `/${label}` : ''}`),
    getMessage: (id) => client.get(`/mail/messages/${id}`),
    sendMessage: (params) => client.post('/mail/messages/send', params),
    deleteMessage: (id) => client.del(`/mail/messages/${id}`),
    moveMessage: (id, label) => client.post(`/mail/messages/${id}/move`, { label }),
    updateMessage: (id, params) => client.put(`/mail/messages/${id}`, params),
    search: (query) => client.post('/mail/search', { query }),
    uploadAttachment: async (messageID, file) => {
      const token = typeof localStorage !== 'undefined'
        ? (() => { try { return JSON.parse(localStorage.getItem('haseen-auth') ?? '{}').token; } catch { return null; } })()
        : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/v1/mail/messages/${messageID}/attachments`, {
        method: 'POST',
        credentials: 'include',
        headers,
        body: form,
      });
      if (!res.ok) throw { status: res.status, message: 'upload failed' };
      return res.json();
    },
    getAttachmentUrl: (attachmentID) => `/api/v1/mail/attachments/${attachmentID}`,
    saveDraft: (params) => client.post('/mail/drafts', params),
    updateDraft: (draftID, params) => client.put(`/mail/drafts/${draftID}`, params),
    sendDraft: (draftID) => client.post(`/mail/drafts/${draftID}/send`, {}),
  };
}

export function createDriveApi(client: ApiClient): DriveApi {
  return {
    listFiles: (folderID) => client.get(`/drive/files${folderID ? `?folder=${folderID}` : ''}`),
    uploadFile: (params) => client.post('/drive/files/upload', params),
    downloadFile: async (fileID) => {
      const token = typeof localStorage !== 'undefined'
        ? (() => { try { return JSON.parse(localStorage.getItem('haseen-auth') ?? '{}').token; } catch { return null; } })()
        : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`/api/v1/drive/files/${fileID}/download`, { credentials: 'include', headers });
      if (!response.ok) throw { status: response.status, message: 'download failed' };
      return response.arrayBuffer();
    },
    deleteFile: (id) => client.del(`/drive/files/${id}`),
    search: (query) => client.post('/drive/search', { query }),
    listTrash: () => client.get('/drive/trash'),
    restoreFile: (fileID) => client.post(`/drive/trash/${fileID}/restore`, {}),
    emptyTrash: () => client.del('/drive/trash'),
    sharedWithMe: () => client.get('/drive/shared'),
  };
}

export function createKeysApi(client: ApiClient): KeysApi {
  return {
    getPublicKey: (userID) => client.get(`/keys/keys/${userID}`),
    publishKey: (params) => client.post('/keys/keys/publish', params),
    lookupKeys: (userIDs) => client.post('/keys/keys/lookup', { userIds: userIDs }),
  };
}

export function createCalendarApi(client: ApiClient): CalendarApi {
  return {
    listCalendars: () => client.get('/calendar/calendars'),
    createCalendar: (params) => client.post('/calendar/calendars', params),
    updateCalendar: (id, params) => client.put(`/calendar/calendars/${id}`, params),
    deleteCalendar: (id) => client.del(`/calendar/calendars/${id}`),
    listEvents: (params) => {
      const qs = new URLSearchParams({ start: params.start, end: params.end });
      if (params.calendarId) qs.set('calendarId', params.calendarId);
      return client.get(`/calendar/events?${qs}`);
    },
    getEvent: (id) => client.get(`/calendar/events/${id}`),
    createEvent: (params) => client.post('/calendar/events', params),
    updateEvent: (id, params) => client.put(`/calendar/events/${id}`, params),
    deleteEvent: (id) => client.del(`/calendar/events/${id}`),
  };
}

export function createContactsApi(client: ApiClient): ContactsApi {
  return {
    listContacts: () => client.get('/contacts/contacts'),
    getContact: (id) => client.get(`/contacts/contacts/${id}`),
    createContact: (params) => client.post('/contacts/contacts', params),
    updateContact: (id, params) => client.put(`/contacts/contacts/${id}`, params),
    deleteContact: (id) => client.del(`/contacts/contacts/${id}`),
    searchContacts: (query) => client.post('/contacts/contacts/search', { query }),
  };
}
