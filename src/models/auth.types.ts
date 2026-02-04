/**
 * Authentication types aligned with backend DTOs
 * Backend: @ciscode/authentication-kit
 */

// ============================================================================
// IMPORTS - User types needed throughout
// ============================================================================

import type { UserProfile as UserProfileBase, RoleWithPerms } from './User';

// Re-export for external use
export type UserProfile = UserProfileBase;
export type { RoleWithPerms };

// ============================================================================
// AUTH CREDENTIALS & REQUESTS
// ============================================================================

/**
 * Login credentials matching backend LoginDto
 * 
 * @example
 * ```ts
 * const credentials: LoginCredentials = {
 *   email: 'user@example.com',
 *   password: 'SecurePassword123!',
 * };
 * ```
 */
export interface LoginCredentials {
  /** User email address */
  email: string;
  /** User password (plain text, will be hashed by backend) */
  password: string;
}

/**
 * Registration data matching backend RegisterDto
 * 
 * @example
 * ```ts
 * const data: RegisterData = {
 *   fullname: { fname: 'John', lname: 'Doe' },
 *   email: 'john.doe@example.com',
 *   password: 'SecurePassword123!',
 *   phoneNumber: '+1234567890',
 * };
 * ```
 */
export interface RegisterData {
  /** User's full name */
  fullname: {
    /** First name */
    fname: string;
    /** Last name */
    lname: string;
  };
  /** Username (optional) */
  username?: string;
  /** Email address (must be unique) */
  email: string;
  /** Password (will be hashed by backend) */
  password: string;
  /** Phone number (optional) */
  phoneNumber?: string;
  /** Avatar URL (optional) */
  avatar?: string;
  /** Job title (optional) */
  jobTitle?: string;
  /** Company name (optional) */
  company?: string;
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

/**
 * Email verification request
 */
export interface VerifyEmailRequest {
  token: string;
}

/**
 * Resend verification email request
 */
export interface ResendVerificationRequest {
  email: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

// ============================================================================
// AUTH RESPONSES
// ============================================================================

/**
 * JWT tokens returned from backend after login/refresh
 * 
 * @example
 * ```ts
 * const tokens: AuthTokens = {
 *   accessToken: 'eyJhbGciOiJIUzI1NiIs...',
 *   refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
 * };
 * ```
 */
export interface AuthTokens {
  /** JWT access token (short-lived, use for API calls) */
  accessToken: string;
  /** JWT refresh token (long-lived, use to get new access tokens) */
  refreshToken: string;
}

/**
 * Generic auth response with message
 */
export interface AuthResponse {
  /** Success/error message */
  message: string;
  /** Whether operation succeeded */
  success?: boolean;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  /** Registration result message */
  message: string;
  /** Created user profile (if returned by backend) */
  user?: UserProfile;
}

/**
 * User data from JWT token (decoded)
 * Note: Frontend decodes this for quick access, but backend validates signature
 */
export interface JwtPayload {
  /** User ID (JWT "sub" claim) */
  sub: string;
  /** User email address */
  email: string;
  /** User roles */
  roles: string[];
  /** User permissions */
  permissions: string[];
  /** Tenant ID (for multi-tenant apps) */
  tenantId?: string;
  /** Issued at timestamp (seconds since epoch) */
  iat?: number;
  /** Expiration timestamp (seconds since epoch) */
  exp?: number;
}

// ============================================================================
// AUTH STATE (for React context/hooks)
// ============================================================================

/**
 * Authentication state managed by useAuth hook
 * 
 * This represents the current authentication status and user information
 * in the React application state.
 */
export interface AuthState {
  /** Currently logged-in user (null if not authenticated) */
  user: UserProfile | null;
  
  /** JWT access token (stored in memory, used for API calls) */
  accessToken: string | null;
  
  /** JWT refresh token (stored in localStorage, used to get new access tokens) */
  refreshToken: string | null;
  
  /** Whether user is authenticated (has valid access token) */
  isAuthenticated: boolean;
  
  /** Whether auth state is being initialized (loading from storage) */
  isLoading: boolean;
  
  /** Auth error message if any operation failed */
  error: string | null;
}

/**
 * Auth actions available from useAuth hook
 * 
 * All async actions return promises that can be awaited.
 * Errors are stored in state.error and also thrown for handling in components.
 */
export interface AuthActions {
  /** 
   * Login with email and password
   * @param credentials - User credentials
   * @throws {ApiError} If credentials are invalid or login fails
   */
  login: (credentials: LoginCredentials) => Promise<void>;
  
  /** 
   * Register a new user account
   * @param data - User registration data
   * @throws {ApiError} If email already exists or validation fails
   */
  register: (data: RegisterData) => Promise<void>;
  
  /** 
   * Logout current user (clears tokens and state)
   * @throws {ApiError} If logout API call fails (state is still cleared)
   */
  logout: () => Promise<void>;
  
  /** 
   * Verify email with token from email link
   * @param token - Email verification token
   * @throws {ApiError} If token is invalid or expired
   */
  verifyEmail: (token: string) => Promise<void>;
  
  /** 
   * Resend verification email to user
   * @param email - User email address
   * @throws {ApiError} If email not found or already verified
   */
  resendVerification: (email: string) => Promise<void>;
  
  /** 
   * Request password reset (sends email with reset link)
   * @param email - User email address
   * @throws {ApiError} If email not found
   */
  forgotPassword: (email: string) => Promise<void>;
  
  /** 
   * Reset password with token from email link
   * @param token - Password reset token
   * @param newPassword - New password
   * @throws {ApiError} If token is invalid/expired or password is weak
   */
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  /** Clear auth error from state */
  clearError: () => void;
  
  /**
   * Check if user has a specific role
   * @param role - Role name to check
   * @returns true if user has the role
   */
  hasRole: (role: string) => boolean;
  
  /**
   * Check if user has a specific permission
   * @param permission - Permission name to check
   * @returns true if user has the permission
   */
  hasPermission: (permission: string) => boolean;
}

/**
 * Complete auth hook return type
 * 
 * Combines authentication state and actions into a single interface
 * returned by the useAuth hook.
 * 
 * @example
 * ```tsx
 * const { 
 *   user, 
 *   isAuthenticated, 
 *   isLoading, 
 *   login, 
 *   logout 
 * } = useAuth();
 * ```
 */
export type UseAuthReturn = AuthState & AuthActions;

// ============================================================================
// API ERROR HANDLING
// ============================================================================

/**
 * API error response structure
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
  details?: any;
}

/**
 * Auth-specific error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  UNAUTHORIZED = 'UNAUTHORIZED',
}
