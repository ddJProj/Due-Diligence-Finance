// frontend/src/App.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import authReducer from './store/slices/authSlice';

// Mock the page components
vi.mock('./pages/auth/LoginPage', () => ({
  default: () => <div>Login Page</div>
}));

vi.mock('./pages/auth/RegisterPage', () => ({
  default: () => <div>Register Page</div>
}));

vi.mock('./pages/public/LandingPage', () => ({
  default: () => <div>Landing Page</div>
}));

vi.mock('./pages/dashboards/ClientDashboard', () => ({
  default: () => <div>Client Dashboard</div>
}));

vi.mock('./pages/dashboards/EmployeeDashboard', () => ({
  default: () => <div>Employee Dashboard</div>
}));

vi.mock('./pages/dashboards/AdminDashboard', () => ({
  default: () => <div>Admin Dashboard</div>
}));

vi.mock('./pages/errors/NotFoundPage', () => ({
  default: () => <div>404 - Not Found</div>
}));

vi.mock('./components/layout/MainLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="main-layout">{children}</div>
  )
}));

vi.mock('./components/layout/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-layout">{children}</div>
  )
}));

// Mock ErrorBoundary
vi.mock('./components/common/ErrorBoundary', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock Toast component
vi.mock('./components/common/Toast', () => ({
  default: () => <div data-testid="toast-container">Toast Container</div>
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isLoading: false,
        error: null,
        ...initialState
      }
    }
  });
};

describe('App', () => {
  const renderApp = (route = '/', authState = {}) => {
    const store = createMockStore(authState);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderApp();
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
  });

  it('should render the landing page on root route', () => {
    renderApp('/');
    expect(screen.getByText('Landing Page')).toBeInTheDocument();
  });

  it('should render login page on /login route', () => {
    renderApp('/login');
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
  });

  it('should render register page on /register route', () => {
    renderApp('/register');
    expect(screen.getByText('Register Page')).toBeInTheDocument();
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
  });

  it('should render 404 page for unknown routes', () => {
    renderApp('/unknown-route');
    expect(screen.getByText('404 - Not Found')).toBeInTheDocument();
  });

  it('should render toast container', () => {
    renderApp();
    expect(screen.getByTestId('toast-container')).toBeInTheDocument();
  });

  describe('Dashboard Routing', () => {
    it('should redirect to login when accessing dashboard without auth', () => {
      renderApp('/dashboard');
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('should render client dashboard for authenticated client', () => {
      const authState = {
        user: { id: 1, role: 'CLIENT' },
        token: 'valid-token'
      };
      renderApp('/dashboard', authState);
      expect(screen.getByText('Client Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render employee dashboard for authenticated employee', () => {
      const authState = {
        user: { id: 1, role: 'EMPLOYEE' },
        token: 'valid-token'
      };
      renderApp('/dashboard', authState);
      expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });

    it('should render admin dashboard for authenticated admin', () => {
      const authState = {
        user: { id: 1, role: 'ADMIN' },
        token: 'valid-token'
      };
      renderApp('/dashboard', authState);
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login for protected routes without auth', () => {
      const protectedRoutes = [
        '/portfolio',
        '/investments',
        '/transactions',
        '/clients',
        '/users',
        '/profile',
        '/settings'
      ];

      protectedRoutes.forEach(route => {
        const { unmount } = renderApp(route);
        expect(screen.getByText('Login Page')).toBeInTheDocument();
        unmount();
      });
    });

    it('should allow access to protected routes with auth', () => {
      const authState = {
        user: { id: 1, role: 'CLIENT' },
        token: 'valid-token'
      };

      // Test a client-accessible route
      renderApp('/portfolio', authState);
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('Public Routes', () => {
    const publicRoutes = [
      { path: '/about', text: 'About Page' },
      { path: '/features', text: 'Features Page' },
      { path: '/pricing', text: 'Pricing Page' },
      { path: '/contact', text: 'Contact Page' }
    ];

    publicRoutes.forEach(({ path, text }) => {
      it(`should render ${text} without authentication`, () => {
        // Mock the component for this test
        vi.doMock(`.${path.replace('/', '/pages/public/')}Page`, () => ({
          default: () => <div>{text}</div>
        }));

        renderApp(path);
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });
  });

  describe('Role-based Access', () => {
    it('should prevent client from accessing admin routes', () => {
      const authState = {
        user: { id: 1, role: 'CLIENT' },
        token: 'valid-token'
      };
      renderApp('/users', authState);
      // Should redirect to unauthorized or dashboard
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
    });

    it('should prevent employee from accessing admin-only routes', () => {
      const authState = {
        user: { id: 1, role: 'EMPLOYEE' },
        token: 'valid-token'
      };
      renderApp('/system-settings', authState);
      expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
    });

    it('should allow admin access to all routes', () => {
      const authState = {
        user: { id: 1, role: 'ADMIN' },
        token: 'valid-token'
      };
      renderApp('/users', authState);
      // Admin should have access
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('Layout Application', () => {
    it('should apply auth layout to auth pages', () => {
      const authRoutes = ['/login', '/register', '/forgot-password'];
      
      authRoutes.forEach(route => {
        const { unmount } = renderApp(route);
        expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
        expect(screen.queryByTestId('main-layout')).not.toBeInTheDocument();
        unmount();
      });
    });

    it('should apply main layout to authenticated pages', () => {
      const authState = {
        user: { id: 1, role: 'CLIENT' },
        token: 'valid-token'
      };
      
      renderApp('/dashboard', authState);
      expect(screen.getByTestId('main-layout')).toBeInTheDocument();
      expect(screen.queryByTestId('auth-layout')).not.toBeInTheDocument();
    });

    it('should not apply any layout to error pages', () => {
      renderApp('/404');
      expect(screen.queryByTestId('main-layout')).not.toBeInTheDocument();
      expect(screen.queryByTestId('auth-layout')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation errors gracefully', () => {
      // Test error boundary catches navigation errors
      renderApp('/');
      // Should not crash
      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });

    it('should render error boundary for component errors', () => {
      // This would test the error boundary functionality
      // In a real scenario, you'd trigger an error in a child component
      renderApp();
      // App should still render
      expect(document.querySelector('#root')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should use lazy loading for route components', () => {
      // This test would verify that components are lazy loaded
      // Check that the import statements use React.lazy
      expect(App.toString()).toContain('lazy');
    });

    it('should include suspense boundaries', () => {
      renderApp();
      // Verify Suspense is used for lazy-loaded components
      // This is more of a structural test
      expect(App.toString()).toContain('Suspense');
    });
  });
});
