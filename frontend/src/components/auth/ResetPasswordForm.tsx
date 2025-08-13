// frontend/src/components/auth/ResetPasswordForm.tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { authService } from '@/services/authService';
import './ResetPasswordForm.css';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  newPassword?: string;
  confirmPassword?: string;
}

export const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { callApi, loading, error } = useApi();
  
  const [formData, setFormData] = useState<FormData>({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReset, setIsReset] = useState(false);

  // Check if token exists
  if (!token) {
    return (
      <div className="reset-password-form">
        <div className="error-message" role="alert">
          <strong>Invalid or missing reset token</strong>
          <p>The password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="reset-link">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await callApi(
        () => authService.resetPassword(token, formData.newPassword),
        { token, newPassword: formData.newPassword }
      );
      setIsReset(true);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (isReset) {
    return (
      <div className="reset-password-form">
        <div className="success-message" role="alert">
          <strong>Password Reset Successful!</strong>
          <p>Your password has been reset. You can now log in with your new password.</p>
          <Link to="/login" className="login-link">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="reset-password-form" noValidate>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="password-requirements">
        <p>Your new password must contain:</p>
        <ul>
          <li>At least 8 characters</li>
          <li>One uppercase letter</li>
          <li>One lowercase letter</li>
          <li>One number</li>
        </ul>
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            className={errors.newPassword ? 'error' : ''}
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? 'newPassword-error' : undefined}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.newPassword && (
          <span id="newPassword-error" className="field-error">
            {errors.newPassword}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={errors.confirmPassword ? 'error' : ''}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="Toggle password visibility"
          >
            {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.confirmPassword && (
          <span id="confirmPassword-error" className="field-error">
            {errors.confirmPassword}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={loading}
      >
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
};
