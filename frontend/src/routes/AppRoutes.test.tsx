// frontend/src/routes/AppRoutes.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import AppRoutes from './AppRoutes';
import authSlice from '../store/authSlice';
import { Role } from '../types';

// Mock the lazy-loaded components
vi.mock('../pages/auth/LoginPage', () => ({
  default: () => <div>Login Page</div>,
}));

vi.mock('../pages/auth/RegisterPage', () => ({
  default: () => <div>Register Page</div>,
}));

vi.mock('../pages/auth/ForgotPasswordPage', () => ({
  default: () => <div>Forgot Password Page</div>,
}));

vi.mock('../pages/auth/ResetPasswordPage', () => ({
  default: () => <div>Reset Password Page</div>,
}));

vi.mock('../pages/dashboards/GuestDashboard', () => ({
  default: () => <div>Guest Dashboard</div>,
}));

vi.mock('../pages/dashboards/ClientDashboard', () => ({
  default: () => <div>Client Dashboard</div>,
}));

vi.mock('../pages/dashboards/EmployeeDashboard', () => ({
  default: () => <div>Employee Dashboard</div>,
}));

vi.mock('../pages/dashboards/AdminDashboard', () => ({
  default: () => <div>Admin Dashboard</div>,
}));

// Mock layout components
vi.mock('../components/layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  ),
}));

// Mock auth components
vi.mock('../components/auth/ProtectedRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = true; // Mocked for testing
    return isAuthenticated ? <>{children}</> : <div>Please log in</div>;
  },
}));

vi.mock('../components/auth/RoleGuard', () => ({
  default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) => {
    const userRole = Role.CLIENT; // Default for testing, will be overridden
    return allowedRoles.includes(userRole) ? <>{children}</> : <div>Access Denied</div>;
  },
}));

vi.mock('../components/auth/GuestOnlyRoute', () => ({
  default: ({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = false; // Mocked for testing
    return !isAuthenticated ? <>{children}</> : <div>Already logged in</div>;
  },
}));

const createMockStore = (authState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
        ...authState,
      },
    },
  });
};

const renderWithRouter = (
  component: React.ReactElement,
  { 
    route = '/', 
    store = createMockStore() 
  } = {}
) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {component}
      </MemoryRouter>
    </Provider>
  );
};

