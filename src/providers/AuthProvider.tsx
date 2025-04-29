import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

import { AuthConfigContext } from '../context/AuthConfigContext';
import { AuthStateCtx }       from '../context/AuthStateContext';

import type { AuthConfig }  from '../models/AuthConfig';
import type { UserProfile } from '../models/User';

import { decodeToken }           from '../utils/jwtHelpers';
import { attachAuthInterceptor, resetSessionFlag } from '../utils/attachAuthInterceptor';
import { SessionExpiredModal }   from '../components/SessionExpiredModal';
import { SignInPage }            from '../pages/auth/SignInPage';

interface Props {
  config: AuthConfig;
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ config, children }) => {
  /* ── state ─────────────────────────────────────────────── */
  const [accessToken, setAccessToken] = useState<string | null>(
    () => localStorage.getItem('authToken')
  );
  const [user,     setUser]   = useState<UserProfile | null>(null);
  const [booting,  setBooting] = useState(true);
  const [expired,  setExpired] = useState(false);

  /* ── hard logout ───────────────────────────────────────── */
  function hardLogout() {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    setExpired(false);
    resetSessionFlag();
  }

  /* ── axios + interceptor ───────────────────────────────── */
  const api = useMemo(() => {
    const client = axios.create({
      baseURL:        config.baseUrl,
      withCredentials: true,
    });

    attachAuthInterceptor(client, {
      baseUrl:        config.baseUrl,
      getAccessToken: () => accessToken,
      setAccessToken: t => setAccessToken(t),
      logout:         () => setExpired(true),
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

  /* ── manual login ──────────────────────────────────────── */
  async function login(credentials: { email: string; password: string }) {
    const { data } = await api.post('/auth/login', credentials);
    setAccessToken(data.accessToken);
    setUser(decodeToken(data.accessToken));
    localStorage.setItem('authToken', data.accessToken);
  }

  const ctx = useMemo(() => ({
    isAuthenticated: !!accessToken,
    accessToken,
    user,
    login,
    logout: hardLogout,
    api,
  }), [accessToken, user, api]);

  /* ── render ────────────────────────────────────────────── */
  if (booting) {
    return <div className="fixed inset-0 bg-white" />;
  }

  return (
    <AuthConfigContext.Provider value={config}>
      <AuthStateCtx.Provider value={ctx}>
        {ctx.isAuthenticated ? children : <SignInPage />}
        {expired && <SessionExpiredModal onConfirm={hardLogout} />}
      </AuthStateCtx.Provider>
    </AuthConfigContext.Provider>
  );
};
