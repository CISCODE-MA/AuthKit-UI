# Migration Guide

Upgrade guides for `@ciscode/ui-authentication-kit`.

---

## Table of Contents

- [Version 1.x to 2.x](#version-1x-to-2x)
- [Version 0.x to 1.x](#version-0x-to-1x)
- [Breaking Changes Log](#breaking-changes-log)

---

## Version 1.x to 2.x

> **Note**: Version 2.x is not yet released. This section will be updated when available.

### Expected Breaking Changes

The following changes are planned for v2.0.0:

#### 1. Renamed Props

```tsx
// v1.x
<RequirePermissions
  fallbackpermessions={['admin.view']}
  anyPermessions={['read.posts']}
/>

// v2.x (planned)
<RequirePermissions
  allPermissions={['admin.view']}  // ← renamed
  anyPermissions={['read.posts']}  // ← renamed
/>
```

#### 2. AuthProvider Config Structure

```tsx
// v1.x
<AuthProvider
  config={{
    apiUrl: 'https://api.example.com',
    loginPath: '/auth/login',
    registerPath: '/auth/register',
    // ...
  }}
/>

// v2.x (planned)
<AuthProvider
  apiUrl="https://api.example.com"
  endpoints={{
    login: '/auth/login',
    register: '/auth/register',
    // ...
  }}
/>
```

#### 3. Hook Return Values

```tsx
// v1.x
const { user, isAuthenticated, booting, login, logout } = useAuthState();

// v2.x (planned)
const { user, isAuthenticated, isLoading, login, logout } = useAuthState();
// ↑ `booting` renamed to `isLoading` for consistency
```

---

## Version 0.x to 1.x

### Breaking Changes

#### 1. Package Rename

```bash
# v0.x
npm install @ciscode/auth-ui-kit

# v1.x
npm install @ciscode/ui-authentication-kit
```

```tsx
// v0.x
import { AuthProvider } from '@ciscode/auth-ui-kit';

// v1.x
import { AuthProvider } from '@ciscode/ui-authentication-kit';
```

#### 2. AuthProvider Structure

**Before (v0.x):**

```tsx
<AuthProvider
  apiUrl="https://api.example.com"
  loginEndpoint="/auth/login"
  logoutEndpoint="/auth/logout"
>
  <App />
</AuthProvider>
```

**After (v1.x):**

```tsx
<AuthProvider
  config={{
    apiUrl: 'https://api.example.com',
    loginPath: '/auth/login',
    registerPath: '/auth/register',
    profilePath: '/auth/profile',
    logoutPath: '/auth/logout',
    redirectAfterLogin: '/dashboard',
    redirectAfterLogout: '/',
  }}
>
  <App />
</AuthProvider>
```

**Migration:**

```tsx
// Create config object
const authConfig = {
  apiUrl: process.env.REACT_APP_API_URL,
  loginPath: '/auth/login',
  registerPath: '/auth/register',
  profilePath: '/auth/profile',
  logoutPath: '/auth/logout',
  redirectAfterLogin: '/dashboard',
  redirectAfterLogout: '/',
};

<AuthProvider config={authConfig}>
  <App />
</AuthProvider>;
```

#### 3. Hook Name Changes

| v0.x               | v1.x             |
| ------------------ | ---------------- |
| `useAuth()`        | `useAuthState()` |
| `usePermission(p)` | `useCan(p)`      |
| `useRole(r)`       | `useHasRole(r)`  |

**Before (v0.x):**

```tsx
const { user, authenticated } = useAuth();
const canEdit = usePermission('users.edit');
const isAdmin = useRole('admin');
```

**After (v1.x):**

```tsx
const { user, isAuthenticated } = useAuthState();
const canEdit = useCan('users.edit');
const isAdmin = useHasRole('admin');
```

#### 4. RequirePermissions Props

**Before (v0.x):**

```tsx
<RequirePermissions permissions={['admin.view']} roles={['super-admin']} />
```

**After (v1.x):**

```tsx
<RequirePermissions fallbackpermessions={['admin.view']} fallbackRoles={['super-admin']} />
```

#### 5. RBAC Context

**Before (v0.x):**

```tsx
import { PermissionProvider } from '@ciscode/auth-ui-kit';

<PermissionProvider>
  <App />
</PermissionProvider>;
```

**After (v1.x):**

```tsx
import { RbacProvider } from '@ciscode/ui-authentication-kit';

<RbacProvider>
  <App />
</RbacProvider>;
```

#### 6. ProfilePage Component

**Before (v0.x):**

```tsx
import { Profile } from '@ciscode/auth-ui-kit';

<Profile onUpdate={handleUpdate} />;
```

**After (v1.x):**

```tsx
import { ProfilePage } from '@ciscode/ui-authentication-kit';

<ProfilePage onUpdate={handleUpdate} />;
```

---

## Step-by-Step Migration (v0.x → v1.x)

### Step 1: Update Package

```bash
# Uninstall old package
npm uninstall @ciscode/auth-ui-kit

# Install new package
npm install @ciscode/ui-authentication-kit
```

### Step 2: Update Imports

Use find-and-replace in your editor:

```tsx
// Find
@ciscode/auth-ui-kit

// Replace with
@ciscode/ui-authentication-kit
```

### Step 3: Update AuthProvider

```tsx
// Old (v0.x)
<AuthProvider
  apiUrl="https://api.example.com"
  loginEndpoint="/auth/login"
  logoutEndpoint="/auth/logout"
>

// New (v1.x)
<AuthProvider
  config={{
    apiUrl: 'https://api.example.com',
    loginPath: '/auth/login',
    registerPath: '/auth/register',
    profilePath: '/auth/profile',
    logoutPath: '/auth/logout',
    redirectAfterLogin: '/dashboard',
    redirectAfterLogout: '/',
  }}
>
```

### Step 4: Update Hook Names

```bash
# Find and replace in your codebase

# useAuth → useAuthState
sed -i 's/useAuth(/useAuthState(/g' **/*.tsx

# usePermission → useCan
sed -i 's/usePermission(/useCan(/g' **/*.tsx

# useRole → useHasRole
sed -i 's/useRole(/useHasRole(/g' **/*.tsx
```

### Step 5: Update Hook Destructuring

```tsx
// Old (v0.x)
const { user, authenticated } = useAuth();

// New (v1.x)
const { user, isAuthenticated } = useAuthState();
```

### Step 6: Update RequirePermissions

```tsx
// Old (v0.x)
<RequirePermissions
  permissions={['admin.view']}
  roles={['super-admin']}
>

// New (v1.x)
<RequirePermissions
  fallbackpermessions={['admin.view']}
  fallbackRoles={['super-admin']}
>
```

### Step 7: Update Component Names

```tsx
// Old (v0.x)
import { Profile, PermissionProvider } from '@ciscode/auth-ui-kit';

// New (v1.x)
import { ProfilePage, RbacProvider } from '@ciscode/ui-authentication-kit';
```

### Step 8: Test Your Application

Run your test suite and manually test:

```bash
npm test
npm run dev
```

---

## Breaking Changes Log

### v1.0.0 (January 2026)

**Package:**

- Renamed package from `@ciscode/auth-ui-kit` to `@ciscode/ui-authentication-kit`

**Components:**

- `Profile` → `ProfilePage`
- `PermissionProvider` → `RbacProvider`
- `AuthProvider` now requires `config` object prop

**Hooks:**

- `useAuth()` → `useAuthState()`
- `usePermission(p)` → `useCan(p)`
- `useRole(r)` → `useHasRole(r)`
- Return value `authenticated` → `isAuthenticated`

**Props:**

- `RequirePermissions.permissions` → `fallbackpermessions`
- `RequirePermissions.roles` → `fallbackRoles`

**Types:**

- `AuthConfig` interface restructured
- `User` → `UserProfile`

### v0.9.0 (December 2025)

**Added:**

- Google OAuth support
- Session expiration modal
- Module-based permissions

**Changed:**

- Improved TypeScript types
- Better error handling

### v0.8.0 (November 2025)

**Initial release:**

- Basic auth components
- RBAC support
- Profile management

---

## Deprecation Warnings

The following features are deprecated and will be removed in v2.0:

### ⚠️ Deprecated in v1.0

```tsx
// DEPRECATED: Old hook names still work but log warnings
useAuth() // Use useAuthState() instead
usePermission(p) // Use useCan(p) instead
useRole(r) // Use useHasRole(r) instead

// DEPRECATED: Old prop names
<RequirePermissions permissions={[]} /> // Use fallbackpermessions
<RequirePermissions roles={[]} /> // Use fallbackRoles
```

To silence warnings, update to new APIs.

---

## Migration Helpers

### Codemod Script (Optional)

Create a script to automate migration:

```bash
#!/bin/bash
# migrate-to-v1.sh

echo "Migrating to @ciscode/ui-authentication-kit v1.x..."

# Update package name in imports
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/@ciscode\/auth-ui-kit/@ciscode\/ui-authentication-kit/g'

# Update hook names
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/useAuth(/useAuthState(/g'
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/usePermission(/useCan(/g'
find src -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/useRole(/useHasRole(/g'

# Update component names
find src -type f -name "*.tsx" | xargs sed -i 's/<Profile/<ProfilePage/g'
find src -type f -name "*.tsx" | xargs sed -i 's/PermissionProvider/RbacProvider/g'

echo "Migration complete! Please review changes and test thoroughly."
```

### Type-Safe Migration

Use TypeScript to catch issues:

```tsx
// Create a wrapper for gradual migration
import {
  useAuthState as useAuthStateNew,
  useCan as useCanNew,
  useHasRole as useHasRoleNew,
} from '@ciscode/ui-authentication-kit';

// Provide old names with deprecation warnings
export function useAuth() {
  console.warn('useAuth is deprecated. Use useAuthState instead.');
  return useAuthStateNew();
}

export function usePermission(permission: string) {
  console.warn('usePermission is deprecated. Use useCan instead.');
  return useCanNew(permission);
}

export function useRole(role: string) {
  console.warn('useRole is deprecated. Use useHasRole instead.');
  return useHasRoleNew(role);
}
```

---

## Getting Help

If you encounter issues during migration:

1. **Check the documentation**: [API.md](API.md), [EXAMPLES.md](EXAMPLES.md)
2. **Search issues**: [GitHub Issues](https://github.com/CISCODE-MA/AuthKit-UI/issues)
3. **Ask for help**: [Open a discussion](https://github.com/CISCODE-MA/AuthKit-UI/discussions)

---

_Last Updated: January 31, 2026_  
_Version: 1.0.8_
