// frontend/src/pages/shared/EditProfilePage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectUser } from '@/store/slices/authSlice';
import { adminService } from '@/api/AdminService';
import { clientService } from '@/api/ClientService';
import { employeeService } from '@/api/EmployeeService';
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Card,
  ConfirmDialog,
} from '@/components/common';
import './EditProfilePage.css';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth?: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  // Form data
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
  });
  
  // Original data for comparison
  const [originalData, setOriginalData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
  });

  // Load profile data
  const loadProfile = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      let profileData: any;
      switch (currentUser.role) {
        case 'CLIENT':
          profileData = await clientService.getProfile();
          break;
        case 'EMPLOYEE':
          profileData = await employeeService.getProfile();
          break;
        case 'ADMIN':
          profileData = await adminService.getUserProfile(currentUser.id);
          break;
        default:
          setError('Profile editing not available for guest users');
          setLoading(false);
          return;
      }
      
      const data: ProfileFormData = {
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
        dateOfBirth: profileData.dateOfBirth || '',
      };
      
      setFormData(data);
      setOriginalData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Check for changes
  useEffect(() => {
    const changed = Object.keys(formData).some(
      key => formData[key as keyof ProfileFormData] !== originalData[key as keyof ProfileFormData]
    );
    setHasChanges(changed);
  }, [formData, originalData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Required fields
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    // Phone number validation (if provided)
    if (formData.phoneNumber) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(formData.phoneNumber) || formData.phoneNumber.length < 10) {
        errors.phoneNumber = 'Invalid phone number format';
      }
    }
    
    // Date of birth validation (if provided)
    if (formData.dateOfBirth) {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
      }
      if (dob.getFullYear() < 1900) {
        errors.dateOfBirth = 'Invalid date of birth';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !currentUser) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const updateData: Partial<ProfileFormData> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      };
      
      // Include optional fields only if they have values
      if (formData.address?.trim()) {
        updateData.address = formData.address.trim();
      }
      if (formData.dateOfBirth?.trim()) {
        updateData.dateOfBirth = formData.dateOfBirth.trim();
      }
      
      switch (currentUser.role) {
        case 'CLIENT':
          await clientService.updateProfile(updateData);
          break;
        case 'EMPLOYEE':
          await employeeService.updateProfile(updateData);
          break;
        case 'ADMIN':
          await adminService.updateUserProfile(currentUser.id, updateData);
          break;
      }
      
      // Navigate back to profile page
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      navigate('/profile');
    }
  };

  const confirmCancel = () => {
    navigate('/profile');
  };

  // Guest users
  if (currentUser?.role === 'GUEST') {
    return (
      <div className="edit-profile-page">
        <div className="guest-message">
          <h2>Guest Account</h2>
          <p>Please log in to edit your profile.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="edit-profile-page">
        <LoadingSpinner size="large" message="Loading profile..." />
      </div>
    );
  }

  if (error && !formData.firstName) {
    return (
      <div className="edit-profile-page">
        <ErrorMessage
          message="Failed to load profile"
          details={error}
          onRetry={loadProfile}
        />
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-header">
        <h1>Edit Profile</h1>
      </div>

      <Card className="edit-profile-form-card">
        <form onSubmit={handleSave} className="edit-profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">
                  First Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={validationErrors.firstName ? 'error' : ''}
                  disabled={saving}
                />
                {validationErrors.firstName && (
                  <span className="error-message">{validationErrors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">
                  Last Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={validationErrors.lastName ? 'error' : ''}
                  disabled={saving}
                />
                {validationErrors.lastName && (
                  <span className="error-message">{validationErrors.lastName}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className={validationErrors.phoneNumber ? 'error' : ''}
                  disabled={saving}
                />
                {validationErrors.phoneNumber && (
                  <span className="error-message">{validationErrors.phoneNumber}</span>
                )}
              </div>

              {currentUser?.role === 'CLIENT' && (
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={validationErrors.dateOfBirth ? 'error' : ''}
                    disabled={saving}
                  />
                  {validationErrors.dateOfBirth && (
                    <span className="error-message">{validationErrors.dateOfBirth}</span>
                  )}
                </div>
              )}
            </div>

            {currentUser?.role === 'CLIENT' && (
              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="123 Main St, City, State ZIP"
                  disabled={saving}
                />
              </div>
            )}
          </div>

          <div className="form-note">
            <p>
              <strong>Note:</strong> To change your email address or other account settings, 
              please go to <button
                type="button"
                className="link-button"
                onClick={() => navigate('/settings')}
              >
                Settings
              </button>.
            </p>
          </div>

          {error && (
            <ErrorMessage
              message="Failed to update profile"
              details={error}
            />
          )}

          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={saving || !hasChanges}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave?"
        confirmText="Discard"
        cancelText="Stay"
        variant="warning"
      />
    </div>
  );
};

export default EditProfilePage;
