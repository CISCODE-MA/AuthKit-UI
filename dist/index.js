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
// Services (for advanced usage)
export { AuthService } from './services/auth.service';
export { HttpClient } from './services/http-client';
// ============================================================================
// TODO: Step 2 - Component exports (after refactoring)
// ============================================================================
// export { SignInForm } from './components/auth/SignInForm';
// export { SignUpForm } from './components/auth/SignUpForm';
// export { RequireAuth } from './components/guards/RequireAuth';
// ...
//# sourceMappingURL=index.js.map