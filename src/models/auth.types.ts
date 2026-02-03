/**
 * Authentication types aligned with backend DTOs
 * Backend: @ciscode/authentication-kit
 */

// ============================================================================
// AUTH CREDENTIALS & REQUESTS
// ============================================================================

/**
 * Login credentials matching backend LoginDto
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data matching backend RegisterDto
 */
export interface RegisterData {
  fullname: {
    fname: string;
    lname: string;
  };
  username?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  avatar?: string;
  jobTitle?: string;
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
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generic auth response with message
 */
export interface AuthResponse {
  message: string;
  success?: boolean;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  message: string;
  user?: UserProfile;
}

// ============================================================================
// USER PROFILE (Re-export existing + extend)
// ============================================================================

export { UserProfile, RoleWithPerms } from './User';

/**
 * User data from JWT token (decoded)
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  permissions: string[];
  tenantId?: string;
  iat?: number;
  exp?: number;
}

// ============================================================================
// AUTH STATE (for React context/hooks)
// ============================================================================

/**
 * Authentication state managed by useAuth hook
 */
export interface AuthState {
  /** Currently logged-in user */
  user: UserProfile | null;
  
  /** JWT access token */
  accessToken: string | null;
  
  /** JWT refresh token */
  refreshToken: string | null;
  
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether auth state is being initialized */
  isLoading: boolean;
  
  /** Auth error if any */
  error: string | null;
}

/**
 * Auth actions for useAuth hook
 */
export interface AuthActions {
  /** Login with credentials */
  login: (credentials: LoginCredentials) => Promise<void>;
  
  /** Register new user */
  register: (data: RegisterData) => Promise<void>;
  
  /** Logout current user */
  logout: () => Promise<void>;
  
  /** Refresh access token */
  refreshToken: () => Promise<void>;
  
  /** Verify email with token */
  verifyEmail: (token: string) => Promise<void>;
  
  /** Resend verification email */
  resendVerification: (email: string) => Promise<void>;
  
  /** Request password reset */
  forgotPassword: (email: string) => Promise<void>;
  
  /** Reset password with token */
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  
  /** Clear auth error */
  clearError: () => void;
}

/**
 * Complete auth hook return type
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
