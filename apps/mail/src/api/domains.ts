import { createClient, createDomainsApi } from '@haseen-me/api-client';

export const domainsApi = createDomainsApi(createClient());
