// frontend/src/pages/admin/users/EditUserPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../hooks/redux';
import { adminService } from '../../../services/adminService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { showToast } from '../../../store/slices/uiSlice';
import type { UserAccountDTO, UpdateUserRequest } from '../../../types/admin.types';
import './EditUserPage.css';

export const EditUserPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserAccountDTO | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'CLIENT',
    active: true
  });

  // Password reset state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Validation state
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      if (!id || isNaN(parseInt(id))) {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userData = await adminService.getUser(parseInt(id));
        setUser(userData);
        setFormData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          phoneNumber: userData.phoneNumber || '',
          role: userData.role,
          active: userData.active
        });
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password validation
  const validatePassword = (): boolean => {
    const errors: Record<string, string> = {};

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string): string => {
    if (!password) return '';

    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    try {
      setSaving(true);
      
      // Update user details
      const updateRequest: UpdateUserRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber || undefined,
        active: formData.active
      };

      await adminService.updateUser(user.id, updateRequest);

      // Update role if changed
      if (formData.role !== user.role) {
        await adminService.updateUserRole(user.id, formData.role);
      }

      dispatch(showToast({
        message: 'User updated successfully',
        type: 'success'
      }));

      navigate('/admin/users');
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to update user',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async () => {
    if (!validatePassword() || !user) return;

    try {
      setSaving(true);
      await adminService.resetUserPassword(user.id, passwordData.newPassword);
      
      dispatch(showToast({
        message: 'Password reset successfully',
        type: 'success'
      }));

      // Clear password form
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordReset(false);
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to reset password',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error) {
    return (
      <div className="edit-user-page">
        <Card>
          <div className="error-state">
            <p>{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="edit-user-page">
        <Card>
          <p>User not found</p>
        </Card>
      </div>
    );
  }

  const isFormValid = Object.keys(formErrors).length === 0 && 
    formData.firstName && formData.lastName && formData.email;

  const isPasswordValid = Object.keys(passwordErrors).length === 0 &&
    passwordData.newPassword && passwordData.confirmPassword;

  const passwordStrength = calculatePasswordStrength(passwordData.newPassword);

  return (
    <div className="edit-user-page">
      <div className="page-header">
        <h1>Edit User</h1>
        <p>Update user account information</p>
      </div>

      <Card className="user-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>User Details</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  onBlur={() => validateForm()}
                  className={formErrors.firstName ? 'error' : ''}
                />
                {formErrors.firstName && (
                  <span className="error-message">{formErrors.firstName}</span>
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
                  onBlur={() => validateForm()}
                  className={formErrors.lastName ? 'error' : ''}
                />
                {formErrors.lastName && (
                  <span className="error-message">{formErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => validateForm()}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && (
                  <span className="error-message">{formErrors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">User Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                >
                  <option value="CLIENT">Client</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Active Account
                </label>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/admin/users')}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid || saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="password-reset-card">
        <div className="password-reset-section">
          {!showPasswordReset ? (
            <>
              <h2>Password Management</h2>
              <p>Reset the user's password if needed</p>
              <Button
                variant="warning"
                onClick={() => setShowPasswordReset(true)}
              >
                Reset Password
              </Button>
            </>
          ) : (
            <>
              <h2>Reset Password</h2>
              <div className="password-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    onBlur={() => validatePassword()}
                    className={passwordErrors.newPassword ? 'error' : ''}
                  />
                  {passwordErrors.newPassword && (
                    <span className="error-message">{passwordErrors.newPassword}</span>
                  )}
                  {passwordData.newPassword && (
                    <div className={`password-strength strength-${passwordStrength.toLowerCase()}`}>
                      Password strength: {passwordStrength}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    onBlur={() => validatePassword()}
                    className={passwordErrors.confirmPassword ? 'error' : ''}
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="error-message">{passwordErrors.confirmPassword}</span>
                  )}
                </div>

                <div className="password-actions">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowPasswordReset(false);
                      setPasswordData({ newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handlePasswordReset}
                    disabled={!isPasswordValid || saving}
                  >
                    {saving ? 'Saving...' : 'Save New Password'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};
