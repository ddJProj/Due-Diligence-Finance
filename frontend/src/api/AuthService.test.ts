// frontend/src/api/AuthService.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError } from 'axios';
import { AuthService } from './AuthService';
import { apiClient, setAuthToken, clearAuthToken } from './apiClient';
import {
  AuthenticationRequest,
  RegisterAuthRequest,
  AuthenticationResponse,
  RefreshTokenRequest,
  LogoutRequest,
} from '@/types';

// Mock the apiClient module
vi.mock('./apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
  setAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = AuthService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('login', () => {
    it('should successfully login and set auth token', async () => {
      const credentials: AuthenticationRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthenticationResponse = {
        token: 'jwt-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+1234567890',
          role: 'CLIENT',
          emailVerified: true,
          active: true,
          createdDate: '2025-01-15T10:00:00Z',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(setAuthToken).toHaveBeenCalledWith('jwt-token-123');
      expect(result).toEqual(mockResponse);
    });

    it('should handle login errors', async () => {
      const credentials: AuthenticationRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error: AxiosError = {
        response: {
          status: 401,
          data: { message: 'Invalid credentials' },
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Unauthorized',
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(authService.login(credentials)).rejects.toThrow();
      expect(setAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registrationData: RegisterAuthRequest = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'New',
        lastName: 'User',
        phoneNumber: '+1234567890',
      };

      const mockResponse: AuthenticationResponse = {
        token: 'jwt-token-new',
        refreshToken: 'refresh-token-new',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: {
          id: 2,
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          phoneNumber: '+1234567890',
          role: 'GUEST',
          emailVerified: false,
          active: true,
          createdDate: '2025-01-15T11:00:00Z',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.register(registrationData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registrationData);
      expect(setAuthToken).toHaveBeenCalledWith('jwt-token-new');
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration errors', async () => {
      const registrationData: RegisterAuthRequest = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Existing',
        lastName: 'User',
      };

      const error: AxiosError = {
        response: {
          status: 409,
          data: { message: 'Email already exists' },
          statusText: 'Conflict',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Conflict',
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(authService.register(registrationData)).rejects.toThrow();
      expect(setAuthToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout and clear auth token', async () => {
      const logoutData: LogoutRequest = {
        refreshToken: 'refresh-token-123',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: {} });

      await authService.logout(logoutData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', logoutData);
      expect(clearAuthToken).toHaveBeenCalled();
    });

    it('should clear auth token even if logout request fails', async () => {
      const logoutData: LogoutRequest = {
        refreshToken: 'refresh-token-123',
      };

      const error = new Error('Network error');
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await authService.logout(logoutData);

      expect(clearAuthToken).toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh auth token', async () => {
      const refreshData: RefreshTokenRequest = {
        refreshToken: 'old-refresh-token',
      };

      const mockResponse: AuthenticationResponse = {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+1234567890',
          role: 'CLIENT',
          emailVerified: true,
          active: true,
          createdDate: '2025-01-15T10:00:00Z',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await authService.refreshToken(refreshData);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', refreshData);
      expect(setAuthToken).toHaveBeenCalledWith('new-jwt-token');
      expect(result).toEqual(mockResponse);
    });

    it('should handle refresh token errors', async () => {
      const refreshData: RefreshTokenRequest = {
        refreshToken: 'invalid-refresh-token',
      };

      const error: AxiosError = {
        response: {
          status: 401,
          data: { message: 'Invalid refresh token' },
          statusText: 'Unauthorized',
          headers: {},
          config: {} as any,
        },
        config: {} as any,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Unauthorized',
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(authService.refreshToken(refreshData)).rejects.toThrow();
      expect(clearAuthToken).toHaveBeenCalled(); // Should clear token on 401
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user from last successful auth response', async () => {
      const credentials: AuthenticationRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthenticationResponse = {
        token: 'jwt-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+1234567890',
          role: 'CLIENT',
          emailVerified: true,
          active: true,
          createdDate: '2025-01-15T10:00:00Z',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      await authService.login(credentials);
      const currentUser = authService.getCurrentUser();

      expect(currentUser).toEqual(mockResponse.user);
    });

    it('should return null if no user is logged in', () => {
      const newService = AuthService.getInstance();
      expect(newService.getCurrentUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user is logged in', async () => {
      const credentials: AuthenticationRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse: AuthenticationResponse = {
        token: 'jwt-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+1234567890',
          role: 'CLIENT',
          emailVerified: true,
          active: true,
          createdDate: '2025-01-15T10:00:00Z',
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      await authService.login(credentials);
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false if no user is logged in', () => {
      const newService = AuthService.getInstance();
      expect(newService.isAuthenticated()).toBe(false);
    });
  });
});
