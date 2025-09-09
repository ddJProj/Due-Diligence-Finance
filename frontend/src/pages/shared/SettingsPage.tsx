// frontend/src/pages/shared/SettingsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectUser, logout } from '@/store/slices/authSlice';
import { authService } from '@/api/AuthService';
import { adminService } from '@/api/AdminService';
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Card,
  ConfirmDialog,
} from '@/components/common';
import './SettingsPage.css';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Settings state
  const [email, setEmail] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorEnabled: false,
    sessionTimeout: 30,
  });
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<Partial<PasswordForm>>({});
  
  // Confirmation dialogs
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [show2FAConfirm, setShow2FAConfirm] = useState(false);
  const [twoFAPassword, setTwoFAPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteFinal, setShowDeleteFinal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      if (currentUser.role === 'GUEST') {
        setLoading(false);
        return;
      }
      
      const prefs = await adminService.getUserPreferences(currentUser.id);
      setPreferences(prefs);
      setEmail(currentUser.email);
      setOriginalEmail(currentUser.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Clear messages after delay
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Invalid email format');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Handle email update
  const handleEmailUpdate = async () => {
    if (!validateEmail(email) || email === originalEmail) return;
    setShowEmailConfirm(true);
  };

  const confirmEmailUpdate = async () => {
    setSaving('email');
    try {
      await authService.updateEmail({
        newEmail: email,
        currentPassword: emailConfirmPassword,
      });
      setOriginalEmail(email);
      setSuccess('Email updated successfully');
      setShowEmailConfirm(false);
      setEmailConfirmPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    } finally {
      setSaving(null);
    }
  };

  // Validate password
  const validatePassword = (): boolean => {
    const errors: Partial<PasswordForm> = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    
    setSaving('password');
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess('Password changed successfully');
      setShowPasswordChange(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(null);
    }
  };

  // Handle preferences update
  const handlePreferencesUpdate = async (section: string) => {
    setSaving(section);
    try {
      await adminService.updateUserPreferences(currentUser!.id, preferences);
      setSuccess('Preferences updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setSaving(null);
    }
  };

  // Handle 2FA toggle
  const handle2FAToggle = () => {
    if (!preferences.twoFactorEnabled) {
      setShow2FAConfirm(true);
    } else {
      setPreferences(prev => ({ ...prev, twoFactorEnabled: false }));
      handlePreferencesUpdate('security');
    }
  };

  const confirm2FAEnable = async () => {
    try {
      // Verify password first
      setSaving('2fa');
      // In real app, would verify password with backend
      setPreferences(prev => ({ ...prev, twoFactorEnabled: true }));
      await handlePreferencesUpdate('security');
      setShow2FAConfirm(false);
      setTwoFAPassword('');
    } catch (err) {
      setError('Failed to enable two-factor authentication');
    } finally {
      setSaving(null);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    
    setSaving('delete');
    try {
      await authService.deleteAccount();
      dispatch(logout());
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setSaving(null);
    }
  };

  if (currentUser?.role === 'GUEST') {
    return (
      <div className="settings-page">
        <div className="guest-message">
          <h2>Guest Account</h2>
          <p>Please log in to access settings.</p>
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
      <div className="settings-page">
        <LoadingSpinner size="large" message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
      </div>

      {error && (
        <ErrorMessage
          message="Error"
          details={error}
          onDismiss={() => setError(null)}
        />
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="settings-content">
        {/* Account Settings */}
        <Card className="settings-section">
          <h2>Account Settings</h2>
          
          <div className="setting-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-group">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                className={emailError ? 'error' : ''}
              />
              <Button
                size="small"
                onClick={handleEmailUpdate}
                disabled={email === originalEmail || !!emailError || saving === 'email'}
                loading={saving === 'email'}
              >
                Update Email
              </Button>
            </div>
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          <div className="setting-group">
            <label>Password</label>
            {!showPasswordChange ? (
              <Button
                variant="secondary"
                size="small"
                onClick={() => setShowPasswordChange(true)}
              >
                Change Password
              </Button>
            ) : (
              <div className="password-change-form">
                <input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className={passwordErrors.currentPassword ? 'error' : ''}
                />
                {passwordErrors.currentPassword && (
                  <span className="error-message">{passwordErrors.currentPassword}</span>
                )}
                
                <input
                  type="password"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={passwordErrors.newPassword ? 'error' : ''}
                />
                {passwordErrors.newPassword && (
                  <span className="error-message">{passwordErrors.newPassword}</span>
                )}
                
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={passwordErrors.confirmPassword ? 'error' : ''}
                />
                {passwordErrors.confirmPassword && (
                  <span className="error-message">{passwordErrors.confirmPassword}</span>
                )}
                
                <div className="form-actions">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      setShowPasswordChange(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    onClick={handlePasswordChange}
                    disabled={saving === 'password'}
                    loading={saving === 'password'}
                  >
                    Save New Password
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Preferences */}
        <Card className="settings-section">
          <h2>Preferences</h2>
          
          <div className="settings-grid">
            <div className="setting-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                value={preferences.theme}
                onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value as any }))}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="setting-group">
              <label htmlFor="language">Language</label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            <div className="setting-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences(prev => ({ ...prev, timezone: e.target.value }))}
              >
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>

            <div className="setting-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                value={preferences.currency}
                onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => handlePreferencesUpdate('preferences')}
              disabled={saving === 'preferences'}
              loading={saving === 'preferences'}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="settings-section">
          <h2>Notifications</h2>
          
          <div className="settings-list">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.emailNotifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
              />
              <span>Email notifications</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.smsNotifications}
                onChange={(e) => setPreferences(prev => ({ ...prev, smsNotifications: e.target.checked }))}
              />
              <span>SMS notifications</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.marketingEmails}
                onChange={(e) => setPreferences(prev => ({ ...prev, marketingEmails: e.target.checked }))}
              />
              <span>Marketing emails</span>
            </label>
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => handlePreferencesUpdate('notifications')}
              disabled={saving === 'notifications'}
              loading={saving === 'notifications'}
            >
              Save Changes
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate('/settings/notifications')}
            >
              Advanced Notification Settings
            </Button>
          </div>
        </Card>

        {/* Security */}
        <Card className="settings-section">
          <h2>Security</h2>
          
          <div className="setting-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={preferences.twoFactorEnabled}
                onChange={handle2FAToggle}
              />
              <span>Enable two-factor authentication</span>
            </label>
          </div>

          <div className="setting-group">
            <label htmlFor="sessionTimeout">Session timeout (minutes)</label>
            <input
              type="number"
              id="sessionTimeout"
              value={preferences.sessionTimeout}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                sessionTimeout: parseInt(e.target.value) || 30 
              }))}
              min="5"
              max="120"
            />
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => handlePreferencesUpdate('security')}
              disabled={saving === 'security'}
              loading={saving === 'security'}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="settings-section danger-zone">
          <h2>Danger Zone</h2>
          <p>Once you delete your account, there is no going back. Please be certain.</p>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Account
          </Button>
        </Card>
      </div>

      {/* Email Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showEmailConfirm}
        onClose={() => {
          setShowEmailConfirm(false);
          setEmailConfirmPassword('');
        }}
        onConfirm={confirmEmailUpdate}
        title="Confirm Email Change"
        confirmText="Confirm"
        cancelText="Cancel"
      >
        <p>Enter your password to confirm the email change:</p>
        <input
          type="password"
          placeholder="Current password"
          value={emailConfirmPassword}
          onChange={(e) => setEmailConfirmPassword(e.target.value)}
          className="confirm-input"
        />
      </ConfirmDialog>

      {/* 2FA Confirmation Dialog */}
      <ConfirmDialog
        isOpen={show2FAConfirm}
        onClose={() => {
          setShow2FAConfirm(false);
          setTwoFAPassword('');
        }}
        onConfirm={confirm2FAEnable}
        title="Enable Two-Factor Authentication"
        confirmText="Enable"
        cancelText="Cancel"
      >
        <p>Enter your password to enable two-factor authentication:</p>
        <input
          type="password"
          placeholder="Password"
          value={twoFAPassword}
          onChange={(e) => setTwoFAPassword(e.target.value)}
          className="confirm-input"
        />
      </ConfirmDialog>

      {/* Delete Account Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          setShowDeleteConfirm(false);
          setShowDeleteFinal(true);
        }}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmText="Yes, Continue"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Final Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteFinal}
        onClose={() => {
          setShowDeleteFinal(false);
          setDeleteConfirmText('');
        }}
        onConfirm={handleDeleteAccount}
        title="Final Confirmation"
        confirmText="Permanently Delete"
        cancelText="Cancel"
        variant="danger"
        confirmDisabled={deleteConfirmText !== 'DELETE'}
      >
        <p>This will permanently delete your account and all associated data.</p>
        <p>Type "DELETE" to confirm:</p>
        <input
          type="text"
          placeholder="Type DELETE"
          value={deleteConfirmText}
          onChange={(e) => setDeleteConfirmText(e.target.value)}
          className="confirm-input"
        />
      </ConfirmDialog>
    </div>
  );
};

export default SettingsPage;
