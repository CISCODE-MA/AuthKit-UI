import { jwtDecode } from 'jwt-decode';
import type { UserProfile } from '../models/User';

interface RawJwt {
  sub: string;
  exp: number;
  iat: number;
  email?: string;
  roles?: string[];
  permissions?: string[];
  modules?: string[];
  tenantId?: string;
}

export function decodeToken(token: string): UserProfile {
  const d = jwtDecode<RawJwt>(token);
  return {
    id:          d.sub,
    email:       d.email ?? '',
    roles:       d.roles ?? [],
    permissions: d.permissions ?? [],
    modules:     d.modules ?? [],
    tenantId:    d.tenantId ?? '',
  };
}
