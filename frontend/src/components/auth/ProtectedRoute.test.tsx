// frontend/src/components/auth/ProtectedRoute.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from './ProtectedRoute';
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

// Test component that renders when route is accessible
const TestComponent = () => <div>Protected Content</div>;

// Test component for redirect target
const LoginPage = () => <div>Login Page</div>;

describe('ProtectedRoute', () => {
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
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  {ui}
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Authentication Check', () => {
    it('should render children when user is authenticated', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
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

      renderWithRouter(<TestComponent />, { store });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
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

      renderWithRouter(<TestComponent />, { store });

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should redirect to login when there is no access token', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: null,
          refreshToken: 'refresh-token',
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(<TestComponent />, { store });

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading state while authentication is being checked', () => {
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

      renderWithRouter(<TestComponent />, { store });

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
      // The component should not render anything during loading
    });
  });

  describe('Custom Redirect', () => {
    it('should redirect to custom path when provided', () => {
      const CustomRedirect = () => <div>Custom Login Page</div>;
      
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

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/custom-login" element={<CustomRedirect />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute redirectTo="/custom-login">
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle inactive users by redirecting to login', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            role: Role.CLIENT,
            isActive: false,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(<TestComponent />, { store });

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render children for all authenticated roles', () => {
      const roles = [Role.CLIENT, Role.EMPLOYEE, Role.ADMIN];

      roles.forEach((role) => {
        const store = createTestStore({
          auth: {
            user: {
              id: 1,
              username: 'testuser',
              email: 'test@example.com',
              role,
              isActive: true,
            },
            accessToken: 'valid-token',
            refreshToken: 'refresh-token',
            isAuthenticated: true,
            loading: false,
            error: null,
          },
        });

        const { unmount } = renderWithRouter(<TestComponent />, { store });
        
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        unmount();
      });
    });

    it('should preserve location state when redirecting', () => {
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

      render(
        <Provider store={store}>
          <MemoryRouter initialEntries={['/protected-page?param=value']}>
            <Routes>
              <Route 
                path="/login" 
                element={
                  <div>
                    Login Page
                    <Route path="*" element={null} />
                  </div>
                } 
              />
              <Route
                path="/protected-page"
                element={
                  <ProtectedRoute>
                    <TestComponent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </Provider>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      // Location state should be preserved for returning after login
    });
  });
});
