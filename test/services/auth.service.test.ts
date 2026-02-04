/**
 * AuthService Tests
 * Unit tests for authentication service
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { HttpClient } from '../../src/services/http-client';
import type { LoginCredentials, RegisterData } from '../../src/models/auth.types';

// Mock HttpClient
vi.mock('../../src/services/http-client');

describe('AuthService', () => {
  let service: AuthService;
  let mockHttpClient: any;

  beforeEach(() => {
    // Create mock HttpClient instance
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      setTokenGetter: vi.fn(),
    };

    // Mock HttpClient constructor
    vi.mocked(HttpClient).mockImplementation(() => mockHttpClient);

    // Create service
    service = new AuthService('http://test-api.com');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  describe('Initialization', () => {
    it('should initialize with base URL', () => {
      expect(service).toBeDefined();
      expect(HttpClient).toHaveBeenCalledWith({ baseUrl: 'http://test-api.com' });
    });

    it('should set token getter', () => {
      const tokenGetter = () => 'test-token';
      service.setTokenGetter(tokenGetter);

      expect(mockHttpClient.setTokenGetter).toHaveBeenCalledWith(tokenGetter);
    });
  });

  // ==========================================================================
  // LOGIN
  // ==========================================================================

  describe('Login', () => {
    it('should call POST /api/auth/login with credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockTokens = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      mockHttpClient.post.mockResolvedValueOnce(mockTokens);

      const result = await service.login(credentials);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/login',
        credentials,
        { withCredentials: true }
      );
      expect(result).toEqual(mockTokens);
    });

    it('should include withCredentials for cookie-based refresh token', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      mockHttpClient.post.mockResolvedValueOnce({});

      await service.login(credentials);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({ withCredentials: true })
      );
    });
  });

  // ==========================================================================
  // REGISTER
  // ==========================================================================

  describe('Register', () => {
    it('should call POST /api/auth/register with user data', async () => {
      const registerData: RegisterData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockResponse = {
        message: 'User registered successfully',
        ok: true,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.register(registerData);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/register',
        registerData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // LOGOUT
  // ==========================================================================

  describe('Logout', () => {
    it('should resolve successfully (client-side logout)', async () => {
      await expect(service.logout()).resolves.toBeUndefined();
    });

    it('should not call HTTP client (no backend endpoint)', async () => {
      await service.logout();
      expect(mockHttpClient.post).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // REFRESH TOKEN
  // ==========================================================================

  describe('Refresh Token', () => {
    it('should call POST /api/auth/refresh-token', async () => {
      const refreshToken = 'old-refresh-token';
      const mockNewTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      mockHttpClient.post.mockResolvedValueOnce(mockNewTokens);

      const result = await service.refreshToken(refreshToken);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/refresh-token',
        { refreshToken },
        { withCredentials: true }
      );
      expect(result).toEqual(mockNewTokens);
    });
  });

  // ==========================================================================
  // EMAIL VERIFICATION
  // ==========================================================================

  describe('Email Verification', () => {
    it('should call POST /api/auth/verify-email with token', async () => {
      const token = 'verification-token';
      const mockResponse = {
        message: 'Email verified successfully',
        ok: true,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.verifyEmail(token);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/verify-email',
        { token }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /api/auth/resend-verification with email', async () => {
      const email = 'test@example.com';
      const mockResponse = {
        message: 'Verification email sent',
        ok: true,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.resendVerification(email);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/resend-verification',
        { email }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // USER PROFILE
  // ==========================================================================

  describe('User Profile', () => {
    it('should call GET /api/auth/me', async () => {
      const mockProfile = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user'],
        permissions: ['read:profile'],
        modules: [],
        tenantId: 'tenant-1',
      };

      mockHttpClient.get.mockResolvedValueOnce(mockProfile);

      const result = await service.getProfile();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockProfile);
    });

    it('should require authentication (token injected by HttpClient)', async () => {
      mockHttpClient.get.mockResolvedValueOnce({});

      await service.getProfile();

      // Token injection is handled by HttpClient, not AuthService
      expect(mockHttpClient.get).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // PASSWORD RESET
  // ==========================================================================

  describe('Password Reset', () => {
    it('should call POST /api/auth/forgot-password with email', async () => {
      const email = 'test@example.com';
      const mockResponse = {
        message: 'Password reset email sent',
        ok: true,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.forgotPassword(email);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/forgot-password',
        { email }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call POST /api/auth/reset-password with token and new password', async () => {
      const token = 'reset-token';
      const newPassword = 'newPassword123';
      const mockResponse = {
        message: 'Password reset successfully',
        ok: true,
      };

      mockHttpClient.post.mockResolvedValueOnce(mockResponse);

      const result = await service.resetPassword(token, newPassword);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/auth/reset-password',
        { token, newPassword }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ==========================================================================
  // OAUTH
  // ==========================================================================

  describe('OAuth URLs', () => {
    it('should generate Google OAuth URL', () => {
      const callbackUrl = 'http://localhost:3000/auth/callback';
      const url = service.getGoogleOAuthUrl(callbackUrl);

      expect(url).toContain('/api/auth/google');
      expect(url).toContain(encodeURIComponent(callbackUrl));
    });

    it('should generate Microsoft OAuth URL', () => {
      const callbackUrl = 'http://localhost:3000/auth/callback';
      const url = service.getMicrosoftOAuthUrl(callbackUrl);

      expect(url).toContain('/api/auth/microsoft');
      expect(url).toContain(encodeURIComponent(callbackUrl));
    });
  });

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  describe('Error Handling', () => {
    it('should propagate HTTP errors from login', async () => {
      const error = new Error('Invalid credentials');
      mockHttpClient.post.mockRejectedValueOnce(error);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should propagate HTTP errors from register', async () => {
      const error = new Error('Email already exists');
      mockHttpClient.post.mockRejectedValueOnce(error);

      await expect(
        service.register({
          email: 'existing@example.com',
          password: 'password',
          firstName: 'John',
          lastName: 'Doe',
        })
      ).rejects.toThrow('Email already exists');
    });

    it('should propagate HTTP errors from getProfile', async () => {
      const error = new Error('Unauthorized');
      mockHttpClient.get.mockRejectedValueOnce(error);

      await expect(service.getProfile()).rejects.toThrow('Unauthorized');
    });

    it('should propagate network errors', async () => {
      const error = new Error('Network error');
      mockHttpClient.post.mockRejectedValueOnce(error);

      await expect(
        service.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Network error');
    });
  });
});
