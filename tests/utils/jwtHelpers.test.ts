import { describe, it, expect } from 'vitest';
import { decodeToken } from '../../src/utils/jwtHelpers';

function b64url(input: string) {
  const base64 = Buffer.from(input, 'utf-8').toString('base64');
  return base64.replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');
}

describe('jwtHelpers.decodeToken', () => {
  it('maps fields from token payload', () => {
    const payload = {
      sub: '123',
      email: 'user@example.com',
      roles: ['admin'],
      permissions: ['read'],
      modules: ['billing'],
      tenantId: 't1',
      iat: 0,
      exp: 9999999999,
    };
    const token = `${b64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${b64url(JSON.stringify(payload))}.sig`;
    const user = decodeToken(token);
    expect(user).toEqual({
      id: '123',
      email: 'user@example.com',
      roles: ['admin'],
      permissions: ['read'],
      modules: ['billing'],
      tenantId: 't1',
    });
  });

  it('applies defaults when fields missing', () => {
    const payload = { sub: 'x', iat: 0, exp: 1 };
    const token = `${b64url(JSON.stringify({ alg: 'none', typ: 'JWT' }))}.${b64url(JSON.stringify(payload))}.sig`;
    const user = decodeToken(token);
    expect(user).toEqual({
      id: 'x',
      email: '',
      roles: [],
      permissions: [],
      modules: [],
      tenantId: '',
    });
  });
});
