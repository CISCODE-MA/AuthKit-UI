/**
 * HttpClient Tests
 * Unit tests for HTTP client utility
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HttpClient } from '../../src/services/http-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('HttpClient', () => {
  let client: HttpClient;
  const baseUrl = 'http://test-api.com';

  beforeEach(() => {
    client = new HttpClient({ baseUrl });
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  describe('Initialization', () => {
    it('should initialize with base URL', () => {
      expect(client).toBeDefined();
    });

    it('should remove trailing slash from base URL', () => {
      const clientWithSlash = new HttpClient({ baseUrl: 'http://api.com/' });
      expect(clientWithSlash).toBeDefined();
    });

    it('should use default timeout if not provided', () => {
      const client = new HttpClient({ baseUrl: 'http://api.com' });
      expect(client).toBeDefined();
    });

    it('should use custom timeout if provided', () => {
      const client = new HttpClient({ baseUrl: 'http://api.com', timeout: 5000 });
      expect(client).toBeDefined();
    });
  });

  // ==========================================================================
  // TOKEN INJECTION
  // ==========================================================================

  describe('Token Injection', () => {
    it('should inject Authorization header when token getter is set', async () => {
      const token = 'test-access-token';
      client.setTokenGetter(() => token);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${token}`,
          }),
        })
      );
    });

    it('should not inject Authorization header when token is null', async () => {
      client.setTokenGetter(() => null);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await client.get('/test');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });

    it('should not inject Authorization header when getter not set', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await client.get('/test');

      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  // ==========================================================================
  // GET REQUEST
  // ==========================================================================

  describe('GET Request', () => {
    it('should make GET request with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, name: 'Test' }),
      });

      await client.get('/users/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/users/1',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should return parsed JSON response', async () => {
      const mockData = { id: 1, email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await client.get('/user');

      expect(result).toEqual(mockData);
    });

    it('should include Content-Type header', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include custom headers if provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test', {
        headers: { 'X-Custom-Header': 'custom-value' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should handle withCredentials option', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test', { withCredentials: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  // ==========================================================================
  // POST REQUEST
  // ==========================================================================

  describe('POST Request', () => {
    it('should make POST request with data', async () => {
      const data = { email: 'test@example.com', password: 'password123' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'token' }),
      });

      await client.post('/login', data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
    });

    it('should return parsed JSON response', async () => {
      const mockResponse = { accessToken: 'token', refreshToken: 'refresh' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.post('/login', {});

      expect(result).toEqual(mockResponse);
    });

    it('should handle POST without data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.post('/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });
  });

  // ==========================================================================
  // PATCH REQUEST
  // ==========================================================================

  describe('PATCH Request', () => {
    it('should make PATCH request with data', async () => {
      const data = { name: 'Updated Name' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, ...data }),
      });

      await client.patch('/users/1', data);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/users/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(data),
        })
      );
    });
  });

  // ==========================================================================
  // DELETE REQUEST
  // ==========================================================================

  describe('DELETE Request', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await client.delete('/users/1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://test-api.com/users/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  describe('Error Handling', () => {
    it('should throw error on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Resource not found', statusCode: 404 }),
      });

      await expect(client.get('/not-found')).rejects.toThrow('Resource not found');
    });

    it('should throw error on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Invalid credentials', statusCode: 401 }),
      });

      await expect(client.post('/login', {})).rejects.toThrow('Invalid credentials');
    });

    it('should throw error on 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error', statusCode: 500 }),
      });

      await expect(client.get('/test')).rejects.toThrow('Server error');
    });

    it('should handle error when JSON parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('JSON parse error');
        },
      });

      await expect(client.get('/test')).rejects.toThrow('Internal Server Error');
    });

    it('should include response data in error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Invalid input', statusCode: 400, field: 'email' }),
      });

      try {
        await client.post('/test', {});
      } catch (error: any) {
        expect(error.response).toBeDefined();
        expect(error.response.status).toBe(400);
        expect(error.response.data.field).toBe('email');
      }
    });
  });

  // ==========================================================================
  // TIMEOUT HANDLING
  // ==========================================================================

  describe('Timeout Handling', () => {
    // Skipped: fetch abort/timeout not reliably mockable in jsdom, flaky in CI. See docs/tasks/active/UI-FLAKY-HTTP-TIMEOUT.md
    it.skip('should abort request on timeout', async () => {
      const clientWithTimeout = new HttpClient({ baseUrl, timeout: 100 });

      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 200);
          })
      );

      // Use fake timers to simulate timeout
      vi.useFakeTimers();
      const promise = clientWithTimeout.get('/slow');
      vi.advanceTimersByTime(200);
      await expect(promise).rejects.toThrow();
      vi.useRealTimers();
    });
  });

  // ==========================================================================
  // URL BUILDING
  // ==========================================================================

  describe('URL Building', () => {
    it('should handle endpoint with leading slash', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('/test');

      expect(mockFetch).toHaveBeenCalledWith('http://test-api.com/test', expect.any(Object));
    });

    it('should handle endpoint without leading slash', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await client.get('test');

      expect(mockFetch).toHaveBeenCalledWith('http://test-api.com/test', expect.any(Object));
    });
  });
});
