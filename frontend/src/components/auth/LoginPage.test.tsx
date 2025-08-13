// frontend/src/pages/auth/LoginPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { LoginPage } from './LoginPage';
import { setupStore } from '@/store';

// Mock the components
vi.mock('@/components/auth', () => ({
  GuestOnlyRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-only-route">{children}</div>
  ),
  LoginForm: () => <div data-testid="login-form">Login Form Component</div>
}));

vi.mock('@/components/layout', () => ({
  MainLayout: ({ children, hideSidebar }: { children: React.ReactNode; hideSidebar?: boolean }) => (
    <div data-testid="main-layout" data-hide-sidebar={hideSidebar}>
      {children}
    </div>
  )
}));

describe('LoginPage', () => {
  const renderLoginPage = () => {
    const store = setupStore();
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    renderLoginPage();
    expect(screen.getByTestId('guest-only-route')).toBeInTheDocument();
  });

  it('should wrap content in GuestOnlyRoute', () => {
    renderLoginPage();
    const guestRoute = screen.getByTestId('guest-only-route');
    expect(guestRoute).toBeInTheDocument();
  });

  it('should use MainLayout with sidebar hidden', () => {
    renderLoginPage();
    const mainLayout = screen.getByTestId('main-layout');
    expect(mainLayout).toBeInTheDocument();
    expect(mainLayout).toHaveAttribute('data-hide-sidebar', 'true');
  });

  it('should render LoginForm component', () => {
    renderLoginPage();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    renderLoginPage();
    const authPage = screen.getByTestId('auth-page');
    expect(authPage).toBeInTheDocument();
    expect(authPage).toHaveClass('auth-page');
  });

  it('should render welcome message', () => {
    renderLoginPage();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    renderLoginPage();
    expect(screen.getByText('Sign in to your Due Diligence Finance account')).toBeInTheDocument();
  });

  it('should have centered content container', () => {
    renderLoginPage();
    const container = screen.getByTestId('auth-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('auth-container');
  });

  it('should have correct heading hierarchy', () => {
    renderLoginPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Welcome Back');
  });

  it('should apply responsive classes', () => {
    renderLoginPage();
    const formWrapper = screen.getByTestId('form-wrapper');
    expect(formWrapper).toHaveClass('form-wrapper');
  });
});
