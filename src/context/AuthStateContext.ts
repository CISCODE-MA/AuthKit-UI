import { createContext, useContext } from 'react';
import { UserProfile } from '../models/User';
import { AxiosInstance } from 'axios';

export interface AuthCtx {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  api: AxiosInstance;
  login(credentials: { email: string; password: string }): Promise<void>;
  logout(): void;
  setUser(user: UserProfile | null): void;
}

export const AuthStateCtx = createContext<AuthCtx | null>(null);

export function useAuthState(): AuthCtx {
  const ctx = useContext(AuthStateCtx);
  if (!ctx) throw new Error('useAuthState must be inside <AuthProvider>');
  return ctx;
}