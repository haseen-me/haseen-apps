/**
 * @haseen-me/api-client
 *
 * Typed HTTP client for Haseen Go backend services.
 * All requests go through the API gateway at /api/v1/*.
 */

export { createClient, type ApiClient, type ClientOptions } from './client';
export { type ApiError, isApiError } from './errors';
export type {
  AuthApi,
  AdminApi,
  AdminUser,
  AdminDomain,
  AdminAuditEvent,
  AdminOverviewMetrics,
  AdminSmtpQueueMetrics,
  AdminAttachmentMetrics,
  AdminPoolMetrics,
  AdminLatencyMetrics,
  MailApi,
  MailEvent,
  MailMessage,
  MailThread,
  MailboxResponse,
  SendMessageParams,
  EmailAddress,
  Attachment,
  DomainsApi,
  CustomDomain,
  DomainMailbox,
  DomainResponse,
  DomainDNSRecords,
  DNSCheckLog,
  DNSRecord,
  DriveApi,
  DriveFile,
  DriveFolder,
  KeysApi,
  PublicKeyBundle,
  CalendarApi,
  CalendarItem,
  CalendarEvent,
  Attendee,
  Reminder,
  ContactsApi,
  Contact,
  ContactGroup,
} from './services';
export {
  createAuthApi,
  createAdminApi,
  createMailApi,
  createDomainsApi,
  createDriveApi,
  createKeysApi,
  createCalendarApi,
  createContactsApi,
} from './factories';
