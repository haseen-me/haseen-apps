import type { ApiClient } from './client';
import type { AuthApi, MailApi, DriveApi, KeysApi } from './services';

export function createAuthApi(client: ApiClient): AuthApi {
  return {
    register: (params) => client.post('/auth/register', params),
    loginInit: (params) => client.post('/auth/login/init', params),
    loginVerify: (params) => client.post('/auth/login/verify', params),
    logout: () => client.post('/auth/logout'),
    getAccount: () => client.get('/auth/account'),
  };
}

export function createMailApi(client: ApiClient): MailApi {
  return {
    getMailbox: () => client.get('/mail/mailbox'),
    getMessage: (id) => client.get(`/mail/messages/${id}`),
    sendMessage: (params) => client.post('/mail/messages', params),
    deleteMessage: (id) => client.del(`/mail/messages/${id}`),
  };
}

export function createDriveApi(client: ApiClient): DriveApi {
  return {
    listFiles: (folderID) => client.get(`/drive/files${folderID ? `?folder=${folderID}` : ''}`),
    uploadFile: (params) => client.post('/drive/files', params),
    downloadFile: async (fileID) => {
      const response = await fetch(`/api/v1/drive/files/${fileID}/download`, { credentials: 'include' });
      if (!response.ok) throw { status: response.status, message: 'download failed' };
      return response.arrayBuffer();
    },
    deleteFile: (id) => client.del(`/drive/files/${id}`),
  };
}

export function createKeysApi(client: ApiClient): KeysApi {
  return {
    getPublicKey: (userID) => client.get(`/keys/keys/${userID}`),
    publishKey: (params) => client.post('/keys/keys/publish', params),
    lookupKeys: (emails) => client.post('/keys/keys/lookup', { userIds: emails }),
  };
}
