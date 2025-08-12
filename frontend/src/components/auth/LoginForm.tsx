// frontend/src/components/auth/LoginForm.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth.types';
import './LoginForm.css';

interface LoginFormProps {
  title?: string;
  redirectTo?: string;
}

interface FormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  username?: string;
  password?: string;
}

const ROLE_DASHBOARDS: Record<Role, string> = {
  [Role.ADMIN]: '/dashboard/admin',
  [Role.EMPLOYEE]: '/dashboard/employee',
  [Role.CLIENT]: '/dashboard/client',
  [Role.GUEST]: '/',
};

/**
 * LoginForm component for user authentication
 * Handles form validation, submission, and navigation
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  title = 'Sign In',
  redirectTo,
}) => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear errors when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (apiError) {
      setApiError(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await login(formData.username, formData.password);
      
      if (response && response.user) {
        // Navigate to appropriate dashboard or redirect URL
        const destination = redirectTo || ROLE_DASHBOARDS[response.user.role as Role];
        navigate(destination);
      }
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="form-title">{title}</h2>

        {apiError && (
          <div className="error-message" role="alert">
            {apiError}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            className={`form-input ${errors.username ? 'error' : ''}`}
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            autoComplete="username"
            aria-describedby={errors.username ? 'username-error' : undefined}
          />
          {errors.username && (
            <span id="username-error" className="field-error">
              {errors.username}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              autoComplete="current-password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={togglePasswordVisibility}
              aria-label="Toggle password visibility"
              disabled={loading}
            >
              {showPassword ? '👁️‍🗨️' : '👁️'}
            </button>
          </div>
          {errors.password && (
            <span id="password-error" className="field-error">
              {errors.password}
            </span>
          )}
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Remember me</span>
          </label>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/forgot-password')}
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="form-footer">
          <span>Don't have an account?</span>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/register')}
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
};
