import type { ApiClient } from './client';
import type { AuthApi, MailApi, DriveApi, KeysApi, CalendarApi } from './services';

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
    getMailbox: () => client.get('/mail/mailbox'),
    getMessage: (id) => client.get(`/mail/messages/${id}`),
    sendMessage: (params) => client.post('/mail/messages/send', params),
    deleteMessage: (id) => client.del(`/mail/messages/${id}`),
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
  };
}

export function createKeysApi(client: ApiClient): KeysApi {
  return {
    getPublicKey: (userID) => client.get(`/keys/keys/${userID}`),
    publishKey: (params) => client.post('/keys/keys/publish', params),
    lookupKeys: (emails) => client.post('/keys/keys/lookup', { userIds: emails }),
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
