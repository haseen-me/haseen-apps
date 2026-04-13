import { createAdminApi, createClient, createDomainsApi } from '@haseen-me/api-client';

const client = createClient();

export const adminApi = createAdminApi(client);
export const domainsApi = createDomainsApi(client);
