import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthConfigContext, useAuthConfig } from '../../src/context/AuthConfigContext';

function OutsideConsumer() {
  useAuthConfig();
  return null;
}

function InsideConsumer() {
  const cfg = useAuthConfig();
  return <div data-testid="baseUrl">{cfg.baseUrl}</div>;
}

describe('AuthConfigContext', () => {
  const config = {
    baseUrl: 'https://api.example.com',
    colors: { primary: '#00f' },
  } as any;

  it('throws when used outside provider', () => {
    expect(() => render(<OutsideConsumer />)).toThrowError(/useAuthConfig must be used within an AuthConfigProvider/);
  });

  it('provides config inside provider', () => {
    render(
      <AuthConfigContext.Provider value={config}>
        <InsideConsumer />
      </AuthConfigContext.Provider>
    );
    expect(screen.getByTestId('baseUrl').textContent).toBe('https://api.example.com');
  });
});
