# Auth Kit UI

> **React authentication hooks library** for `@ciscode/authentication-kit` backend integration.

[![npm version](https://img.shields.io/npm/v/@ciscode/ui-authentication-kit.svg)](https://www.npmjs.com/package/@ciscode/ui-authentication-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-66%20passing-success.svg)](test/)

**Hooks-first authentication library for React.** Build your own UI with your design system.

---

## ✨ Features

- 🎣 **Hooks-first API** - Use `useAuth()` hook, not components
- 🎨 **UI agnostic** - Works with any design system (Tailwind, MUI, Ant Design, etc.)
- 🔐 **JWT token management** - Automatic token injection and refresh
- 🔄 **Auto-refresh** - Tokens refreshed before expiration
- 📱 **Platform agnostic** - React web, React Native, Next.js, Remix
- 🔒 **Type-safe** - Full TypeScript support
- 🧪 **Well-tested** - 66 tests, 86% coverage
- 📚 **OAuth support** - Google, Microsoft, Facebook (via backend)
- 👥 **RBAC helpers** - `hasRole()`, `hasPermission()`

---

## 📦 Installation

```bash
npm install @ciscode/ui-authentication-kit
```

**Requirements:**
- React 18+
- TypeScript 5+
- Backend: `@ciscode/authentication-kit` v1.5.0+

---

## 🚀 Quick Start

### 1. Create the hook

```typescript
// src/hooks/useAuth.ts
import { createUseAuth } from '@ciscode/ui-authentication-kit';

export const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 60,
});
```

### 2. Use in components

```tsx
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      // Redirect to dashboard
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={credentials.email}
        onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={credentials.password}
        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### 3. Protected routes

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
}
```

### 4. Display user info

```tsx
// src/components/UserProfile.tsx
import { useAuth } from '../hooks/useAuth';

export function UserProfile() {
  const { user, logout, hasRole } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.email}!</p>
      <p>Roles: {user?.roles.join(', ')}</p>
      
      {hasRole('admin') && <button>Admin Panel</button>}
      
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## 📖 API Reference

### `createUseAuth(config)`

Creates a pre-configured authentication hook.

**Parameters:**
```typescript
interface UseAuthConfig {
  baseUrl: string;              // Backend API URL
  autoRefresh?: boolean;        // Auto-refresh before expiration (default: false)
  refreshBeforeSeconds?: number; // Refresh N seconds before expiry (default: 60)
}
```

**Returns:** `() => UseAuthReturn`

**Example:**
```typescript
const useAuth = createUseAuth({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 300, // Refresh 5 minutes before expiration
});
```

---

### `useAuth()` Hook

Returns authentication state and actions.

**State:**
```typescript
interface AuthState {
  user: UserProfile | null;      // Current user
  accessToken: string | null;    // JWT access token
  refreshToken: string | null;   // JWT refresh token
  isAuthenticated: boolean;      // Whether user is logged in
  isLoading: boolean;            // Whether auth state is loading
  error: string | null;          // Error message if any
}
```

**Actions:**
```typescript
interface AuthActions {
  login(credentials: LoginCredentials): Promise<void>;
  register(data: RegisterData): Promise<void>;
  logout(): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendVerification(email: string): Promise<void>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  clearError(): void;
  hasRole(role: string): boolean;
  hasPermission(permission: string): boolean;
}
```

---

## 📚 Examples

Complete UI examples with different design systems:

- [Tailwind CSS Example](examples/TailwindLoginForm.tsx)
- [Material-UI Example](examples/MuiLoginForm.tsx)
- [Plain CSS Example](examples/PlainLoginForm.tsx)
- [Protected Routes](examples/ProtectedRoute.tsx)
- [Role-Based Access](examples/RoleBasedRoute.tsx)

---

## 🔗 Backend Integration

**Required:** Backend must use `@ciscode/authentication-kit` v1.5.0+

See [Backend Integration Guide](docs/BACKEND_INTEGRATION.md) for:
- Backend setup instructions
- CORS configuration
- API endpoint mapping
- Type alignment (frontend ↔ backend)
- Error handling patterns
- Complete working examples
- Troubleshooting

---

## 🏗️ Architecture

**Design Philosophy:** Hooks-only library. Apps use hooks for logic and build their own UI.

```
Frontend App
    │
    ├─ useAuth()                    ← You use this
    │   ├─ State: user, isAuthenticated, isLoading, error
    │   └─ Actions: login, register, logout, verifyEmail, etc.
    │
    └─ Your Components              ← You build these
        ├─ LoginForm.tsx            (with your design system)
        ├─ RegisterForm.tsx
        └─ UserProfile.tsx
```

**Why hooks-only?**
- ✅ Works with any design system (Tailwind, MUI, Ant Design, etc.)
- ✅ Full control over UI/UX
- ✅ Platform agnostic (React web, React Native, Next.js, etc.)
- ✅ Smaller bundle size (no UI dependencies)
- ✅ Easier to test and maintain

---

## 🧪 Testing

**Test Coverage:** 66 tests, 86% coverage

```bash
npm test              # Run tests
npm run test:coverage # Run with coverage report
```

**Test Structure:**
```
test/
├── hooks/
│   └── useAuth.test.ts       (19 tests)
├── services/
│   ├── auth.service.test.ts  (20 tests)
│   └── http-client.test.ts   (25 tests)
└── utils/
    └── jwtHelpers.test.ts    (4 tests)
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Type check
npm run typecheck

# Build
npm run build

# Lint
npm run lint

# Format
npm run format:write
```

---

## 📦 Build Output

Package exports ESM, CJS, and TypeScript declarations:

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

## 🔐 Security

- ✅ Tokens stored in `localStorage` (configurable for production)
- ✅ Auto-refresh before expiration
- ✅ Tokens cleared on logout
- ✅ JWT decoded client-side (signature validated server-side)
- ✅ HTTPS recommended for production
- ✅ No tokens in console logs

**Production recommendation:** Use `httpOnly` cookies instead of `localStorage` for enhanced security.

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## 📄 License

MIT © CISCode

---

## 🔗 Links

- [Backend Module (@ciscode/authentication-kit)](https://github.com/ciscode/auth-kit)
- [Backend Integration Guide](docs/BACKEND_INTEGRATION.md)
- [Examples](examples/)
- [NPM Package](https://www.npmjs.com/package/@ciscode/ui-authentication-kit)

---

**Need help?** Open an issue on [GitHub](https://github.com/ciscode/auth-kit-ui/issues)

