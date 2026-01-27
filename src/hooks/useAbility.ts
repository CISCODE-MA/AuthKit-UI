// src/hooks/useAbility.ts
import { useAuthState } from "../context/AuthStateContext";

export function useHasRole(...roles: string[]) {
  const { user } = useAuthState();
  const userRoles = user?.roles ?? [];
  return roles.some(r => userRoles.includes(r));
}

export function useHasModule(moduleName: string) {
  const { user } = useAuthState();
  return user?.modules.includes(moduleName) ?? false;
}

/**
 * Generic permission checker. Accepts one or many permissions.
 * Returns true if *every* permission is present.
 */
export function useCan(...needed: string[]) {
  const { user } = useAuthState();
  const perms = user?.permissions ?? [];
  return needed.every(p => perms.includes(p));
}
