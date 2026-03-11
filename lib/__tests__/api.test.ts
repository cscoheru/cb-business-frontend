/**
 * API Client Fixes Verification Tests
 *
 * This file verifies the fixes from SESSION1-FRONTEND-FIXES.md:
 * 1. API client auth header logic
 * 2. User type definition
 * 3. Request cancellation support
 * 4. Error handling improvements
 * 5. Request retry logic
 */

import { apiClient, authApi, APIError, getToken, setToken, removeToken } from '../api';

describe('API Client Fixes', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('1. Auth Header Logic', () => {
    test('should NOT add auth headers when requiresAuth=false', async () => {
      // Mock fetch to inspect headers
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      await apiClient.post('/api/v1/auth/register', {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }, false);  // requiresAuth = false

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;

      // Should NOT have Authorization header
      expect(headers['Authorization']).toBeUndefined();
      // Should have Content-Type
      expect(headers['Content-Type']).toBe('application/json');
    });

    test('should add auth headers when requiresAuth=true', async () => {
      // Set a token
      setToken('test_token_123');

      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });
      global.fetch = mockFetch;

      await apiClient.get('/api/v1/users/me', true);  // requiresAuth = true

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;

      // Should have Authorization header
      expect(headers['Authorization']).toBe('Bearer test_token_123');
    });
  });

  describe('2. User Type Definition', () => {
    test('should have correct User interface', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: '123',
          email: 'test@example.com',
          name: 'Test User',
          phone: null,
          avatar_url: null,
          plan_tier: 'pro',
          plan_status: 'active',  // ✅ Fixed: was 'cancelled'
          region_preference: null,
          currency_preference: 'CNY',
          created_at: '2024-01-01T00:00:00Z',
          last_login_at: '2024-01-01T00:00:00Z',  // ✅ Fixed: was 'last_active_at'
          is_admin: false,  // ✅ Added
        }),
      });
      global.fetch = mockFetch;

      setToken('test_token');
      const user = await apiClient.get('/api/v1/users/me');

      // Verify all required fields
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('phone');
      expect(user).toHaveProperty('avatar_url');
      expect(user).toHaveProperty('plan_tier');
      expect(user).toHaveProperty('plan_status');
      expect(user).toHaveProperty('region_preference');
      expect(user).toHaveProperty('currency_preference');
      expect(user).toHaveProperty('created_at');
      expect(user).toHaveProperty('last_login_at');
      expect(user).toHaveProperty('is_admin');

      // Verify plan_status accepts correct values
      expect(['active', 'canceled', 'expired']).toContain(user.plan_status);
    });
  });

  describe('3. Request Cancellation', () => {
    test('should support request cancellation via AbortSignal', async () => {
      const controller = apiClient.createController();
      const mockFetch = jest.fn();

      // Simulate aborting the request
      controller.abort();

      try {
        await apiClient.get('/api/v1/slow-endpoint', true, controller.signal);
      } catch (error: any) {
        // Should get an AbortError
        expect(error.name).toBe('AbortError');
      }
    });

    test('should create AbortController', () => {
      const controller = apiClient.createController();
      expect(controller).toBeInstanceOf(AbortController);
      expect(controller.abort).toBeInstanceOf(Function);
      expect(controller.signal).toBeInstanceOf(AbortSignal);
    });
  });

  describe('4. Error Handling', () => {
    test('should throw APIError with proper structure', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          detail: 'Unauthorized access',
          code: 'UNAUTHORIZED',
        }),
      });
      global.fetch = mockFetch;

      try {
        await apiClient.get('/api/v1/protected');
      } catch (error: any) {
        expect(error).toBeInstanceOf(APIError);
        expect(error.name).toBe('APIError');
        expect(error.code).toBe('UNAUTHORIZED');
        expect(error.status).toBe(401);
        expect(error.message).toBe('Unauthorized access');
      }
    });

    test('should handle error with missing detail', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          // No detail field
        }),
      });
      global.fetch = mockFetch;

      try {
        await apiClient.get('/api/v1/error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(APIError);
        expect(error.status).toBe(500);
        expect(error.code).toBe('UNKNOWN_ERROR');
      }
    });

    test('should provide error helper methods', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({
          detail: 'Forbidden',
          code: 'FORBIDDEN',
        }),
      });
      global.fetch = mockFetch;

      try {
        await apiClient.get('/api/v1/forbidden');
      } catch (error: any) {
        expect(error.getErrorMessage()).toBe('Forbidden');
        expect(error.getErrorCode()).toBe('FORBIDDEN');
      }
    });
  });

  describe('5. Request Retry Logic', () => {
    test('should retry on server errors (5xx)', async () => {
      let attemptCount = 0;
      const mockFetch = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.resolve({
            ok: false,
            status: 503,
            json: async () => ({ detail: 'Service unavailable' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      });
      global.fetch = mockFetch;

      const result = await apiClient.get('/api/v1/unstable');

      // Should have retried and succeeded
      expect(attemptCount).toBe(3);
      expect(result).toEqual({ success: true });
    });

    test('should NOT retry on client errors (4xx)', async () => {
      let attemptCount = 0;
      const mockFetch = jest.fn().mockImplementation(() => {
        attemptCount++;
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ detail: 'Bad request' }),
        });
      });
      global.fetch = mockFetch;

      try {
        await apiClient.get('/api/v1/bad-request');
      } catch (error) {
        // Should have only tried once
        expect(attemptCount).toBe(1);
      }
    });

    test('should retry on network errors', async () => {
      let attemptCount = 0;
      const mockFetch = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      });
      global.fetch = mockFetch;

      const result = await apiClient.get('/api/v1/network-error');

      // Should have retried and succeeded
      expect(attemptCount).toBe(2);
      expect(result).toEqual({ success: true });
    });
  });

  describe('Integration Tests', () => {
    test('register flow should work without auth', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'new_token',
          user: {
            id: '123',
            email: 'new@example.com',
            name: 'New User',
            phone: null,
            avatar_url: null,
            plan_tier: 'free',
            plan_status: 'active',
            region_preference: null,
            currency_preference: 'CNY',
            created_at: '2024-01-01T00:00:00Z',
            last_login_at: null,
            is_admin: false,
          },
        }),
      });
      global.fetch = mockFetch;

      const response = await authApi.register('new@example.com', 'password123', 'New User');

      expect(response.access_token).toBe('new_token');
      expect(getToken()).toBe('new_token');

      // Verify no auth header was sent
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });

    test('login flow should work without auth', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: 'login_token',
          user: {
            id: '123',
            email: 'user@example.com',
            name: 'User',
            phone: null,
            avatar_url: null,
            plan_tier: 'pro',
            plan_status: 'active',
            region_preference: null,
            currency_preference: 'CNY',
            created_at: '2024-01-01T00:00:00Z',
            last_login_at: '2024-01-01T00:00:00Z',
            is_admin: false,
          },
        }),
      });
      global.fetch = mockFetch;

      const response = await authApi.login('user@example.com', 'password123');

      expect(response.access_token).toBe('login_token');
      expect(getToken()).toBe('login_token');

      // Verify no auth header was sent
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBeUndefined();
    });

    test('protected endpoint should require auth', async () => {
      setToken('existing_token');
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: '123',
          email: 'user@example.com',
          name: 'User',
          phone: null,
          avatar_url: null,
          plan_tier: 'pro',
          plan_status: 'active',
          region_preference: null,
          currency_preference: 'CNY',
          created_at: '2024-01-01T00:00:00Z',
          last_login_at: '2024-01-01T00:00:00Z',
          is_admin: false,
        }),
      });
      global.fetch = mockFetch;

      await apiClient.get('/api/v1/users/me');

      // Verify auth header was sent
      const headers = mockFetch.mock.calls[0][1].headers;
      expect(headers['Authorization']).toBe('Bearer existing_token');
    });
  });

  describe('Token Management', () => {
    test('should set, get, and remove tokens', () => {
      expect(getToken()).toBeNull();

      setToken('test_token');
      expect(getToken()).toBe('test_token');

      removeToken();
      expect(getToken()).toBeNull();
    });

    test('should handle SSR gracefully', () => {
      // Save original window
      const originalWindow = global.window;

      // Simulate SSR environment
      // @ts-ignore
      delete global.window;

      expect(getToken()).toBeNull();
      setToken('should_not_crash');
      removeToken();

      // Restore window
      global.window = originalWindow;
    });
  });
});
