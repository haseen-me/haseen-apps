import { createClient, createMailApi, createAuthApi, createKeysApi, createContactsApi } from '@haseen-me/api-client';

const client = createClient();

export const mailApi = createMailApi(client);
export const authApi = createAuthApi(client);
export const keysApi = createKeysApi(client);
export const contactsApi = createContactsApi(client);
export { client };
