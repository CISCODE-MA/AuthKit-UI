# 🧪 Auth Kit UI - Guida Completa ai Test

> **Documento creato**: 4 Febbraio 2026  
> **Versione**: 1.0.4 → Target 2.0.0  
> **Backend**: @ciscode/authentication-kit v1.5.0+

---

## 📋 Indice

1. [Setup Iniziale](#setup-iniziale)
2. [Test Hooks (useAuth)](#test-hooks-useauth)
3. [Test OAuth Providers](#test-oauth-providers)
4. [Test Componenti UI](#test-componenti-ui)
5. [Integrazione con Backend](#integrazione-con-backend)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Setup Iniziale

### 1. Installazione

```bash
npm install @ciscode/ui-authentication-kit
```

### 2. Configurazione Base

#### React App (CRA, Vite, Next.js)

**src/hooks/useAuth.ts:**
```typescript
import { createUseAuth } from '@ciscode/ui-authentication-kit';

export const useAuth = createUseAuth({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 60,
});
```

#### Configurazione Environment

**`.env` (development):**
```env
REACT_APP_API_URL=http://localhost:3000
```

**`.env.production`:**
```env
REACT_APP_API_URL=https://api.yourapp.com
```

---

## 🎣 Test Hooks (useAuth)

### Setup Test App

**App.tsx:**
```typescript
import React from 'react';
import { useAuth } from './hooks/useAuth';

function App() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  } = useAuth();

  return (
    <div>
      <h1>Auth Kit UI Test</h1>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm login={login} isLoading={isLoading} error={error} />
      )}
    </div>
  );
}
```

### Test Login Flow

**LoginForm.tsx:**
```tsx
import { useState } from 'react';

export function LoginForm({ login, isLoading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      console.log('✅ Login successful');
    } catch (err) {
      console.error('❌ Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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

**Test Steps:**
1. ✅ Enter email: `test@example.com`
2. ✅ Enter password: `SecurePassword123!`
3. ✅ Click Login
4. ✅ Verify `isLoading` becomes `true`
5. ✅ Verify `isAuthenticated` becomes `true` on success
6. ✅ Verify `user` object populated
7. ✅ Verify token stored (inspect localStorage/cookies)

### Test Register Flow

**RegisterForm.tsx:**
```tsx
export function RegisterForm({ register, isLoading, error }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(formData);
      console.log('✅ Registration successful - check email');
    } catch (err) {
      console.error('❌ Registration failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Full Name"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registering...' : 'Register'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
}
```

### Test Forgot/Reset Password

**ForgotPasswordForm.tsx:**
```tsx
export function ForgotPasswordForm({ forgotPassword }) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await forgotPassword(email);
      setSuccess(true);
      console.log('✅ Reset email sent');
    } catch (err) {
      console.error('❌ Failed to send reset email:', err);
    }
  };

  if (success) {
    return <p>✅ Check your email for reset link</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit">Send Reset Link</button>
    </form>
  );
}
```

**ResetPasswordForm.tsx:**
```tsx
export function ResetPasswordForm({ resetPassword }) {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(token, password);
      console.log('✅ Password reset successful');
    } catch (err) {
      console.error('❌ Password reset failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Reset token from email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
      />
      <button type="submit">Reset Password</button>
    </form>
  );
}
```

---

## 🌐 Test OAuth Providers

### Setup OAuth Hooks

**src/hooks/useOAuth.ts:**
```typescript
import { createUseAuth } from '@ciscode/ui-authentication-kit';

const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true,
});

export function useOAuth() {
  const auth = useAuth();

  const loginWithGoogle = () => {
    const callbackUrl = `${window.location.origin}/oauth/google/callback`;
    const url = `${process.env.REACT_APP_API_URL}/api/auth/google?redirect=${encodeURIComponent(callbackUrl)}`;
    window.location.href = url;
  };

  const loginWithMicrosoft = () => {
    const callbackUrl = `${window.location.origin}/oauth/microsoft/callback`;
    const url = `${process.env.REACT_APP_API_URL}/api/auth/microsoft?redirect=${encodeURIComponent(callbackUrl)}`;
    window.location.href = url;
  };

  const loginWithFacebook = () => {
    const callbackUrl = `${window.location.origin}/oauth/facebook/callback`;
    const url = `${process.env.REACT_APP_API_URL}/api/auth/facebook?redirect=${encodeURIComponent(callbackUrl)}`;
    window.location.href = url;
  };

  return {
    ...auth,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithFacebook,
  };
}
```

### OAuth Buttons Component

**OAuthButtons.tsx:**
```tsx
import { useOAuth } from '../hooks/useOAuth';

export function OAuthButtons() {
  const { loginWithGoogle, loginWithMicrosoft, loginWithFacebook } = useOAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button onClick={loginWithGoogle}>
        🔵 Continue with Google
      </button>
      <button onClick={loginWithMicrosoft}>
        🟦 Continue with Microsoft
      </button>
      <button onClick={loginWithFacebook}>
        🔵 Continue with Facebook
      </button>
    </div>
  );
}
```

### OAuth Callback Pages

**pages/GoogleCallbackPage.tsx:**
```tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const errorMsg = searchParams.get('error');

      if (errorMsg) {
        setError(errorMsg);
        return;
      }

      if (accessToken && refreshToken) {
        // Store tokens (useAuth hook handles this)
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        console.log('✅ Google OAuth successful');
        navigate('/dashboard');
      } else {
        setError('Missing tokens in callback');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div>
        <h2>❌ OAuth Failed</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')}>Back to Login</button>
      </div>
    );
  }

  return (
    <div>
      <h2>⏳ Processing Google login...</h2>
    </div>
  );
}
```

**Repeat for Microsoft and Facebook** (same pattern)

### Routing Setup

**App.tsx (with React Router):**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { GoogleCallbackPage } from './pages/GoogleCallbackPage';
import { MicrosoftCallbackPage } from './pages/MicrosoftCallbackPage';
import { FacebookCallbackPage } from './pages/FacebookCallbackPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth/google/callback" element={<GoogleCallbackPage />} />
        <Route path="/oauth/microsoft/callback" element={<MicrosoftCallbackPage />} />
        <Route path="/oauth/facebook/callback" element={<FacebookCallbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Test OAuth Flow (Manual)

#### 1. **Google OAuth Test**

**Steps:**
1. ✅ Click "Continue with Google" button
2. ✅ Browser redirects to `http://localhost:3000/api/auth/google`
3. ✅ Backend redirects to Google consent screen
4. ✅ Select Google account
5. ✅ Grant permissions
6. ✅ Redirect to `/oauth/google/callback?accessToken=...&refreshToken=...`
7. ✅ Tokens stored in localStorage
8. ✅ User redirected to dashboard
9. ✅ Verify `useAuth()` shows `isAuthenticated: true`

