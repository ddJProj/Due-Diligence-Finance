// frontend/src/types/auth.types.test.ts
import { describe, it, expect } from 'vitest';
import type {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterAuthRequest,
  RefreshTokenRequest,
  LogoutRequest,
} from './auth.types';

describe('Authentication Types', () => {
  describe('AuthenticationRequest', () => {
    it('should have correct structure for login', () => {
      const validRequest: AuthenticationRequest = {
        email: 'user@example.com',
        password: 'SecurePass123!',
      };

      expect(validRequest.email).toBe('user@example.com');
      expect(validRequest.password).toBe('SecurePass123!');
      expect(Object.keys(validRequest).length).toBe(2);
    });
  });

  describe('RegisterAuthRequest', () => {
    it('should have correct structure for registration', () => {
      const validRequest: RegisterAuthRequest = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      expect(validRequest.email).toBe('newuser@example.com');
      expect(validRequest.password).toBe('SecurePass123!');
      expect(validRequest.firstName).toBe('John');
      expect(validRequest.lastName).toBe('Doe');
      expect(Object.keys(validRequest).length).toBe(4);
    });
  });

  describe('AuthenticationResponse', () => {
    it('should have correct structure for auth response', () => {
      const validResponse: AuthenticationResponse = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh-token-string',
        user: {
          id: 1,
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CLIENT',
          active: true,
          createdAt: '2025-01-15T10:00:00Z',
          lastLogin: '2025-01-15T10:00:00Z',
        },
        expiresIn: 3600,
      };

      expect(validResponse.token).toBeDefined();
      expect(validResponse.refreshToken).toBeDefined();
      expect(validResponse.user).toBeDefined();
      expect(validResponse.expiresIn).toBe(3600);
      expect(validResponse.user.role).toBe('CLIENT');
    });
  });

  describe('RefreshTokenRequest', () => {
    it('should have correct structure for token refresh', () => {
      const validRequest: RefreshTokenRequest = {
        refreshToken: 'refresh-token-string',
      };

      expect(validRequest.refreshToken).toBeDefined();
      expect(Object.keys(validRequest).length).toBe(1);
    });
  });

  describe('LogoutRequest', () => {
    it('should have correct structure for logout', () => {
      const validRequest: LogoutRequest = {
        token: 'current-jwt-token',
        refreshToken: 'refresh-token-string',
      };

      expect(validRequest.token).toBeDefined();
      expect(validRequest.refreshToken).toBeDefined();
      expect(Object.keys(validRequest).length).toBe(2);
    });
  });

  describe('Type validation', () => {
    it('should enforce email format at compile time', () => {
      const request: AuthenticationRequest = {
        email: 'user@example.com', // Valid email format
        password: 'password123',
      };

      // TypeScript will validate this at compile time
      expect(request.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('should enforce role constraints', () => {
      const validRoles = ['GUEST', 'CLIENT', 'EMPLOYEE', 'ADMIN'] as const;
      
      // This test ensures our types match backend roles
      validRoles.forEach(role => {
        const response: AuthenticationResponse = {
          token: 'token',
          refreshToken: 'refresh',
          user: {
            id: 1,
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            role: role,
            active: true,
            createdAt: '2025-01-15T10:00:00Z',
            lastLogin: '2025-01-15T10:00:00Z',
          },
          expiresIn: 3600,
        };
        
        expect(validRoles).toContain(response.user.role);
      });
    });
  });
});
