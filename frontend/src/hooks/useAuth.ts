// frontend/src/hooks/useAuth.ts

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  login as loginAction,
  logout as logoutAction,
  register as registerAction,
  refreshToken as refreshTokenAction,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
} from '@/store/slices/authSlice';
import {
  AuthenticationRequest,
  RegisterAuthRequest,
  Role,
} from '@/types/auth.types';

/**
 * Custom hook for authentication management
 * Provides authentication state and methods for login, logout, register, and role checking
 * 
 * @example
 * const { user, login, logout, hasRole, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const role = useAppSelector(selectUserRole);

  // Login function
  const login = useCallback(
    async (credentials: AuthenticationRequest) => {
      const result = await dispatch(loginAction(credentials));
      if (loginAction.rejected.match(result)) {
        throw new Error(result.error.message || 'Login failed');
      }
      return result.payload;
    },
    [dispatch]
  );

  // Register function
  const register = useCallback(
    async (data: RegisterAuthRequest) => {
      const result = await dispatch(registerAction(data));
      if (registerAction.rejected.match(result)) {
        throw new Error(result.error.message || 'Registration failed');
      }
      return result.payload;
    },
    [dispatch]
  );

  // Logout function
  const logout = useCallback(async () => {
    await dispatch(logoutAction());
  }, [dispatch]);

  // Refresh tokens
  const refreshTokens = useCallback(async () => {
    const result = await dispatch(refreshTokenAction());
    if (refreshTokenAction.rejected.match(result)) {
      throw new Error(result.error.message || 'Token refresh failed');
    }
    return result.payload;
  }, [dispatch]);

  // Check if user has a specific role
  const hasRole = useCallback(
    (requiredRole: Role): boolean => {
      return role === requiredRole;
    },
    [role]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      return role !== null && roles.includes(role);
    },
    [role]
  );

  // Convenience role checks
  const isAdmin = useMemo(() => role === Role.ADMIN, [role]);
  const isEmployee = useMemo(() => role === Role.EMPLOYEE, [role]);
  const isClient = useMemo(() => role === Role.CLIENT, [role]);

  return {
    // State
    user,
    isAuthenticated,
    loading: authState.loading,
    error: authState.error,
    role,

    // Actions
    login,
    register,
    logout,
    refreshTokens,

    // Role checks
    hasRole,
    hasAnyRole,
    isAdmin,
    isEmployee,
    isClient,
  };
};
