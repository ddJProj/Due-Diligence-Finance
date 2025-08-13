// frontend/src/components/auth/RegisterForm.tsx
import { useState, FormEvent, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RegisterRequest, UserRole } from '@/types/auth';
import './RegisterForm.css';

interface FormData extends RegisterRequest {
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phoneNumber?: string;
  role?: string;
}

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const firstNameRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    role: 'CLIENT' as UserRole
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Focus first error field
      if (errors.firstName && firstNameRef.current) {
        firstNameRef.current.focus();
      }
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.phoneNumber && !/^\d{10,}$/.test(formData.phoneNumber.replace(/[^\d]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
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
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form" noValidate>
      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            ref={firstNameRef}
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={errors.firstName ? 'error' : ''}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'firstName-error' : undefined}
          />
          {errors.firstName && (
            <span id="firstName-error" className="field-error">
              {errors.firstName}
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={errors.lastName ? 'error' : ''}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lastName-error' : undefined}
          />
          {errors.lastName && (
            <span id="lastName-error" className="field-error">
              {errors.lastName}
            </span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={errors.email ? 'error' : ''}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="field-error">
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={errors.password ? 'error' : ''}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
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
        {errors.password && (
          <span id="password-error" className="field-error">
            {errors.password}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
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

      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number (Optional)</label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          className={errors.phoneNumber ? 'error' : ''}
          aria-invalid={!!errors.phoneNumber}
          aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
        />
        {errors.phoneNumber && (
          <span id="phoneNumber-error" className="field-error">
            {errors.phoneNumber}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="role">Account Type</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className={errors.role ? 'error' : ''}
        >
          <option value="CLIENT">Client - Invest and manage portfolio</option>
          <option value="EMPLOYEE">Employee - Assist clients</option>
          <option value="ADMIN">Admin - Full system access</option>
        </select>
        {errors.role && (
          <span id="role-error" className="field-error">
            {errors.role}
          </span>
        )}
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      <div className="form-footer">
        <span>Already have an account? </span>
        <Link to="/login">Sign In</Link>
      </div>
    </form>
  );
};
