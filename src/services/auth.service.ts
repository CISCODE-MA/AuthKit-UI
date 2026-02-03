/**
 * Auth Service
 * Handles all authentication-related API calls to the backend
 * 
 * Backend endpoints: @ciscode/authentication-kit
 * Base path: /api/auth
 */

import { HttpClient } from './http-client';
import type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthResponse,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  RefreshTokenRequest,
} from '../models/auth.types';

/**
 * Authentication service for backend API calls
 */
export class AuthService {
  private http: HttpClient;

  constructor(baseUrl: string) {
    this.http = new HttpClient({ baseUrl });
  }

  /**
   * Set token getter for authenticated requests
   */
  setTokenGetter(getter: () => string | null): void {
    this.http.setTokenGetter(getter);
  }

  // ============================================================================
  // AUTHENTICATION
  // ============================================================================

  /**
   * Login with email and password
   * POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    return this.http.post<AuthTokens>('/api/auth/login', credentials, {
      withCredentials: true, // Important: backend sets refreshToken cookie
    });
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    return this.http.post<RegisterResponse>('/api/auth/register', data);
  }

  /**
   * Logout (clear tokens on backend if needed)
   * Note: Actual logout is handled client-side (clearing localStorage/state)
   * Backend may implement POST /api/auth/logout to blacklist refresh token
   */
  async logout(): Promise<void> {
    // If backend has logout endpoint, call it
    // await this.http.post('/api/auth/logout', {}, { withCredentials: true });
    
    // For now, client-side logout (clear tokens in hook)
    return Promise.resolve();
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh-token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.http.post<AuthTokens>(
      '/api/auth/refresh-token',
      { refreshToken },
      { withCredentials: true }
    );
  }

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  /**
   * Verify email with token
   * POST /api/auth/verify-email
   */
  async verifyEmail(token: string): Promise<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/verify-email', { token });
  }

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  async resendVerification(email: string): Promise<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/resend-verification', { email });
  }

  // ============================================================================
  // PASSWORD RESET
  // ============================================================================

  /**
   * Request password reset email
   * POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  async resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/reset-password', {
      token,
      newPassword,
    });
  }

  // ============================================================================
  // OAUTH (if needed later)
  // ============================================================================

  /**
   * Get Google OAuth URL
   * Note: Typically a redirect, not an API call
   */
  getGoogleOAuthUrl(callbackUrl: string): string {
    return `${this.http['baseUrl']}/api/auth/google?redirect=${encodeURIComponent(callbackUrl)}`;
  }

  /**
   * Get Microsoft OAuth URL
   */
  getMicrosoftOAuthUrl(callbackUrl: string): string {
    return `${this.http['baseUrl']}/api/auth/microsoft?redirect=${encodeURIComponent(callbackUrl)}`;
  }
}
