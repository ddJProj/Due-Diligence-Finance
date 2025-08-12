// frontend/src/components/auth/GuestOnlyRoute.test.tsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { GuestOnlyRoute } from './GuestOnlyRoute';
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
const GuestContent = () => <div>Guest Only Content</div>;
const ClientDashboard = () => <div>Client Dashboard</div>;
const EmployeeDashboard = () => <div>Employee Dashboard</div>;
const AdminDashboard = () => <div>Admin Dashboard</div>;
const HomePage = () => <div>Home Page</div>;

describe('GuestOnlyRoute', () => {
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
            <Route path="/dashboard/client" element={<ClientDashboard />} />
            <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/" element={ui} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  describe('Guest Access', () => {
    it('should render children when user is not authenticated', () => {
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
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Guest Only Content')).toBeInTheDocument();
    });

    it('should render children when there is no access token', () => {
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
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Guest Only Content')).toBeInTheDocument();
    });
  });

  describe('Authenticated User Redirects', () => {
    it('should redirect CLIENT to client dashboard by default', () => {
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
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Guest Only Content')).not.toBeInTheDocument();
    });

    it('should redirect EMPLOYEE to employee dashboard by default', () => {
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
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Guest Only Content')).not.toBeInTheDocument();
    });

    it('should redirect ADMIN to admin dashboard by default', () => {
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
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Guest Only Content')).not.toBeInTheDocument();
    });
  });

  describe('Custom Redirect', () => {
    it('should redirect to custom path when provided', () => {
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
        <GuestOnlyRoute redirectTo="/home">
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Home Page')).toBeInTheDocument();
      expect(screen.queryByText('Guest Only Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Client Dashboard')).not.toBeInTheDocument();
    });

    it('should use custom redirect regardless of user role', () => {
      const roles = [Role.CLIENT, Role.EMPLOYEE, Role.ADMIN];

      roles.forEach((role) => {
        const store = createTestStore({
          auth: {
            user: {
              id: 1,
              username: 'user',
              email: 'user@example.com',
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

        const { unmount } = renderWithRouter(
          <GuestOnlyRoute redirectTo="/home">
            <GuestContent />
          </GuestOnlyRoute>,
          { store }
        );

        expect(screen.getByText('Home Page')).toBeInTheDocument();
        expect(screen.queryByText('Guest Only Content')).not.toBeInTheDocument();
        
        unmount();
      });
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
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.queryByText('Guest Only Content')).not.toBeInTheDocument();
      expect(screen.queryByText('Client Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should allow access for inactive users who are not authenticated', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'inactive',
            email: 'inactive@example.com',
            role: Role.CLIENT,
            isActive: false,
          },
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Guest Only Content')).toBeInTheDocument();
    });

    it('should redirect active authenticated users even with error state', () => {
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
          error: 'Some error occurred',
        },
      });

      renderWithRouter(
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
      expect(screen.queryByText('Guest Only Content')).not.toBeInTheDocument();
    });

    it('should handle missing user object gracefully', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: 'some-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithRouter(
        <GuestOnlyRoute>
          <GuestContent />
        </GuestOnlyRoute>,
        { store }
      );

      // Should allow access when user object is missing
      expect(screen.getByText('Guest Only Content')).toBeInTheDocument();
    });
  });
});
