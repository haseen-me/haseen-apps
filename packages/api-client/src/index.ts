/**
 * @haseen-me/api-client
 *
 * Typed HTTP client for Haseen Go backend services.
 * All requests go through the API gateway at /api/v1/*.
 */

export { createClient, type ApiClient } from './client';
export { type ApiError, isApiError } from './errors';
export type {
  AuthApi,
  MailApi,
  MailMessage,
  DriveApi,
  DriveFile,
  KeysApi,
} from './services';
export {
  createAuthApi,
  createMailApi,
  createDriveApi,
  createKeysApi,
} from './factories';
