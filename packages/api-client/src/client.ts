import type { ApiError } from './errors';

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ClientOptions {
  baseUrl?: string;
  getToken?: () => string | null;
}

export interface ApiClient {
  request<T>(options: RequestOptions): Promise<T>;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  put<T>(path: string, body?: unknown): Promise<T>;
  del<T>(path: string): Promise<T>;
}

export function createClient(baseUrlOrOpts: string | ClientOptions = '/api/v1'): ApiClient {
  const opts: ClientOptions = typeof baseUrlOrOpts === 'string'
    ? { baseUrl: baseUrlOrOpts }
    : baseUrlOrOpts;
  const baseUrl = opts.baseUrl ?? '/api/v1';
  const getToken = opts.getToken;

  async function request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body, headers = {} } = options;

    const authHeaders: Record<string, string> = {};
    if (getToken) {
      const token = getToken();
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: response.statusText,
      };
      try {
        const data = await response.json();
        error.message = data.error || error.message;
        error.code = data.code;
      } catch {
        // Response body isn't JSON
      }
      throw error;
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  return {
    request,
    get: <T>(path: string) => request<T>({ method: 'GET', path }),
    post: <T>(path: string, body?: unknown) => request<T>({ method: 'POST', path, body }),
    put: <T>(path: string, body?: unknown) => request<T>({ method: 'PUT', path, body }),
    del: <T>(path: string) => request<T>({ method: 'DELETE', path }),
  };
}
