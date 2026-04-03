/** Auth service API types */
export interface AuthApi {
  register(params: { email: string; srpSalt: string; srpVerifier: string; publicKey: string; signingPublicKey: string }): Promise<{ userID: string; sessionToken: string }>;
  loginInit(params: { email: string; srpA: string }): Promise<{ srpB: string; srpSalt: string }>;
  loginVerify(params: { email: string; srpM1: string }): Promise<{ sessionToken: string; srpM2: string }>;
  logout(): Promise<void>;
  getAccount(): Promise<{ userID: string; email: string; createdAt: string }>;
}

/** Mail service API types */
export interface MailApi {
  getMailbox(): Promise<{ messages: MailMessage[] }>;
  getMessage(messageID: string): Promise<MailMessage>;
  sendMessage(params: { to: string[]; encryptedSubject: string; encryptedBody: string; encryptedSessionKeys: Record<string, string> }): Promise<{ messageID: string }>;
  deleteMessage(messageID: string): Promise<void>;
}

export interface MailMessage {
  id: string;
  threadID: string;
  from: string;
  to: string[];
  encryptedSubject: string;
  encryptedBody: string;
  encryptedSessionKey: string;
  createdAt: string;
  read: boolean;
  label: string;
}

/** Drive service API types */
export interface DriveApi {
  listFiles(folderID?: string): Promise<{ files: DriveFile[] }>;
  uploadFile(params: { name: string; encryptedData: ArrayBuffer; encryptedKey: string; folderID?: string }): Promise<{ fileID: string }>;
  downloadFile(fileID: string): Promise<ArrayBuffer>;
  deleteFile(fileID: string): Promise<void>;
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

/** Key server API types */
export interface KeysApi {
  getPublicKey(userID: string): Promise<{ publicKey: string; signingPublicKey: string }>;
  publishKey(params: { publicKey: string; signingPublicKey: string; signature: string }): Promise<void>;
  lookupKeys(emails: string[]): Promise<Record<string, { publicKey: string; signingPublicKey: string }>>;
}

/** Calendar service API types */
export interface CalendarApi {
  listCalendars(): Promise<{ calendars: CalendarItem[] }>;
  createCalendar(params: { name: string; color: string }): Promise<CalendarItem>;
  updateCalendar(id: string, params: { name?: string; color?: string }): Promise<CalendarItem>;
  deleteCalendar(id: string): Promise<void>;
  listEvents(params: { start: string; end: string; calendarId?: string }): Promise<{ events: CalendarEvent[] }>;
  getEvent(id: string): Promise<CalendarEvent>;
  createEvent(params: { calendarId: string; title: string; description: string; startTime: string; endTime: string; allDay: boolean; location: string; color: string }): Promise<CalendarEvent>;
  updateEvent(id: string, params: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(id: string): Promise<void>;
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
