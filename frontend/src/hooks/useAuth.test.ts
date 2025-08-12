// frontend/src/hooks/useAuth.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useAuth } from './useAuth';
import authReducer, { AuthState } from '@/store/slices/authSlice';
import { authService } from '@/api';
import { Role, AuthenticationRequest, RegisterAuthRequest } from '@/types/auth.types';

// Mock the auth service
jest.mock('@/api', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

describe('useAuth', () => {
  // Helper to create store with initial state
  const createTestStore = (initialAuthState?: Partial<AuthState>) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: initialAuthState ? {
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          ...initialAuthState,
        },
      } : undefined,
    });
  };

  // Helper to create wrapper with store
  const createWrapper = (store: ReturnType<typeof createTestStore>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('State Access', () => {
    it('should provide authentication state', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide authenticated user state', () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: Role.CLIENT,
        enabled: true,
        accountNonExpired: true,
        accountNonLocked: true,
        credentialsNonExpired: true,
      };

      const store = createTestStore({
        user: mockUser,
        isAuthenticated: true,
        accessToken: 'mock-token',
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should provide user role', () => {
      const store = createTestStore({
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: Role.ADMIN,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        isAuthenticated: true,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.role).toBe(Role.ADMIN);
    });

    it('should return null role when not authenticated', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.role).toBeNull();
    });
  });

  describe('Login', () => {
    it('should handle successful login', async () => {
      const credentials: AuthenticationRequest = {
        username: 'testuser',
        password: 'password123',
      };

      const mockResponse = {
        userAccount: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: Role.CLIENT,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      (authService.login as jest.Mock).mockResolvedValueOnce(mockResponse);

      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login(credentials);
      });

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockResponse.userAccount);
    });

    it('should handle login failure', async () => {
      const credentials: AuthenticationRequest = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      (authService.login as jest.Mock).mockRejectedValueOnce(error);

      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        try {
          await result.current.login(credentials);
        } catch (err) {
          // Expected to throw
        }
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });
  });

  describe('Register', () => {
    it('should handle successful registration', async () => {
      const registerData: RegisterAuthRequest = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      };

      const mockResponse = {
        userAccount: {
          id: 2,
          username: 'newuser',
          email: 'newuser@example.com',
          role: Role.CLIENT,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      (authService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(registerData);
      });

      expect(authService.register).toHaveBeenCalledWith(registerData);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockResponse.userAccount);
    });
  });

  describe('Logout', () => {
    it('should handle successful logout', async () => {
      const store = createTestStore({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: Role.CLIENT,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        isAuthenticated: true,
        accessToken: 'mock-token',
      });
      const wrapper = createWrapper(store);

      (authService.logout as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Permission Checks', () => {
    it('should check if user has specific role', () => {
      const store = createTestStore({
        user: {
          id: 1,
          username: 'employee',
          email: 'employee@example.com',
          role: Role.EMPLOYEE,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        isAuthenticated: true,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasRole(Role.EMPLOYEE)).toBe(true);
      expect(result.current.hasRole(Role.ADMIN)).toBe(false);
      expect(result.current.hasRole(Role.CLIENT)).toBe(false);
    });

    it('should check if user has any of the specified roles', () => {
      const store = createTestStore({
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: Role.ADMIN,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        isAuthenticated: true,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasAnyRole([Role.ADMIN, Role.EMPLOYEE])).toBe(true);
      expect(result.current.hasAnyRole([Role.CLIENT, Role.EMPLOYEE])).toBe(false);
    });

    it('should return false for role checks when not authenticated', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasRole(Role.ADMIN)).toBe(false);
      expect(result.current.hasAnyRole([Role.ADMIN, Role.EMPLOYEE])).toBe(false);
    });

    it('should check if user is admin', () => {
      const store = createTestStore({
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: Role.ADMIN,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        isAuthenticated: true,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAdmin).toBe(true);
    });

    it('should check if user is employee', () => {
      const store = createTestStore({
        user: {
          id: 1,
          username: 'employee',
          email: 'employee@example.com',
          role: Role.EMPLOYEE,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        isAuthenticated: true,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isEmployee).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it('should check if user is client', () => {
      const store = createTestStore({
        user: {
          id: 1,
          username: 'client',
          email: 'client@example.com',
          role: Role.CLIENT,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        isAuthenticated: true,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isClient).toBe(true);
      expect(result.current.isEmployee).toBe(false);
      expect(result.current.isAdmin).toBe(false);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh tokens', async () => {
      const mockResponse = {
        userAccount: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: Role.CLIENT,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      (authService.refreshToken as jest.Mock).mockResolvedValueOnce(mockResponse);

      const store = createTestStore({
        user: mockResponse.userAccount,
        isAuthenticated: true,
        accessToken: 'old-token',
        refreshToken: 'old-refresh',
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.refreshTokens();
      });

      expect(authService.refreshToken).toHaveBeenCalled();
    });
  });
});
