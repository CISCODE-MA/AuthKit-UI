/**
 * Create authentication hook for managing auth state and actions
 *
 * This is the main entry point for using authentication in your app.
 * Create a configured hook once and use it throughout your application.
 *
 * @example
 * ```tsx
 * // hooks/useAuth.ts
 * import { createUseAuth } from '@ciscode/ui-authentication-kit';
 *
 * export const useAuth = createUseAuth({
 *   baseUrl: 'http://localhost:3000',
 *   autoRefresh: true,
 * });
 *
 * // components/LoginForm.tsx
 * import { useAuth } from '../hooks/useAuth';
 *
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth();
 *   // ... your UI logic
 * }
 * ```
 *
 * @see {@link examples/} for complete usage examples
 */
export { createUseAuth } from './hooks/useAuth';
export type { UseAuthConfig, UseAuthReturn } from './hooks/useAuth';
/**
 * Global authentication context provider
 * Wrap your app with this to enable auth functionality
 */
export { AuthProvider } from './providers/AuthProvider';
/**
 * Legacy context hook - will be deprecated in v3.0.0
 * @deprecated Use createUseAuth() instead
 */
export { useAuthState } from './context/AuthStateContext';
export type { LoginCredentials, RegisterData, AuthTokens, AuthResponse, RegisterResponse, AuthState, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest, ResendVerificationRequest, RefreshTokenRequest, JwtPayload, UserProfile, RoleWithPerms, ApiError, AuthErrorCode, AuthActions, } from './models/auth.types';
//# sourceMappingURL=index.d.ts.map