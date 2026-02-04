# Copilot Instructions - Auth Kit UI

> **Purpose**: Development guidelines for Auth Kit UI - A React authentication hooks library for @ciscode/authentication-kit integration.

---

## 📊 Current Status (Feb 4, 2026)

**Production Status**: 🟡 In Development  
**Version**: 1.0.4 → Target 2.0.0  
**Test Coverage**: 0% → Target 80%+  
**Integration**: ✅ Works with @ciscode/authentication-kit v1.5.0

---

## 🎯 Module Overview

**Package**: `@ciscode/ui-authentication-kit`  
**Type**: React TypeScript Hooks Library  
**Purpose**: Authentication hooks and utilities for React apps using Auth Kit backend

### Design Philosophy:
- **Hooks-first API**: Apps use hooks, not components
- **UI agnostic**: Works with any design system
- **Type-safe**: Full TypeScript support
- **Platform agnostic**: React web, React Native, Next.js, Remix
- **Zero UI dependencies**: Apps control their own UI

### Responsibilities:
- JWT token management (access, refresh, auto-refresh)
- Authentication state management (login, logout, register)
- User profile management
- OAuth integration (Google, Microsoft, Facebook)
- Role-based access control (RBAC) helpers
- HTTP client with auth interceptors

---

## 🏗️ Module Architecture