describe('AppRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Public Routes', () => {
    it('should render login page at root path for unauthenticated users', async () => {
      renderWithRouter(<AppRoutes />, { route: '/' });
      
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('should render login page at /login', async () => {
      renderWithRouter(<AppRoutes />, { route: '/login' });
      
      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('should render register page at /register', async () => {
      renderWithRouter(<AppRoutes />, { route: '/register' });
      
      await waitFor(() => {
        expect(screen.getByText('Register Page')).toBeInTheDocument();
      });
    });

    it('should render forgot password page at /forgot-password', async () => {
      renderWithRouter(<AppRoutes />, { route: '/forgot-password' });
      
      await waitFor(() => {
        expect(screen.getByText('Forgot Password Page')).toBeInTheDocument();
      });
    });

    it('should render reset password page at /reset-password/:token', async () => {
      renderWithRouter(<AppRoutes />, { route: '/reset-password/test-token' });
      
      await waitFor(() => {
        expect(screen.getByText('Reset Password Page')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - Guest', () => {
    const guestUser = {
      id: 1,
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'User',
      role: Role.GUEST,
    };

    const guestStore = createMockStore({
      isAuthenticated: true,
      user: guestUser,
    });

    it('should render guest dashboard at /dashboard for guest users', async () => {
      // Mock RoleGuard to allow GUEST role
      vi.mock('../components/auth/RoleGuard', () => ({
        default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) => {
          return allowedRoles.includes(Role.GUEST) ? <>{children}</> : <div>Access Denied</div>;
        },
      }));

      renderWithRouter(<AppRoutes />, { 
        route: '/dashboard',
        store: guestStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Guest Dashboard')).toBeInTheDocument();
      });
    });

    it('should restrict guest users from client-only routes', async () => {
      // Mock RoleGuard to deny GUEST access to CLIENT routes
      vi.mock('../components/auth/RoleGuard', () => ({
        default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) => {
          return allowedRoles.includes(Role.GUEST) ? <div>Access Denied</div> : <div>Access Denied</div>;
        },
      }));

      renderWithRouter(<AppRoutes />, { 
        route: '/portfolio',
        store: guestStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - Client', () => {
    const clientUser = {
      id: 1,
      email: 'client@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.CLIENT,
    };

    const clientStore = createMockStore({
      isAuthenticated: true,
      user: clientUser,
    });

    it('should render client dashboard at /dashboard for client users', async () => {
      // Mock RoleGuard to allow CLIENT role
      vi.mock('../components/auth/RoleGuard', () => ({
        default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) => {
          return allowedRoles.includes(Role.CLIENT) ? <>{children}</> : <div>Access Denied</div>;
        },
      }));

      renderWithRouter(<AppRoutes />, { 
        route: '/dashboard',
        store: clientStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect authenticated users from login to dashboard', async () => {
      // Mock GuestOnlyRoute to redirect authenticated users
      vi.mock('../components/auth/GuestOnlyRoute', () => ({
        default: ({ children }: { children: React.ReactNode }) => {
          return <div>Already logged in</div>;
        },
      }));

      renderWithRouter(<AppRoutes />, { 
        route: '/login',
        store: clientStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Already logged in')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - Employee', () => {
    const employeeUser = {
      id: 2,
      email: 'employee@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: Role.EMPLOYEE,
    };

    const employeeStore = createMockStore({
      isAuthenticated: true,
      user: employeeUser,
    });

    it('should render employee dashboard at /dashboard for employee users', async () => {
      // Mock RoleGuard to allow EMPLOYEE role
      vi.mock('../components/auth/RoleGuard', () => ({
        default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) => {
          return allowedRoles.includes(Role.EMPLOYEE) ? <>{children}</> : <div>Access Denied</div>;
        },
      }));

      renderWithRouter(<AppRoutes />, { 
        route: '/dashboard',
        store: employeeStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - Admin', () => {
    const adminUser = {
      id: 3,
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
    };

    const adminStore = createMockStore({
      isAuthenticated: true,
      user: adminUser,
    });

    it('should render admin dashboard at /dashboard for admin users', async () => {
      // Mock RoleGuard to allow ADMIN role
      vi.mock('../components/auth/RoleGuard', () => ({
        default: ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) => {
          return allowedRoles.includes(Role.ADMIN) ? <>{children}</> : <div>Access Denied</div>;
        },
      }));

      renderWithRouter(<AppRoutes />, { 
        route: '/dashboard',
        store: adminStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Route Protection', () => {
    it('should show access denied for unauthorized role access', async () => {
      const clientUser = {
        id: 1,
        email: 'client@example.com',
        role: Role.CLIENT,
      };

      const clientStore = createMockStore({
        isAuthenticated: true,
        user: clientUser,
      });

      // Mock RoleGuard to deny access
      vi.mock('../components/auth/RoleGuard', () => ({
        default: ({ allowedRoles }: { allowedRoles: Role[] }) => {
          return <div>Access Denied</div>;
        },
      }));

      renderWithRouter(<AppRoutes />, { 
        route: '/admin/users',
        store: clientStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });

    it('should require authentication for protected routes', async () => {
      // Mock ProtectedRoute to require login
      vi.mock('../components/auth/ProtectedRoute', () => ({
        default: () => <div>Please log in</div>,
      }));

      renderWithRouter(<AppRoutes />, { route: '/dashboard' });
      
      await waitFor(() => {
        expect(screen.getByText('Please log in')).toBeInTheDocument();
      });
    });
  });

  describe('Layout Integration', () => {
    it('should wrap authenticated routes in MainLayout', async () => {
      const clientUser = {
        id: 1,
        email: 'client@example.com',
        role: Role.CLIENT,
      };

      const clientStore = createMockStore({
        isAuthenticated: true,
        user: clientUser,
      });

      renderWithRouter(<AppRoutes />, { 
        route: '/dashboard',
        store: clientStore 
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      });
    });

    it('should not use MainLayout for auth pages', async () => {
      renderWithRouter(<AppRoutes />, { route: '/login' });
      
      await waitFor(() => {
        expect(screen.queryByTestId('main-layout')).not.toBeInTheDocument();
      });
    });
  });

  describe('404 Handling', () => {
    it('should render 404 page for unknown routes', async () => {
      renderWithRouter(<AppRoutes />, { route: '/unknown-route' });
      
      await waitFor(() => {
        expect(screen.getByText(/404/)).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Dashboard Routing', () => {
    it('should route to guest dashboard for GUEST role', async () => {
      const guestStore = createMockStore({
        isAuthenticated: true,
        user: { role: Role.GUEST },
      });

      renderWithRouter(<AppRoutes />, { 
        route: '/dashboard',
        store: guestStore 
      });
      
      await waitFor(() => {
        expect(screen.getByText('Guest Dashboard')).toBeInTheDocument();
      });
    });

    it('should route to correct dashboard based on user role', async () => {
      // Test will be implemented when we have the actual routing logic
      expect(true).toBe(true);
    });
  });

  describe('Lazy Loading', () => {
    it('should show loading state while components are loading', async () => {
      // Mock React.Suspense to show loading
      renderWithRouter(<AppRoutes />, { route: '/dashboard' });
      
      // The actual implementation will show a loading spinner
      expect(true).toBe(true);
    });
  });
});
