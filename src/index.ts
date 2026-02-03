// ============================================================================
// PUBLIC API EXPORTS
// ============================================================================

// Legacy exports (to be refactored in Step 2)
export * from './main/app';
export * from './components/ProfilePage';

// ============================================================================
// NEW: Step 1 - Foundation Layer
// ============================================================================

// Hooks (PRIMARY API)
export { createUseAuth } from './hooks/useAuth';
export type { UseAuthReturn, UseAuthConfig } from './hooks/useAuth';

// Providers
// Note: Will create new AuthProvider in Step 2 to replace legacy
// export { AuthProvider, useAuth } from './providers/AuthProvider';

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