import { createClient, createDriveApi, createAuthApi, createKeysApi } from '@haseen-me/api-client';

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('haseen-auth');
    if (!raw) return null;
    return JSON.parse(raw).token ?? null;
  } catch { return null; }
}

const client = createClient({ getToken });

export const driveApi = createDriveApi(client);
export const authApi = createAuthApi(client);
export const keysApi = createKeysApi(client);
export { client };
