import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../src/hooks/useAbility', () => ({
  useCan: vi.fn(() => false),
  useHasRole: vi.fn(() => false),
}));

import { RbacProvider, useGrant } from '../../src/context/RbacContext';
import { useCan, useHasRole } from '../../src/hooks/useAbility';

function Probe({ feature, action }: { feature: string; action: string }) {
  const allowed = useGrant(feature, action);
  return <div data-testid={`${feature}-${action}`}>{String(allowed)}</div>;
}

describe('RbacContext useGrant', () => {
  const table = {
    users: {
      view: { perms: ['user.view'] },
      delete: { fallbackRoles: ['super-admin'] },
    },
  };

  it('returns false when no rule exists', () => {
    render(
      <RbacProvider value={{}}>
        <Probe feature="unknown" action="none" />
      </RbacProvider>
    );
    expect(screen.getByTestId('unknown-none').textContent).toBe('false');
  });

  it('grants by permissions when useCan returns true', () => {
    (useCan as any).mockReturnValueOnce(true);
    render(
      <RbacProvider value={table}>
        <Probe feature="users" action="view" />
      </RbacProvider>
    );
    expect(screen.getByTestId('users-view').textContent).toBe('true');
  });

  it('grants by fallback roles when useHasRole returns true', () => {
    (useHasRole as any).mockReturnValueOnce(true);
    render(
      <RbacProvider value={table}>
        <Probe feature="users" action="delete" />
      </RbacProvider>
    );
    expect(screen.getByTestId('users-delete').textContent).toBe('true');
  });
});
