// frontend/src/components/auth/RegisterForm.test.tsx
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { RegisterForm } from './RegisterForm';
import { setupStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { RegisterRequest } from '@/types/auth';

// Mock the hooks
vi.mock('@/hooks/useAuth');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

describe('RegisterForm', () => {
  const mockRegister = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as Mock).mockReturnValue({
      register: mockRegister,
      loading: false,
      error: null
    });
  });

  const renderRegisterForm = () => {
    const store = setupStore();
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <RegisterForm />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render all form fields', () => {
    renderRegisterForm();
    
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /role/i })).toBeInTheDocument();
  });

  it('should render register button', () => {
    renderRegisterForm();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('should have login link', () => {
    renderRegisterForm();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute('href', '/login');
  });

  it('should require all fields', async () => {
    renderRegisterForm();
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    renderRegisterForm();
    const emailInput = screen.getByLabelText(/email/i);
    
    await userEvent.type(emailInput, 'invalid-email');
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('should validate password strength', async () => {
    renderRegisterForm();
    const passwordInput = screen.getByLabelText(/^password/i);
    
    await userEvent.type(passwordInput, 'weak');
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('should validate password match', async () => {
    renderRegisterForm();
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    
    await userEvent.type(passwordInput, 'StrongPass123!');
    await userEvent.type(confirmInput, 'DifferentPass123!');
    fireEvent.blur(confirmInput);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', async () => {
    renderRegisterForm();
    const passwordInput = screen.getByLabelText(/^password/i);
    const toggleButton = screen.getAllByRole('button', { name: /toggle password visibility/i })[0];
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should submit form with valid data', async () => {
    const mockResponse = { success: true };
    mockRegister.mockResolvedValueOnce(mockResponse);
    
    renderRegisterForm();
    
    await userEvent.type(screen.getByLabelText(/first name/i), 'John');
    await userEvent.type(screen.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/^password/i), 'StrongPass123!');
    await userEvent.type(screen.getByLabelText(/confirm password/i), 'StrongPass123!');
    await userEvent.type(screen.getByLabelText(/phone number/i), '1234567890');
    await userEvent.selectOptions(screen.getByRole('combobox', { name: /role/i }), 'CLIENT');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await userEvent.click(submitButton);
    
    await waitFor(() => {
      const expectedData: RegisterRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'StrongPass123!',
        phoneNumber: '1234567890',
        role: 'CLIENT'
      };
      expect(mockRegister).toHaveBeenCalledWith(expectedData);
    });
  });

  it('should show loading state during submission', async () => {
    (useAuth as Mock).mockReturnValue({
      register: mockRegister,
      loading: true,
      error: null
    });
    
    renderRegisterForm();
    
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });

  it('should display error message', () => {
    const errorMessage = 'Email already exists';
    (useAuth as Mock).mockReturnValue({
      register: mockRegister,
      loading: false,
      error: errorMessage
    });
    
    renderRegisterForm();
    
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('should validate phone number format', async () => {
    renderRegisterForm();
    const phoneInput = screen.getByLabelText(/phone number/i);
    
    await userEvent.type(phoneInput, '123');
    fireEvent.blur(phoneInput);
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid phone number/i)).toBeInTheDocument();
    });
  });

  it('should have accessible form labels', () => {
    renderRegisterForm();
    
    const inputs = screen.getAllByRole('textbox');
    const selects = screen.getAllByRole('combobox');
    
    inputs.forEach(input => {
      expect(input).toHaveAccessibleName();
    });
    
    selects.forEach(select => {
      expect(select).toHaveAccessibleName();
    });
  });

  it('should show role descriptions', () => {
    renderRegisterForm();
    
    expect(screen.getByText(/client.*invest and manage portfolio/i)).toBeInTheDocument();
    expect(screen.getByText(/employee.*assist clients/i)).toBeInTheDocument();
    expect(screen.getByText(/admin.*full system access/i)).toBeInTheDocument();
  });

  it('should focus first error field on validation', async () => {
    renderRegisterForm();
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(document.activeElement).toBe(firstNameInput);
    });
  });
});
