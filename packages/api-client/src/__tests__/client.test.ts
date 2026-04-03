import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '../client';
import { isApiError } from '../errors';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(status: number, body?: { error?: string; code?: string }) {
  return new Response(body ? JSON.stringify(body) : null, {
    status,
    statusText: status === 404 ? 'Not Found' : 'Internal Server Error',
  });
}

describe('createClient', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('creates a client with default base URL', () => {
    const client = createClient();
    expect(client).toBeDefined();
    expect(client.get).toBeTypeOf('function');
    expect(client.post).toBeTypeOf('function');
    expect(client.put).toBeTypeOf('function');
    expect(client.del).toBeTypeOf('function');
    expect(client.request).toBeTypeOf('function');
  });

  it('creates a client with custom base URL', async () => {
    const client = createClient('http://localhost:8080/api/v1');
    mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

    await client.get('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/test',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  describe('GET requests', () => {
    it('sends GET request with correct URL and headers', async () => {
      const client = createClient('/api/v1');
      mockFetch.mockResolvedValueOnce(jsonResponse({ id: '123' }));

      const result = await client.get('/users/123');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/users/123', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
        credentials: 'include',
      });
      expect(result).toEqual({ id: '123' });
    });
  });

  describe('POST requests', () => {
    it('sends POST request with JSON body', async () => {
      const client = createClient('/api/v1');
      const body = { email: 'test@example.com', password: 'secret' };
      mockFetch.mockResolvedValueOnce(jsonResponse({ userID: 'abc' }));

      const result = await client.post('/auth/register', body);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      expect(result).toEqual({ userID: 'abc' });
    });

    it('sends POST with no body', async () => {
      const client = createClient('/api/v1');
      mockFetch.mockResolvedValueOnce(jsonResponse({}));

      await client.post('/auth/logout');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
        credentials: 'include',
      });
    });
  });

  describe('PUT requests', () => {
    it('sends PUT request with JSON body', async () => {
      const client = createClient('/api/v1');
      const body = { name: 'Updated' };
      mockFetch.mockResolvedValueOnce(jsonResponse({ name: 'Updated' }));

      const result = await client.put('/calendars/1', body);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/calendars/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      expect(result).toEqual({ name: 'Updated' });
    });
  });

  describe('DELETE requests', () => {
    it('sends DELETE request', async () => {
      const client = createClient('/api/v1');
      // 204 No Content for deletes
      mockFetch.mockResolvedValueOnce(new Response(null, { status: 204 }));

      const result = await client.del('/messages/1');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/messages/1', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: undefined,
        credentials: 'include',
      });
      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('throws ApiError on non-OK response with JSON body', async () => {
      const client = createClient('/api/v1');
      mockFetch.mockResolvedValueOnce(errorResponse(404, { error: 'user not found', code: 'NOT_FOUND' }));

      try {
        await client.get('/users/999');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(isApiError(err)).toBe(true);
        if (isApiError(err)) {
          expect(err.status).toBe(404);
          expect(err.message).toBe('user not found');
          expect(err.code).toBe('NOT_FOUND');
        }
      }
    });

    it('throws ApiError with statusText when response body is not JSON', async () => {
      const client = createClient('/api/v1');
      mockFetch.mockResolvedValueOnce(
        new Response('plain text', { status: 500, statusText: 'Internal Server Error' }),
      );

      try {
        await client.get('/broken');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(isApiError(err)).toBe(true);
        if (isApiError(err)) {
          expect(err.status).toBe(500);
          expect(err.message).toBe('Internal Server Error');
        }
      }
    });

    it('throws ApiError on 401 Unauthorized', async () => {
      const client = createClient('/api/v1');
      mockFetch.mockResolvedValueOnce(errorResponse(401, { error: 'unauthorized' }));

      try {
        await client.get('/auth/account');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(isApiError(err)).toBe(true);
        if (isApiError(err)) {
          expect(err.status).toBe(401);
          expect(err.message).toBe('unauthorized');
        }
      }
    });
  });

  describe('request method', () => {
    it('supports custom headers', async () => {
      const client = createClient('/api/v1');
      mockFetch.mockResolvedValueOnce(jsonResponse({ ok: true }));

      await client.request({
        method: 'POST',
        path: '/test',
        headers: { 'X-Custom': 'value' },
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Custom': 'value' },
        body: undefined,
        credentials: 'include',
      });
    });
  });
});

describe('isApiError', () => {
  it('returns true for valid ApiError objects', () => {
    expect(isApiError({ status: 404, message: 'not found' })).toBe(true);
    expect(isApiError({ status: 500, message: 'error', code: 'ERR' })).toBe(true);
  });

  it('returns false for non-ApiError values', () => {
    expect(isApiError(null)).toBe(false);
    expect(isApiError(undefined)).toBe(false);
    expect(isApiError('string')).toBe(false);
    expect(isApiError(42)).toBe(false);
    expect(isApiError({})).toBe(false);
    expect(isApiError({ status: 404 })).toBe(false);
    expect(isApiError({ message: 'err' })).toBe(false);
    expect(isApiError(new Error('test'))).toBe(false);
  });
});
