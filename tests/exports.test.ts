/**
 * Smoke test: importing from the package entry point covers
 * src/index.ts and src/main/app.ts re-export lines.
 */
import { describe, it, expect } from 'vitest';

import {
  AuthProvider,
  useAuthState,
  useHasRole,
  useHasModule,
  useCan,
  RequirePermissions,
  RbacContext,
  RbacProvider,
  useGrant,
} from '../src/main/app';

import { ProfilePage } from '../src/components/ProfilePage';

describe('package exports', () => {
  it('exports all expected symbols from main/app', () => {
    expect(AuthProvider).toBeDefined();
    expect(useAuthState).toBeDefined();
    expect(useHasRole).toBeDefined();
    expect(useHasModule).toBeDefined();
    expect(useCan).toBeDefined();
    expect(RequirePermissions).toBeDefined();
    expect(RbacContext).toBeDefined();
    expect(RbacProvider).toBeDefined();
    expect(useGrant).toBeDefined();
  });

  it('exports ProfilePage from components', () => {
    expect(ProfilePage).toBeDefined();
  });
});
