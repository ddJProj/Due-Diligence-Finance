// frontend/src/store/slices/authSlice.test.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  login,
  logout,
  register,
  refreshToken,
  setUser,
  setTokens,
  clearAuth,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
  AuthState,
} from './authSlice';
import { authService } from '@/api';
import {
  AuthenticationRequest,
  AuthenticationResponse,
  RegisterAuthRequest,
  Role,
} from '@/types/auth.types';

// Mock the auth service
jest.mock('@/api', () => ({
  authService: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle setUser', () => {
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: Role.CLIENT,
        enabled: true,
        accountNonExpired: true,
        accountNonLocked: true,
        credentialsNonExpired: true,
      };

      store.dispatch(setUser(user));
      const state = store.getState().auth;

      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle setTokens', () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      store.dispatch(setTokens(tokens));
      const state = store.getState().auth;

      expect(state.accessToken).toBe(tokens.accessToken);
      expect(state.refreshToken).toBe(tokens.refreshToken);
    });

    it('should handle clearAuth', () => {
      // Set some initial state
      store.dispatch(setUser({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: Role.CLIENT,
        enabled: true,
        accountNonExpired: true,
        accountNonLocked: true,
        credentialsNonExpired: true,
      }));
      store.dispatch(setTokens({
        accessToken: 'token',
        refreshToken: 'refresh',
      }));

      // Clear auth
      store.dispatch(clearAuth());
      const state = store.getState().auth;

      expect(state).toEqual({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
    });
  });

  describe('Async Actions', () => {
    describe('login', () => {
      const credentials: AuthenticationRequest = {
        username: 'testuser',
        password: 'password123',
      };

      const mockResponse: AuthenticationResponse = {
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

      it('should handle successful login', async () => {
        (authService.login as jest.Mock).mockResolvedValueOnce(mockResponse);

        await store.dispatch(login(credentials) as any);
        const state = store.getState().auth;

        expect(authService.login).toHaveBeenCalledWith(credentials);
        expect(state.user).toEqual(mockResponse.userAccount);
        expect(state.accessToken).toBe(mockResponse.accessToken);
        expect(state.refreshToken).toBe(mockResponse.refreshToken);
        expect(state.isAuthenticated).toBe(true);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle login failure', async () => {
        const error = new Error('Invalid credentials');
        (authService.login as jest.Mock).mockRejectedValueOnce(error);

        await store.dispatch(login(credentials) as any);
        const state = store.getState().auth;

        expect(state.user).toBeNull();
        expect(state.accessToken).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Invalid credentials');
      });

      it('should set loading state during login', () => {
        (authService.login as jest.Mock).mockImplementation(
          () => new Promise(() => {}) // Never resolves
        );

        store.dispatch(login(credentials) as any);
        const state = store.getState().auth;

        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
      });
    });

    describe('register', () => {
      const registerData: RegisterAuthRequest = {
        username: 'newuser',
        password: 'password123',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
      };

      it('should handle successful registration', async () => {
        const mockResponse: AuthenticationResponse = {
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
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          tokenType: 'Bearer',
          expiresIn: 3600,
        };

        (authService.register as jest.Mock).mockResolvedValueOnce(mockResponse);

        await store.dispatch(register(registerData) as any);
        const state = store.getState().auth;

        expect(authService.register).toHaveBeenCalledWith(registerData);
        expect(state.user).toEqual(mockResponse.userAccount);
        expect(state.isAuthenticated).toBe(true);
      });
    });

    describe('logout', () => {
      it('should handle successful logout', async () => {
        // Set initial authenticated state
        store.dispatch(setUser({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: Role.CLIENT,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        }));
        store.dispatch(setTokens({
          accessToken: 'token',
          refreshToken: 'refresh',
        }));

        (authService.logout as jest.Mock).mockResolvedValueOnce(undefined);

        await store.dispatch(logout() as any);
        const state = store.getState().auth;

        expect(authService.logout).toHaveBeenCalled();
        expect(state.user).toBeNull();
        expect(state.accessToken).toBeNull();
        expect(state.isAuthenticated).toBe(false);
      });

      it('should clear auth even if logout request fails', async () => {
        (authService.logout as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await store.dispatch(logout() as any);
        const state = store.getState().auth;

        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
      });
    });

    describe('refreshToken', () => {
      it('should handle successful token refresh', async () => {
        const mockResponse: AuthenticationResponse = {
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

        await store.dispatch(refreshToken() as any);
        const state = store.getState().auth;

        expect(state.accessToken).toBe(mockResponse.accessToken);
        expect(state.refreshToken).toBe(mockResponse.refreshToken);
      });
    });
  });

  describe('Selectors', () => {
    const mockState = {
      auth: {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: Role.EMPLOYEE,
          enabled: true,
          accountNonExpired: true,
          accountNonLocked: true,
          credentialsNonExpired: true,
        },
        accessToken: 'token',
        refreshToken: 'refresh',
        isAuthenticated: true,
        loading: false,
        error: null,
      } as AuthState,
    };

    it('should select auth state', () => {
      expect(selectAuth(mockState as any)).toEqual(mockState.auth);
    });

    it('should select user', () => {
      expect(selectUser(mockState as any)).toEqual(mockState.auth.user);
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(mockState as any)).toBe(true);
    });

    it('should select user role', () => {
      expect(selectUserRole(mockState as any)).toBe(Role.EMPLOYEE);
    });

    it('should return null role when no user', () => {
      const stateWithoutUser = {
        auth: { ...mockState.auth, user: null },
      };
      expect(selectUserRole(stateWithoutUser as any)).toBeNull();
    });
  });
});
