/* ——— Address ——— */
export interface EmailAddress {
  name?: string;
  address: string;
}

/* ——— Attachment ——— */
export interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

/* ——— Message ——— */
export interface Message {
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
  date: string;            // ISO 8601
  read: boolean;
  starred: boolean;
  labels: string[];        // system + user label IDs
  encrypted: boolean;
  // E2E envelope fields
  encryptedSubject?: string;
  encryptedBody?: string;
  encryptedSessionKeys?: Record<string, string>;
}

/* ——— Thread ——— */
export interface Thread {
  id: string;
  subject: string;
  messages: Message[];
  lastMessageDate: string;
  unreadCount: number;
  labels: string[];
  snippet: string;
  from: EmailAddress;      // most recent sender
  hasAttachments: boolean;
}

/* ——— System labels ——— */
export type SystemLabel = 'inbox' | 'sent' | 'drafts' | 'trash' | 'spam' | 'starred' | 'archive';

export const SYSTEM_LABELS: { id: SystemLabel; name: string }[] = [
  { id: 'inbox', name: 'Inbox' },
  { id: 'starred', name: 'Starred' },
  { id: 'sent', name: 'Sent' },
  { id: 'drafts', name: 'Drafts' },
  { id: 'archive', name: 'Archive' },
  { id: 'spam', name: 'Spam' },
  { id: 'trash', name: 'Trash' },
];

/* ——— User labels ——— */
export interface UserLabel {
  id: string;
  name: string;
  color: string;
}

/* ——— Compose ——— */
export interface ComposeMessage {
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  subject: string;
  bodyHtml: string;
  attachments: File[];
  replyToMessageId?: string;
  forwardFromMessageId?: string;
}
