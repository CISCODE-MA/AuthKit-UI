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
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { GoogleCallbackPage } from "../pages/auth/GoogleCallbackPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";

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

  /* ── state ─────────────────────────────────────────────── */
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('authToken')
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [booting, setBooting] = useState(true);
  const [expired, setExpired] = useState(false);

  /* ── Google OAuth callback component (inside AuthProvider so it can touch state) ── */
  const GoogleOAuthCallback: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
      const params = new URLSearchParams(location.search);
      const tokenFromQuery = params.get('accessToken');

      if (tokenFromQuery) {
        try {
          setAccessToken(tokenFromQuery);
          setUser(decodeToken(tokenFromQuery));
          localStorage.setItem('authToken', tokenFromQuery);
          resetSessionFlag();
        } catch (e) {
          console.error("Failed to decode or store Google access token:", e);
        }
      } else {
        console.error("No accessToken found in Google OAuth callback URL.");
      }

      const redirectPath = sessionStorage.getItem('postLoginRedirect') || '/';
      sessionStorage.removeItem('postLoginRedirect');

      navigate(redirectPath, { replace: true });
    }, [location.search, navigate]);

    // No UI needed; this route just processes the tokens then redirects.
    return null;
  };

  /* ── hard logout ───────────────────────────────────────── */
  async function hardLogout() {
    try {
      // Ask backend to clear the HttpOnly refreshToken cookie
      await api.post('/auth/logout');
    } catch (e) {
      // Even if backend call fails, still clear local session
      console.warn('Logout endpoint failed, proceeding with local logout:', e);
    }
  
    setAccessToken(null);
    setUser(null);
  
    localStorage.removeItem('authToken');
    sessionStorage.clear();
  
    setExpired(false);
    navigate('/login', { replace: true });
  }

  /* ── axios + interceptor ───────────────────────────────── */
  const api = useMemo(() => {
    const client = axios.create({
      baseURL: config.baseUrl,
      withCredentials: true,
    });

    attachAuthInterceptor(client, {
      baseUrl: config.baseUrl,
      getAccessToken: () => accessToken,
      setAccessToken: t => setAccessToken(t),
      logout: () => setExpired(true),
    });

    return client;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.baseUrl, accessToken]);

  /* ── bootstrap (localStorage → refresh) ────────────────── */
  useEffect(() => {
    const init = async () => {
      if (accessToken) {
        setUser(decodeToken(accessToken));
        setBooting(false);
        return;
      }

      try {
        const { data } = await axios.post(
          `${config.baseUrl}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.accessToken);
        setUser(decodeToken(data.accessToken));
        localStorage.setItem('authToken', data.accessToken);
      } catch {
        /* no valid refresh cookie – remain logged-out */
      } finally {
        setBooting(false);
      }
    };
    init();
  }, [accessToken, config.baseUrl]);

  /* ── manual login (email/password client login) ────────── */
  async function login(credentials: { email: string; password: string }) {
    const { data } = await api.post('/api/auth/login', credentials);
    setAccessToken(data.accessToken);
    setUser(decodeToken(data.accessToken));
    localStorage.setItem('authToken', data.accessToken);
    resetSessionFlag();

    // NOTE: this previously tried to use `location.state.from`
    // but `location` here is the global, not React Router's.
    // For simplicity we send the user to "/" after manual login.
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

          {/* public forgot/reset password routes */}
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />

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