// frontend/src/pages/auth/ForgotPasswordPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { setupStore } from '@/store';

// Mock the components
vi.mock('@/components/auth', () => ({
  GuestOnlyRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-only-route">{children}</div>
  ),
  ForgotPasswordForm: () => <div data-testid="forgot-password-form">Forgot Password Form Component</div>
}));

vi.mock('@/components/layout', () => ({
  MainLayout: ({ children, hideSidebar }: { children: React.ReactNode; hideSidebar?: boolean }) => (
    <div data-testid="main-layout" data-hide-sidebar={hideSidebar}>
      {children}
    </div>
  )
}));

describe('ForgotPasswordPage', () => {
  const renderForgotPasswordPage = () => {
    const store = setupStore();
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPasswordPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    renderForgotPasswordPage();
    expect(screen.getByTestId('guest-only-route')).toBeInTheDocument();
  });

  it('should wrap content in GuestOnlyRoute', () => {
    renderForgotPasswordPage();
    const guestRoute = screen.getByTestId('guest-only-route');
    expect(guestRoute).toBeInTheDocument();
  });

  it('should use MainLayout with sidebar hidden', () => {
    renderForgotPasswordPage();
    const mainLayout = screen.getByTestId('main-layout');
    expect(mainLayout).toBeInTheDocument();
    expect(mainLayout).toHaveAttribute('data-hide-sidebar', 'true');
  });

  it('should render ForgotPasswordForm component', () => {
    renderForgotPasswordPage();
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    renderForgotPasswordPage();
    const authPage = screen.getByTestId('auth-page');
    expect(authPage).toBeInTheDocument();
    expect(authPage).toHaveClass('auth-page');
  });

  it('should render page title', () => {
    renderForgotPasswordPage();
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    renderForgotPasswordPage();
    expect(screen.getByText("We'll help you get back into your account")).toBeInTheDocument();
  });

  it('should have centered content container', () => {
    renderForgotPasswordPage();
    const container = screen.getByTestId('auth-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('auth-container');
  });

  it('should have correct heading hierarchy', () => {
    renderForgotPasswordPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Reset Your Password');
  });

  it('should apply responsive classes', () => {
    renderForgotPasswordPage();
    const formWrapper = screen.getByTestId('form-wrapper');
    expect(formWrapper).toHaveClass('form-wrapper');
  });

  it('should render security icon', () => {
    renderForgotPasswordPage();
    const icon = screen.getByTestId('security-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('🔐');
  });
});
