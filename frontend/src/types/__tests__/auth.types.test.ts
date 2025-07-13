import { describe, it, expect } from 'vitest';
import type {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterAuthRequest,
  TokenRefreshRequest,
  UserAccountDTO,
  Role,
  Permission
} from '../auth.types';

describe('Authentication Types', () => {
  describe('AuthenticationRequest', () => {
    it('should have correct structure for login', () => {
      const loginRequest: AuthenticationRequest = {
        email: 'test@example.com',
        password: 'password123'
      };

      expect(loginRequest.email).toBeDefined();
      expect(loginRequest.password).toBeDefined();
    });
  });

  describe('RegisterAuthRequest', () => {
    it('should have correct structure for registration', () => {
      const registerRequest: RegisterAuthRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'securePassword123'
      };

      expect(registerRequest.firstName).toBeDefined();
      expect(registerRequest.lastName).toBeDefined();
      expect(registerRequest.email).toBeDefined();
      expect(registerRequest.password).toBeDefined();
    });
  });

  describe('AuthenticationResponse', () => {
    it('should have correct structure for auth response', () => {
      const authResponse: AuthenticationResponse = {
        token: 'jwt.token.here',
        refreshToken: 'refresh.token.here',
        type: 'Bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CLIENT' as Role,
          permissions: new Set(['READ_OWN_PORTFOLIO', 'UPDATE_OWN_PROFILE'])
        }
      };

      expect(authResponse.token).toBeDefined();
      expect(authResponse.refreshToken).toBeDefined();
      expect(authResponse.type).toBe('Bearer');
      expect(authResponse.user).toBeDefined();
      expect(authResponse.user.role).toBe('CLIENT');
    });
  });

  describe('Role Enum', () => {
    it('should have all required roles', () => {
      const validRoles: Role[] = ['GUEST', 'CLIENT', 'EMPLOYEE', 'ADMIN'];
      
      validRoles.forEach(role => {
        expect(['GUEST', 'CLIENT', 'EMPLOYEE', 'ADMIN']).toContain(role);
      });
    });
  });

  describe('UserAccountDTO', () => {
    it('should not include password field', () => {
      const user: UserAccountDTO = {
        id: 1,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT' as Role,
        permissions: new Set(['READ_OWN_PORTFOLIO'])
      };

      // TypeScript should prevent password from being added
      // @ts-expect-error - password should not exist on UserAccountDTO
      expect(user.password).toBeUndefined();
    });
  });
});
