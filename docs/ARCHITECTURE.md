# Architecture - Auth Kit UI

> **Hooks-first authentication library** for React applications.

---

## 🎯 Design Philosophy

**Auth Kit UI is a hooks-only library.** It provides authentication logic and state management, but **no UI components**.

### Why Hooks-Only?

- ✅ **UI agnostic** - Works with any design system (Tailwind, MUI, Ant Design, etc.)
- ✅ **Platform agnostic** - React web, React Native, Next.js, Remix
- ✅ **Smaller bundle** - No UI dependencies
- ✅ **Full control** - Apps build their own UI/UX
- ✅ **Easier testing** - Pure logic, no UI coupling

---

## 📁 Project Structure

```
src/
├── index.ts                           # PUBLIC API - exports only
│
├── hooks/                             # PRIMARY API
│   └── useAuth.ts                     # Main authentication hook
│
├── services/                          # INTERNAL - HTTP layer
│   ├── auth.service.ts                # Backend API calls
│   └── http-client.ts                 # HTTP wrapper with token injection
│
├── models/                            # TypeScript types
│   ├── auth.types.ts                  # Authentication interfaces
│   └── User.ts                        # User profile types
│
├── providers/                         # LEGACY (will be deprecated)
│   └── AuthProvider.tsx               # Context provider (v1 API)
│
├── context/                           # LEGACY (will be deprecated)
│   └── AuthStateContext.tsx           # Old context hook
│
├── utils/                             # INTERNAL utilities
│   └── jwtHelpers.ts                  # JWT decode helpers
│
└── test/                              # Test utilities
    ├── setup.ts                       # Vitest configuration
    └── mocks.ts                       # Mock data factories

test/                                  # Test suites (mirror structure)
├── hooks/
│   └── useAuth.test.ts                (19 tests)
├── services/
│   ├── auth.service.test.ts           (20 tests)
│   └── http-client.test.ts            (25 tests)
└── utils/
    └── jwtHelpers.test.ts             (4 tests)
```

---

## 🏗️ Layer Architecture

### Layer 1: Public API (`index.ts`)

**What it exports:**
```typescript
// Hooks (PRIMARY API)
export { createUseAuth } from './hooks/useAuth';
export type { UseAuthConfig, UseAuthReturn } from './hooks/useAuth';

// Types (for TypeScript)
export type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  UserProfile,
  // ... all public types
} from './models/auth.types';

// Legacy (will be deprecated in v3.0.0)
export { AuthProvider } from './providers/AuthProvider';
export { useAuthState } from './context/AuthStateContext';
```

**What it NEVER exports:**
- ❌ Services (`AuthService`, `HttpClient`) - Internal implementation
- ❌ Utils (`jwtHelpers`) - Internal helpers
- ❌ Components - Apps build their own

---

### Layer 2: Hooks (`hooks/`)

**Primary API for consumers.**

```typescript
// App creates hook with configuration
const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true,
});

// Component uses hook
function LoginForm() {
  const { login, user, isAuthenticated } = useAuth();
  // ... your UI logic
}
```

**Hook responsibilities:**
- ✅ State management (user, tokens, loading, errors)
- ✅ Token storage (localStorage)
- ✅ Auto-refresh logic
- ✅ Orchestration (call services, update state)
- ❌ NO UI rendering
- ❌ NO API calls (delegated to services)

---

### Layer 3: Services (`services/`)

**Internal layer - NOT exported.**

**AuthService:**
- Makes HTTP calls to backend
- Returns data (tokens, user profiles)
- Throws errors on failure

**HttpClient:**
- Wraps `fetch` API
- Injects JWT token automatically
- Handles common HTTP operations

**Why internal?**
- Consumers use hooks, not services directly
- Services can change without breaking public API
- Cleaner separation of concerns

---

### Layer 4: Models (`models/`)

**TypeScript interfaces and types.**

**Aligned with backend DTOs:**
- `LoginCredentials` ↔ Backend `LoginDto`
- `RegisterData` ↔ Backend `RegisterDto`
- `AuthTokens` ↔ Backend response
- `UserProfile` ↔ Backend `UserDto`

**Why alignment matters:**
- Type safety across frontend/backend boundary
- Easier refactoring
- Clear API contracts

---

## 🔄 Data Flow

### Login Flow

