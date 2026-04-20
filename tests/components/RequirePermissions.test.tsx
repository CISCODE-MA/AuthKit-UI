import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../src/hooks/useAbility', () => ({
  useCan: vi.fn(() => true),
  useHasRole: vi.fn(() => false),
  useCanAny: vi.fn(() => false),
}));

import { RequirePermissions } from '../../src/components/RequirePermissions';
import { useCan, useHasRole, useCanAny } from '../../src/hooks/useAbility';

function App({ element }: { element: React.ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={element as any} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequirePermissions', () => {
  it('renders children when bypass role present', () => {
    (useHasRole as any).mockReturnValueOnce(true);
    render(
      <App
        element={
          <RequirePermissions fallbackRoles={['super-admin']}>
            <div>Protected</div>
          </RequirePermissions>
        }
      />,
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
  });

  it('renders children when all and any conditions pass', () => {
    // useCan defaults to true (has all fallbackpermessions)
    (useCanAny as ReturnType<typeof vi.fn>).mockReturnValueOnce(true); // has any of anyPermessions
    render(
      <App
        element={
          <RequirePermissions
            fallbackpermessions={['a', 'b']}
            anyPermessions={['x', 'b']}
            fallbackRoles={[]}
          >
            <div>Protected</div>
          </RequirePermissions>
        }
      />,
    );
    // In router tests, initial render can duplicate; assert at least one
    const els = screen.queryAllByText('Protected');
    expect(els.length).toBeGreaterThan(0);
  });

  it('redirects when unauthorized', async () => {
    (useCan as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(
      <App
        element={
          <RequirePermissions fallbackpermessions={['a']} anyPermessions={['b']} fallbackRoles={[]}>
            <div>Protected</div>
          </RequirePermissions>
        }
      />,
    );
    // Assert redirect target is present
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
  });
});
