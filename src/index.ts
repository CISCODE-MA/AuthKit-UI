// ============================================================================
// @ciscode/ui-authentication-kit - PUBLIC API
// ============================================================================
// This is a HOOKS-ONLY library. Apps use hooks for logic and build their own UI.
// For example components, see: examples/ directory
//
// Quick Start:
// 1. Create hook: const useAuth = createUseAuth({ baseUrl: '...' })
// 2. Use in components: const { login, user, isAuthenticated } = useAuth()
// 3. Build your own UI components with your design system
// ============================================================================

// ============================================================================
// PRIMARY API: Hooks
// ============================================================================

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

// ============================================================================
// PROVIDERS: Context Providers
// ============================================================================

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

// ============================================================================
// TYPES: TypeScript Interfaces
// ============================================================================

export type {
  // Authentication
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthResponse,
  RegisterResponse,
  AuthState,
  
  // Password Management
  ForgotPasswordRequest,
  ResetPasswordRequest,
  
  // Email Verification
  VerifyEmailRequest,
  ResendVerificationRequest,
  
  // Token Management
  RefreshTokenRequest,
  JwtPayload,
  
  // User & Permissions
  UserProfile,
  RoleWithPerms,
  
  // Error Handling
  ApiError,
  AuthErrorCode,
  
  // Hook Return Types
  AuthActions,
} from './models/auth.types';

// ============================================================================
// INTERNAL - NOT EXPORTED
// ============================================================================
// The following are internal implementation details and NOT part of public API:
// - AuthService (use hooks instead)
// - HttpClient (use hooks instead)
// - Utils (internal helpers)
// - Components (apps build their own, see examples/)
// ============================================================================