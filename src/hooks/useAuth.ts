/**
 * useAuth Hook
 * Primary authentication hook for managing auth state and actions
 * 
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *   
 *   const handleLogin = async () => {
 *     await login({ email: 'user@example.com', password: 'password' });
 *   };
 *   
 *   return <div>{user?.email}</div>;
 * }
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthService } from '../services/auth.service';
import type {
  LoginCredentials,
  RegisterData,
  AuthState,
  UseAuthReturn,
  UserProfile,
  JwtPayload,
} from '../models/auth.types';

/**
 * Storage keys for tokens
 */
const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

/**
 * Decode JWT token (simple, no validation - backend validates)
 */
function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.exp) return true;
  return Date.now() >= decoded.exp * 1000;
}

/**
 * Convert JWT payload to UserProfile
 * Note: Backend JWT only contains sub, roles, permissions
 * Email and other details must be fetched separately
 */
function jwtToUserProfile(payload: JwtPayload): UserProfile {
  return {
    id: payload.sub,
    email: payload.email || '', // JWT may not contain email, will fetch from /me
    name: null,
    roles: payload.roles || [],
    permissions: payload.permissions || [],
    modules: [],
    tenantId: payload.tenantId || '',
  };
}

/**
 * Authentication hook configuration
 */
export interface UseAuthConfig {
  /** Backend API base URL */
  baseUrl: string;
  
  /** Auto-refresh token before expiration */
  autoRefresh?: boolean;
  
  /** Refresh token X seconds before expiration */
  refreshBeforeSeconds?: number;
}

/**
 * Create useAuth hook with configuration
 */
