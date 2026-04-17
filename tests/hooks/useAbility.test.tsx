import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthStateCtx } from '../../src/context/AuthStateContext';
import { useHasRole, useHasModule, useCan } from '../../src/hooks/useAbility';

function Probe() {
  const hasRole = useHasRole('admin', 'editor');
  const hasBilling = useHasModule('billing');
  const canAll = useCan('perm.read', 'perm.write');
  const canAllFail = useCan('perm.read', 'perm.delete');
  return (
    <div>
      <span data-testid="hasRole">{String(hasRole)}</span>
      <span data-testid="hasBilling">{String(hasBilling)}</span>
      <span data-testid="canAll">{String(canAll)}</span>
      <span data-testid="canAllFail">{String(canAllFail)}</span>
    </div>
  );
}

describe('useAbility hooks', () => {
  const value = {
    isAuthenticated: true,
    user: {
      id: 'u1',
      email: 'a@b.com',
      roles: ['admin'],
      permissions: ['perm.read', 'perm.write'],
      modules: ['billing'],
      tenantId: 't1',
    },
    accessToken: 'tok',
    api: {} as any,
    login: async () => {},
    logout: () => {},
    setUser: () => {},
  };

  it('evaluates roles, modules, and permissions correctly', () => {
    render(
      <AuthStateCtx.Provider value={value}>
        <Probe />
      </AuthStateCtx.Provider>
    );

    expect(screen.getByTestId('hasRole').textContent).toBe('true');
    expect(screen.getByTestId('hasBilling').textContent).toBe('true');
    expect(screen.getByTestId('canAll').textContent).toBe('true');
    expect(screen.getByTestId('canAllFail').textContent).toBe('false');
  });

  it('handles missing user gracefully', () => {
    render(
      <AuthStateCtx.Provider value={{ ...value, user: null }}>
        <Probe />
      </AuthStateCtx.Provider>
    );

    const hasRoleEls = screen.getAllByTestId('hasRole');
    const hasBillingEls = screen.getAllByTestId('hasBilling');
    const canAllEls = screen.getAllByTestId('canAll');
    expect(hasRoleEls.at(-1)?.textContent).toBe('false');
    expect(hasBillingEls.at(-1)?.textContent).toBe('false');
    expect(canAllEls.at(-1)?.textContent).toBe('false');
  });
});
