import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthState, AuthStateCtx } from '../../src/context/AuthStateContext';

function OutsideConsumer() {
  // Will throw when rendered outside Provider
  useAuthState();
  return null;
}

function InsideConsumer() {
  const ctx = useAuthState();
  return <div data-testid="isAuth">{String(ctx.isAuthenticated)}</div>;
}

describe('AuthStateContext', () => {
  const value = {
    isAuthenticated: true,
    user: null,
    accessToken: 'tok',
    api: {} as any,
    login: async () => {},
    logout: () => {},
    setUser: () => {},
  };

  it('throws when used outside provider', () => {
    expect(() => render(<OutsideConsumer />)).toThrowError(/useAuthState must be inside <AuthProvider>/);
  });

  it('provides context values when inside provider', () => {
    render(
      <AuthStateCtx.Provider value={value}>
        <InsideConsumer />
      </AuthStateCtx.Provider>
    );
    expect(screen.getByTestId('isAuth').textContent).toBe('true');
  });
});
