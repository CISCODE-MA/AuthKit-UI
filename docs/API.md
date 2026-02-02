# API Reference

Complete API documentation for `@ciscode/ui-authentication-kit`.

---

## Table of Contents

- [Components](#components)
  - [AuthProvider](#authprovider)
  - [ProfilePage](#profilepage)
  - [RequirePermissions](#requirepermissions)
  - [RbacProvider](#rbacprovider)
- [Hooks](#hooks)
  - [useAuthState](#useauthstate)
  - [useHasRole](#usehasrole)
  - [useHasModule](#usehasmodule)
  - [useCan](#usecan)
  - [useGrant](#usegrant)
- [Types](#types)

---

## Components

### AuthProvider

Root authentication provider that manages auth state, session handling, and routing.

#### Props

```typescript
interface AuthProviderProps {
  config: AuthConfigProps;
  children: React.ReactNode;
}

interface AuthConfigProps {
  /** Base API URL */
  apiUrl: string;

  /** Login endpoint path */
  loginPath: string;

  /** Register endpoint path */
  registerPath: string;

  /** User profile endpoint path */
  profilePath: string;

  /** Logout endpoint path */
  logoutPath: string;

  /** Where to redirect after successful login */
  redirectAfterLogin: string;

  /** Where to redirect after logout */
  redirectAfterLogout: string;

  /** Optional: Google OAuth client ID */
  googleClientId?: string;

  /** Optional: Enable session expiration modal */
  showSessionExpiredModal?: boolean;

  /** Optional: Token refresh interval in ms */
  refreshInterval?: number;
}
```

#### Usage

```tsx
import { AuthProvider } from '@ciscode/ui-authentication-kit';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider
        config={{
          apiUrl: 'https://api.example.com',
          loginPath: '/auth/login',
          registerPath: '/auth/register',
          profilePath: '/auth/profile',
          logoutPath: '/auth/logout',
          redirectAfterLogin: '/dashboard',
          redirectAfterLogout: '/',
          googleClientId: 'your-google-client-id', // Optional
        }}
      >
        {/* Your app */}
      </AuthProvider>
    </BrowserRouter>
  );
}
```

#### Features

- ✅ Automatic token storage and retrieval
- ✅ Session expiration detection
- ✅ JWT decoding and validation
- ✅ Axios interceptor attachment
- ✅ Built-in auth routes (`/login`, `/register`, `/forgot-password`, etc.)
- ✅ Google OAuth support
- ✅ Protected route wrapper

#### Built-in Routes

The `AuthProvider` automatically provides these routes:

- `/login` - Sign in page
- `/register` - Sign up page
- `/forgot-password` - Password reset request
- `/reset-password` - Password reset form
- `/auth/google/callback` - Google OAuth callback

---

### ProfilePage

Pre-built user profile management component.

#### Props

```typescript
interface ProfilePageProps {
  /** Optional: Custom className for styling */
  className?: string;

  /** Optional: Custom onUpdate callback */
  onUpdate?: (user: UserProfile) => void;
}
```

#### Usage

```tsx
import { ProfilePage } from '@ciscode/ui-authentication-kit';

function UserProfile() {
  return (
    <ProfilePage
      className="my-profile-styles"
      onUpdate={(user) => console.log('Profile updated:', user)}
    />
  );
}
```

#### Features

- ✅ Display current user info
- ✅ Edit profile fields
- ✅ Avatar upload
- ✅ Password change
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling

---

### RequirePermissions

Component for protecting routes based on permissions and roles.

#### Props

```typescript
interface RequirePermissionsProps {
  /** All permissions in this array must be present */
  fallbackpermessions?: string[];

  /** At least one permission from this array must be present */
  anyPermessions?: string[];

  /** Roles that bypass all permission checks */
  fallbackRoles?: string[];

  /** Where to redirect if access is denied */
  redirectTo?: string;

  /** Content to render if access is granted */
  children: React.ReactNode;
}
```

#### Default Values

```typescript
{
  fallbackpermessions: [],
  anyPermessions: [],
  fallbackRoles: ['super-admin'],
  redirectTo: '/dashboard',
}
```

#### Usage

```tsx
import { RequirePermissions } from '@ciscode/ui-authentication-kit';

// Require ALL permissions
function AdminPanel() {
  return (
    <RequirePermissions
      fallbackpermessions={['admin.view', 'admin.edit']}
      redirectTo="/unauthorized"
    >
      <div>Admin Content</div>
    </RequirePermissions>
  );
}

// Require ANY permission
function ModeratorPanel() {
  return (
    <RequirePermissions
      anyPermessions={['posts.moderate', 'users.moderate']}
      redirectTo="/unauthorized"
    >
      <div>Moderator Content</div>
    </RequirePermissions>
  );
}

// Combine both
function ComplexAccess() {
  return (
    <RequirePermissions
      fallbackpermessions={['access.dashboard']}
      anyPermessions={['reports.view', 'analytics.view']}
      fallbackRoles={['super-admin', 'admin']}
      redirectTo="/unauthorized"
    >
      <div>Complex Access Content</div>
    </RequirePermissions>
  );
}
```

#### Access Logic

```
if (user has fallbackRoles) → GRANT ACCESS

if (user has ALL fallbackpermessions AND ANY anyPermessions) → GRANT ACCESS

else → REDIRECT
```

---

### RbacProvider

Context provider for role-based access control.

#### Props

```typescript
interface RbacProviderProps {
  children: React.ReactNode;
}
```

#### Usage

```tsx
import { RbacProvider, useGrant } from '@ciscode/ui-authentication-kit';

function App() {
  return (
    <RbacProvider>
      <Dashboard />
    </RbacProvider>
  );
}

function Dashboard() {
  const { grant, updateGrant } = useGrant();

  return (
    <div>
      <pre>{JSON.stringify(grant, null, 2)}</pre>
    </div>
  );
}
```

---

## Hooks

### useAuthState

Access authentication state and methods.

#### Signature

```typescript
function useAuthState(): AuthState;

interface AuthState {
  /** Current authenticated user */
  user: UserProfile | null;

  /** Is user authenticated */
  isAuthenticated: boolean;

  /** Is initial auth check in progress */
  booting: boolean;

  /** Current access token */
  accessToken: string | null;

  /** Has session expired */
  expired: boolean;

  /** Login method */
  login: (token: string) => void;

  /** Logout method */
  logout: () => void;

  /** Update user profile */
  updateUser: (user: UserProfile) => void;
}
```

#### Usage

```tsx
import { useAuthState } from '@ciscode/ui-authentication-kit';

function Header() {
  const { user, isAuthenticated, logout, booting } = useAuthState();

  if (booting) return <div>Loading...</div>;

  return (
    <header>
      {isAuthenticated ? (
        <>
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

---

### useHasRole

Check if the current user has a specific role.

#### Signature

```typescript
function useHasRole(role: string): boolean;
```

#### Usage

```tsx
import { useHasRole } from '@ciscode/ui-authentication-kit';

function AdminButton() {
  const isAdmin = useHasRole('admin');

  if (!isAdmin) return null;

  return <button>Admin Action</button>;
}
```

---

### useHasModule

Check if the current user has access to a module.

#### Signature

```typescript
function useHasModule(module: string): boolean;
```

#### Usage

```tsx
import { useHasModule } from '@ciscode/ui-authentication-kit';

function ReportsSection() {
  const hasReports = useHasModule('reports');

  if (!hasReports) return null;

  return <div>Reports Dashboard</div>;
}
```

---

### useCan

Check if the current user has a specific permission.

#### Signature

```typescript
function useCan(permission: string): boolean;
```

#### Usage

```tsx
import { useCan } from '@ciscode/ui-authentication-kit';

function UsersList() {
  const canEditUsers = useCan('users.edit');
  const canDeleteUsers = useCan('users.delete');

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>
          <span>{user.name}</span>
          {canEditUsers && <button>Edit</button>}
          {canDeleteUsers && <button>Delete</button>}
        </div>
      ))}
    </div>
  );
}
```

---

### useGrant

Access RBAC grant context for managing permissions.

#### Signature

```typescript
function useGrant(): GrantContext;

interface GrantContext {
  /** Current grant object */
  grant: Grant | null;

  /** Update grant */
  updateGrant: (grant: Grant) => void;
}

interface Grant {
  roles: string[];
  modules: string[];
  permissions: string[];
}
```

#### Usage

```tsx
import { useGrant } from '@ciscode/ui-authentication-kit';

function PermissionsManager() {
  const { grant, updateGrant } = useGrant();

  const addPermission = (permission: string) => {
    if (grant) {
      updateGrant({
        ...grant,
        permissions: [...grant.permissions, permission],
      });
    }
  };

  return (
    <div>
      <h3>Current Permissions:</h3>
      <ul>
        {grant?.permissions.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
      <button onClick={() => addPermission('new.permission')}>Add Permission</button>
    </div>
  );
}
```

---

## Types

### UserProfile

```typescript
interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  roles?: string[];
  modules?: string[];
  permissions?: string[];
  createdAt?: string;
  updatedAt?: string;
}
```

### AuthConfig

```typescript
interface AuthConfigProps {
  apiUrl: string;
  loginPath: string;
  registerPath: string;
  profilePath: string;
  logoutPath: string;
  redirectAfterLogin: string;
  redirectAfterLogout: string;
  googleClientId?: string;
  showSessionExpiredModal?: boolean;
  refreshInterval?: number;
}
```

### Grant

```typescript
interface Grant {
  roles: string[];
  modules: string[];
  permissions: string[];
}
```

---

## Error Handling

All API-related hooks and components handle errors gracefully:

```tsx
import { useAuthState } from '@ciscode/ui-authentication-kit';

function LoginForm() {
  const { login } = useAuthState();
  const [error, setError] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
    </form>
  );
}
```

---

## Best Practices

### 1. Always wrap your app with AuthProvider inside BrowserRouter

```tsx
<BrowserRouter>
  <AuthProvider config={config}>
    <App />
  </AuthProvider>
</BrowserRouter>
```

### 2. Use RequirePermissions for route protection

```tsx
// ❌ Manual permission checks everywhere
function Dashboard() {
  const { user } = useAuthState();
  if (!user?.permissions.includes('dashboard.view')) {
    return <Navigate to="/unauthorized" />;
  }
  // ...
}

// ✅ Use RequirePermissions wrapper
function Dashboard() {
  return (
    <RequirePermissions fallbackpermessions={['dashboard.view']}>
      {/* Dashboard content */}
    </RequirePermissions>
  );
}
```

### 3. Combine RBAC hooks for complex logic

```tsx
function ActionButton() {
  const isAdmin = useHasRole('admin');
  const canEdit = useCan('content.edit');
  const hasModule = useHasModule('cms');

  const canShowButton = isAdmin || (canEdit && hasModule);

  return canShowButton ? <button>Edit</button> : null;
}
```

### 4. Handle loading states

```tsx
function ProtectedContent() {
  const { booting, isAuthenticated } = useAuthState();

  if (booting) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Protected Content</div>;
}
```

---

## Migration from v1.x to v2.x

See [MIGRATION.md](MIGRATION.md) for detailed upgrade instructions.

---

_Last Updated: January 31, 2026_  
_Version: 1.0.8_
