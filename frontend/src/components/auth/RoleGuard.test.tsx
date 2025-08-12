// frontend/src/components/auth/RoleGuard.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { RoleGuard } from './RoleGuard';
import authReducer from '@/store/slices/authSlice';
import { Role } from '@/types/auth.types';

// Create a test store factory
const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

// Test components
const TestComponent = () => <div>Authorized Content</div>;
const UnauthorizedPage = () => <div>Unauthorized Access</div>;
const CustomFallback = () => <div>Custom Fallback</div>;

describe('RoleGuard', () => {
  const renderWithRouter = (
    ui: React.ReactElement,
    {
      route = '/',
      store = createTestStore(),
    }: {
      route?: string;
      store?: ReturnType<typeof createTestStore>;
    } = {}
  ) => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/" element={ui} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Single Role Check', () => {
    it('should render children when user has the required role', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: Role.ADMIN,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard requiredRole={Role.ADMIN}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Authorized Content')).toBeInTheDocument();
      expect(screen.queryByText('Unauthorized Access')).not.toBeInTheDocument();
    });

    it('should redirect when user does not have the required role', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'client',
            email: 'client@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard requiredRole={Role.ADMIN}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
      expect(screen.queryByText('Authorized Content')).not.toBeInTheDocument();
    });
  });

  describe('Multiple Roles Check', () => {
    it('should render when user has any of the allowed roles', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'employee',
            email: 'employee@example.com',
            role: Role.EMPLOYEE,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard allowedRoles={[Role.ADMIN, Role.EMPLOYEE]}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Authorized Content')).toBeInTheDocument();
    });

    it('should redirect when user has none of the allowed roles', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'client',
            email: 'client@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard allowedRoles={[Role.ADMIN, Role.EMPLOYEE]}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    });
  });

  describe('Minimum Role Check', () => {
    it('should render when user meets minimum role requirement', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: Role.ADMIN,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard minimumRole={Role.EMPLOYEE}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Authorized Content')).toBeInTheDocument();
    });

    it('should redirect when user does not meet minimum role', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'client',
            email: 'client@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard minimumRole={Role.EMPLOYEE}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback instead of redirecting', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'client',
            email: 'client@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard 
          requiredRole={Role.ADMIN} 
          fallback={<CustomFallback />}
        >
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
      expect(screen.queryByText('Authorized Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Unauthorized Access')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when specified', () => {
      const CustomRedirect = () => <div>Custom Unauthorized Page</div>;
      
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'client',
            email: 'client@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/custom-unauthorized" element={<CustomRedirect />} />
              <Route
                path="/"
                element={
                  <RoleGuard 
                    requiredRole={Role.ADMIN}
                    redirectTo="/custom-unauthorized"
                  >
                    <TestComponent />
                  </RoleGuard>
                }
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Custom Unauthorized Page')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should not render anything while loading', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: true,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard requiredRole={Role.ADMIN}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.queryByText('Authorized Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Unauthorized Access')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle unauthenticated users', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard requiredRole={Role.ADMIN}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    });

    it('should handle inactive users', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: Role.ADMIN,
            isActive: false,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <RoleGuard requiredRole={Role.ADMIN}>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    });

    it('should handle missing props gracefully', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: Role.ADMIN,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      // No role requirements specified - should render children
      renderWithRouter(
        <RoleGuard>
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      expect(screen.getByText('Authorized Content')).toBeInTheDocument();
    });

    it('should check all role conditions when multiple are specified', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'employee',
            email: 'employee@example.com',
            role: Role.EMPLOYEE,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      // Employee role satisfies minimumRole but not requiredRole
      renderWithRouter(
        <RoleGuard 
          requiredRole={Role.ADMIN}
          minimumRole={Role.EMPLOYEE}
        >
          <TestComponent />
        </RoleGuard>,
        { store }
      );

      // Should use requiredRole when both are specified
      expect(screen.getByText('Unauthorized Access')).toBeInTheDocument();
    });
  });
});
