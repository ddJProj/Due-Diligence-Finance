// frontend/src/components/layout/AppSidebar.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AppSidebar } from './AppSidebar';
import authReducer from '@/store/slices/authSlice';
import { Role } from '@/types/auth.types';

// Mock useLocation
let mockPathname = '/';
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
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

describe('AppSidebar', () => {
  const renderWithProviders = (
    store = createTestStore(),
    props = {}
  ) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <AppSidebar {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mockPathname = '/';
  });

  describe('Client Sidebar', () => {
    it('should display client menu items', () => {
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

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Investments')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should highlight active menu item based on current path', () => {
      mockPathname = '/portfolio';
      
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

      const portfolioLink = screen.getByText('My Portfolio');
      expect(portfolioLink.closest('a')).toHaveClass('active');
    });
  });

  describe('Employee Sidebar', () => {
    it('should display employee menu items', () => {
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
      expect(screen.getByText('Client Management')).toBeInTheDocument();
      expect(screen.getByText('Investment Requests')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should show submenu items when parent is clicked', () => {
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

      // Initially, submenu should not be visible
      expect(screen.queryByText('All Clients')).not.toBeInTheDocument();

      // Click on Client Management to expand
      const clientManagement = screen.getByText('Client Management');
      fireEvent.click(clientManagement);

      // Submenu items should now be visible
      expect(screen.getByText('All Clients')).toBeInTheDocument();
      expect(screen.getByText('Add New Client')).toBeInTheDocument();
      expect(screen.getByText('Client Reports')).toBeInTheDocument();
    });
  });

  describe('Admin Sidebar', () => {
    it('should display admin menu items', () => {
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
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('System Settings')).toBeInTheDocument();
      expect(screen.getByText('Activity Logs')).toBeInTheDocument();
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Backup & Restore')).toBeInTheDocument();
    });

    it('should expand system settings submenu', () => {
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

      // Click on System Settings
      const systemSettings = screen.getByText('System Settings');
      fireEvent.click(systemSettings);

      // Submenu items should be visible
      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Security Settings')).toBeInTheDocument();
      expect(screen.getByText('Email Configuration')).toBeInTheDocument();
      expect(screen.getByText('API Keys')).toBeInTheDocument();
    });
  });

  describe('Collapsed State', () => {
    it('should toggle collapsed state when button is clicked', () => {
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

      const sidebar = screen.getByTestId('app-sidebar');
      expect(sidebar).not.toHaveClass('collapsed');

      // Click collapse button
      const collapseButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(collapseButton);

      expect(sidebar).toHaveClass('collapsed');

      // Click again to expand
      fireEvent.click(collapseButton);
      expect(sidebar).not.toHaveClass('collapsed');
    });

    it('should show only icons when collapsed', () => {
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

      renderWithProviders(store, { isCollapsed: true });

      const sidebar = screen.getByTestId('app-sidebar');
      expect(sidebar).toHaveClass('collapsed');

      // Menu items should still be present but visually hidden
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument();
    });
  });

  describe('Guest User', () => {
    it('should not render for guest users', () => {
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

      const { container } = renderWithProviders(store);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Mobile Behavior', () => {
    it('should close sidebar when overlay is clicked on mobile', () => {
      const onClose = jest.fn();
      
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

      renderWithProviders(store, { isMobileOpen: true, onClose });

      const overlay = screen.getByTestId('sidebar-overlay');
      fireEvent.click(overlay);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should not render during loading', () => {
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

      const { container } = renderWithProviders(store);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Navigation Icons', () => {
    it('should display appropriate icons for menu items', () => {
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

      expect(screen.getByTestId('icon-dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('icon-portfolio')).toBeInTheDocument();
      expect(screen.getByTestId('icon-investments')).toBeInTheDocument();
      expect(screen.getByTestId('icon-messages')).toBeInTheDocument();
      expect(screen.getByTestId('icon-documents')).toBeInTheDocument();
      expect(screen.getByTestId('icon-settings')).toBeInTheDocument();
    });
  });
});
