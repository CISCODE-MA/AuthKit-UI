// src/context/RbacContext.ts
import React from 'react';
import { useCan, useHasRole } from '../hooks/useAbility';

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
  if (!rule) return false;                    // no rule = no access

  if (rule.perms?.some(p => useCan(p)))           return true;
  if (rule.fallbackRoles?.some(r => useHasRole(r))) return true;
  return false;
}
