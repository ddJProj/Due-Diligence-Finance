// frontend/src/components/layout/MainLayout.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { MainLayout } from './MainLayout';
import authReducer from '@/store/slices/authSlice';
import { Role } from '@/types/auth.types';

// Mock the layout components
jest.mock('./AppHeader', () => ({
  AppHeader: () => <div data-testid="app-header">Header</div>,
}));

jest.mock('./AppSidebar', () => ({
  AppSidebar: ({ isCollapsed, isMobileOpen, onClose }: any) => (
    <div 
      data-testid="app-sidebar" 
      className={isCollapsed ? 'collapsed' : ''}
      data-mobile-open={isMobileOpen}
    >
      Sidebar
      {isMobileOpen && (
        <button onClick={onClose} data-testid="close-sidebar">
          Close
        </button>
      )}
    </div>
  ),
}));

jest.mock('./AppFooter', () => ({
  AppFooter: () => <div data-testid="app-footer">Footer</div>,
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

describe('MainLayout', () => {
  const TestContent = () => <div data-testid="test-content">Test Content</div>;

  const renderWithProviders = (
    store = createTestStore(),
    props = {}
  ) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <MainLayout {...props}>
            <TestContent />
          </MainLayout>
        </BrowserRouter>
      </Provider>
    );
  };

  describe('Layout Structure', () => {
    it('should render all layout components', () => {
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

      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('app-footer')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render children content in main area', () => {
      renderWithProviders();

      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toContainElement(screen.getByTestId('test-content'));
    });
  });

  describe('Guest Layout', () => {
    it('should not render sidebar for guest users', () => {
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

      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
      expect(screen.getByTestId('app-footer')).toBeInTheDocument();
    });

    it('should use full width for content when no sidebar', () => {
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

      const layoutContainer = screen.getByTestId('layout-container');
      expect(layoutContainer).toHaveClass('no-sidebar');
    });
  });

  describe('Authenticated Layout', () => {
    it('should render sidebar for authenticated users', () => {
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

      expect(screen.getByTestId('app-sidebar')).toBeInTheDocument();
    });

    it('should adjust content margin based on sidebar state', () => {
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

      const layoutContainer = screen.getByTestId('layout-container');
      expect(layoutContainer).toHaveClass('with-sidebar');
    });
  });

  describe('Mobile Sidebar Toggle', () => {
    it('should show mobile menu button on small screens', () => {
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

      // Mock window width for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      renderWithProviders(store);

      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should toggle mobile sidebar when button is clicked', () => {
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

      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      const sidebar = screen.getByTestId('app-sidebar');

      // Initially closed
      expect(sidebar).toHaveAttribute('data-mobile-open', 'false');

      // Open sidebar
      fireEvent.click(mobileMenuButton);
      expect(sidebar).toHaveAttribute('data-mobile-open', 'true');

      // Close sidebar
      fireEvent.click(screen.getByTestId('close-sidebar'));
      expect(sidebar).toHaveAttribute('data-mobile-open', 'false');
    });
  });

  describe('Loading State', () => {
    it('should show loading indicator during auth loading', () => {
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

      expect(screen.getByTestId('layout-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
    });

    it('should still render header and footer during loading', () => {
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

      expect(screen.getByTestId('app-header')).toBeInTheDocument();
      expect(screen.getByTestId('app-footer')).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should accept and apply custom className', () => {
      renderWithProviders(createTestStore(), { className: 'custom-layout' });

      const layoutWrapper = screen.getByTestId('layout-wrapper');
      expect(layoutWrapper).toHaveClass('custom-layout');
    });

    it('should disable sidebar when hideSidebar prop is true', () => {
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

      renderWithProviders(store, { hideSidebar: true });

      expect(screen.queryByTestId('app-sidebar')).not.toBeInTheDocument();
    });

    it('should hide footer when hideFooter prop is true', () => {
      renderWithProviders(createTestStore(), { hideFooter: true });

      expect(screen.queryByTestId('app-footer')).not.toBeInTheDocument();
    });
  });

  describe('Scroll Behavior', () => {
    it('should have scrollable main content area', () => {
      renderWithProviders();

      const mainContent = screen.getByTestId('main-content');
      expect(mainContent).toHaveClass('main-content');
    });

    it('should scroll to top on route change', () => {
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
      
      const { rerender } = renderWithProviders();

      // Simulate route change by changing key
      rerender(
        <Provider store={createTestStore()}>
          <BrowserRouter>
            <MainLayout key="new-route">
              <TestContent />
            </MainLayout>
          </BrowserRouter>
        </Provider>
      );

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
      scrollToSpy.mockRestore();
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide mobile menu button on large screens', () => {
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

      // Mock window width for desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      renderWithProviders(store);

      const mobileMenuButton = screen.getByLabelText('Toggle mobile menu');
      expect(mobileMenuButton).toHaveClass('mobile-only');
    });
  });
});
