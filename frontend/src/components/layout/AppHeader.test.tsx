// frontend/src/components/layout/AppHeader.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AppHeader } from './AppHeader';
import authReducer from '@/store/slices/authSlice';
import { Role } from '@/types/auth.types';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create a test store factory
const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

describe('AppHeader', () => {
  const renderWithProviders = (
    store = createTestStore()
  ) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <AppHeader />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Guest User', () => {
    it('should display guest navigation items', () => {
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

      renderWithProviders(store);

      expect(screen.getByText('Due Diligence Finance')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText('Register')).toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });

    it('should navigate to login when login button clicked', () => {
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

      renderWithProviders(store);

      const loginButton = screen.getByText('Login');
      fireEvent.click(loginButton);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('Client User', () => {
    it('should display client navigation items', () => {
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

      renderWithProviders(store);

      expect(screen.getByText('Due Diligence Finance')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('client')).toBeInTheDocument();
      expect(screen.queryByText('Clients')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('should show user menu on username click', () => {
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

      renderWithProviders(store);

      const usernameButton = screen.getByText('client');
      fireEvent.click(usernameButton);

      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('Employee User', () => {
    it('should display employee navigation items', () => {
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

      renderWithProviders(store);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.queryByText('Portfolio')).not.toBeInTheDocument();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });
  });

  describe('Admin User', () => {
    it('should display admin navigation items', () => {
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

      renderWithProviders(store);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout when logout is clicked', async () => {
      const mockLogout = jest.fn();
      jest.spyOn(require('@/hooks/useAuth'), 'useAuth').mockReturnValue({
        user: {
          id: 1,
          username: 'client',
          email: 'client@example.com',
          role: Role.CLIENT,
          isActive: true,
        },
        isAuthenticated: true,
        loading: false,
        logout: mockLogout,
      });

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

      renderWithProviders(store);

      // Open user menu
      const usernameButton = screen.getByText('client');
      fireEvent.click(usernameButton);

      // Click logout
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('Mobile Menu', () => {
    it('should toggle mobile menu on hamburger click', () => {
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

      renderWithProviders(store);

      // Mobile menu should not be visible initially
      expect(screen.queryByTestId('mobile-menu')).not.toHaveClass('open');

      // Click hamburger menu
      const hamburgerButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburgerButton);

      // Mobile menu should be visible
      expect(screen.getByTestId('mobile-menu')).toHaveClass('open');

      // Click again to close
      fireEvent.click(hamburgerButton);
      expect(screen.queryByTestId('mobile-menu')).not.toHaveClass('open');
    });

    it('should close mobile menu when a link is clicked', () => {
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

      renderWithProviders(store);

      // Open mobile menu
      const hamburgerButton = screen.getByLabelText('Toggle menu');
      fireEvent.click(hamburgerButton);
      expect(screen.getByTestId('mobile-menu')).toHaveClass('open');

      // Click a navigation link
      const homeLink = screen.getAllByText('Home')[1]; // Mobile menu version
      fireEvent.click(homeLink);

      // Mobile menu should close
      expect(screen.queryByTestId('mobile-menu')).not.toHaveClass('open');
    });
  });

  describe('Loading State', () => {
    it('should show minimal header during loading', () => {
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

      renderWithProviders(store);

      expect(screen.getByText('Due Diligence Finance')).toBeInTheDocument();
      expect(screen.queryByText('Login')).not.toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Logo Navigation', () => {
    it('should navigate to home when logo is clicked for guest', () => {
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

      renderWithProviders(store);

      const logo = screen.getByText('Due Diligence Finance');
      fireEvent.click(logo);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should navigate to role-specific dashboard when logo is clicked for authenticated user', () => {
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

      renderWithProviders(store);

      const logo = screen.getByText('Due Diligence Finance');
      fireEvent.click(logo);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/client');
    });
  });
});
