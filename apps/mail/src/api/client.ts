import { createClient, createMailApi, createAuthApi, createKeysApi } from '@haseen-me/api-client';

const client = createClient('/api/v1');

export const mailApi = createMailApi(client);
export const authApi = createAuthApi(client);
export const keysApi = createKeysApi(client);
export { client };
