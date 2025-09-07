// frontend/src/pages/admin/settings/SystemSettingsPage.tsx

import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/redux';
import { adminService } from '../../../services/adminService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { showToast } from '../../../store/slices/uiSlice';
import type { SystemConfigDTO } from '../../../types/admin.types';
import './SystemSettingsPage.css';

export const SystemSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalConfig, setOriginalConfig] = useState<SystemConfigDTO | null>(null);

  // Form state
  const [config, setConfig] = useState<SystemConfigDTO>({
    maintenanceMode: false,
    maintenanceMessage: '',
    maxUploadSize: 10485760, // 10MB default
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireSpecialChar: true,
    passwordRequireNumber: true,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    loginLockoutMinutes: 30,
    requireTwoFactor: false,
    allowGuestRegistration: true,
    investmentApprovalThreshold: 10000,
    lastModified: '',
    modifiedBy: ''
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load system configuration
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true);
        const systemConfig = await adminService.getSystemConfig();
        setConfig(systemConfig);
        setOriginalConfig(systemConfig);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  // Convert bytes to MB for display
  const bytesToMB = (bytes: number): number => {
    return Math.round(bytes / 1048576);
  };

  // Convert MB to bytes for storage
  const mbToBytes = (mb: number): number => {
    return mb * 1048576;
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (config.sessionTimeout < 5) {
      newErrors.sessionTimeout = 'Session timeout must be at least 5 minutes';
    }

    if (config.passwordMinLength < 6) {
      newErrors.passwordMinLength = 'Password length must be at least 6 characters';
    }

    if (config.passwordExpiryDays < 30) {
      newErrors.passwordExpiryDays = 'Password expiry must be at least 30 days';
    }

    if (config.maxLoginAttempts < 3) {
      newErrors.maxLoginAttempts = 'Max login attempts must be at least 3';
    }

    if (config.loginLockoutMinutes < 5) {
      newErrors.loginLockoutMinutes = 'Login lockout must be at least 5 minutes';
    }

    const uploadSizeMB = bytesToMB(config.maxUploadSize);
    if (uploadSizeMB < 1) {
      newErrors.maxUploadSize = 'Max upload size must be at least 1 MB';
    }

    if (config.investmentApprovalThreshold && config.investmentApprovalThreshold < 0) {
      newErrors.investmentApprovalThreshold = 'Approval threshold must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfig(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseFloat(value) || 0;
      if (name === 'maxUploadSize') {
        // Convert MB input to bytes
        setConfig(prev => ({ ...prev, [name]: mbToBytes(numValue) }));
      } else {
        setConfig(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle maintenance mode toggle
  const handleMaintenanceToggle = async () => {
    try {
      const result = await adminService.toggleMaintenanceMode(!config.maintenanceMode);
      setConfig(prev => ({ ...prev, maintenanceMode: result.maintenanceMode }));
      dispatch(showToast({
        message: result.message,
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to toggle maintenance mode',
        type: 'error'
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      const updatedConfig = await adminService.updateSystemConfig(config);
      setConfig(updatedConfig);
      setOriginalConfig(updatedConfig);
      
      dispatch(showToast({
        message: 'Settings saved successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to save settings',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  // Reset form to original values
  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      setErrors({});
    }
  };

  if (loading) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error) {
    return (
      <div className="system-settings-page">
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

  const isFormValid = Object.keys(errors).length === 0;
  const hasChanges = JSON.stringify(config) !== JSON.stringify(originalConfig);

  return (
    <div className="system-settings-page">
      <div className="page-header">
        <h1>System Settings</h1>
        <p>Configure system-wide settings and parameters</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="settings-section">
          <h2>General Settings</h2>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={config.maintenanceMode}
                onChange={handleMaintenanceToggle}
              />
              Maintenance Mode
            </label>
            <p className="field-help">Enable to prevent user access during system maintenance</p>
          </div>

          {config.maintenanceMode && (
            <div className="form-group">
              <label htmlFor="maintenanceMessage">Maintenance Message</label>
              <textarea
                id="maintenanceMessage"
                name="maintenanceMessage"
                value={config.maintenanceMessage}
                onChange={handleInputChange}
                rows={3}
                placeholder="Message to display during maintenance"
              />
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <input
                type="number"
                id="sessionTimeout"
                name="sessionTimeout"
                value={config.sessionTimeout}
                onChange={handleInputChange}
                onBlur={() => validateForm()}
                min={5}
                className={errors.sessionTimeout ? 'error' : ''}
              />
              {errors.sessionTimeout && (
                <span className="error-message">{errors.sessionTimeout}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="maxUploadSize">Max Upload Size (MB)</label>
              <input
                type="number"
                id="maxUploadSize"
                name="maxUploadSize"
                value={bytesToMB(config.maxUploadSize)}
                onChange={handleInputChange}
                onBlur={() => validateForm()}
                min={1}
                className={errors.maxUploadSize ? 'error' : ''}
              />
              {errors.maxUploadSize && (
                <span className="error-message">{errors.maxUploadSize}</span>
              )}
            </div>
          </div>
        </Card>

        <Card className="settings-section">
          <h2>Security Settings</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="passwordMinLength">Minimum Password Length</label>
              <input
                type="number"
                id="passwordMinLength"
                name="passwordMinLength"
                value={config.passwordMinLength}
                onChange={handleInputChange}
                onBlur={() => validateForm()}
                min={6}
                className={errors.passwordMinLength ? 'error' : ''}
              />
              {errors.passwordMinLength && (
                <span className="error-message">{errors.passwordMinLength}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="passwordExpiryDays">Password Expiry (days)</label>
              <input
                type="number"
                id="passwordExpiryDays"
                name="passwordExpiryDays"
                value={config.passwordExpiryDays}
                onChange={handleInputChange}
                onBlur={() => validateForm()}
                min={30}
                className={errors.passwordExpiryDays ? 'error' : ''}
              />
              {errors.passwordExpiryDays && (
                <span className="error-message">{errors.passwordExpiryDays}</span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxLoginAttempts">Max Login Attempts</label>
              <input
                type="number"
                id="maxLoginAttempts"
                name="maxLoginAttempts"
                value={config.maxLoginAttempts}
                onChange={handleInputChange}
                onBlur={() => validateForm()}
                min={3}
                className={errors.maxLoginAttempts ? 'error' : ''}
              />
              {errors.maxLoginAttempts && (
                <span className="error-message">{errors.maxLoginAttempts}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="loginLockoutMinutes">Login Lockout (minutes)</label>
              <input
                type="number"
                id="loginLockoutMinutes"
                name="loginLockoutMinutes"
                value={config.loginLockoutMinutes}
                onChange={handleInputChange}
                onBlur={() => validateForm()}
                min={5}
                className={errors.loginLockoutMinutes ? 'error' : ''}
              />
              {errors.loginLockoutMinutes && (
                <span className="error-message">{errors.loginLockoutMinutes}</span>
              )}
            </div>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="passwordRequireSpecialChar"
                checked={config.passwordRequireSpecialChar}
                onChange={handleInputChange}
              />
              Require Special Characters in Passwords
            </label>
            
            <label>
              <input
                type="checkbox"
                name="passwordRequireNumber"
                checked={config.passwordRequireNumber}
                onChange={handleInputChange}
              />
              Require Numbers in Passwords
            </label>

            <label>
              <input
                type="checkbox"
                name="requireTwoFactor"
                checked={config.requireTwoFactor}
                onChange={handleInputChange}
              />
              Require Two-Factor Authentication
            </label>
          </div>
        </Card>

        <Card className="settings-section">
          <h2>Business Settings</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="investmentApprovalThreshold">
                Investment Approval Threshold ($)
              </label>
              <input
                type="number"
                id="investmentApprovalThreshold"
                name="investmentApprovalThreshold"
                value={config.investmentApprovalThreshold || 0}
                onChange={handleInputChange}
                onBlur={() => validateForm()}
                min={0}
                step={1000}
                className={errors.investmentApprovalThreshold ? 'error' : ''}
              />
              {errors.investmentApprovalThreshold && (
                <span className="error-message">{errors.investmentApprovalThreshold}</span>
              )}
              <p className="field-help">
                Investments above this amount require approval
              </p>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="allowGuestRegistration"
                  checked={config.allowGuestRegistration}
                  onChange={handleInputChange}
                />
                Allow Guest Registration
              </label>
              <p className="field-help">
                Enable guests to register and request client status
              </p>
            </div>
          </div>
        </Card>

        {config.lastModified && (
          <Card className="settings-info">
            <p>
              <strong>Last Modified:</strong>{' '}
              {new Date(config.lastModified).toLocaleString()}
              {config.modifiedBy && <> by {config.modifiedBy}</>}
            </p>
          </Card>
        )}

        <div className="form-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={saving || !hasChanges}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid || saving || !hasChanges}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};
