import type { ApiClient } from './client';
import type {
  AuthApi,
  MailApi,
  DriveApi,
  KeysApi,
  CalendarApi,
  ContactsApi,
  DomainsApi,
  AdminApi,
} from './services';

export function createAuthApi(client: ApiClient): AuthApi {
  return {
    register: (params: Record<string, unknown>) => client.post('/auth/register', params),
    loginInit: (params: Record<string, unknown>) => client.post('/auth/login/init', params),
    loginVerify: (params: Record<string, unknown>) => client.post('/auth/login/verify', params),
    login: (params: { email: string; password: string }) => client.post('/auth/login', params),
    loginMfa: (params: { mfaToken: string; code: string }) => client.post('/auth/login/mfa', params),
    logout: () => client.post('/auth/logout'),
    me: () => client.get('/auth/me'),
    getAccount: () => client.get('/auth/account'),
  };
}

export function createMailApi(client: ApiClient): MailApi {
  return {
    getMailbox: (label, params) => {
      const base = `/mail/mailbox${label ? `/${label}` : ''}`;
      const qs = new URLSearchParams();
      if (params?.limit) qs.set('limit', String(params.limit));
      if (params?.cursor) qs.set('cursor', params.cursor);
      const query = qs.toString();
      return client.get(query ? `${base}?${query}` : base);
    },
    getMessage: (id) => client.get(`/mail/messages/${id}`),
    sendMessage: (params) => client.post('/mail/messages/send', params),
    deleteMessage: (id) => client.del(`/mail/messages/${id}`),
    moveMessage: (id, label) => client.post(`/mail/messages/${id}/move`, { label }),
    updateMessage: (id, params) => client.put(`/mail/messages/${id}`, params),
    search: (query) => client.post('/mail/search', { query }),
    uploadAttachment: async (messageID, file) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`/api/v1/mail/messages/${messageID}/attachments`, {
        method: 'POST',
        credentials: 'include',
        body: form,
      });
      if (!res.ok) throw { status: res.status, message: 'upload failed' };
      return res.json();
    },
    getAttachmentUrl: (attachmentID) => `/api/v1/mail/attachments/${attachmentID}`,
    saveDraft: (params) => client.post('/mail/drafts', params),
    updateDraft: (draftID, params) => client.put(`/mail/drafts/${draftID}`, params),
    sendDraft: (draftID) => client.post(`/mail/drafts/${draftID}/send`, {}),
    createLabel: (params) => client.post('/mail/labels', params),
    deleteLabel: (labelID) => client.del(`/mail/labels/${labelID}`),
    listLabels: () => client.get('/mail/labels'),
    getEventStreamUrl: (since) => `/api/v1/mail/events${since ? `?since=${encodeURIComponent(since)}` : ''}`,
  };
}

export function createDomainsApi(client: ApiClient): DomainsApi {
  return {
    list: () => client.get('/mail/domains'),
    add: (domain) => client.post('/mail/domains', { domain }),
    get: (domainID) => client.get(`/mail/domains/${domainID}`),
    delete: (domainID) => client.del(`/mail/domains/${domainID}`),
    verify: (domainID) => client.post(`/mail/domains/${domainID}/verify`, {}),
    getDNSRecords: (domainID) => client.get(`/mail/domains/${domainID}/dns`),
    getDNSLogs: (domainID) => client.get(`/mail/domains/${domainID}/dns/logs`),
    addMailbox: (domainID, localPart, displayName, isCatchAll) =>
      client.post(`/mail/domains/${domainID}/mailboxes`, { localPart, displayName, isCatchAll }),
    listMailboxes: (domainID) => client.get(`/mail/domains/${domainID}/mailboxes`),
    deleteMailbox: (domainID, mailboxID) => client.del(`/mail/domains/${domainID}/mailboxes/${mailboxID}`),
  };
}