```
1. User submits form
   ↓
2. Component: login({ email, password })
   ↓
3. Hook: useAuth().login()
   ↓
4. Service: authService.login()
   ↓
5. HTTP: POST /auth/login
   ↓
6. Backend validates credentials
   ↓
7. Backend returns { accessToken, refreshToken }
   ↓
8. Service returns tokens
   ↓
9. Hook decodes JWT → user profile
   ↓
10. Hook stores tokens in localStorage
    ↓
11. Hook updates state: isAuthenticated = true
    ↓
12. Component re-renders with user data
```

### Auto-Refresh Flow

```
1. Hook checks token expiration every N seconds
   ↓
2. If token expires soon (e.g., 60s before expiry)
   ↓
3. Hook: refreshAccessToken(refreshToken)
   ↓
4. Service: authService.refreshToken()
   ↓
5. HTTP: POST /auth/refresh
   ↓
6. Backend validates refresh token
   ↓
7. Backend returns new { accessToken, refreshToken }
   ↓
8. Hook updates tokens silently
   ↓
9. User continues working (no interruption)
```

---

## 🧪 Testing Strategy

**Test Coverage:** 66 tests, 86% coverage

### Unit Tests
- ✅ All hooks (business logic)
- ✅ All services (API calls)
- ✅ All utilities (pure functions)

### Integration Tests
- ✅ Hook + Service interaction
- ✅ Complete auth flows (login → logout)

### What We DON'T Test
- ❌ UI components (apps build their own)
- ❌ Legacy code (will be removed)

**Test Pattern:**
```typescript
// test/hooks/useAuth.test.ts
describe('useAuth', () => {
  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login({ email: 'user@example.com', password: 'pass' });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

---

## 🔐 Security Considerations

### Token Storage

**Current:** `localStorage`
- ✅ Simple to implement
- ✅ Persists across page reloads
- ❌ Vulnerable to XSS attacks

**Production recommendation:** `httpOnly` cookies
- ✅ Protected from XSS
- ✅ Automatically sent with requests
- ❌ Requires backend CORS configuration

### Token Auto-Refresh

- ✅ Refresh before expiration (no session interruption)
- ✅ Configurable timing (`refreshBeforeSeconds`)
- ✅ Automatic cleanup on logout

---

## 📦 Build & Distribution

**Build Tool:** `tsup`

**Output:**
```
dist/
├── index.js         # ESM build
├── index.cjs        # CommonJS build
├── index.d.ts       # TypeScript declarations
└── index.d.ts.map   # Source maps for types
```

**Package Exports:**
```json
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

---

## 🚫 What This Library Is NOT

- ❌ **NOT a UI component library** - Apps build their own UI
- ❌ **NOT a complete auth solution** - Requires backend (`@ciscode/authentication-kit`)
- ❌ **NOT a state management library** - Just auth state
- ❌ **NOT platform-specific** - Works with any React setup

---

## 🔮 Future Roadmap

### v2.0.0 (Current)
- ✅ Hooks-first API
- ✅ Full TypeScript support
- ✅ Auto-refresh tokens
- ✅ RBAC helpers

### v3.0.0 (Future)
- 🔘 Remove legacy `AuthProvider` and context API
- 🔘 Add `httpOnly` cookie support
- 🔘 Add React Native support
- 🔘 Add session management helpers

---

## 📚 Related Documentation

- [Backend Integration Guide](BACKEND_INTEGRATION.md) - How to connect with Auth Kit backend
- [Examples](../examples/) - Copy-paste ready examples
- [README](../README.md) - Installation and quick start

---

**Last Updated:** February 4, 2026  
**Version:** 2.0.0 (hooks-only API)

- May import React.
- Avoid “magic” side effects: prefer explicit params.
- No direct network calls unless the library is explicitly meant to do so.

### `components`

- May import React.
- Keep UI behavior self-contained and testable.
- No styling dependencies.
  - Tailwind-compatible className patterns are allowed
  - Do not assume global CSS
  - Do not ship Tailwind as a dependency

---

## Exports convention

Default pattern:

- `src/components/Button/Button.tsx`
- `src/components/Button/index.ts` exports Button
- `src/components/index.ts` re-exports all components
- `src/index.ts` re-exports `components`, `hooks`, `utils`

---

## Testing

- Vitest only.
- Prefer unit tests for `utils`.
- For `components/hooks`, start with behavior tests and keep DOM coupling minimal.
