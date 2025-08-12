// frontend/src/hooks/useRole.test.ts

import { renderHook } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { useRole } from './useRole';
import authReducer, { AuthState } from '@/store/slices/authSlice';
import { Role } from '@/types/auth.types';

describe('useRole', () => {
  // Helper to create store with initial state
  const createTestStore = (role: Role | null = null) => {
    return configureStore({
      reducer: {
        auth: authReducer,
      },
      preloadedState: {
        auth: {
          user: role ? {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role,
            enabled: true,
            accountNonExpired: true,
            accountNonLocked: true,
            credentialsNonExpired: true,
          } : null,
          accessToken: role ? 'mock-token' : null,
          refreshToken: null,
          isAuthenticated: !!role,
          loading: false,
          error: null,
        } as AuthState,
      },
    });
  };

  // Helper to create wrapper with store
  const createWrapper = (store: ReturnType<typeof createTestStore>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  describe('Role Access', () => {
    it('should return current user role', () => {
      const store = createTestStore(Role.EMPLOYEE);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.role).toBe(Role.EMPLOYEE);
    });

    it('should return null when user is not authenticated', () => {
      const store = createTestStore(null);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.role).toBeNull();
    });
  });

  describe('Role Checks', () => {
    describe('isRole', () => {
      it('should correctly check if user has specific role', () => {
        const store = createTestStore(Role.ADMIN);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.isRole(Role.ADMIN)).toBe(true);
        expect(result.current.isRole(Role.EMPLOYEE)).toBe(false);
        expect(result.current.isRole(Role.CLIENT)).toBe(false);
      });

      it('should return false when user is not authenticated', () => {
        const store = createTestStore(null);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.isRole(Role.ADMIN)).toBe(false);
      });
    });

    describe('hasMinimumRole', () => {
      it('should check admin has minimum role of admin', () => {
        const store = createTestStore(Role.ADMIN);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.hasMinimumRole(Role.ADMIN)).toBe(true);
        expect(result.current.hasMinimumRole(Role.EMPLOYEE)).toBe(true);
        expect(result.current.hasMinimumRole(Role.CLIENT)).toBe(true);
      });

      it('should check employee has minimum role of employee', () => {
        const store = createTestStore(Role.EMPLOYEE);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.hasMinimumRole(Role.ADMIN)).toBe(false);
        expect(result.current.hasMinimumRole(Role.EMPLOYEE)).toBe(true);
        expect(result.current.hasMinimumRole(Role.CLIENT)).toBe(true);
      });

      it('should check client only has minimum role of client', () => {
        const store = createTestStore(Role.CLIENT);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.hasMinimumRole(Role.ADMIN)).toBe(false);
        expect(result.current.hasMinimumRole(Role.EMPLOYEE)).toBe(false);
        expect(result.current.hasMinimumRole(Role.CLIENT)).toBe(true);
      });

      it('should return false when user is not authenticated', () => {
        const store = createTestStore(null);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.hasMinimumRole(Role.CLIENT)).toBe(false);
      });
    });

    describe('hasAnyRole', () => {
      it('should check if user has any of the specified roles', () => {
        const store = createTestStore(Role.EMPLOYEE);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.hasAnyRole([Role.ADMIN, Role.EMPLOYEE])).toBe(true);
        expect(result.current.hasAnyRole([Role.CLIENT, Role.EMPLOYEE])).toBe(true);
        expect(result.current.hasAnyRole([Role.ADMIN, Role.CLIENT])).toBe(false);
      });

      it('should return false when user is not authenticated', () => {
        const store = createTestStore(null);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.hasAnyRole([Role.ADMIN, Role.EMPLOYEE])).toBe(false);
      });

      it('should return false for empty role array', () => {
        const store = createTestStore(Role.ADMIN);
        const wrapper = createWrapper(store);

        const { result } = renderHook(() => useRole(), { wrapper });

        expect(result.current.hasAnyRole([])).toBe(false);
      });
    });
  });

  describe('Convenience Properties', () => {
    it('should correctly identify admin user', () => {
      const store = createTestStore(Role.ADMIN);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isEmployee).toBe(false);
      expect(result.current.isClient).toBe(false);
      expect(result.current.isGuest).toBe(false);
    });

    it('should correctly identify employee user', () => {
      const store = createTestStore(Role.EMPLOYEE);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isEmployee).toBe(true);
      expect(result.current.isClient).toBe(false);
      expect(result.current.isGuest).toBe(false);
    });

    it('should correctly identify client user', () => {
      const store = createTestStore(Role.CLIENT);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isEmployee).toBe(false);
      expect(result.current.isClient).toBe(true);
      expect(result.current.isGuest).toBe(false);
    });

    it('should correctly identify guest (unauthenticated) user', () => {
      const store = createTestStore(null);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isEmployee).toBe(false);
      expect(result.current.isClient).toBe(false);
      expect(result.current.isGuest).toBe(true);
    });
  });

  describe('canAccess', () => {
    it('should check if admin can access different sections', () => {
      const store = createTestStore(Role.ADMIN);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.canAccess('admin')).toBe(true);
      expect(result.current.canAccess('employee')).toBe(true);
      expect(result.current.canAccess('client')).toBe(true);
      expect(result.current.canAccess('public')).toBe(true);
    });

    it('should check if employee can access different sections', () => {
      const store = createTestStore(Role.EMPLOYEE);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.canAccess('admin')).toBe(false);
      expect(result.current.canAccess('employee')).toBe(true);
      expect(result.current.canAccess('client')).toBe(true);
      expect(result.current.canAccess('public')).toBe(true);
    });

    it('should check if client can access different sections', () => {
      const store = createTestStore(Role.CLIENT);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.canAccess('admin')).toBe(false);
      expect(result.current.canAccess('employee')).toBe(false);
      expect(result.current.canAccess('client')).toBe(true);
      expect(result.current.canAccess('public')).toBe(true);
    });

    it('should check if guest can only access public sections', () => {
      const store = createTestStore(null);
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => useRole(), { wrapper });

      expect(result.current.canAccess('admin')).toBe(false);
      expect(result.current.canAccess('employee')).toBe(false);
      expect(result.current.canAccess('client')).toBe(false);
      expect(result.current.canAccess('public')).toBe(true);
    });
  });

  describe('Role Hierarchy', () => {
    it('should return correct role hierarchy level', () => {
      const adminStore = createTestStore(Role.ADMIN);
      const employeeStore = createTestStore(Role.EMPLOYEE);
      const clientStore = createTestStore(Role.CLIENT);
      const guestStore = createTestStore(null);

      const { result: adminResult } = renderHook(() => useRole(), { 
        wrapper: createWrapper(adminStore) 
      });
      const { result: employeeResult } = renderHook(() => useRole(), { 
        wrapper: createWrapper(employeeStore) 
      });
      const { result: clientResult } = renderHook(() => useRole(), { 
        wrapper: createWrapper(clientStore) 
      });
      const { result: guestResult } = renderHook(() => useRole(), { 
        wrapper: createWrapper(guestStore) 
      });

      expect(adminResult.current.roleLevel).toBe(3);
      expect(employeeResult.current.roleLevel).toBe(2);
      expect(clientResult.current.roleLevel).toBe(1);
      expect(guestResult.current.roleLevel).toBe(0);
    });
  });
});