export function createUseAuth(config: UseAuthConfig) {
  const authService = new AuthService(config.baseUrl);
  
  return function useAuth(): UseAuthReturn {
    const [state, setState] = useState<AuthState>({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    });

    // Set token getter for API calls
    useEffect(() => {
      authService.setTokenGetter(() => state.accessToken);
    }, [state.accessToken]);

    /**
     * Load auth state from storage on mount
     */
    useEffect(() => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userJson = localStorage.getItem(USER_KEY);

      if (accessToken && !isTokenExpired(accessToken)) {
        const user: UserProfile = userJson ? JSON.parse(userJson) : jwtToUserProfile(decodeJwt(accessToken)!);
        
        setState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else if (refreshToken && !isTokenExpired(refreshToken)) {
        // Try to refresh
        refreshAccessToken(refreshToken);
      } else {
        // No valid tokens
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }, []);

    /**
     * Auto-refresh token before expiration
     */
    useEffect(() => {
      if (!config.autoRefresh || !state.accessToken || !state.refreshToken) return;

      const decoded = decodeJwt(state.accessToken);
      if (!decoded || !decoded.exp) return;

      const expiresIn = decoded.exp * 1000 - Date.now();
      const refreshBefore = (config.refreshBeforeSeconds || 60) * 1000;
      const refreshAt = expiresIn - refreshBefore;

      if (refreshAt <= 0) {
        // Already expired or about to expire
        refreshAccessToken(state.refreshToken);
        return;
      }

      const timeoutId = setTimeout(() => {
        refreshAccessToken(state.refreshToken!);
      }, refreshAt);

      return () => clearTimeout(timeoutId);
    }, [state.accessToken, state.refreshToken, config.autoRefresh]);

    /**
     * Refresh access token
     */
    const refreshAccessToken = useCallback(async (refreshToken: string) => {
      try {
        const tokens = await authService.refreshToken(refreshToken);
        const decoded = decodeJwt(tokens.accessToken);
        const user = decoded ? jwtToUserProfile(decoded) : state.user;

        // Update storage
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        if (user) {
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        }

        setState({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error: any) {
        // Refresh failed, logout
        clearAuth();
        setState((prev) => ({
          ...prev,
          error: 'Session expired. Please login again.',
          isLoading: false,
        }));
      }
    }, []);

    /**
     * Clear auth state and storage
     */
    const clearAuth = useCallback(() => {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, []);

    /**
     * Login action
     * After getting tokens, fetch full user profile from /me endpoint
     */
    const login = useCallback(async (credentials: LoginCredentials) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Step 1: Get tokens
        const tokens = await authService.login(credentials);
        const decoded = decodeJwt(tokens.accessToken);
        
        if (!decoded) {
          throw new Error('Invalid token received');
        }

        // Store tokens first
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

        // Step 2: Fetch full user profile from /me
        try {
          authService.setTokenGetter(() => tokens.accessToken);
          const response: any = await authService.getProfile();
          
          // Backend returns {ok: true, data: {...}}
          const fullProfile = response.data || response;
          
          // Map backend user to frontend UserProfile
          const user: UserProfile = {
            id: fullProfile._id || fullProfile.id,
            email: fullProfile.email,
            name: fullProfile.fullname 
              ? `${fullProfile.fullname.fname} ${fullProfile.fullname.lname}`
              : null,
            roles: fullProfile.roles || [],
            permissions: decoded.permissions || [],
            modules: [],
            tenantId: '',
          };
          
          // Store full profile
          localStorage.setItem(USER_KEY, JSON.stringify(user));

          setState({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (profileError) {
          // Fallback to JWT data if /me fails
          console.warn('Failed to fetch profile, using JWT data:', profileError);
          const user = jwtToUserProfile(decoded);
          localStorage.setItem(USER_KEY, JSON.stringify(user));

          setState({
            user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Login failed',
          isLoading: false,
        }));
        throw error;
      }
    }, []);

    /**
     * Register action
     */
    const register = useCallback(async (data: RegisterData) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await authService.register(data);
        
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
        
        // Note: After registration, user typically needs to verify email
        // Then login manually
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Registration failed',
          isLoading: false,
        }));
        throw error;
      }
    }, []);

    /**
     * Logout action
     */
    const logout = useCallback(async () => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        await authService.logout();
      } catch (error) {
        // Even if backend logout fails, clear local state
        console.error('Logout error:', error);
      } finally {
        clearAuth();
      }
    }, [clearAuth]);

    /**
     * Verify email action
     */
    const verifyEmail = useCallback(async (token: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await authService.verifyEmail(token);
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Email verification failed',
          isLoading: false,
        }));
        throw error;
      }
    }, []);

    /**
     * Resend verification email action
     */
    const resendVerification = useCallback(async (email: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await authService.resendVerification(email);
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Failed to resend verification',
          isLoading: false,
        }));
        throw error;
      }
    }, []);

    /**
     * Forgot password action
     */
    const forgotPassword = useCallback(async (email: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await authService.forgotPassword(email);
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Password reset request failed',
          isLoading: false,
        }));
        throw error;
      }
    }, []);

    /**
     * Reset password action
     */
    const resetPassword = useCallback(async (token: string, newPassword: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await authService.resetPassword(token, newPassword);
        setState((prev) => ({ ...prev, isLoading: false }));
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          error: error.message || 'Password reset failed',
          isLoading: false,
        }));
        throw error;
      }
    }, []);

    /**
     * Clear error action
     */
    const clearError = useCallback(() => {
      setState((prev) => ({ ...prev, error: null }));
    }, []);

    return useMemo(
      () => ({
        ...state,
        login,
        register,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        clearError,
      }),
      [
        state,
        login,
        register,
        logout,
        refreshAccessToken,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        clearError,
      ]
    );
  };
}

/**
 * Default useAuth hook (requires configuration via AuthProvider)
 * For standalone usage, use createUseAuth() directly
 */
export const useAuth = (() => {
  throw new Error(
    'useAuth must be created with createUseAuth({ baseUrl }) or used within AuthProvider'
  );
}) as unknown as () => UseAuthReturn;
