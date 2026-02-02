// src/components/auth/RequirePermissions.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';            // or useNavigate()
import { useCan, useHasRole } from '../hooks/useAbility'; // your hooks

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

    /* 1. super‑admin bypass */
    const hasBypass = fallbackRoles.some(r => useHasRole(r));
    if (hasBypass) return <>{children}</>;

    /* 2. must have *all*  */
    const hasAll = fallbackpermessions.length === 0 || fallbackpermessions.every(p => useCan(p));

    /* 3. must have *any*  */
    const hasSome = anyPermessions.length === 0 || anyPermessions.some(p => useCan(p));

    if (hasAll && hasSome) {
        return <>{children}</>;
    }

    /* 4. no access => either redirect or render a 403 page  */
    return <Navigate to={redirectTo} replace />;
};
