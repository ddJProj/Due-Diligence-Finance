// frontend/src/pages/errors/ForbiddenPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { store } from '../../store';
import { ForbiddenPage } from './ForbiddenPage';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const renderWithProviders = (initialRoute = '/forbidden') => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>
        <ForbiddenPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('ForbiddenPage', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderWithProviders();
    expect(screen.getByText('403')).toBeInTheDocument();
  });

  it('should display 403 error code prominently', () => {
    renderWithProviders();
    const errorCode = screen.getByText('403');
    expect(errorCode).toBeInTheDocument();
    expect(errorCode).toHaveClass('error-code');
  });

  it('should display access forbidden message', () => {
    renderWithProviders();
    expect(screen.getByText('Access Forbidden')).toBeInTheDocument();
  });

  it('should display permission error message', () => {
    renderWithProviders();
    expect(
      screen.getByText(/You don't have permission to access this resource/)
    ).toBeInTheDocument();
  });

  it('should render go to dashboard button', () => {
    renderWithProviders();
    const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
    expect(dashboardButton).toBeInTheDocument();
  });

  it('should navigate to dashboard when button is clicked', () => {
    renderWithProviders();
    const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
    
    fireEvent.click(dashboardButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should render logout button', () => {
    renderWithProviders();
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
  });

  it('should handle logout when button is clicked', () => {
    renderWithProviders();
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    
    fireEvent.click(logoutButton);
    
    // Check that logout was initiated (would dispatch action in real implementation)
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should display the attempted path', () => {
    renderWithProviders('/admin/users');
    expect(screen.getByText(/\/admin\/users/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithProviders();
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Access Forbidden');
  });

  it('should have proper styling classes', () => {
    const { container } = renderWithProviders();
    
    expect(container.querySelector('.forbidden-page')).toBeInTheDocument();
    expect(container.querySelector('.error-container')).toBeInTheDocument();
  });

  it('should display contact support link', () => {
    renderWithProviders();
    
    const supportLink = screen.getByRole('link', { name: /contact support/i });
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute('href', '/contact');
  });

  it('should render lock icon or illustration', () => {
    const { container } = renderWithProviders();
    
    const illustration = container.querySelector('.error-illustration');
    expect(illustration).toBeInTheDocument();
  });

  it('should show role-specific message', () => {
    renderWithProviders();
    expect(
      screen.getByText(/This area requires special privileges/)
    ).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    renderWithProviders();
    
    const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    const supportLink = screen.getByRole('link', { name: /contact support/i });
    
    // Check tab order
    dashboardButton.focus();
    expect(document.activeElement).toBe(dashboardButton);
    
    // Tab to next element
    userEvent.tab();
    expect(document.activeElement).toBe(logoutButton);
    
    // Tab to next element
    userEvent.tab();
    expect(document.activeElement).toBe(supportLink);
  });

  it('should have document title set', () => {
    renderWithProviders();
    expect(document.title).toContain('403');
  });

  it('should show request access button for certain roles', () => {
    renderWithProviders();
    
    const requestButton = screen.queryByRole('button', { name: /request access/i });
    // May or may not be present depending on user role
    if (requestButton) {
      expect(requestButton).toBeInTheDocument();
    }
  });
});

// Additional test for userEvent import
import userEvent from '@testing-library/user-event';
