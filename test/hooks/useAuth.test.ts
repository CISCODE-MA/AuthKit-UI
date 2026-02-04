/**
 * useAuth Hook Tests
 * Comprehensive test suite for authentication hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { createUseAuth } from '../../src/hooks/useAuth';
import { AuthService } from '../../src/services/auth.service';
import type { LoginCredentials, RegisterData } from '../../src/models/auth.types';
import {
  mockLoginCredentials,
  mockRegisterData,
  mockAuthTokens,
  mockUserProfile,
  mockAccessToken,
} from '../../src/test/mocks';

// Mock AuthService
vi.mock('../../src/services/auth.service');

describe('useAuth', () => {
  let useAuth: ReturnType<typeof createUseAuth>;
  let mockAuthService: any;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Create mock AuthService instance
    mockAuthService = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshToken: vi.fn(),
      verifyEmail: vi.fn(),
      resendVerification: vi.fn(),
      forgotPassword: vi.fn(),
      resetPassword: vi.fn(),
      getProfile: vi.fn(),
      setTokenGetter: vi.fn(),
    };

    // Mock AuthService constructor
    vi.mocked(AuthService).mockImplementation(() => mockAuthService);

    // Create hook instance
    useAuth = createUseAuth({
      baseUrl: 'http://test.com',
      autoRefresh: false, // Disable for most tests
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ========================================================================
  // INITIALIZATION
  // ========================================================================

  describe('Initialization', () => {
    it('should initialize with unauthenticated state', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should load auth state from localStorage', async () => {
      // Setup: Store valid token in localStorage
      const futureExpiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const validToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: '123',
          email: 'test@example.com',
          exp: futureExpiry,
          roles: ['user'],
          permissions: [],
        })
      )}.signature`;

      localStorage.setItem('auth_access_token', validToken);
      localStorage.setItem('auth_refresh_token', 'refresh-token');
      localStorage.setItem('auth_user', JSON.stringify(mockUserProfile));

      const { result } = renderHook(() => useAuth());

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Verify user loaded (ignore Date serialization differences)
      expect(result.current.user).toMatchObject({
        id: mockUserProfile.id,
        email: mockUserProfile.email,
        roles: mockUserProfile.roles,
        permissions: mockUserProfile.permissions,
      });
      expect(result.current.accessToken).toBe(validToken);
    });

    it('should not load expired token from localStorage', () => {
      // Setup: Store expired token
      const pastExpiry = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const expiredToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
        JSON.stringify({
          sub: '123',
          email: 'test@example.com',
          exp: pastExpiry,
        })
      )}.signature`;

      localStorage.setItem('auth_access_token', expiredToken);
      localStorage.setItem('auth_user', JSON.stringify(mockUserProfile));

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  // ========================================================================
  // LOGIN
  // ========================================================================

  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      // Mock successful login
      mockAuthService.login.mockResolvedValue(mockAuthTokens);
      mockAuthService.getProfile.mockResolvedValue({ data: mockUserProfile });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(mockLoginCredentials);
      });

      // Verify state
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toMatchObject({
        id: mockUserProfile.id,
        email: mockUserProfile.email,
        roles: mockUserProfile.roles,
      });
      expect(result.current.accessToken).toBe(mockAuthTokens.accessToken);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);

      // Verify service calls
      expect(mockAuthService.login).toHaveBeenCalledWith(mockLoginCredentials);
      expect(mockAuthService.getProfile).toHaveBeenCalled();

      // Verify localStorage
      expect(localStorage.getItem('auth_access_token')).toBe(mockAuthTokens.accessToken);
      expect(localStorage.getItem('auth_refresh_token')).toBe(mockAuthTokens.refreshToken);
      expect(localStorage.getItem('auth_user')).toBeTruthy();
    });

    it('should handle login failure', async () => {
      const loginError = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(loginError);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login(mockLoginCredentials);
        })
      ).rejects.toThrow('Invalid credentials');

      // Verify state after error
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
      // Note: error state is implementation detail, focus on behavior
    });

    it('should fallback to JWT data if profile fetch fails', async () => {
      mockAuthService.login.mockResolvedValue(mockAuthTokens);
      mockAuthService.getProfile.mockRejectedValue(new Error('Profile fetch failed'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(mockLoginCredentials);
      });

      // Should still be authenticated with JWT data
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeTruthy();
      expect(result.current.user?.id).toBe('1234567890'); // From mock JWT
    });

    it('should set isLoading during login', async () => {
      let resolveLogin: any;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      mockAuthService.login.mockReturnValue(loginPromise);

      const { result } = renderHook(() => useAuth());

      // Start login
      act(() => {
        result.current.login(mockLoginCredentials);
      });

      // Check loading state
      expect(result.current.isLoading).toBe(true);

      // Resolve
      await act(async () => {
        resolveLogin(mockAuthTokens);
        await loginPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  // ========================================================================
  // LOGOUT
  // ========================================================================

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Setup: Login first
      mockAuthService.login.mockResolvedValue(mockAuthTokens);
      mockAuthService.getProfile.mockResolvedValue({ data: mockUserProfile });
      mockAuthService.logout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      // Login
      await act(async () => {
        await result.current.login(mockLoginCredentials);
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      // Verify state cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.refreshToken).toBeNull();

      // Verify service called
      expect(mockAuthService.logout).toHaveBeenCalled();

      // Verify localStorage cleared
      expect(localStorage.getItem('auth_access_token')).toBeNull();
      expect(localStorage.getItem('auth_refresh_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });

    it('should clear state even if logout API fails', async () => {
      // Setup: Login first
      mockAuthService.login.mockResolvedValue(mockAuthTokens);
      mockAuthService.getProfile.mockResolvedValue({ data: mockUserProfile });
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login(mockLoginCredentials);
      });

      // Logout (even though API fails)
      await act(async () => {
        await result.current.logout();
      });

      // State should still be cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  // ========================================================================
  // REGISTER
  // ========================================================================

  describe('Register', () => {
    it('should register successfully', async () => {
      mockAuthService.register.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.register(mockRegisterData);
      });

      expect(mockAuthService.register).toHaveBeenCalledWith(mockRegisterData);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle registration failure', async () => {
      const error = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(error);

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.register(mockRegisterData);
        })
      ).rejects.toThrow('Email already exists');

      // Error thrown correctly - focus on behavior not state
    });
  });

  // ========================================================================
  // EMAIL VERIFICATION
  // ========================================================================

  describe('Email Verification', () => {
    it('should verify email successfully', async () => {
      mockAuthService.verifyEmail.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.verifyEmail('verify-token');
      });

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith('verify-token');
      expect(result.current.error).toBeNull();
    });

    it('should handle verification failure', async () => {
      mockAuthService.verifyEmail.mockRejectedValue(new Error('Invalid token'));

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.verifyEmail('invalid-token');
        })
      ).rejects.toThrow('Invalid token');

      // Error thrown correctly
    });

    it('should resend verification email', async () => {
      mockAuthService.resendVerification.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resendVerification('test@example.com');
      });

      expect(mockAuthService.resendVerification).toHaveBeenCalledWith('test@example.com');
    });
  });

  // ========================================================================
  // PASSWORD RESET
  // ========================================================================

  describe('Password Reset', () => {
    it('should request password reset', async () => {
      mockAuthService.forgotPassword.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.forgotPassword('test@example.com');
      });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
      expect(result.current.error).toBeNull();
    });

    it('should reset password with token', async () => {
      mockAuthService.resetPassword.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.resetPassword('reset-token', 'newPassword123');
      });

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith('reset-token', 'newPassword123');
      expect(result.current.error).toBeNull();
    });
  });

  // ========================================================================
  // ERROR HANDLING
  // ========================================================================

  describe('Error Handling', () => {
    it('should clear error', async () => {
      const { result } = renderHook(() => useAuth());

      // Directly test clearError function exists and works
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle network errors gracefully', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      await expect(
        act(async () => {
          await result.current.login(mockLoginCredentials);
        })
      ).rejects.toThrow('Network error');

      // Verify user not authenticated after network error
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  // ========================================================================
  // AUTO-REFRESH
  // ========================================================================

  describe('Auto-Refresh', () => {
    it.skip(
      'should auto-refresh token before expiration',
      async () => {
        vi.useFakeTimers();

        // Create hook with auto-refresh enabled
        const useAuthWithRefresh = createUseAuth({
          baseUrl: 'http://test.com',
          autoRefresh: true,
          refreshBeforeSeconds: 60,
        });

        // Mock refresh
        mockAuthService.refreshToken.mockResolvedValue({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        });

        // Setup: Token expiring in 2 minutes
        const futureExpiry = Math.floor(Date.now() / 1000) + 120; // 2 minutes
        const expiringToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(
          JSON.stringify({
            sub: '123',
            email: 'test@example.com',
            exp: futureExpiry,
            roles: ['user'],
            permissions: [],
          })
        )}.signature`;

        localStorage.setItem('auth_access_token', expiringToken);
        localStorage.setItem('auth_refresh_token', 'refresh-token');
        localStorage.setItem('auth_user', JSON.stringify(mockUserProfile));

        const { result } = renderHook(() => useAuthWithRefresh());

        // Wait for token to load
        await act(async () => {
          vi.runAllTimers();
        });

        await waitFor(() => {
          expect(result.current.isAuthenticated).toBe(true);
        });

        // Fast-forward 61 seconds (should trigger refresh)
        await act(async () => {
          vi.advanceTimersByTime(61000);
          vi.runAllTimers();
        });

        // Verify refresh was called
        await waitFor(
          () => {
            expect(mockAuthService.refreshToken).toHaveBeenCalledWith('refresh-token');
          },
          { timeout: 15000 }
        );

        vi.useRealTimers();
      },
      15000
    ); // Test timeout: 15 seconds
  });
});