**Pattern**: Service-Hook-Provider (React adaptation of backend's CSR)

```
Service → Hook → Provider → App Component
```

```
src/
  ├── index.ts                    # PUBLIC API exports
  │
  ├── hooks/                      # React Hooks (PRIMARY API)
  │   ├── useAuth.ts              # Main authentication hook
  │   ├── useProfile.ts           # User profile management
  │   └── useAbility.ts           # Permissions/RBAC
  │
  ├── providers/                  # React Context Providers
  │   └── AuthProvider.tsx        # Global auth state
  │
  ├── services/                   # API Services (INTERNAL)
  │   ├── auth.service.ts         # Backend API calls
  │   └── http-client.ts          # HTTP wrapper
  │
  ├── models/                     # TypeScript Types
  │   ├── auth.types.ts           # Auth interfaces
  │   └── user.types.ts           # User interfaces
  │
  ├── utils/                      # Utilities (INTERNAL)
  │   ├── jwt.utils.ts            # JWT decode/validation
  │   └── storage.utils.ts        # LocalStorage wrapper
  │
  ├── components/                 # Internal Components
  │   ├── SessionExpiredModal.tsx # Used by AuthProvider
  │   └── InlineError.tsx         # Internal utility
  │
  └── test/                       # Test Utilities
      ├── setup.ts                # Vitest setup
      └── mocks.ts                # Mock factories
```

**Responsibility Layers:**

| Layer          | Responsibility                              | Examples                          |
|----------------|---------------------------------------------|-----------------------------------|
| **Hooks**      | State management, orchestration            | `useAuth()`, `useProfile()`       |
| **Services**   | HTTP calls to backend                      | `AuthService.login()`             |
| **Providers**  | Global state, React Context                | `<AuthProvider>`                  |
| **Models**     | TypeScript interfaces, types               | `LoginCredentials`, `UserProfile` |
| **Utils**      | Pure functions, helpers                    | `decodeJwt()`, `isTokenExpired()` |

**Module Exports (Public API):**
```typescript
// src/index.ts - Only export what apps need to consume
export { createUseAuth } from './hooks/useAuth';
export { AuthProvider } from './providers/AuthProvider';

// Types (public contracts)
export type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  UserProfile,
  UseAuthConfig,
  UseAuthReturn,
} from './models/auth.types';

// ❌ NEVER export services or utils
// export { AuthService } from './services/auth.service'; // FORBIDDEN
// export { httpClient } from './services/http-client'; // FORBIDDEN
```

**Rationale:**
- **Services** = internal implementation (can change)
- **Utils** = internal helpers (can change)
- **Hooks** = public API (stable contract)
- **Types** = public contracts (apps depend on these)

---

## 📝 Naming Conventions

### Files

**Pattern**: `kebab-case` + suffix

| Type       | Example                        | Directory       |
|------------|--------------------------------|-----------------|
| Hook       | `use-auth.ts`                  | `hooks/`        |
| Service    | `auth.service.ts`              | `services/`     |
| Provider   | `AuthProvider.tsx`             | `providers/`    |
| Types      | `auth.types.ts`                | `models/`       |
| Util       | `jwt.utils.ts`                 | `utils/`        |
| Test       | `use-auth.test.ts`             | `test/hooks/`   |
| Component  | `SessionExpiredModal.tsx`      | `components/`   |

**Test Structure**: Mirror structure in `test/` directory:
```
test/
├── hooks/
│   └── useAuth.test.ts
├── services/
│   ├── auth.service.test.ts
│   └── http-client.test.ts
└── utils/
    └── jwtHelpers.test.ts
```

### Code Naming

- **Components**: `PascalCase` → `AuthProvider`, `SessionExpiredModal`
- **Hooks**: `camelCase` with `use` prefix → `useAuth`, `useProfile`
- **Functions**: `camelCase` → `decodeJwt`, `isTokenExpired`
- **Interfaces**: `PascalCase` → `LoginCredentials`, `UseAuthReturn`
- **Types**: `PascalCase` → `AuthState`, `ApiError`
- **Constants**: `UPPER_SNAKE_CASE` → `ACCESS_TOKEN_KEY`, `DEFAULT_REFRESH_INTERVAL`

### Path Aliases

**NOT using path aliases** - Keep imports relative for library simplicity:
```typescript
// ✅ CORRECT - Relative imports
import { AuthService } from '../services/auth.service';
import type { LoginCredentials } from '../models/auth.types';

// ❌ WRONG - No path aliases in libraries
import { AuthService } from '@services/auth.service';
```

---

## 🧪 Testing - RIGOROUS for Hooks Library

### Coverage Target: 80%+

**Priority Testing Order:**
1. ✅ All hooks (business logic) - CRITICAL
2. ✅ All services (API calls) - CRITICAL
3. ✅ All utilities (pure functions) - HIGH
4. ✅ Providers (context) - MEDIUM
5. 🔘 Internal components - LOW (used by provider only)

**Test Structure:**
```
src/
  └── hooks/
      ├── use-auth.ts
      └── use-auth.test.ts  ← Same directory
```

**Vitest Configuration:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/examples/**',
        'src/main/**', // legacy
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```

**Hook Testing Pattern:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createUseAuth } from './use-auth';

describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

---

## 📚 Documentation - Complete

### JSDoc/TSDoc - ALWAYS for:

```typescript
/**
 * Create authentication hook for managing user state and auth actions
 * 
 * @param config - Configuration options
 * @returns Authentication hook
 * 
 * @example
 * ```tsx
 * const useAuth = createUseAuth({
 *   baseUrl: 'http://localhost:3000',
 *   autoRefresh: true,
 * });
 * 
 * function LoginForm() {
 *   const { login, user, isAuthenticated } = useAuth();
 *   
 *   const handleSubmit = async (e) => {
 *     await login({ email: 'user@example.com', password: 'password' });
 *   };
 *   
 *   return <div>{user?.email}</div>;
 * }
 * ```
 */
export function createUseAuth(config: UseAuthConfig): () => UseAuthReturn
```

**Required for:**
- All exported hooks
- All exported types/interfaces
- All public function signatures
- Configuration options

### README Structure:
- Installation
- Quick start (code example)
- API reference
- Backend integration guide
- Examples (link to examples/)
- Troubleshooting

---

## 🚀 Module Development Principles

### 1. Hooks-First API

**Export ONLY hooks, providers, and types:**
```typescript
// src/index.ts - Public API
export { createUseAuth } from './hooks/use-auth';
export { AuthProvider } from './providers/AuthProvider';
export type { LoginCredentials, RegisterData } from './models/auth.types';
```

**❌ NEVER export:**
```typescript
// ❌ Services - internal implementation
export { AuthService } from './services/auth.service'; // FORBIDDEN

// ❌ Utils - internal helpers
export { decodeJwt } from './utils/jwt.utils'; // FORBIDDEN

// ❌ Components - apps build their own UI
export { LoginForm } from './components/auth/LoginForm'; // FORBIDDEN
```

**Rationale:**
- Apps use **hooks** for logic
- Apps build **their own UI** with their design system
- Services/utils = internal, can change without breaking consumers

### 2. Type Alignment with Backend

**Backend DTOs → Frontend Types:**
```typescript
// Backend: LoginDto
// Frontend: LoginCredentials (matches exactly)

export interface LoginCredentials {
  email: string;      // matches LoginDto.email
  password: string;   // matches LoginDto.password
}

// Backend: UserDto
// Frontend: UserProfile (matches exactly)

export interface UserProfile {
  id: string;         // matches UserDto.id
  email: string;      // matches UserDto.email
  roles: string[];    // matches UserDto.roles
}
```

**Keep types in sync** with backend Auth Kit v1.5.0+

### 3. Zero UI Dependencies
- No CSS files
- No Tailwind as dependency
- No MUI, Ant Design, etc.
- Apps bring their own styling

**Instead**: Provide copy-paste examples in `examples/`

### 4. Auto-Refresh Pattern

**Implement token auto-refresh:**
```typescript
// Before token expires, refresh automatically
const refreshBeforeSeconds = 60; // Refresh 60s before expiry
const expiresAt = decodeJwt(accessToken).exp;
const refreshAt = expiresAt - refreshBeforeSeconds;

// Setup timer
setTimeout(() => refreshToken(), refreshAt * 1000);
```

---

## 🔄 Workflow & Task Management

### Task-Driven Development

**1. Branch Creation:**
```bash
feature/UI-001-add-feature
bugfix/UI-002-fix-issue
refactor/UI-003-improve-code
```

**2. Task Documentation:**
Create task file at branch start:
```
docs/tasks/active/UI-001-add-feature.md
```

**3. On Release:**
Move to archive:
```
docs/tasks/archive/by-release/v2.0.0/UI-001-add-feature.md
```

### Development Workflow

**Simple changes**:
- Read context → Implement → Update docs → **Create changeset**

**Complex changes**:
- Read context → Discuss approach → Implement → Update docs → **Create changeset**

**When blocked**:
- **DO**: Ask immediately
- **DON'T**: Generate incorrect output

---

## 📦 Versioning & Breaking Changes

### Semantic Versioning (Strict)

**MAJOR** (x.0.0) - Breaking changes:
- Changed hook signatures
- Removed exported hooks/types
- Changed configuration API
- Changed AuthProvider props

**MINOR** (0.x.0) - New features:
- New hooks
- New optional config parameters
- New exported types

**PATCH** (0.0.x) - Bug fixes:
- Internal fixes
- Performance improvements
- Documentation updates

### Changesets Workflow

**ALWAYS create a changeset file directly for user-facing changes:**

**Steps:**
1. Create file in `.changeset/` with descriptive-kebab-case name
2. Use this template:

```markdown
---
"@ciscode/ui-authentication-kit": <severity>
---

<description>
```

**Severity levels:**
- `major` - Breaking changes (API changes, removed exports)
- `minor` - New features (new hooks, new parameters)
- `patch` - Bug fixes, documentation

**Example changeset:**
```markdown
---
"@ciscode/ui-authentication-kit": major
---

### Breaking Changes
- Removed UI component exports (LoginForm, RegisterForm)
- Changed createUseAuth() API signature

### Migration Guide
```tsx
// Before (v1.x)
const { user } = useAuthState();

// After (v2.0)
const useAuth = createUseAuth({ baseUrl: 'http://localhost:3000' });
const { user } = useAuth();
```

### New Features
- Auto-refresh token support
- RBAC helpers (hasRole, hasPermission)
```

**When to create a changeset:**
- ✅ New features (new hooks)
- ✅ Bug fixes (user-visible)
- ✅ Breaking changes
- ✅ API changes
- ❌ Internal refactoring (no user impact)
- ❌ Test improvements only
- ❌ Documentation only

**Do NOT use interactive `npx changeset`** - Create file directly for automation.

---

## 🔐 Security Best Practices

**ALWAYS:**
- ✅ Tokens in memory or httpOnly cookies (never localStorage for production)
- ✅ Auto-refresh before expiry
- ✅ Clear tokens on logout
- ✅ Validate JWT structure (but backend validates signature)
- ✅ HTTPS in production
- ✅ No tokens in console.log

**Example:**
```typescript
// ✅ CORRECT - Secure storage
const [accessToken, setAccessToken] = useState<string | null>(null); // Memory
// OR
document.cookie = `token=${token}; httpOnly; secure; sameSite=strict`;

// ❌ WRONG - Insecure
localStorage.setItem('token', token); // XSS vulnerable
```

---

## 🚫 Restrictions - Require Approval

**NEVER without approval:**
- Breaking changes to hook API
- Changing exported types/interfaces
- Removing exported hooks
- Major dependency upgrades
- Security-related changes

**CAN do autonomously:**
- Bug fixes (no breaking changes)
- Internal refactoring
- Adding new hooks (non-breaking)
- Test improvements
- Documentation updates

---

## ✅ Release Checklist

Before publishing:
- [ ] All tests passing (100% of test suite)
- [ ] Coverage >= 80%
- [ ] No ESLint warnings (`--max-warnings=0`)
- [ ] TypeScript strict mode passing
- [ ] All exported hooks documented (JSDoc)
- [ ] README updated with examples
- [ ] Changeset created
- [ ] Breaking changes highlighted
- [ ] Integration tested with sample app
- [ ] Backend compatibility verified (Auth Kit v1.5.0+)

---

## 🔄 Development Workflow

### Working on Module:
1. Clone module repo
2. Create branch: `feature/UI-123-description` from `develop`
3. Implement with tests
4. **Create changeset**: Create file in `.changeset/` directory
5. Verify checklist
6. Create PR → `develop`

### Testing in App:
```bash
# In module
npm link

# In app
cd ~/comptaleyes/frontend
npm link @ciscode/ui-authentication-kit

# Develop and test
# Unlink when done
npm unlink @ciscode/ui-authentication-kit
```

---

## 🎨 Code Style

- ESLint `--max-warnings=0`
- Prettier formatting
- TypeScript strict mode
- Functional React (hooks, no classes)
- Pure functions for utils
- Immutability (spread operators, no mutations)

**Example:**
```typescript
// ✅ CORRECT - Functional, immutable
function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    const tokens = await authService.login(credentials);
    setUser(decodeJwt(tokens.accessToken));
  }, []);
  
  return { user, login };
}

