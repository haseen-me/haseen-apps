import { createClient, createDriveApi, createAuthApi, createKeysApi } from '@haseen-me/api-client';

const client = createClient('/api/v1');

export const driveApi = createDriveApi(client);
export const authApi = createAuthApi(client);
export const keysApi = createKeysApi(client);
export { client };
