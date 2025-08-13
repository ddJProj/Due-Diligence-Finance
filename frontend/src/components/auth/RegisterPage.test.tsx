// frontend/src/pages/auth/RegisterPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { RegisterPage } from './RegisterPage';
import { setupStore } from '@/store';

// Mock the components
vi.mock('@/components/auth', () => ({
  GuestOnlyRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="guest-only-route">{children}</div>
  ),
  RegisterForm: () => <div data-testid="register-form">Register Form Component</div>
}));

vi.mock('@/components/layout', () => ({
  MainLayout: ({ children, hideSidebar }: { children: React.ReactNode; hideSidebar?: boolean }) => (
    <div data-testid="main-layout" data-hide-sidebar={hideSidebar}>
      {children}
    </div>
  )
}));

describe('RegisterPage', () => {
  const renderRegisterPage = () => {
    const store = setupStore();
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    renderRegisterPage();
    expect(screen.getByTestId('guest-only-route')).toBeInTheDocument();
  });

  it('should wrap content in GuestOnlyRoute', () => {
    renderRegisterPage();
    const guestRoute = screen.getByTestId('guest-only-route');
    expect(guestRoute).toBeInTheDocument();
  });

  it('should use MainLayout with sidebar hidden', () => {
    renderRegisterPage();
    const mainLayout = screen.getByTestId('main-layout');
    expect(mainLayout).toBeInTheDocument();
    expect(mainLayout).toHaveAttribute('data-hide-sidebar', 'true');
  });

  it('should render RegisterForm component', () => {
    renderRegisterPage();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('should have proper page structure', () => {
    renderRegisterPage();
    const authPage = screen.getByTestId('auth-page');
    expect(authPage).toBeInTheDocument();
    expect(authPage).toHaveClass('auth-page');
  });

  it('should render welcome message', () => {
    renderRegisterPage();
    expect(screen.getByText('Create Your Account')).toBeInTheDocument();
  });

  it('should render subtitle', () => {
    renderRegisterPage();
    expect(screen.getByText('Join Due Diligence Finance to start investing')).toBeInTheDocument();
  });

  it('should have centered content container', () => {
    renderRegisterPage();
    const container = screen.getByTestId('auth-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('auth-container');
  });

  it('should have correct heading hierarchy', () => {
    renderRegisterPage();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Create Your Account');
  });

  it('should apply responsive classes', () => {
    renderRegisterPage();
    const formWrapper = screen.getByTestId('form-wrapper');
    expect(formWrapper).toHaveClass('form-wrapper');
  });

  it('should render benefits section', () => {
    renderRegisterPage();
    expect(screen.getByText('Why Choose Due Diligence Finance?')).toBeInTheDocument();
  });

  it('should render all benefit items', () => {
    renderRegisterPage();
    expect(screen.getByText(/Professional Portfolio Management/)).toBeInTheDocument();
    expect(screen.getByText(/Real-time Market Data/)).toBeInTheDocument();
    expect(screen.getByText(/Secure & Compliant/)).toBeInTheDocument();
    expect(screen.getByText(/Expert Support/)).toBeInTheDocument();
  });

  it('should use wider container for register page', () => {
    renderRegisterPage();
    const container = screen.getByTestId('auth-container');
    expect(container).toHaveClass('auth-container--wide');
  });
});
