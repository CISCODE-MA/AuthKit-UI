// src/components/auth/RequirePermissions.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useHasRole, useCan, useCanAny } from '../hooks/useAbility';

interface Props {
    /** list of permissions; *every* one must be present  */
    fallbackpermessions?: string[];
    /** at least one of these must be present (optional)  */
    anyPermessions?: string[];
    /** role(s) that always bypass the check (optional)   */
    fallbackRoles: string[];
    /** where to redirect  ("/dashboard" by default)      */
    redirectTo?: string;
    children: React.ReactNode;
}

export const RequirePermissions: React.FC<Props> = ({
    children,
    fallbackpermessions = [],
    anyPermessions = [],
    fallbackRoles = ['super-admin'],
    redirectTo = '/dashboard',
}) => {
    /* all hooks called unconditionally at the top */
    const hasBypass = useHasRole(...fallbackRoles);
    const hasAll    = useCan(...fallbackpermessions);
    const hasSome   = useCanAny(...anyPermessions);

    /* 1. super‑admin bypass */
    if (hasBypass) return <>{children}</>;

    /* 2. must have *all* fallback perms (vacuous true if empty) */
    /* 3. must have *any* of anyPermessions (vacuous true if empty) */
    if (
      (fallbackpermessions.length === 0 || hasAll) &&
      (anyPermessions.length === 0 || hasSome)
    ) {
        return <>{children}</>;
    }

    /* 4. no access ⇒ redirect */
    return <Navigate to={redirectTo} replace />;
};
