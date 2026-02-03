import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { AuthConfigContext } from '../context/AuthConfigContext';
import { AuthStateCtx, useAuthState } from '../context/AuthStateContext';

import type { AuthConfigProps } from '../models/AuthConfig';
import type { UserProfile } from '../models/User';

import { decodeToken } from '../utils/jwtHelpers';
import { attachAuthInterceptor, resetSessionFlag } from '../utils/attachAuthInterceptor';
import { SessionExpiredModal } from '../components/SessionExpiredModal';
import { SignInPage } from '../pages/auth/SignInPage';
import { SignUpPage } from '../pages/auth/SignUpPage';
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router";
import { GoogleCallbackPage } from "../pages/auth/GoogleCallbackPage";
import { createUseAuth } from '../hooks/useAuth';

interface Props {
  config: AuthConfigProps;
  children: React.ReactNode;
}

/* ---------- tiny in-file route guard ----------------------- */
const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuthState();
  const location = useLocation();
  return isAuthenticated
    ? children
    : <Navigate to="/login" state={{ from: location }} replace />;
};
/* ----------------------------------------------------------- */

export const AuthProvider: React.FC<Props> = ({ config, children }) => {
  const navigate = useNavigate();

  /* ── New auth hook (foundation layer) ──────────────────── */
  const useAuthHook = useMemo(
    () => createUseAuth({
      baseUrl: config.baseUrl || '',
      autoRefresh: true,
      refreshBeforeSeconds: 60,
    }),
    [config.baseUrl]
  );
  const auth = useAuthHook();

  /* ── Legacy state (for backward compatibility) ─────────── */
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('authToken')
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [expired, setExpired] = useState(false);

  /* ── Sync new auth state with legacy state ─────────────── */
  useEffect(() => {
    if (auth.user && auth.accessToken) {
      setAccessToken(auth.accessToken);
      setUser(auth.user as UserProfile);
    } else {
      setAccessToken(null);
      setUser(null);
    }
    setBooting(false);
  }, [auth.user, auth.accessToken]);

  /* ── Google OAuth callback component (inside AuthProvider so it can touch state) ── */
  const GoogleOAuthCallback: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const tokenFromQuery = params.get('accessToken');

      if (tokenFromQuery) {
        // Store token in localStorage for useAuth hook to pick up
        localStorage.setItem('authToken', tokenFromQuery);
        localStorage.setItem('refreshToken', params.get('refreshToken') || '');
        resetSessionFlag();
      } else {
        console.error("No accessToken found in Google OAuth callback URL.");
      }

      const redirectPath = sessionStorage.getItem('postLoginRedirect') || '/';
      sessionStorage.removeItem('postLoginRedirect');

      // Force re-render by reloading (useAuth will pick up tokens)
      window.location.href = redirectPath;
    }, [location.search]);

    // No UI needed; this route just processes the tokens then redirects.
    return null;
  };

  /* ── hard logout ───────────────────────────────────────── */
  async function hardLogout() {
    await auth.logout();
    setExpired(false);
    navigate('/login', { replace: true });
  }

  /* ── axios + interceptor ───────────────────────────────── */
  const api = useMemo(() => {
    const client = axios.create({
      baseURL: config.baseUrl,
      withCredentials: true,
    });

    // Use new auth system's token
    if (auth.accessToken) {
      client.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`;
    }

    attachAuthInterceptor(client, {
      baseUrl: config.baseUrl,
      getAccessToken: () => auth.accessToken,
      setAccessToken: () => {}, // Token managed by useAuth hook
      logout: () => setExpired(true),
    });

    return client;
  }, [config.baseUrl, auth.accessToken]);

  /* ── bootstrap (no longer needed, handled by useAuth) ─── */
  // Removed: useAuth hook handles auto-refresh internally

  /* ── manual login (email/password client login) ────────── */
  async function login(credentials: { email: string; password: string }) {
    await auth.login(credentials);
    resetSessionFlag();
    navigate('/', { replace: true });
  }

  const ctx = useMemo(
    () => ({
      isAuthenticated: !!accessToken,
      accessToken,
      user,
      login,
      logout: hardLogout,
      api,
      setUser,
    }),
    [accessToken, user, api]
  );

  // Optional boot screen
  // if (booting) {
  //   return <div className="fixed inset-0 bg-white" />;
  // }

  return (
    <AuthConfigContext.Provider value={config}>
      <AuthStateCtx.Provider value={ctx}>
        <Routes>
          {/* public login route */}
          <Route
            path="login"
            element={
              accessToken
                ? <Navigate to="/" replace />
                : <SignInPage baseUrl={config.baseUrl} colors={config.colors} />
            }
          />

          {/* public signup route */}
          <Route
            path="signup"
            element={
              accessToken ? <Navigate to="/" replace /> : <SignUpPage />
            }
          />

          {/* Google OAuth callback route */}
          <Route
            path="oauth/google/callback"
            element={<GoogleCallbackPage  />}
          />

          {/* Microsoft OAuth callback route */}
          <Route 
            path="/oauth/microsoft/callback"
            element={<GoogleCallbackPage />} 
          />

          {/* everything else protected */}
          <Route
            path="*"
            element={<RequireAuth>{children as JSX.Element}</RequireAuth>}
          />
        </Routes>

        {expired && <SessionExpiredModal onConfirm={hardLogout} />}
      </AuthStateCtx.Provider>
    </AuthConfigContext.Provider>
  );
};