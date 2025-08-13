// frontend/src/components/auth/ForgotPasswordForm.tsx
import { useState, FormEvent, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { authService } from '@/services/authService';
import './ForgotPasswordForm.css';

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
}

export const ForgotPasswordForm = () => {
  const { callApi, loading, error } = useApi();
  const emailRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    email: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Focus email input on mount
    emailRef.current?.focus();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
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
        () => authService.forgotPassword(formData.email),
        formData
      );
      setIsSubmitted(true);
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

  return (
    <form onSubmit={handleSubmit} className="forgot-password-form" noValidate>
      <div className="form-instructions">
        <p>Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      {error && !isSubmitted && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {isSubmitted && (
        <div className="success-message" role="alert">
          <strong>Check your email!</strong>
          <p>We've sent a password reset link to {formData.email}</p>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          ref={emailRef}
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? 'error' : ''}
          disabled={isSubmitted}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="field-error">
            {errors.email}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={loading || isSubmitted}
      >
        {loading ? 'Sending...' : isSubmitted ? 'Email Sent' : 'Send Reset Link'}
      </button>

      <div className="form-footer">
        <Link to="/login" className="back-link">
          ← Back to Login
        </Link>
      </div>
    </form>
  );
};
