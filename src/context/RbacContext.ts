// src/context/RbacContext.ts
import React from 'react';
import { useCanAny, useHasRole } from '../hooks/useAbility';

/** A single rule */
export interface RbacRule {
  perms?: string[];
  fallbackRoles?: string[];
}

/** Arbitrary nesting: feature‑key ➜ action ➜ rule */
export type RbacTable = Record<string, Record<string, RbacRule>>;

/* empty default so the library still renders in Storybook / tests */
export const RbacContext = React.createContext<RbacTable>({});

/* provider re‑export – host app supplies the actual table */
export const RbacProvider = RbacContext.Provider;

/* helper hook that libraries call */
export function useGrant(feature: string, action: string) {
  const table = React.useContext(RbacContext);
  const rule  = table[feature]?.[action];

  // Hooks must be called unconditionally before any early return
  const canByPerm = useCanAny(...(rule?.perms ?? []));
  const canByRole = useHasRole(...(rule?.fallbackRoles ?? []));

  if (!rule) return false;
  if (canByPerm) return true;
  if (canByRole) return true;
  return false;
}
