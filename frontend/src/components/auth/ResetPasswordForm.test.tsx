// frontend/src/components/auth/ResetPasswordForm.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ResetPasswordForm } from './ResetPasswordForm';
import { setupStore } from '@/store';
import { useApi } from '@/hooks/useApi';

// Mock the hooks
vi.mock('@/hooks/useApi');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useSearchParams: () => {
      const params = new URLSearchParams('token=test-token-123');
      return [params, vi.fn()];
    }
  };
});

describe('ResetPasswordForm', () => {
  const mockCallApi = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useApi as Mock).mockReturnValue({
      callApi: mockCallApi,
      loading: false,
      error: null
    });
  });

  const renderResetPasswordForm = () => {
    const store = setupStore();
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reset-password?token=test-token-123']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordForm />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render password input fields', () => {
    renderResetPasswordForm();
    
    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    renderResetPasswordForm();
    expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
  });

  it('should validate password is required', async () => {
    renderResetPasswordForm();
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should validate password strength', async () => {
    renderResetPasswordForm();
    const passwordInput = screen.getByLabelText(/new password/i);
    
    await userEvent.type(passwordInput, 'weak');
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should validate password match', async () => {
    renderResetPasswordForm();
    const passwordInput = screen.getByLabelText(/new password/i);
    const confirmInput = screen.getByLabelText(/confirm new password/i);
    
    await userEvent.type(passwordInput, 'StrongPass123!');
    await userEvent.type(confirmInput, 'DifferentPass123!');
    fireEvent.blur(confirmInput);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    renderResetPasswordForm();
    const passwordInput = screen.getByLabelText(/new password/i);
    const toggleButton = screen.getAllByRole('button', { name: /toggle password visibility/i })[0];
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should show error if no token provided', () => {
    const store = setupStore();
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/reset-password']}>
          <Routes>
            <Route path="/reset-password" element={<ResetPasswordForm />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid or missing reset token/i);
    expect(screen.getByRole('link', { name: /request a new reset link/i })).toHaveAttribute('href', '/forgot-password');
  });

  it('should submit form with valid data', async () => {
    mockCallApi.mockResolvedValueOnce({ success: true });
    
    renderResetPasswordForm();
    
    await userEvent.type(screen.getByLabelText(/new password/i), 'StrongPass123!');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'StrongPass123!');
    
    const submitButton = screen.getByRole('button', { name: /reset password/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCallApi).toHaveBeenCalledWith(
        expect.any(Function),
        {
          token: 'test-token-123',
          newPassword: 'StrongPass123!'
        }
      );
    });
  });

  it('should show loading state during submission', async () => {
    (useApi as Mock).mockReturnValue({
      callApi: mockCallApi,
      loading: true,
      error: null
    });
    
    renderResetPasswordForm();
    
    expect(screen.getByRole('button', { name: /resetting.../i })).toBeDisabled();
  });

  it('should display API error message', () => {
    const errorMessage = 'Reset token has expired';
    (useApi as Mock).mockReturnValue({
      callApi: mockCallApi,
      loading: false,
      error: errorMessage
    });
    
    renderResetPasswordForm();
    
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('should show success message after reset', async () => {
    mockCallApi.mockResolvedValueOnce({ success: true });
    
    renderResetPasswordForm();
    
    await userEvent.type(screen.getByLabelText(/new password/i), 'StrongPass123!');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'StrongPass123!');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/password reset successful/i);
      expect(screen.getByRole('alert')).toHaveClass('success-message');
    });
  });

  it('should show link to login after success', async () => {
    mockCallApi.mockResolvedValueOnce({ success: true });
    
    renderResetPasswordForm();
    
    await userEvent.type(screen.getByLabelText(/new password/i), 'StrongPass123!');
    await userEvent.type(screen.getByLabelText(/confirm new password/i), 'StrongPass123!');
    await userEvent.click(screen.getByRole('button', { name: /reset password/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /go to login/i })).toHaveAttribute('href', '/login');
    });
  });

  it('should display password requirements', () => {
    renderResetPasswordForm();
    
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one number/i)).toBeInTheDocument();
  });

  it('should have accessible form labels', () => {
    renderResetPasswordForm();
    
    const inputs = screen.getAllByLabelText(/password/i);
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName();
    });
  });
});
