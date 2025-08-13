// frontend/src/components/auth/ForgotPasswordForm.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { setupStore } from '@/store';
import { useApi } from '@/hooks/useApi';

// Mock the hooks
vi.mock('@/hooks/useApi');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('ForgotPasswordForm', () => {
  const mockCallApi = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as Mock).mockReturnValue({
      callApi: mockCallApi,
      loading: false,
      error: null
    });
  });

  const renderForgotPasswordForm = () => {
    const store = setupStore();
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ForgotPasswordForm />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render email input field', () => {
    renderForgotPasswordForm();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderForgotPasswordForm();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('should have back to login link', () => {
    renderForgotPasswordForm();
    expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login');
  });

  it('should render instructions text', () => {
    renderForgotPasswordForm();
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
  });

  it('should validate email is required', async () => {
    renderForgotPasswordForm();
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderForgotPasswordForm();
    const emailInput = screen.getByLabelText(/email address/i);
    
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid email', async () => {
    mockCallApi.mockResolvedValueOnce({ success: true });
    
    renderForgotPasswordForm();
    const emailInput = screen.getByLabelText(/email address/i);
    
    await userEvent.type(emailInput, 'user@example.com');
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCallApi).toHaveBeenCalledWith(
        expect.any(Function),
        { email: 'user@example.com' }
      );
    });
  });

  it('should show loading state during submission', async () => {
    (useApi as Mock).mockReturnValue({
      callApi: mockCallApi,
      loading: true,
      error: null
    });
    
    renderForgotPasswordForm();
    
    expect(screen.getByRole('button', { name: /sending.../i })).toBeDisabled();
  });

  it('should display error message on failure', () => {
    const errorMessage = 'Email not found';
    (useApi as Mock).mockReturnValue({
      callApi: mockCallApi,
      loading: false,
      error: errorMessage
    });
    
    renderForgotPasswordForm();
    
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('should show success message after submission', async () => {
    mockCallApi.mockResolvedValueOnce({ success: true });
    
    renderForgotPasswordForm();
    const emailInput = screen.getByLabelText(/email address/i);
    
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/check your email/i);
      expect(screen.getByRole('alert')).toHaveClass('success-message');
    });
  });

  it('should disable form after successful submission', async () => {
    mockCallApi.mockResolvedValueOnce({ success: true });
    
    renderForgotPasswordForm();
    const emailInput = screen.getByLabelText(/email address/i);
    
    await userEvent.type(emailInput, 'user@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send reset link/i }));
    
    await waitFor(() => {
      expect(emailInput).toBeDisabled();
      expect(screen.getByRole('button', { name: /email sent/i })).toBeDisabled();
    });
  });

  it('should clear error when typing', async () => {
    renderForgotPasswordForm();
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    
    // Trigger error
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
    
    // Type to clear error
    await userEvent.type(emailInput, 'u');
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  it('should have accessible form labels', () => {
    renderForgotPasswordForm();
    
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toHaveAccessibleName();
  });

  it('should focus email input on mount', () => {
    renderForgotPasswordForm();
    
    const emailInput = screen.getByLabelText(/email address/i);
    expect(document.activeElement).toBe(emailInput);
  });
});
