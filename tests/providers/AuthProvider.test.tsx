import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

// Mock translator to return keys or defaults for stable assertions
vi.mock('@ciscode/ui-translate-core', () => ({
  useT: () => ((key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? key),
}));

// Mock JWT decode to avoid requiring real tokens
vi.mock('../../src/utils/jwtHelpers', () => ({
  decodeToken: () => ({ id: 'u', email: '', roles: [], permissions: [], modules: [], tenantId: '' }),
}));

import axios from 'axios';
import { AuthProvider } from '../../src/providers/AuthProvider';

const config = {
  baseUrl: 'https://api.example.com',
  colors: { bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-500' },
};

function renderWithRouter(initialPath: string, children: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      {/* AuthProvider manages its own nested <Routes /> */}
      <Routes>
        <Route path="/*" element={<AuthProvider config={config}>{children}</AuthProvider>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AuthProvider routing', () => {
  it('shows SignInPage on /login when not authenticated', () => {
    localStorage.removeItem('authToken');
    // Avoid network errors from bootstrap refresh attempt
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('no refresh in tests'));
    renderWithRouter('/login', <div data-testid="protected">Protected</div>);
    // The SignInPage renders a heading using t("SignInPage.signIn")
    expect(screen.getAllByText('SignInPage.signIn').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('redirects from /login to / when already authenticated', () => {
    localStorage.setItem('authToken', 'dummy-token');
    // Prevent bootstrap network calls
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { accessToken: 'tok' } } as any);
    renderWithRouter('/login', <div data-testid="protected">Protected</div>);
    // When token exists, login route navigates to "/" and protected children render via catch-all route
    expect(screen.getByTestId('protected')).toBeInTheDocument();
  });

  it('redirects /protected to /login when not authenticated', () => {
    localStorage.removeItem('authToken');
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('no refresh in tests'));
    renderWithRouter('/protected', <div data-testid="protected">Protected</div>);
    // After RequireAuth, user should be on login screen
    expect(screen.getAllByText('SignInPage.signIn').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });
});
