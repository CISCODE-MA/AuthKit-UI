# MODULE-UI-001: Align Auth Kit UI with Backend Architecture

## Priority: 🟡 HIGH

## Branch: `refactor/MODULE-UI-001-align-with-backend`

## Description
Restructure Auth Kit UI (frontend) to align with the CSR architecture implemented 
in Auth Kit (backend) on branch `refactor/MODULE-001-align-architecture-csr`.

The frontend needs to match the backend's level of quality, organization, and compliance:
- Structured component organization
- Proper export strategy (public API)
- Testing infrastructure
- Documentation standards
- TypeScript strict mode
- Consistent naming conventions

## Business Impact
- Seamless integration with backend Auth Kit
- Maintainable and reusable UI components
- Professional-grade module quality
- Production-ready authentication UI

---

## Implementation Plan

### Phase 1: Structure Alignment (2-3 days)

#### 1.1 Reorganize Component Structure
**Current**: Mixed structure in `src/components/`, `src/pages/`
**Target**: Feature-based organization

```
src/
├── index.ts                        # PUBLIC API exports
├── components/                     # Reusable UI Components
│   ├── auth/                       # Auth-specific components
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   ├── ProfileCard.tsx
│   │   └── SocialButton.tsx
│   ├── guards/                     # Route guards/protection
│   │   ├── RequireAuth.tsx
│   │   ├── RequirePermissions.tsx
│   │   └── RequireRole.tsx
│   ├── feedback/                   # User feedback
│   │   ├── InlineError.tsx
│   │   ├── SessionExpiredModal.tsx
│   │   └── LoadingSpinner.tsx
│   └── form/                       # Form elements
│       ├── InputField.tsx
│       └── FormButton.tsx
│
├── hooks/                          # React Hooks
│   ├── useAuth.ts
│   ├── usePermissions.ts
│   ├── useProfile.ts
│   └── useAbility.ts
│
├── services/                       # API Services
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── oauth.service.ts
│
├── models/                         # TypeScript Types/Interfaces
│   ├── auth.types.ts
│   ├── user.types.ts
│   └── api.types.ts
│
├── providers/                      # React Context Providers
│   ├── AuthProvider.tsx
│   └── PermissionsProvider.tsx
│
├── utils/                          # Utilities
│   ├── validation.utils.ts
│   ├── storage.utils.ts
│   └── http.utils.ts
│
└── pages/                          # Demo/Example Pages (optional)
    └── demo/
        ├── SignInDemo.tsx
        └── SignUpDemo.tsx
```

**Tasks**:
- [ ] Create new directory structure
- [ ] Move components to appropriate directories
- [ ] Rename components to match conventions
- [ ] Update imports across the codebase

#### 1.2 Define Public API Strategy
**Goal**: Only export what consumers need

**Export Strategy**:
```typescript
// src/index.ts - Public API

// Components (UI elements consumers use)
export { SignInForm } from './components/auth/SignInForm';
export { SignUpForm } from './components/auth/SignUpForm';
export { ProfileCard } from './components/auth/ProfileCard';
export { SocialButton } from './components/auth/SocialButton';

// Guards (route protection)
export { RequireAuth } from './components/guards/RequireAuth';
export { RequirePermissions } from './components/guards/RequirePermissions';
export { RequireRole } from './components/guards/RequireRole';

// Hooks (main API for apps)
export { useAuth } from './hooks/useAuth';
export { usePermissions } from './hooks/usePermissions';
export { useProfile } from './hooks/useProfile';

// Providers (context providers)
export { AuthProvider } from './providers/AuthProvider';
export { PermissionsProvider } from './providers/PermissionsProvider';

// Types (TypeScript interfaces)
export type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  AuthState,
} from './models/auth.types';

// ❌ DO NOT export:
// - Internal utilities
// - Services (consumers use hooks, not services directly)
// - Demo pages
```

**Tasks**:
- [ ] Review current exports in `src/index.ts`
- [ ] Define comprehensive export list
- [ ] Document export rationale
- [ ] Update `src/index.ts`

