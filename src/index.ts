// ============================================================================
// PUBLIC API EXPORTS
// ============================================================================

// Providers (UPDATED: now uses new useAuth internally)
export { AuthProvider } from './providers/AuthProvider';
export { useAuthState } from './context/AuthStateContext';

// Legacy exports (maintained for compatibility)
export * from './main/app';
export * from './components/ProfilePage';

// ============================================================================
// NEW: Step 1 - Foundation Layer (Refactored in Step 2)
// ============================================================================

// Hooks (PRIMARY API)
export { createUseAuth } from './hooks/useAuth';
export type { UseAuthConfig } from './hooks/useAuth';

// Services (for advanced usage)
export { AuthService } from './services/auth.service';
export { HttpClient } from './services/http-client';

// Types
export type {
  // Auth types
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
  JwtPayload,
  AuthState,
  AuthActions,
  UseAuthReturn,
  
  // User types
  UserProfile,
  RoleWithPerms,
  
  // Error types
  ApiError,
  AuthErrorCode,
} from './models/auth.types';

// ============================================================================
// TODO: Step 2 - Component exports (after refactoring)
// ============================================================================
// export { SignInForm } from './components/auth/SignInForm';
// export { SignUpForm } from './components/auth/SignUpForm';
// export { RequireAuth } from './components/guards/RequireAuth';
// ...