**Expected Console Logs:**
```
🔵 Redirecting to Google OAuth...
✅ Google OAuth successful
✅ User authenticated: user@gmail.com
```

#### 2. **Microsoft OAuth Test**

**Steps:**
1. ✅ Click "Continue with Microsoft" button
2. ✅ Browser redirects to Microsoft consent screen
3. ✅ Login with Microsoft account
4. ✅ Grant permissions
5. ✅ Redirect to callback with tokens
6. ✅ Verify authentication successful

#### 3. **Facebook OAuth Test**

**Steps:**
1. ✅ Click "Continue with Facebook" button
2. ✅ Browser redirects to Facebook login
3. ✅ Login with Facebook account
4. ✅ Grant permissions
5. ✅ Redirect to callback with tokens
6. ✅ Verify authentication successful

---

## 🎨 Test Componenti UI (Examples)

### Material-UI Login Form

**Usa esempio pronto:**
```bash
# Copy from examples/
cp examples/MuiLoginForm.example.tsx src/components/LoginForm.tsx
```

**Test:**
1. ✅ Form validation (email, password required)
2. ✅ Loading state during login
3. ✅ Error display (invalid credentials)
4. ✅ Success redirect to dashboard
5. ✅ Remember me checkbox (optional)
6. ✅ Forgot password link

### Tailwind CSS Login Form

**TailwindLoginForm.tsx:**
```tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function TailwindLoginForm() {
  const { login, isLoading, error } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-3xl font-bold text-center">Sign in</h2>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            placeholder="Email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            placeholder="Password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 🔗 Integrazione con Backend

### Verificare Connessione

**Test Connection:**
```typescript
// src/utils/testConnection.ts
export async function testBackendConnection() {
  const baseUrl = process.env.REACT_APP_API_URL;
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    if (response.ok) {
      console.log('✅ Backend connected:', baseUrl);
      return true;
    } else {
      console.error('❌ Backend returned error:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
}

// Call on app init
testBackendConnection();
```

### CORS Configuration

**Backend (NestJS main.ts):**
```typescript
app.enableCors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true,
});
```

**Frontend (.env):**
```env
REACT_APP_API_URL=http://localhost:3000
```

### Token Inspection

**Verify Token Storage:**
```typescript
// In browser console
console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Refresh Token:', localStorage.getItem('refreshToken'));

// Decode JWT (using jwt-decode)
import jwtDecode from 'jwt-decode';
const decoded = jwtDecode(localStorage.getItem('accessToken'));
console.log('Token payload:', decoded);
```

---

## 🧪 Test Automatizzati (Vitest)

### Setup Test Environment

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/', 'examples/'],
    },
  },
});
```

### Test useAuth Hook

**useAuth.test.ts:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createUseAuth } from '@ciscode/ui-authentication-kit';

