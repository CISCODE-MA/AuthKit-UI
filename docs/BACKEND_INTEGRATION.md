# Backend Integration Guide

> **Auth Kit UI** requires `@ciscode/authentication-kit` v1.5.0+ on the backend.

This guide explains how to integrate Auth Kit UI with the Auth Kit backend module.

---

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Endpoint Mapping](#api-endpoint-mapping)
- [Type Alignment](#type-alignment)
- [Error Handling](#error-handling)
- [Complete Example](#complete-example)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Backend Requirements

- NestJS application with `@ciscode/authentication-kit` v1.5.0+
- MongoDB or PostgreSQL database configured
- Backend running on `http://localhost:3000` (or your chosen URL)

### Frontend Requirements

- React 18+ application
- TypeScript 5+
- `@ciscode/ui-authentication-kit` installed

---

## Backend Setup

### 1. Install Auth Kit Backend

```bash
cd backend
npm install @ciscode/authentication-kit
```

### 2. Configure Auth Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthKitModule } from '@ciscode/authentication-kit';

@Module({
  imports: [
    AuthKitModule.forRoot({
      jwt: {
        secret: process.env.JWT_SECRET,
        accessExpiresIn: '15m',
        refreshExpiresIn: '7d',
      },
      database: {
        uri: process.env.MONGO_URI,
      },
      email: {
        from: 'noreply@example.com',
        // ... email config
      },
    }),
  ],
})
export class AppModule {}
```

### 3. Enable CORS

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
```

### 4. Verify Backend Endpoints

Backend should expose these endpoints:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user profile
- `POST /auth/verify-email` - Verify email with token
- `POST /auth/resend-verification` - Resend verification email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `GET /auth/oauth/google` - Google OAuth URL
- `GET /auth/oauth/microsoft` - Microsoft OAuth URL
- `GET /auth/oauth/facebook` - Facebook OAuth URL

---

## Frontend Setup

### 1. Install Auth Kit UI

```bash
cd frontend
npm install @ciscode/ui-authentication-kit
```

### 2. Create useAuth Hook

```typescript
// src/hooks/useAuth.ts
import { createUseAuth } from '@ciscode/ui-authentication-kit';

export const useAuth = createUseAuth({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 60, // Refresh 60s before token expires
});
```

### 3. Use in Components

```tsx
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate('/dashboard');
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

---

## API Endpoint Mapping

Frontend hook methods map to backend endpoints:

| Hook Method | HTTP Request | Backend Endpoint |
|-------------|--------------|------------------|
| `login(credentials)` | `POST /auth/login` | Body: `{ email, password }` |
| `register(data)` | `POST /auth/register` | Body: `{ fullname, email, password, ... }` |
| `logout()` | `POST /auth/logout` | Headers: `Authorization: Bearer {token}` |
| `verifyEmail(token)` | `POST /auth/verify-email` | Body: `{ token }` |
| `resendVerification(email)` | `POST /auth/resend-verification` | Body: `{ email }` |
| `forgotPassword(email)` | `POST /auth/forgot-password` | Body: `{ email }` |
| `resetPassword(token, newPassword)` | `POST /auth/reset-password` | Body: `{ token, newPassword }` |

### Request Flow

```
1. User submits login form
   ↓
2. Frontend: login({ email, password })
   ↓
3. HTTP POST → http://localhost:3000/auth/login
   ↓
4. Backend validates credentials
   ↓
5. Backend returns { accessToken, refreshToken }
   ↓
6. Frontend stores tokens in localStorage
   ↓
7. Frontend decodes JWT → user profile
   ↓
8. Frontend updates state → isAuthenticated = true
```

---

## Type Alignment

Frontend types are aligned with backend DTOs:

### Login

**Frontend:**
```typescript
interface LoginCredentials {
  email: string;
  password: string;
}
```

**Backend (LoginDto):**
```typescript
class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### Register

**Frontend:**
```typescript
interface RegisterData {
  fullname: {
    fname: string;
    lname: string;
  };
  email: string;
  password: string;
  phoneNumber?: string;
  // ... optional fields
}
```

**Backend (RegisterDto):**
```typescript
class RegisterDto {
  @ValidateNested()
  fullname: {
    fname: string;
    lname: string;
  };

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
```

### Auth Response

**Frontend:**
```typescript
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
```

**Backend:**
```typescript
{
  accessToken: string; // JWT token
  refreshToken: string; // JWT token
}
```

### User Profile

**Frontend:**
```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
  permissions: string[];
  modules: string[];
  tenantId: string;
}
```

**Backend (UserDto):**
```typescript
class UserDto {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  modules: string[];
  tenantId: string;
}
```

---

## Error Handling

### Backend Error Format

Auth Kit backend returns errors in this format:

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Frontend Error Handling

```typescript
try {
  await login({ email: 'user@example.com', password: 'wrong' });
} catch (error: any) {
  // Error is automatically stored in state.error
  console.error(error.message); // "Invalid credentials"
  console.error(error.statusCode); // 401
}
```

### Common Error Codes

| Status Code | Message | Cause |
|-------------|---------|-------|
| 400 | Invalid input | Validation failed (e.g., weak password) |
| 401 | Invalid credentials | Email or password incorrect |
| 401 | Token expired | JWT token expired |
| 403 | Email not verified | User hasn't verified email |
| 404 | User not found | Email doesn't exist |
| 409 | Email already exists | Registration with existing email |

### Error Display Pattern

```tsx
function LoginForm() {
  const { login, error, clearError } = useAuth();

  useEffect(() => {
    // Clear error when component unmounts
    return () => clearError();
  }, [clearError]);

  return (
    <form>
      {/* ... form fields */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </form>
  );
}
```

---

## Complete Example

### Full Login Flow

```tsx
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
```

```tsx
// pages/LoginPage.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      // Error is already in state.error
      console.error('Login failed');
    }
  };

  return (
    <div className="login-page">
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}
```

```tsx
// pages/Dashboard.tsx
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {user?.email}!</h1>
      <p>Roles: {user?.roles.join(', ')}</p>
      
      {hasRole('admin') && (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          {/* Admin-only content */}
        </div>
      )}
      
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

---

## Troubleshooting

### 1. CORS Errors

**Problem:**
```
Access to fetch at 'http://localhost:3000/auth/login' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
```typescript
// backend/src/main.ts
app.enableCors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
});
```

### 2. Token Not Sent with Requests

**Problem:** API calls return 401 Unauthorized even after login

**Solution:** Auth Kit UI automatically injects the token. Verify:
```typescript
// Check if token is stored
const token = localStorage.getItem('auth_access_token');
console.log('Token:', token);

// Check if token is valid (not expired)
const { isAuthenticated } = useAuth();
console.log('Is authenticated:', isAuthenticated);
```

### 3. Token Expired Immediately

**Problem:** User logged out immediately after login

**Solution:** Check token expiration times:
```typescript
// Backend: Increase token expiration
AuthKitModule.forRoot({
  jwt: {
    accessExpiresIn: '15m', // 15 minutes
    refreshExpiresIn: '7d', // 7 days
  },
});
```

### 4. Profile Data Missing

**Problem:** `user` object only contains `id`, `email`, `roles` (no name, avatar, etc.)

**Solution:** JWT only contains minimal data. Fetch full profile:
```typescript
const { user, isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated && !user?.name) {
    // Profile is automatically fetched after login
    // If needed, you can trigger manual fetch:
    // await authService.getProfile();
  }
}, [isAuthenticated, user]);
```

### 5. Auto-Refresh Not Working

**Problem:** User logged out after 15 minutes (access token expires)

**Solution:** Enable auto-refresh:
```typescript
const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true, // ✅ Enable
  refreshBeforeSeconds: 60, // Refresh 60s before expiry
});
```

### 6. Email Verification Not Working

**Problem:** Verification email not sent

**Solution:** Configure email service in backend:
```typescript
// Backend
AuthKitModule.forRoot({
  email: {
    from: 'noreply@example.com',
    transport: {
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
  },
});
```

### 7. Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

**Backend (.env):**
```env
JWT_SECRET=your-super-secret-key
MONGO_URI=mongodb://localhost:27017/mydb
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## Next Steps

- [Examples](../examples/) - See complete UI examples with Tailwind, MUI, etc.
- [API Reference](../README.md#api-reference) - Detailed hook API documentation
- [Auth Kit Backend Docs](https://github.com/ciscode/auth-kit) - Backend module documentation

---

**Need help?** Open an issue on [GitHub](https://github.com/ciscode/auth-kit-ui/issues)

*Last Updated: February 4, 2026*
