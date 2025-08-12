// frontend/src/components/auth/LoginForm.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { LoginForm } from './LoginForm';
import authReducer from '@/store/slices/authSlice';
import { AuthService } from '@/api/services/auth.service';

// Mock AuthService
jest.mock('@/api/services/auth.service');

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

describe('LoginForm', () => {
  const mockLogin = AuthService.login as jest.MockedFunction<typeof AuthService.login>;
  
  const renderWithProviders = (
    store = createTestStore(),
    props = {}
  ) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <LoginForm {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockReset();
  });

  describe('Form Rendering', () => {
    it('should render login form with all fields', () => {
      renderWithProviders();

      expect(screen.getByText('Sign In')).toBeInTheDocument();
      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    });

    it('should render with custom title when provided', () => {
      renderWithProviders(createTestStore(), { title: 'Welcome Back!' });

      expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      renderWithProviders();

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid username format', async () => {
      renderWithProviders();

      const usernameInput = screen.getByLabelText('Username');
      await userEvent.type(usernameInput, 'ab');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      renderWithProviders();

      const passwordInput = screen.getByLabelText('Password');
      await userEvent.type(passwordInput, '12345');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should call login API with form data on valid submission', async () => {
      mockLogin.mockResolvedValueOnce({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'CLIENT',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      renderWithProviders();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'password123',
        });
      });
    });

    it('should navigate to dashboard on successful login', async () => {
      mockLogin.mockResolvedValueOnce({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'CLIENT',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      renderWithProviders();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard/client');
      });
    });

    it('should navigate to redirect URL if provided', async () => {
      mockLogin.mockResolvedValueOnce({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'CLIENT',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });

      renderWithProviders(createTestStore(), { redirectTo: '/portfolio' });

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/portfolio');
      });
    });

    it('should show error message on login failure', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      renderWithProviders();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable form during submission', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

      renderWithProviders();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(usernameInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      renderWithProviders();

      const passwordInput = screen.getByLabelText('Password');
      const toggleButton = screen.getByLabelText('Toggle password visibility');

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password again
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to register page when sign up link is clicked', () => {
      renderWithProviders();

      const signUpLink = screen.getByText('Sign up');
      fireEvent.click(signUpLink);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should navigate to forgot password page when link is clicked', () => {
      renderWithProviders();

      const forgotPasswordLink = screen.getByText('Forgot password?');
      fireEvent.click(forgotPasswordLink);

      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });
  });

  describe('Remember Me', () => {
    it('should have remember me checkbox', () => {
      renderWithProviders();

      const rememberMeCheckbox = screen.getByLabelText('Remember me');
      expect(rememberMeCheckbox).toBeInTheDocument();
      expect(rememberMeCheckbox).not.toBeChecked();
    });

    it('should toggle remember me checkbox', async () => {
      renderWithProviders();

      const rememberMeCheckbox = screen.getByLabelText('Remember me');
      
      fireEvent.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).toBeChecked();

      fireEvent.click(rememberMeCheckbox);
      expect(rememberMeCheckbox).not.toBeChecked();
    });
  });

  describe('Error Handling', () => {
    it('should display specific error for inactive account', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Account is inactive'));

      renderWithProviders();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Account is inactive')).toBeInTheDocument();
      });
    });

    it('should clear error message when user starts typing', async () => {
      mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));

      renderWithProviders();

      const usernameInput = screen.getByLabelText('Username');
      const passwordInput = screen.getByLabelText('Password');

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'wrongpassword');

      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Start typing to clear error
      await userEvent.type(usernameInput, 'a');

      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });
});