// ❌ WRONG - Mutable state
let currentUser = null;
function setCurrentUser(user) {
  currentUser = user; // Mutation
}
```

---

## 🐛 Error Handling

**Structured errors:**
```typescript
export interface ApiError {
  code: string;           // 'AUTH_001'
  message: string;        // 'Invalid credentials'
  statusCode: number;     // 401
  details?: any;
}

throw new ApiError('AUTH_001', 'Invalid credentials', 401);
```

**Hook error pattern:**
```typescript
function useAuth() {
  const [error, setError] = useState<ApiError | null>(null);
  
  const login = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      await authService.login(credentials);
    } catch (err) {
      setError(err as ApiError);
      throw err; // Re-throw for component handling
    }
  };
  
  return { login, error };
}
```

---

## 💬 Communication Style

- Brief and direct
- Focus on results
- Hooks/React-specific context
- Highlight breaking changes immediately

---

## 📋 Summary

**Module Principles:**
1. Hooks-first API (no UI components exported)
2. Comprehensive testing (80%+)
3. Complete documentation
4. Type alignment with backend
5. Zero UI dependencies
6. Platform agnostic
7. Security-first

**When in doubt:** Ask, don't assume. This library is used across multiple apps.

---

*Last Updated: February 4, 2026*  
*Version: 1.0.0*