describe('useAuth', () => {
  let useAuth: ReturnType<typeof createUseAuth>;

  beforeEach(() => {
    useAuth = createUseAuth({
      baseUrl: 'http://localhost:3000',
      autoRefresh: false, // Disable for tests
    });
  });

  it('should start unauthenticated', () => {
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password',
      });
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it('should handle login errors', async () => {
    const { result } = renderHook(() => useAuth());
    
    await act(async () => {
      try {
        await result.current.login({
          email: 'wrong@example.com',
          password: 'wrongpassword',
        });
      } catch (err) {
        // Expected to fail
      }
    });
    
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeDefined();
  });
});
```

### Run Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Open coverage report
open coverage/index.html
```

---

## 🚨 Troubleshooting

### ❌ Problema: CORS Error

**Causa**: Frontend e backend su porte diverse

**Soluzione (Backend):**
```typescript
// main.ts
app.enableCors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true,
});
```

### ❌ Problema: 401 Unauthorized

**Causa**: Token non inviato o scaduto

**Soluzione:**
```typescript
// Verifica token
console.log('Token:', localStorage.getItem('accessToken'));

// Usa refresh token
const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true, // Enable auto-refresh
});
```

### ❌ Problema: OAuth Redirect Loop

**Causa**: Callback URL non corretto

**Soluzione:**
```typescript
// Verifica URL di callback
const callbackUrl = `${window.location.origin}/oauth/google/callback`;
console.log('Callback URL:', callbackUrl);

// Backend deve matchare esattamente
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
```

### ❌ Problema: Token not refreshing

**Causa**: Auto-refresh disabilitato o refresh token scaduto

**Soluzione:**
```typescript
const useAuth = createUseAuth({
  baseUrl: 'http://localhost:3000',
  autoRefresh: true,
  refreshBeforeSeconds: 60, // Refresh 60s before expiry
});
```

### ❌ Problema: User object is null after login

**Causa**: Token non contiene user data

**Soluzione:**
```typescript
// Verifica payload del token
import jwtDecode from 'jwt-decode';
const token = localStorage.getItem('accessToken');
const payload = jwtDecode(token);
console.log('Token payload:', payload);

// Backend deve includere user data nel JWT
// payload: { sub: userId, email, roles, ... }
```

---

## 📊 Checklist Test Completi

### ✅ Hooks (useAuth)

- [ ] Login with email/password
- [ ] Register new user
- [ ] Logout
- [ ] Get current user profile
- [ ] Refresh access token (auto)
- [ ] Forgot password
- [ ] Reset password
- [ ] Error handling (401, 403, 500)

### ✅ OAuth Providers

- [ ] Google OAuth (web flow)
- [ ] Google OAuth (callback handling)
- [ ] Microsoft OAuth (web flow)
- [ ] Microsoft OAuth (callback handling)
- [ ] Facebook OAuth (web flow)
- [ ] Facebook OAuth (callback handling)

### ✅ UI Components

- [ ] Login form (validation, loading, errors)
- [ ] Register form (validation, loading, errors)
- [ ] OAuth buttons (redirect handling)
- [ ] Forgot password form
- [ ] Reset password form
- [ ] Protected routes (redirect to login)

### ✅ Integration

- [ ] Backend connection verified
- [ ] CORS configured correctly
- [ ] Tokens stored properly
- [ ] Token auto-refresh working
- [ ] Error messages displayed
- [ ] Success redirects working

---

## 📝 Examples Gallery

### Available Examples

```
examples/
├── MuiLoginForm.example.tsx        # Material-UI login
├── TailwindLoginForm.example.tsx   # Tailwind CSS login
├── AntDesignLogin.example.tsx      # Ant Design login
└── BasicReactLogin.example.tsx     # Plain React (no UI lib)
```

### Usage

```bash
# Copy example to your project
cp examples/MuiLoginForm.example.tsx src/components/LoginForm.tsx

# Install dependencies
npm install @mui/material @emotion/react @emotion/styled
```

---

## 🎯 Prossimi Passi

1. **Testare tutti i flow** con backend Auth Kit v1.5.0+
2. **Configurare OAuth providers** (Google, Microsoft, Facebook)
3. **Creare UI personalizzata** con il tuo design system
4. **Integrare in ComptAlEyes** frontend
5. **Deploy in staging** e test end-to-end

---

## 📚 Risorse

- **Backend**: @ciscode/authentication-kit [README](../../auth-kit/README.md)
- **API Docs**: Backend Swagger UI (`/api/docs`)
- **Examples**: `examples/` directory
- **Coverage Report**: Run `npm run test:coverage`

---

**Documento compilato da**: GitHub Copilot  
**Ultimo aggiornamento**: 4 Febbraio 2026  
**Auth Kit UI Version**: 1.0.4

