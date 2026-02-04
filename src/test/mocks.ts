/**
 * Test Mocks and Factories
 * Reusable mock data for testing
 */

import type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  UserProfile,
  AuthResponse,
} from '../models/auth.types';

// ============================================================================
// Mock Credentials
// ============================================================================

export const mockLoginCredentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123',
};

export const mockRegisterData: RegisterData = {
  email: 'newuser@example.com',
  password: 'password123',
  name: 'Test User',
};

// ============================================================================
// Mock Tokens
// ============================================================================

export const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.4Adcj0vgGJx8E7T9fP0fM5NQZJ0X9Y9Z0X9Y9Z0X9Y0';
export const mockRefreshToken = 'refresh-token-mock';

export const mockAuthTokens: AuthTokens = {
  accessToken: mockAccessToken,
  refreshToken: mockRefreshToken,
};

// ============================================================================
// Mock User
// ============================================================================

export const mockUserProfile: UserProfile = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  roles: ['user'],
  permissions: ['read:profile', 'write:profile'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// ============================================================================
// Mock Auth Response
// ============================================================================

export const mockAuthResponse: AuthResponse = {
  accessToken: mockAccessToken,
  refreshToken: mockRefreshToken,
  user: mockUserProfile,
};

// ============================================================================
// Mock HTTP Client
// ============================================================================

export class MockHttpClient {
  post = vi.fn();
  get = vi.fn();
  patch = vi.fn();
  put = vi.fn();
  delete = vi.fn();
  setTokenGetter = vi.fn();
}

// ============================================================================
// Mock AuthService
// ============================================================================

export class MockAuthService {
  login = vi.fn().mockResolvedValue(mockAuthTokens);
  register = vi.fn().mockResolvedValue(mockAuthResponse);
  logout = vi.fn().mockResolvedValue(undefined);
  refreshToken = vi.fn().mockResolvedValue(mockAuthTokens);
  verifyEmail = vi.fn().mockResolvedValue(undefined);
  resendVerification = vi.fn().mockResolvedValue(undefined);
  forgotPassword = vi.fn().mockResolvedValue(undefined);
  resetPassword = vi.fn().mockResolvedValue(undefined);
  getProfile = vi.fn().mockResolvedValue(mockUserProfile);
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create mock user profile with custom fields
 */
export function createMockUser(overrides?: Partial<UserProfile>): UserProfile {
  return {
    ...mockUserProfile,
    ...overrides,
  };
}

/**
 * Create mock auth tokens with custom values
 */
export function createMockTokens(overrides?: Partial<AuthTokens>): AuthTokens {
  return {
    ...mockAuthTokens,
    ...overrides,
  };
}

/**
 * Create mock auth response with custom values
 */
export function createMockAuthResponse(overrides?: Partial<AuthResponse>): AuthResponse {
  return {
    ...mockAuthResponse,
    ...overrides,
  };
}
