import { createClient, createContactsApi, createAuthApi } from '@haseen-me/api-client';

const client = createClient();

export const contactsApi = createContactsApi(client);
export const authApi = createAuthApi(client);
export { client };
