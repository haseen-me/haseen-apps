import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ApiClient } from '../client';
import { createAuthApi, createMailApi, createDriveApi, createKeysApi, createCalendarApi } from '../factories';

function mockClient(): ApiClient {
  return {
    request: vi.fn(),
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
    put: vi.fn().mockResolvedValue({}),
    del: vi.fn().mockResolvedValue(undefined),
  };
}

describe('createAuthApi', () => {
  let client: ReturnType<typeof mockClient>;
  beforeEach(() => { client = mockClient(); });

  it('register calls POST /auth/register', async () => {
    const api = createAuthApi(client);
    const params = { email: 'a@b.com', password: 'password-12345', displayName: 'A', publicKey: 'pk', signingKey: 'spk', signature: 'sig' };
    await api.register(params);
    expect(client.post).toHaveBeenCalledWith('/auth/register', params);
  });

  it('login calls POST /auth/login', async () => {
    const api = createAuthApi(client);
    await api.login({ email: 'a@b.com', password: 'password-12345' });
    expect(client.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'password-12345' });
  });

  it('logout calls POST /auth/logout', async () => {
    const api = createAuthApi(client);
    await api.logout();
    expect(client.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('getAccount calls GET /auth/account', async () => {
    const api = createAuthApi(client);
    await api.getAccount();
    expect(client.get).toHaveBeenCalledWith('/auth/account');
  });

  it('me calls GET /auth/me', async () => {
    const api = createAuthApi(client);
    await api.me();
    expect(client.get).toHaveBeenCalledWith('/auth/me');
  });
});

describe('createMailApi', () => {
  let client: ReturnType<typeof mockClient>;
  beforeEach(() => { client = mockClient(); });

  it('getMailbox calls GET /mail/mailbox', async () => {
    const api = createMailApi(client);
    await api.getMailbox();
    expect(client.get).toHaveBeenCalledWith('/mail/mailbox');
  });

  it('getMessage calls GET /mail/messages/:id', async () => {
    const api = createMailApi(client);
    await api.getMessage('msg-1');
    expect(client.get).toHaveBeenCalledWith('/mail/messages/msg-1');
  });

  it('sendMessage calls POST /mail/messages/send', async () => {
    const api = createMailApi(client);
    const params = { to: [{ address: 'b@c.com' }], encryptedSubject: 'es', encryptedBody: 'eb', encryptedSessionKeys: { k: 'v' }, subject: 's', bodyHtml: 'b' };
    await api.sendMessage(params);
    expect(client.post).toHaveBeenCalledWith('/mail/messages/send', params);
  });

  it('deleteMessage calls DELETE /mail/messages/:id', async () => {
    const api = createMailApi(client);
    await api.deleteMessage('msg-2');
    expect(client.del).toHaveBeenCalledWith('/mail/messages/msg-2');
  });
});

describe('createDriveApi', () => {
  let client: ReturnType<typeof mockClient>;
  beforeEach(() => { client = mockClient(); });

  it('listFiles without folder calls GET /drive/files', async () => {
    const api = createDriveApi(client);
    await api.listFiles();
    expect(client.get).toHaveBeenCalledWith('/drive/files');
  });

  it('listFiles with folder ID appends query param', async () => {
    const api = createDriveApi(client);
    await api.listFiles('folder-1');
    expect(client.get).toHaveBeenCalledWith('/drive/files?folder=folder-1');
  });

  it('uploadFile calls POST /drive/files/upload', async () => {
    const api = createDriveApi(client);
    const params = { name: 'test.txt', encryptedData: new ArrayBuffer(10), encryptedKey: 'ek' };
    await api.uploadFile(params);
    expect(client.post).toHaveBeenCalledWith('/drive/files/upload', params);
  });

  it('deleteFile calls DELETE /drive/files/:id', async () => {
    const api = createDriveApi(client);
    await api.deleteFile('file-1');
    expect(client.del).toHaveBeenCalledWith('/drive/files/file-1');
  });
});

describe('createKeysApi', () => {
  let client: ReturnType<typeof mockClient>;
  beforeEach(() => { client = mockClient(); });

  it('getPublicKey calls GET /keys/keys/:userId', async () => {
    const api = createKeysApi(client);
    await api.getPublicKey('user-1');
    expect(client.get).toHaveBeenCalledWith('/keys/keys/user-1');
  });

  it('publishKey calls POST /keys/keys/publish', async () => {
    const api = createKeysApi(client);
    const params = { encryptionPublicKey: 'pk', signingPublicKey: 'spk', selfSignature: 'sig' };
    await api.publishKey(params);
    expect(client.post).toHaveBeenCalledWith('/keys/keys/publish', params);
  });

  it('lookupKeys calls POST /keys/keys/lookup', async () => {
    const api = createKeysApi(client);
    await api.lookupKeys(['a@b.com', 'c@d.com']);
    expect(client.post).toHaveBeenCalledWith('/keys/keys/lookup', { userIds: ['a@b.com', 'c@d.com'] });
  });
});

describe('createCalendarApi', () => {
  let client: ReturnType<typeof mockClient>;
  beforeEach(() => { client = mockClient(); });

  it('listCalendars calls GET /calendar/calendars', async () => {
    const api = createCalendarApi(client);
    await api.listCalendars();
    expect(client.get).toHaveBeenCalledWith('/calendar/calendars');
  });

  it('createCalendar calls POST /calendar/calendars', async () => {
    const api = createCalendarApi(client);
    await api.createCalendar({ name: 'Work', color: '#ff0000' });
    expect(client.post).toHaveBeenCalledWith('/calendar/calendars', { name: 'Work', color: '#ff0000' });
  });

  it('updateCalendar calls PUT /calendar/calendars/:id', async () => {
    const api = createCalendarApi(client);
    await api.updateCalendar('cal-1', { name: 'Personal' });
    expect(client.put).toHaveBeenCalledWith('/calendar/calendars/cal-1', { name: 'Personal' });
  });

  it('deleteCalendar calls DELETE /calendar/calendars/:id', async () => {
    const api = createCalendarApi(client);
    await api.deleteCalendar('cal-1');
    expect(client.del).toHaveBeenCalledWith('/calendar/calendars/cal-1');
  });

  it('listEvents builds query string with start/end', async () => {
    const api = createCalendarApi(client);
    await api.listEvents({ start: '2024-01-01', end: '2024-01-31' });
    expect(client.get).toHaveBeenCalledWith(
      expect.stringContaining('/calendar/events?'),
    );
    const url: string = (client.get as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(url).toContain('start=2024-01-01');
    expect(url).toContain('end=2024-01-31');
  });

  it('listEvents includes optional calendarId', async () => {
    const api = createCalendarApi(client);
    await api.listEvents({ start: '2024-01-01', end: '2024-01-31', calendarId: 'cal-1' });
    const url: string = (client.get as ReturnType<typeof vi.fn>).mock.calls[0]![0];
    expect(url).toContain('calendarId=cal-1');
  });

  it('getEvent calls GET /calendar/events/:id', async () => {
    const api = createCalendarApi(client);
    await api.getEvent('evt-1');
    expect(client.get).toHaveBeenCalledWith('/calendar/events/evt-1');
  });

  it('createEvent calls POST /calendar/events', async () => {
    const api = createCalendarApi(client);
    const params = {
      calendarId: 'cal-1', title: 'Meeting', description: '', startTime: '2024-01-01T09:00:00Z',
      endTime: '2024-01-01T10:00:00Z', allDay: false, location: '', color: '#00ff00',
    };
    await api.createEvent(params);
    expect(client.post).toHaveBeenCalledWith('/calendar/events', params);
  });

  it('updateEvent calls PUT /calendar/events/:id', async () => {
    const api = createCalendarApi(client);
    await api.updateEvent('evt-1', { title: 'Updated' });
    expect(client.put).toHaveBeenCalledWith('/calendar/events/evt-1', { title: 'Updated' });
  });

  it('deleteEvent calls DELETE /calendar/events/:id', async () => {
    const api = createCalendarApi(client);
    await api.deleteEvent('evt-1');
    expect(client.del).toHaveBeenCalledWith('/calendar/events/evt-1');
  });
});
