# Usage Examples

Real-world integration examples for `@ciscode/ui-authentication-kit`.

---

## Table of Contents

- [Basic Setup](#basic-setup)
- [Custom Login Flow](#custom-login-flow)
- [Protected Routes](#protected-routes)
- [Role-Based Dashboard](#role-based-dashboard)
- [Multi-Tenant Application](#multi-tenant-application)
- [Social Authentication](#social-authentication)
- [Custom Profile Page](#custom-profile-page)
- [Permission-Based UI](#permission-based-ui)
- [Session Management](#session-management)
- [Integration with React Query](#integration-with-react-query)

---

## Basic Setup

Minimal setup for a React app with routing:

```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@ciscode/ui-authentication-kit';
import App from './App';

const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  loginPath: '/auth/login',
  registerPath: '/auth/register',
  profilePath: '/auth/profile',
  logoutPath: '/auth/logout',
  redirectAfterLogin: '/dashboard',
  redirectAfterLogout: '/',
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider config={config}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

```tsx
// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from '@ciscode/ui-authentication-kit';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';

function App() {
  const { isAuthenticated, booting } = useAuthState();

  if (booting) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
```

---

## Custom Login Flow

Building a custom login page that uses the auth provider:

```tsx
// src/pages/CustomLogin.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from '@ciscode/ui-authentication-kit';
import axios from 'axios';

export default function CustomLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuthState();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call your API
      const response = await axios.post('https://api.example.com/auth/login', {
        email,
        password,
      });

      // Extract token from response
      const { accessToken } = response.data;

      // Update auth state
      login(accessToken);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        {error && <div className="error">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
```

---

## Protected Routes

Using `RequirePermissions` for route protection:

```tsx
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { RequirePermissions } from '@ciscode/ui-authentication-kit';
import AdminPanel from './pages/AdminPanel';
import ModeratorPanel from './pages/ModeratorPanel';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Admin-only route */}
      <Route
        path="/admin"
        element={
          <RequirePermissions
            fallbackpermessions={['admin.access']}
            fallbackRoles={['super-admin', 'admin']}
            redirectTo="/unauthorized"
          >
            <AdminPanel />
          </RequirePermissions>
        }
      />

      {/* Moderator route - needs ANY of these permissions */}
      <Route
        path="/moderate"
        element={
          <RequirePermissions
            anyPermessions={['posts.moderate', 'users.moderate', 'comments.moderate']}
            redirectTo="/unauthorized"
          >
            <ModeratorPanel />
          </RequirePermissions>
        }
      />

      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
}
```

---

## Role-Based Dashboard

Different dashboard views based on user role:

```tsx
// src/pages/Dashboard.tsx
import { useHasRole, useAuthState } from '@ciscode/ui-authentication-kit';
import AdminDashboard from '../components/AdminDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import UserDashboard from '../components/UserDashboard';

export default function Dashboard() {
  const { user } = useAuthState();
  const isAdmin = useHasRole('admin');
  const isManager = useHasRole('manager');

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.name}!</h1>

      {isAdmin && <AdminDashboard />}
      {isManager && !isAdmin && <ManagerDashboard />}
      {!isAdmin && !isManager && <UserDashboard />}
    </div>
  );
}
```

---

## Multi-Tenant Application

Handling multiple tenants with role-based access:

```tsx
// src/App.tsx
import { AuthProvider, RbacProvider } from '@ciscode/ui-authentication-kit';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from './contexts/TenantContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider config={authConfig}>
        <TenantProvider>
          <RbacProvider>
            <AppRoutes />
          </RbacProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

```tsx
// src/components/TenantSwitcher.tsx
import { useAuthState, useGrant } from '@ciscode/ui-authentication-kit';
import { useTenant } from '../contexts/TenantContext';

export default function TenantSwitcher() {
  const { user } = useAuthState();
  const { currentTenant, setTenant } = useTenant();
  const { updateGrant } = useGrant();

  const handleTenantChange = async (tenantId: string) => {
    // Fetch permissions for new tenant
    const response = await fetch(`/api/tenants/${tenantId}/permissions`);
    const { roles, modules, permissions } = await response.json();

    // Update RBAC context
    updateGrant({ roles, modules, permissions });

    // Update tenant
    setTenant(tenantId);
  };

  return (
    <select value={currentTenant} onChange={(e) => handleTenantChange(e.target.value)}>
      {user?.tenants.map((tenant) => (
        <option key={tenant.id} value={tenant.id}>
          {tenant.name}
        </option>
      ))}
    </select>
  );
}
```

---

## Social Authentication

Google OAuth integration:

```tsx
// src/main.tsx
import { AuthProvider } from '@ciscode/ui-authentication-kit';

const config = {
  apiUrl: 'https://api.example.com',
  loginPath: '/auth/login',
  registerPath: '/auth/register',
  profilePath: '/auth/profile',
  logoutPath: '/auth/logout',
  redirectAfterLogin: '/dashboard',
  redirectAfterLogout: '/',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID', // Enable Google OAuth
};

// AuthProvider automatically handles /auth/google/callback route
```

```tsx
// src/pages/Login.tsx
export default function Login() {
  const handleGoogleLogin = () => {
    // AuthProvider handles this automatically
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>Continue with Google</button>
    </div>
  );
}
```

---

## Custom Profile Page

Extending the built-in ProfilePage:

```tsx
// src/pages/CustomProfile.tsx
import { ProfilePage, useAuthState } from '@ciscode/ui-authentication-kit';
import { useState } from 'react';

export default function CustomProfile() {
  const { user, updateUser } = useAuthState();
  const [customField, setCustomField] = useState('');

  const handleProfileUpdate = async (updatedUser: any) => {
    // Add custom logic
    const response = await fetch('/api/user/custom-field', {
      method: 'POST',
      body: JSON.stringify({ customField }),
    });

    // Update user in auth state
    updateUser(updatedUser);
  };

  return (
    <div className="profile-container">
      <ProfilePage onUpdate={handleProfileUpdate} />

      {/* Custom fields */}
      <div className="custom-section">
        <h3>Custom Settings</h3>
        <input
          value={customField}
          onChange={(e) => setCustomField(e.target.value)}
          placeholder="Custom Field"
        />
      </div>
    </div>
  );
}
```

---

## Permission-Based UI

Granular UI control based on permissions:

```tsx
// src/components/UserTable.tsx
import { useCan } from '@ciscode/ui-authentication-kit';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function UserTable({ users }: { users: User[] }) {
  const canView = useCan('users.view');
  const canEdit = useCan('users.edit');
  const canDelete = useCan('users.delete');
  const canCreate = useCan('users.create');

  if (!canView) {
    return <div>You don't have permission to view users.</div>;
  }

  return (
    <div>
      {canCreate && <button onClick={() => console.log('Create user')}>Add User</button>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {(canEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {(canEdit || canDelete) && (
                <td>
                  {canEdit && <button>Edit</button>}
                  {canDelete && <button>Delete</button>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Session Management

Handling session expiration and refresh:

```tsx
// src/App.tsx
import { useEffect } from 'react';
import { useAuthState } from '@ciscode/ui-authentication-kit';
import { useNavigate } from 'react-router-dom';

function App() {
  const { expired, logout } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    if (expired) {
      // Show notification
      alert('Your session has expired. Please log in again.');

      // Logout and redirect
      logout();
      navigate('/login');
    }
  }, [expired, logout, navigate]);

  return <div>{/* App content */}</div>;
}
```

```tsx
// src/components/SessionMonitor.tsx
import { useEffect, useState } from 'react';
import { useAuthState } from '@ciscode/ui-authentication-kit';

export default function SessionMonitor() {
  const { accessToken } = useAuthState();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!accessToken) return;

    // Decode JWT and calculate time left
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = payload.exp * 1000;

    const interval = setInterval(() => {
      const remaining = Math.floor((expiresAt - Date.now()) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  if (timeLeft <= 0) return null;

  return (
    <div className="session-monitor">
      Session expires in: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
    </div>
  );
}
```

---

## Integration with React Query

Combining auth state with React Query:

```tsx
// src/hooks/useAuthenticatedQuery.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthState } from '@ciscode/ui-authentication-kit';
import axios from 'axios';

export function useAuthenticatedQuery<T>(key: string[], url: string, options?: any) {
  const { isAuthenticated, accessToken } = useAuthState();

  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    },
    enabled: isAuthenticated,
    ...options,
  });
}
```

```tsx
// src/pages/Dashboard.tsx
import { useAuthenticatedQuery } from '../hooks/useAuthenticatedQuery';

export default function Dashboard() {
  const { data, isLoading, error } = useAuthenticatedQuery<DashboardData>(
    ['dashboard'],
    '/api/dashboard',
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading dashboard</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
```

---

## Advanced: Custom Auth Interceptor

Adding custom logic to API requests:

```tsx
// src/utils/setupAxios.ts
import axios from 'axios';
import { useAuthState } from '@ciscode/ui-authentication-kit';

export function setupAxiosInterceptors() {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add custom headers
      config.headers['X-Client-Version'] = '1.0.0';

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 with token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          const response = await axios.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;

          localStorage.setItem('authToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return axios(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );
}
```

```tsx
// src/main.tsx
import { setupAxiosInterceptors } from './utils/setupAxios';

setupAxiosInterceptors();

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

---

## Best Practices

### 1. Centralize Auth Configuration

```tsx
// src/config/auth.ts
export const authConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  loginPath: '/auth/login',
  registerPath: '/auth/register',
  profilePath: '/auth/profile',
  logoutPath: '/auth/logout',
  redirectAfterLogin: '/dashboard',
  redirectAfterLogout: '/',
};
```

### 2. Create Reusable Permission Components

```tsx
// src/components/Can.tsx
import { useCan } from '@ciscode/ui-authentication-kit';

interface CanProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const hasPermission = useCan(permission);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

// Usage
<Can permission="users.edit">
  <EditButton />
</Can>;
```

### 3. Handle Loading States Consistently

```tsx
// src/components/AuthGuard.tsx
import { useAuthState } from '@ciscode/ui-authentication-kit';
import { Navigate } from 'react-router-dom';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, booting } = useAuthState();

  if (booting) {
    return <div className="loading-screen">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}
```

---

_Last Updated: January 31, 2026_  
_Version: 1.0.8_