export function createAdminApi(client: ApiClient): AdminApi {
  return {
    users: (params) => {
      const qs = new URLSearchParams();
      if (params?.q) qs.set('q', params.q);
      if (params?.limit != null) qs.set('limit', String(params.limit));
      if (params?.offset != null) qs.set('offset', String(params.offset));
      const query = qs.toString();
      return client.get(`/auth/admin/users${query ? `?${query}` : ''}`);
    },
    user: (id) => client.get(`/auth/admin/users/${id}`),
    suspendUser: (id) => client.post(`/auth/admin/users/${id}/suspend`, {}),
    reactivateUser: (id) => client.post(`/auth/admin/users/${id}/reactivate`, {}),
    verifyUserEmail: (id) => client.post(`/auth/admin/users/${id}/verify-email`, {}),
    enforceUserMfa: (id, enforced) => client.post(`/auth/admin/users/${id}/mfa-enforce`, { enforced }),
    setUserQuotas: (id, quotas) => client.post(`/auth/admin/users/${id}/quotas`, quotas),
    domains: () => client.get('/auth/admin/domains'),
    verifyDomainOverride: (id) => client.post(`/auth/admin/domains/${id}/verify-override`, {}),
    overview: () => client.get('/auth/admin/metrics/overview'),
    smtpQueue: () => client.get('/auth/admin/metrics/smtp-queue'),
    attachments: () => client.get('/auth/admin/metrics/attachments'),
    pool: () => client.get('/auth/admin/metrics/pool'),
    latency: () => client.get('/auth/admin/metrics/latency'),
    audit: (limit) => client.get(`/auth/admin/audit${limit ? `?limit=${limit}` : ''}`),
  };
}

export function createDriveApi(client: ApiClient): DriveApi {
  return {
    listFiles: (folderID) => client.get(`/drive/files${folderID ? `?folder=${folderID}` : ''}`),
    listFolder: (folderID) => client.get(`/drive/folders/${folderID ?? 'root'}`),
    uploadFile: (params) => client.post('/drive/files/upload', params),
    downloadFile: async (fileID) => {
      const response = await fetch(`/api/v1/drive/files/${fileID}/download`, { credentials: 'include' });
      if (!response.ok) throw { status: response.status, message: 'download failed' };
      return response.arrayBuffer();
    },
    deleteFile: (id) => client.del(`/drive/files/${id}`),
    renameFile: (id, name) => client.put(`/drive/files/${id}`, { name }),
    moveFile: (id, folderID) => client.post(`/drive/files/${id}/move`, { folderID }),
    shareFile: (id, params) => client.post(`/drive/files/${id}/share`, params),
    createFolder: (params) => client.post('/drive/folders', params),
    renameFolder: (id, name) => client.put(`/drive/folders/${id}`, { name }),
    deleteFolder: (id) => client.del(`/drive/folders/${id}`),
    search: (query) => client.post('/drive/search', { query }),
    listTrash: () => client.get('/drive/trash'),
    restoreFile: (fileID) => client.post(`/drive/trash/${fileID}/restore`, {}),
    emptyTrash: () => client.del('/drive/trash'),
    sharedWithMe: () => client.get('/drive/shared'),
    getStorageUsage: () => client.get('/drive/usage'),
    starFile: (fileID, starred) => client.put(`/drive/files/${fileID}/star`, { starred }),
    listStarred: () => client.get('/drive/starred'),
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
    listAttendees: (eventId) => client.get(`/calendar/events/${eventId}/attendees`),
    addAttendee: (eventId, email) => client.post(`/calendar/events/${eventId}/attendees`, { email }),
    removeAttendee: (eventId, attendeeId) => client.del(`/calendar/events/${eventId}/attendees/${attendeeId}`),
    updateAttendeeStatus: (eventId, attendeeId, status) => client.put(`/calendar/events/${eventId}/attendees/${attendeeId}`, { status }),
    listReminders: (eventId) => client.get(`/calendar/events/${eventId}/reminders`),
    setReminder: (eventId, minutesBefore) => client.post(`/calendar/events/${eventId}/reminders`, { minutesBefore }),
    deleteReminder: (eventId, reminderId) => client.del(`/calendar/events/${eventId}/reminders/${reminderId}`),
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
    listGroups: () => client.get('/contacts/groups'),
    createGroup: (params) => client.post('/contacts/groups', params),
    updateGroup: (id, params) => client.put(`/contacts/groups/${id}`, params),
    deleteGroup: (id) => client.del(`/contacts/groups/${id}`),
    addToGroup: (groupId, contactId) => client.post(`/contacts/groups/${groupId}/members`, { contactId }),
    removeFromGroup: (groupId, contactId) => client.del(`/contacts/groups/${groupId}/members/${contactId}`),
    getGroupMembers: (groupId) => client.get(`/contacts/groups/${groupId}/members`),
  };
}