---

### Phase 2: Alignment with Backend API (1-2 days)

#### 2.1 Sync DTOs/Types with Backend
**Backend exports**:
- `LoginDto`, `RegisterDto`, `UserDto`
- `CreateRoleDto`, `UpdateRoleDto`
- Guards: `AuthenticateGuard`, `RolesGuard`, `AdminGuard`
- Decorators: `@CurrentUser()`, `@Roles()`, `@Admin()`

**Frontend needs**:
- Matching TypeScript interfaces for all DTOs
- API client methods aligned with backend endpoints
- Props interfaces that match backend contracts

**Tasks**:
- [ ] Create `models/auth.types.ts` with interfaces matching backend DTOs
- [ ] Create `models/role.types.ts` for role/permission types
- [ ] Create `models/api.types.ts` for API response wrappers
- [ ] Ensure strict type compatibility (no `any`)

#### 2.2 API Service Layer
**Goal**: Create services that call backend endpoints

```typescript
// services/auth.service.ts
export class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthTokens>;
  async register(data: RegisterData): Promise<User>;
  async logout(): Promise<void>;
  async refreshToken(token: string): Promise<AuthTokens>;
  async verifyEmail(token: string): Promise<void>;
  async resetPassword(email: string): Promise<void>;
}
```

**Tasks**:
- [ ] Create `services/auth.service.ts`
- [ ] Create `services/user.service.ts`
- [ ] Create `services/oauth.service.ts`
- [ ] Implement HTTP client with proper error handling
- [ ] Add request/response interceptors

---

### Phase 3: Testing Infrastructure (2-3 days)

#### 3.1 Setup Vitest Configuration
**Current**: Basic Vitest setup
**Target**: Comprehensive testing with coverage

**Tasks**:
- [ ] Configure Vitest for React components
- [ ] Setup React Testing Library
- [ ] Configure coverage thresholds (80%+)
- [ ] Create test utilities and mock factories
- [ ] Update `vitest.config.ts`

#### 3.2 Component Tests
**Priority Components**:
- `SignInForm`, `SignUpForm` (critical)
- `RequireAuth`, `RequirePermissions` (guards)
- `useAuth`, `usePermissions` (hooks)

**Tasks**:
- [ ] Write unit tests for all hooks
- [ ] Write component tests for forms
- [ ] Write integration tests for auth flows
- [ ] Achieve 80%+ coverage

**Test file structure**:
```
src/
└── components/
    └── auth/
        ├── SignInForm.tsx
        └── SignInForm.test.tsx  ← Same directory
```

---

### Phase 4: Documentation (1-2 days)

#### 4.1 JSDoc/TSDoc
**Goal**: Document all public APIs

```typescript
/**
 * Authentication hook providing login, logout, and user state
 * @returns Auth state and methods
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth();
 *   return <div>{user?.name}</div>;
 * }
 * ```
 */
