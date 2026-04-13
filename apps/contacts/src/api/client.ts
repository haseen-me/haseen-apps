import { createAuthApi, createClient } from '@haseen-me/api-client';
import type { EncryptedContactRecord } from '@/types/contacts';

const client = createClient();

export const contactsApi = {
  listContacts: () => client.get('/contacts/contacts') as Promise<{ contacts: EncryptedContactRecord[]; total: number }>,
  getContact: (id: string) => client.get(`/contacts/contacts/${id}`) as Promise<EncryptedContactRecord>,
  createContact: (params: { encryptedData: string }) =>
    client.post('/contacts/contacts', params) as Promise<EncryptedContactRecord>,
  updateContact: (id: string, params: { encryptedData: string }) =>
    client.put(`/contacts/contacts/${id}`, params) as Promise<EncryptedContactRecord>,
  deleteContact: (id: string) => client.del(`/contacts/contacts/${id}`) as Promise<void>,
};

export const authApi = createAuthApi(client);
export { client };
