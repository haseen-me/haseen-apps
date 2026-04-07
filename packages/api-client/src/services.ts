/** Auth service API types */
export interface AuthApi {
  register(params: { email: string; srpSalt: string; srpVerifier: string; publicKey: string; signingKey: string; signature?: string }): Promise<{ userId: string; sessionToken: string; recoveryKey: string }>;
  loginInit(params: { email: string; srpA: string }): Promise<{ srpB: string; srpSalt: string }>;
  loginVerify(params: { email: string; srpM1: string }): Promise<{ sessionToken: string; srpM2: string; user: { id: string; email: string }; mfaRequired?: boolean }>;
  logout(): Promise<void>;
  getAccount(): Promise<{ userID: string; email: string; createdAt: string }>;
}

/** Email address type matching backend model */
export interface EmailAddress {
  name?: string;
  address: string;
}

/** Attachment metadata */
export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

/** Mail service API types */
export interface MailApi {
  getMailbox(label?: string): Promise<MailboxResponse>;
  getMessage(messageID: string): Promise<MailMessage>;
  sendMessage(params: SendMessageParams): Promise<{ id: string }>;
  deleteMessage(messageID: string): Promise<void>;
  moveMessage(messageID: string, label: string): Promise<MailMessage>;
  updateMessage(messageID: string, params: { read?: boolean; starred?: boolean }): Promise<MailMessage>;
  search(query: string): Promise<{ threads: MailThread[] }>;
  uploadAttachment(messageID: string, file: File): Promise<{ id: string }>;
  getAttachmentUrl(attachmentID: string): string;
  saveDraft(params: SendMessageParams): Promise<{ id: string }>;
  updateDraft(draftID: string, params: SendMessageParams): Promise<void>;
  sendDraft(draftID: string): Promise<{ id: string }>;
  createLabel(params: { name: string; color: string }): Promise<{ id: string; name: string; color: string }>;
  deleteLabel(labelID: string): Promise<void>;
  listLabels(): Promise<{ id: string; name: string; color: string; isSystem: boolean }[]>;
}

export interface SendMessageParams {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  bodyHtml: string;
  replyToMessageId?: string;
  // E2E encrypted envelope fields (optional — if present, backend stores them alongside plaintext fields)
  encryptedSubject?: string;
  encryptedBody?: string;
  encryptedSessionKeys?: Record<string, string>;
}

export interface MailMessage {
  id: string;
  threadId: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  subject: string;
  bodyHtml: string;
  bodyText: string;
  attachments: Attachment[];
  date: string;
  read: boolean;
  starred: boolean;
  labels: string[];
  encrypted: boolean;
}

export interface MailThread {
  id: string;
  subject: string;
  messages: MailMessage[];
  lastMessageDate: string;
  unreadCount: number;
  labels: string[];
  snippet: string;
  from: EmailAddress;
  hasAttachments: boolean;
}

export interface MailboxResponse {
  threads: MailThread[];
  total: number;
}

/** Drive service API types */
export interface DriveApi {
  listFiles(folderID?: string): Promise<{ files: DriveFile[] }>;
  listFolder(folderID?: string): Promise<{ folder: DriveFolder | null; folders: DriveFolder[]; files: DriveFile[]; path: DriveFolder[] }>;
  uploadFile(params: { name: string; encryptedData: ArrayBuffer; encryptedKey: string; folderID?: string }): Promise<{ fileID: string }>;
  downloadFile(fileID: string): Promise<ArrayBuffer>;
  deleteFile(fileID: string): Promise<void>;
  renameFile(fileID: string, name: string): Promise<DriveFile>;
  moveFile(fileID: string, folderID: string): Promise<DriveFile>;
  shareFile(fileID: string, params: { email: string; permission: 'read' | 'write' }): Promise<void>;
  createFolder(params: { name: string; parentID?: string }): Promise<DriveFolder>;
  renameFolder(folderID: string, name: string): Promise<DriveFolder>;
  deleteFolder(folderID: string): Promise<void>;
  search(query: string): Promise<{ files: DriveFile[]; folders: DriveFolder[] }>;
  listTrash(): Promise<{ files: DriveFile[] }>;
  restoreFile(fileID: string): Promise<DriveFile>;
  emptyTrash(): Promise<void>;
  sharedWithMe(): Promise<{ files: DriveFile[] }>;
  getStorageUsage(): Promise<{ usedBytes: number; totalBytes: number }>;
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  folderID: string | null;
  encryptedKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

/** Key server API types */
export interface KeysApi {
  getPublicKey(userID: string): Promise<PublicKeyBundle>;
  publishKey(params: { encryptionPublicKey: string; signingPublicKey: string; selfSignature?: string }): Promise<PublicKeyBundle>;
  lookupKeys(userIDs: string[]): Promise<{ keys: Record<string, PublicKeyBundle> }>;
}

export interface PublicKeyBundle {
  id: string;
  userId: string;
  encryptionPublicKey: string;
  signingPublicKey: string;
  selfSignature: string;
  isActive: boolean;
  createdAt: string;
}

/** Calendar service API types */
export interface CalendarApi {
  listCalendars(): Promise<{ calendars: CalendarItem[] }>;
  createCalendar(params: { name: string; color: string }): Promise<CalendarItem>;
  updateCalendar(id: string, params: { name?: string; color?: string }): Promise<CalendarItem>;
  deleteCalendar(id: string): Promise<void>;
  listEvents(params: { start: string; end: string; calendarId?: string }): Promise<{ events: CalendarEvent[] }>;
  getEvent(id: string): Promise<CalendarEvent>;
  createEvent(params: { calendarId: string; title: string; description: string; startTime: string; endTime: string; allDay: boolean; location: string; color: string; recurrenceRule?: string | null }): Promise<CalendarEvent>;
  updateEvent(id: string, params: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
  listAttendees(eventId: string): Promise<{ attendees: Attendee[] }>;
  addAttendee(eventId: string, email: string): Promise<Attendee>;
  removeAttendee(eventId: string, attendeeId: string): Promise<void>;
  updateAttendeeStatus(eventId: string, attendeeId: string, status: 'accepted' | 'declined' | 'tentative'): Promise<Attendee>;
  listReminders(eventId: string): Promise<{ reminders: Reminder[] }>;
  setReminder(eventId: string, minutesBefore: number): Promise<Reminder>;
  deleteReminder(eventId: string, reminderId: string): Promise<void>;
}

export interface Attendee {
  id: string;
  eventId: string;
  email: string;
  status: string;
}

export interface Reminder {
  id: string;
  eventId: string;
  minutesBefore: number;
}

export interface CalendarItem {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  recurrenceRule: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

/** Contacts service API types */
export interface ContactsApi {
  listContacts(): Promise<{ contacts: Contact[]; total: number }>;
  getContact(id: string): Promise<Contact>;
  createContact(params: { email: string; name: string; notes?: string; phone?: string; company?: string; address?: string; birthday?: string }): Promise<Contact>;
  updateContact(id: string, params: { email?: string; name?: string; notes?: string; phone?: string; company?: string; address?: string; birthday?: string }): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  searchContacts(query: string): Promise<{ contacts: Contact[]; total: number }>;
}

export interface Contact {
  id: string;
  email: string;
  name: string;
  notes: string;
  phone: string;
  company: string;
  address: string;
  birthday: string;
  createdAt: string;
  updatedAt: string;
}