export function useAuth(): AuthState {
  // ...
}
```

**Tasks**:
- [ ] Add JSDoc to all exported hooks
- [ ] Add JSDoc to all exported components
- [ ] Add prop descriptions to component interfaces
- [ ] Add usage examples

#### 4.2 README Update
**Required sections**:
- Installation
- Quick start
- API reference (components, hooks, types)
- Integration with backend Auth Kit
- Examples

**Tasks**:
- [ ] Write comprehensive README
- [ ] Add usage examples
- [ ] Document integration steps
- [ ] Add troubleshooting section

#### 4.3 Compliance Documents
**Create**:
- `docs/COMPLIANCE_SUMMARY.md` - Status report
- `docs/ARCHITECTURE.md` - Component structure explained

**Tasks**:
- [ ] Create compliance summary
- [ ] Document architecture decisions
- [ ] Create migration guide (if needed)

---

### Phase 5: Code Quality (1 day)

#### 5.1 TypeScript Strict Mode
**Tasks**:
- [ ] Enable `strict: true` in `tsconfig.json`
- [ ] Fix all type errors
- [ ] Remove all `any` types
- [ ] Add proper return types

#### 5.2 Linting & Formatting
**Tasks**:
- [ ] Ensure ESLint passes (`--max-warnings=0`)
- [ ] Run Prettier formatting
- [ ] Fix all linting issues
- [ ] Enforce naming conventions

#### 5.3 Code Review
**Tasks**:
- [ ] Review all exports in `index.ts`
- [ ] Verify no internal details exported
- [ ] Check for hardcoded values
- [ ] Verify error handling

---

### Phase 6: Integration Testing (1 day)

#### 6.1 Test with Backend
**Goal**: Verify frontend works with refactored backend

**Tasks**:
- [ ] Link Auth Kit UI with Auth Kit (npm link)
- [ ] Create test app in `examples/` folder
- [ ] Test full auth flow (register → login → logout)
- [ ] Test OAuth flows
- [ ] Test role/permission guards
- [ ] Verify API compatibility

**Commands**:
```bash
# In auth-kit-ui
npm link

# In test app
npm link @ciscode/auth-kit-ui
npm link @ciscode/authentication-kit
```

---

## Success Criteria

- [ ] ✅ Structure matches backend quality level
- [ ] ✅ Clear public API (exports only necessary items)
- [ ] ✅ Test coverage >= 80%
- [ ] ✅ All public APIs documented (JSDoc)
- [ ] ✅ TypeScript strict mode passing
- [ ] ✅ ESLint passing with no warnings
- [ ] ✅ README comprehensive with examples
- [ ] ✅ Types align with backend DTOs
- [ ] ✅ Works seamlessly with backend Auth Kit
- [ ] ✅ Compliance document created
- [ ] ✅ No hardcoded values
- [ ] ✅ Proper error handling

---

## Files Created/Modified

### Created:
- `docs/COMPLIANCE_SUMMARY.md`
- `docs/ARCHITECTURE.md`
- `src/services/auth.service.ts`
- `src/services/user.service.ts`
- `src/models/auth.types.ts`
- `src/models/role.types.ts`
- `src/utils/validation.utils.ts`
- Test files: `*.test.tsx`, `*.test.ts`

### Modified:
- `src/index.ts` (public API)
- `README.md` (comprehensive docs)
- `tsconfig.json` (strict mode)
- `vitest.config.ts` (coverage)
- `package.json` (scripts, deps)
- All component files (reorganization)

### Moved:
- Components reorganized into feature directories
- Pages moved to `pages/demo/` (examples)

---

## Estimated Time: 1-1.5 weeks

## Dependencies
- Backend Auth Kit on `refactor/MODULE-001-align-architecture-csr`
- Backend needs to be functional (tests not required for frontend work)

---

## Breaking Changes

### Exports
**Before**:
```typescript
export * from './main/app';
export * from './components/ProfilePage';
```

**After**:
```typescript
// Explicit, documented exports
export { SignInForm } from './components/auth/SignInForm';
export { useAuth } from './hooks/useAuth';
// ... (comprehensive list)
```

**Migration**: Consumers need to update imports to use specific named exports.

---

## Notes

- Follow React best practices (functional components, hooks)
- Use TypeScript strictly (no `any`)
- Keep components small and focused
- Prefer composition over props drilling
- Use React Context for global state (auth, permissions)
- Memoize expensive computations
- Follow accessibility guidelines (ARIA labels)

---

## Related Tasks

- **Backend**: `MODULE-001-align-architecture-csr` (Auth Kit)
- **Testing**: Will create `MODULE-UI-TEST-001` after structure is complete

---

## Review Checklist

Before marking complete:
- [ ] Code reviewed by team
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Integration tested with backend
- [ ] No console errors/warnings
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] CHANGELOG updated
- [ ] Ready for merge to develop

---

*Created*: February 3, 2026  
*Status*: 🟡 In Progress  
*Assignee*: AI Assistant + Team
