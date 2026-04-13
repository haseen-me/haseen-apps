import { createClient, createCalendarApi, createAuthApi, createKeysApi } from '@haseen-me/api-client';

const client = createClient();

export const calendarApi = createCalendarApi(client);
export const authApi = createAuthApi(client);
export const keysApi = createKeysApi(client);
export { client };
