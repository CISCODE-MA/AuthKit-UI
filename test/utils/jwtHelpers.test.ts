/**
 * JWT Helpers Tests
 * Tests for JWT utility functions (legacy - used by AuthProvider)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { decodeToken } from '../../src/utils/jwtHelpers';

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(),
}));

import { jwtDecode } from 'jwt-decode';

describe('jwtHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('decodeToken', () => {
    it('should decode valid JWT token', () => {
      const mockDecodedJwt = {
        sub: '123',
        exp: 1234567890,
        iat: 1234567890,
        email: 'test@example.com',
        roles: ['user', 'admin'],
        permissions: ['read:profile', 'write:profile'],
        modules: ['module1'],
        tenantId: 'tenant-123',
      };

      vi.mocked(jwtDecode).mockReturnValueOnce(mockDecodedJwt);

      const result = decodeToken('mock-jwt-token');

      expect(result).toEqual({
        id: '123',
        email: 'test@example.com',
        roles: ['user', 'admin'],
        permissions: ['read:profile', 'write:profile'],
        modules: ['module1'],
        tenantId: 'tenant-123',
      });
    });

    it('should handle JWT without optional fields', () => {
      const mockDecodedJwt = {
        sub: '456',
        exp: 1234567890,
        iat: 1234567890,
      };

      vi.mocked(jwtDecode).mockReturnValueOnce(mockDecodedJwt);

      const result = decodeToken('mock-jwt-token');

      expect(result).toEqual({
        id: '456',
        email: '',
        roles: [],
        permissions: [],
        modules: [],
        tenantId: '',
      });
    });

    it('should handle JWT with partial fields', () => {
      const mockDecodedJwt = {
        sub: '789',
        exp: 1234567890,
        iat: 1234567890,
        email: 'partial@example.com',
        roles: ['user'],
      };

      vi.mocked(jwtDecode).mockReturnValueOnce(mockDecodedJwt);

      const result = decodeToken('mock-jwt-token');

      expect(result).toEqual({
        id: '789',
        email: 'partial@example.com',
        roles: ['user'],
        permissions: [],
        modules: [],
        tenantId: '',
      });
    });

    it('should call jwtDecode with the token', () => {
      const token = 'test-jwt-token';
      const mockDecodedJwt = {
        sub: '123',
        exp: 1234567890,
        iat: 1234567890,
      };

      vi.mocked(jwtDecode).mockReturnValueOnce(mockDecodedJwt);

      decodeToken(token);

      expect(jwtDecode).toHaveBeenCalledWith(token);
    });
  });
});
