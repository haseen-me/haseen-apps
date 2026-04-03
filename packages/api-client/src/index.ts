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
  MailApi,
  MailMessage,
  MailThread,
  MailboxResponse,
  SendMessageParams,
  EmailAddress,
  Attachment,
  DriveApi,
  DriveFile,
  KeysApi,
  PublicKeyBundle,
  CalendarApi,
  CalendarItem,
  CalendarEvent,
} from './services';
export {
  createAuthApi,
  createMailApi,
  createDriveApi,
  createKeysApi,
  createCalendarApi,
} from './factories';
