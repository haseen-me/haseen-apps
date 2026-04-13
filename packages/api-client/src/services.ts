/** Auth service API types */
export interface AuthApi {
  /** @deprecated legacy SRP — prefer cookie session + REST identity */
  register(params: Record<string, unknown>): Promise<unknown>;
  loginInit(params: Record<string, unknown>): Promise<unknown>;
  loginVerify(params: Record<string, unknown>): Promise<unknown>;
  login(params: { email: string; password: string }): Promise<unknown>;
  loginMfa(params: { mfaToken: string; code: string }): Promise<unknown>;
  me(): Promise<unknown>;
  logout(): Promise<void>;
  getAccount(): Promise<{ userID: string; email: string; createdAt: string }>;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  emailVerifiedAt?: string;
  suspendedAt?: string;
  mfaEnforced: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  mfaEnabled: boolean;
  emailVerified: boolean;
  sessionCount: number;
  mailQuotaBytes: number;
  driveQuotaBytes: number;
}

export interface AdminDomain {
  id: string;
  userId: string;
  domain: string;
  status: string;
  mxVerified: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  lastCheckedAt?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface AdminAuditEvent {
  id: string;
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminOverviewMetrics {
  activeSessions: number;
  outboundQueue: {
    queued: number;
    sending: number;
    sent: number;
    deferred: number;
    failed: number;
  };
  mail: {
    sentMessages: number;
    inboxMessages: number;
  };
  attachments: {
    r2RefCount: number;
    r2RefBytes: number;
    inlineCount: number;
    inlineBytes: number;
  };
  drive: {
    usedBytes: number;
  };
}

export interface AdminSmtpQueueMetrics {
  queued: number;
  pendingDelivery: number;
  sending: number;
  delivered: number;
  bounced: number;
}

export interface AdminAttachmentMetrics {
  attachmentCount: number;
  totalBytes: number;
}

export interface AdminPoolMetrics {
  dbPoolAcquired: number;
  dbPoolIdle: number;
  dbPoolMax: number;
}

export interface AdminLatencyMetrics {
  authDbPingMs: number;
}

export interface AdminApi {
  users(params?: { q?: string; limit?: number; offset?: number }): Promise<{ users: AdminUser[]; total: number }>;
  user(id: string): Promise<AdminUser>;
  suspendUser(id: string): Promise<{ ok: boolean }>;
  reactivateUser(id: string): Promise<{ ok: boolean }>;
  verifyUserEmail(id: string): Promise<{ ok: boolean }>;
  enforceUserMfa(id: string, enforced: boolean): Promise<{ ok: boolean }>;
  setUserQuotas(id: string, quotas: { mailQuotaBytes: number; driveQuotaBytes: number }): Promise<{ ok: boolean }>;
  domains(): Promise<{ domains: AdminDomain[] }>;
  verifyDomainOverride(id: string): Promise<{ ok: boolean }>;
  overview(): Promise<AdminOverviewMetrics>;
  smtpQueue(): Promise<AdminSmtpQueueMetrics>;
  attachments(): Promise<AdminAttachmentMetrics>;
  pool(): Promise<AdminPoolMetrics>;
  latency(): Promise<AdminLatencyMetrics>;
  audit(limit?: number): Promise<{ events: AdminAuditEvent[] }>;
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

export interface DNSRecord {
  type: string;
  host: string;
  value: string;
  verified: boolean;
}

export interface DomainDNSRecords {
  mx: DNSRecord;
  spf: DNSRecord;
  dkim: DNSRecord;
  dmarc: DNSRecord;
}

export interface CustomDomain {
  id: string;
  userId: string;
  domain: string;
  status: 'pending' | 'verifying' | 'verified' | 'failed';
  mxVerified: boolean;
  spfVerified: boolean;
  dkimVerified: boolean;
  dmarcVerified: boolean;
  verificationToken: string;
  lastCheckedAt: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DomainMailbox {
  id: string;
  domainId: string;
  userId: string;
  localPart: string;
  displayName: string;
  isCatchAll: boolean;
  createdAt: string;
}

export interface DomainResponse {
  domain: CustomDomain;
  dnsRecords: DomainDNSRecords;
  mailboxes: DomainMailbox[];
}

export interface DNSCheckLog {
  id: string;
  domainId: string;
  checkType: 'mx' | 'spf' | 'dkim' | 'dmarc';
  passed: boolean;
  expectedValue: string;
  actualValue: string;
  checkedAt: string;
}

export interface DomainsApi {
  list(): Promise<CustomDomain[]>;
  add(domain: string): Promise<DomainResponse>;
  get(domainId: string): Promise<DomainResponse>;
  delete(domainId: string): Promise<{ ok: boolean }>;
  verify(domainId: string): Promise<CustomDomain>;
  getDNSRecords(domainId: string): Promise<DomainDNSRecords>;
  getDNSLogs(domainId: string): Promise<DNSCheckLog[]>;
  addMailbox(domainId: string, localPart: string, displayName: string, isCatchAll: boolean): Promise<DomainMailbox>;
  listMailboxes(domainId: string): Promise<DomainMailbox[]>;
  deleteMailbox(domainId: string, mailboxId: string): Promise<{ ok: boolean }>;
}

/** Mail service API types */
export interface MailApi {
  getMailbox(label?: string, params?: { limit?: number; cursor?: string }): Promise<MailboxResponse>;
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
  getEventStreamUrl(since?: string): string;
}

export interface MailEvent {
  id: string;
  type: 'message.created' | 'message.updated' | 'message.deleted';
  userId: string;
  mailboxId: string;
  threadId?: string;
  messageId?: string;
  occurredAt: string;
  label?: string;
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
  nextCursor?: string;
  hasMore: boolean;
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
  starFile(fileID: string, starred: boolean): Promise<void>;
  listStarred(): Promise<{ files: DriveFile[] }>;
}

export interface DriveFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  folderID: string | null;
  encryptedKey: string;
  starred: boolean;
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
  attendeeCount: number;
}

/** Contacts service API types */
export interface ContactsApi {
  listContacts(): Promise<{ contacts: Contact[]; total: number }>;
  getContact(id: string): Promise<Contact>;
  createContact(params: { email: string; name: string; notes?: string; phone?: string; company?: string; address?: string; birthday?: string }): Promise<Contact>;
  updateContact(id: string, params: { email?: string; name?: string; notes?: string; phone?: string; company?: string; address?: string; birthday?: string }): Promise<Contact>;
  deleteContact(id: string): Promise<void>;
  searchContacts(query: string): Promise<{ contacts: Contact[]; total: number }>;
  listGroups(): Promise<{ groups: ContactGroup[] }>;
  createGroup(params: { name: string; color: string }): Promise<ContactGroup>;
  updateGroup(id: string, params: { name?: string; color?: string }): Promise<ContactGroup>;
  deleteGroup(id: string): Promise<void>;
  addToGroup(groupId: string, contactId: string): Promise<void>;
  removeFromGroup(groupId: string, contactId: string): Promise<void>;
  getGroupMembers(groupId: string): Promise<{ contactIds: string[] }>;
}

export interface ContactGroup {
  id: string;
  name: string;
  color: string;
  createdAt: string;
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
