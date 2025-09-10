// frontend/src/pages/auth/ResetPasswordPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ResetPasswordPage } from './ResetPasswordPage';
import { setupStore } from '@/store';

// Mock the components
vi.mock('@/components/auth', () => ({
  GuestOnlyRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-only-route">{children}</div>
  ),
  ResetPasswordForm: () => <div data-testid="reset-password-form">Reset Password Form Component</div>
}));

vi.mock('@/components/layout', () => ({
  MainLayout: ({ children, hideSidebar }: { children: React.ReactNode; hideSidebar?: boolean }) => (
    <div data-testid="main-layout" data-hide-sidebar={hideSidebar}>
      {children}
    </div>
  )
}));

describe('ResetPasswordPage', () => {
  const renderResetPasswordPage = (route = '/reset-password?token=test-token') => {
    const store = setupStore();
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    renderResetPasswordPage();
    expect(screen.getByTestId('guest-only-route')).toBeInTheDocument();
  });

  it('should wrap content in GuestOnlyRoute', () => {
    renderResetPasswordPage();
    const guestRoute = screen.getByTestId('guest-only-route');
    expect(guestRoute).toBeInTheDocument();
  });

  it('should use MainLayout with sidebar hidden', () => {
    renderResetPasswordPage();
    const mainLayout = screen.getByTestId('main-layout');
    expect(mainLayout).toBeInTheDocument();
    expect(mainLayout).toHaveAttribute('data-hide-sidebar', 'true');
  });

  it('should render ResetPasswordForm component', () => {
    renderResetPasswordPage();
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    renderResetPasswordPage();
    const authPage = screen.getByTestId('auth-page');
    expect(authPage).toBeInTheDocument();
    expect(authPage).toHaveClass('auth-page');
  });

  it('should render page title', () => {
    renderResetPasswordPage();
    expect(screen.getByText('Create New Password')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    renderResetPasswordPage();
    expect(screen.getByText('Choose a strong password to secure your account')).toBeInTheDocument();
  });

  it('should have centered content container', () => {
    renderResetPasswordPage();
    const container = screen.getByTestId('auth-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('auth-container');
  });

  it('should have correct heading hierarchy', () => {
    renderResetPasswordPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Create New Password');
  });

  it('should apply responsive classes', () => {
    renderResetPasswordPage();
    const formWrapper = screen.getByTestId('form-wrapper');
    expect(formWrapper).toHaveClass('form-wrapper');
  });

  it('should render key icon', () => {
    renderResetPasswordPage();
    const icon = screen.getByTestId('key-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveTextContent('🔑');
  });

  it('should pass with token in URL', () => {
    renderResetPasswordPage('/reset-password?token=abc123');
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });

  it('should work without token (form will handle error)', () => {
    renderResetPasswordPage('/reset-password');
    expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
  });
});
