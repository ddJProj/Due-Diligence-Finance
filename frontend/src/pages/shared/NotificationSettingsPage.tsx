// frontend/src/pages/shared/NotificationSettingsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectUser } from '@/store/slices/authSlice';
import { adminService } from '@/api/AdminService';
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Card,
} from '@/components/common';
import './NotificationSettingsPage.css';

interface NotificationSettings {
  // Email Notifications
  emailEnabled: boolean;
  emailNewInvestment: boolean;
  emailInvestmentUpdate: boolean;
  emailTransactionAlert: boolean;
  emailMonthlyStatement: boolean;
  emailMarketAlert: boolean;
  emailSystemUpdate: boolean;
  emailPromotions: boolean;
  
  // SMS Notifications
  smsEnabled: boolean;
  smsUrgentAlerts: boolean;
  smsTransactionConfirmation: boolean;
  smsSecurityAlerts: boolean;
  
  // In-App Notifications
  inAppEnabled: boolean;
  inAppMessages: boolean;
  inAppInvestmentUpdates: boolean;
  inAppSystemAlerts: boolean;
  
  // Notification Schedule
  quietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendQuietHours: boolean;
  
  // Notification Frequency
  emailDigest: 'realtime' | 'daily' | 'weekly';
  minimumAlertThreshold: number;
  
  // Contact Preferences
  preferredContact: 'email' | 'sms' | 'both';
  emailAddress: string;
  phoneNumber: string;
}

const NotificationSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectUser);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    emailEnabled: true,
    emailNewInvestment: true,
    emailInvestmentUpdate: true,
    emailTransactionAlert: true,
    emailMonthlyStatement: true,
    emailMarketAlert: false,
    emailSystemUpdate: true,
    emailPromotions: false,
    smsEnabled: false,
    smsUrgentAlerts: true,
    smsTransactionConfirmation: false,
    smsSecurityAlerts: true,
    inAppEnabled: true,
    inAppMessages: true,
    inAppInvestmentUpdates: true,
    inAppSystemAlerts: true,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendQuietHours: false,
    emailDigest: 'daily',
    minimumAlertThreshold: 100,
    preferredContact: 'email',
    emailAddress: '',
    phoneNumber: '',
  });

  // Load settings
  const loadSettings = useCallback(async () => {
    if (!currentUser || currentUser.role === 'GUEST') {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getNotificationSettings(currentUser.id);
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Clear messages
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Validate settings
  const validateSettings = (section: string): boolean => {
    setValidationError(null);
    
    if (section === 'sms' && settings.smsEnabled && !settings.phoneNumber) {
      setValidationError('Please add a phone number in Settings to enable SMS notifications');
      return false;
    }
    
    if (section === 'quietHours' && settings.quietHoursEnabled) {
      const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number);
      const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      
      if (startMinutes === endMinutes) {
        setValidationError('End time must be different from start time');
        return false;
      }
    }
    
    if (section === 'preferences') {
      if (!settings.emailAddress) {
        setValidationError('Email address is required');
        return false;
      }
      if (settings.preferredContact !== 'email' && !settings.phoneNumber) {
        setValidationError('Phone number is required for SMS notifications');
        return false;
      }
    }
    
    return true;
  };

  // Save settings
  const saveSettings = async (section: string) => {
    if (!validateSettings(section)) return;
    
    setSaving(section);
    setError(null);
    
    try {
      await adminService.updateNotificationSettings(currentUser!.id, settings);
      setSuccess(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  // Test notifications
  const testNotification = async (type: 'email' | 'sms') => {
    try {
      await adminService.testNotification(type);
      setSuccess(`Test ${type} sent successfully`);
    } catch (err) {
      setError(`Failed to send test notification: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle toggle changes
  const handleToggle = (field: keyof NotificationSettings) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
    setValidationError(null);
  };

  // Handle input changes
  const handleInputChange = (field: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setValidationError(null);
  };

  if (currentUser?.role === 'GUEST') {
    return (
      <div className="notification-settings-page">
        <div className="guest-message">
          <h2>Guest Account</h2>
          <p>Please log in to manage notifications.</p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Log In
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="notification-settings-page">
        <LoadingSpinner size="large" message="Loading notification settings..." />
      </div>
    );
  }

  if (error && !settings.emailAddress) {
    return (
      <div className="notification-settings-page">
        <ErrorMessage
          message="Failed to load notification settings"
          details={error}
          onRetry={loadSettings}
        />
      </div>
    );
  }

  return (
    <div className="notification-settings-page">
      <div className="notification-header">
        <div>
          <h1>Notification Settings</h1>
          <p className="subtitle">Manage how and when you receive notifications</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/settings')}>
          Back to Settings
        </Button>
      </div>

      {error && (
        <ErrorMessage message="Error" details={error} onDismiss={() => setError(null)} />
      )}

      {success && <div className="success-message">{success}</div>}

      {validationError && <div className="validation-error">{validationError}</div>}

      <div className="notification-content">
        {/* Email Notifications */}
        <Card className="notification-section">
          <div className="section-header">
            <h2>Email Notifications</h2>
            {settings.emailEnabled && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => testNotification('email')}
              >
                Test Email
              </Button>
            )}
          </div>

          <div className="master-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.emailEnabled}
                onChange={() => handleToggle('emailEnabled')}
              />
              <span className="toggle-text">Enable email notifications</span>
            </label>
          </div>

          <div className={`notification-options ${!settings.emailEnabled ? 'disabled' : ''}`}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailNewInvestment}
                onChange={() => handleToggle('emailNewInvestment')}
                disabled={!settings.emailEnabled}
              />
              <div>
                <span>New investment alerts</span>
                <small>When new investments are added to your portfolio</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailInvestmentUpdate}
                onChange={() => handleToggle('emailInvestmentUpdate')}
                disabled={!settings.emailEnabled}
              />
              <div>
                <span>Investment updates</span>
                <small>Status changes and performance updates</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailTransactionAlert}
                onChange={() => handleToggle('emailTransactionAlert')}
                disabled={!settings.emailEnabled}
              />
              <div>
                <span>Transaction alerts</span>
                <small>Buy, sell, and dividend notifications</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailMonthlyStatement}
                onChange={() => handleToggle('emailMonthlyStatement')}
                disabled={!settings.emailEnabled}
              />
              <div>
                <span>Monthly statements</span>
                <small>Portfolio summary and performance reports</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailMarketAlert}
                onChange={() => handleToggle('emailMarketAlert')}
                disabled={!settings.emailEnabled}
              />
              <div>
                <span>Market alerts</span>
                <small>Significant market movements affecting your portfolio</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailSystemUpdate}
                onChange={() => handleToggle('emailSystemUpdate')}
                disabled={!settings.emailEnabled}
              />
              <div>
                <span>System updates</span>
                <small>Platform updates and maintenance notices</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.emailPromotions}
                onChange={() => handleToggle('emailPromotions')}
                disabled={!settings.emailEnabled}
              />
              <div>
                <span>Promotional emails</span>
                <small>Special offers and educational content</small>
              </div>
            </label>
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => saveSettings('email')}
              disabled={saving === 'email'}
              loading={saving === 'email'}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* SMS Notifications */}
        <Card className="notification-section">
          <div className="section-header">
            <h2>SMS Notifications</h2>
            {settings.smsEnabled && settings.phoneNumber && (
              <Button
                variant="ghost"
                size="small"
                onClick={() => testNotification('sms')}
              >
                Test SMS
              </Button>
            )}
          </div>

          <div className="master-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.smsEnabled}
                onChange={() => handleToggle('smsEnabled')}
              />
              <span className="toggle-text">Enable SMS notifications</span>
            </label>
          </div>

          <div className={`notification-options ${!settings.smsEnabled ? 'disabled' : ''}`}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.smsUrgentAlerts}
                onChange={() => handleToggle('smsUrgentAlerts')}
                disabled={!settings.smsEnabled}
              />
              <div>
                <span>Urgent alerts only</span>
                <small>Critical account and security notifications</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.smsTransactionConfirmation}
                onChange={() => handleToggle('smsTransactionConfirmation')}
                disabled={!settings.smsEnabled}
              />
              <div>
                <span>Transaction confirmations</span>
                <small>SMS confirmation for transactions</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.smsSecurityAlerts}
                onChange={() => handleToggle('smsSecurityAlerts')}
                disabled={!settings.smsEnabled}
              />
              <div>
                <span>Security alerts</span>
                <small>Login attempts and password changes</small>
              </div>
            </label>
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => saveSettings('sms')}
              disabled={saving === 'sms'}
              loading={saving === 'sms'}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* In-App Notifications */}
        <Card className="notification-section">
          <h2>In-App Notifications</h2>

          <div className="master-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.inAppEnabled}
                onChange={() => handleToggle('inAppEnabled')}
              />
              <span className="toggle-text">Enable in-app notifications</span>
            </label>
          </div>

          <div className={`notification-options ${!settings.inAppEnabled ? 'disabled' : ''}`}>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.inAppMessages}
                onChange={() => handleToggle('inAppMessages')}
                disabled={!settings.inAppEnabled}
              />
              <div>
                <span>New messages</span>
                <small>Notifications for new messages from your advisor</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.inAppInvestmentUpdates}
                onChange={() => handleToggle('inAppInvestmentUpdates')}
                disabled={!settings.inAppEnabled}
              />
              <div>
                <span>Investment activity</span>
                <small>Real-time updates on your investments</small>
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.inAppSystemAlerts}
                onChange={() => handleToggle('inAppSystemAlerts')}
                disabled={!settings.inAppEnabled}
              />
              <div>
                <span>System alerts</span>
                <small>Important system notifications</small>
              </div>
            </label>
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => saveSettings('inApp')}
              disabled={saving === 'inApp'}
              loading={saving === 'inApp'}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Quiet Hours */}
        <Card className="notification-section">
          <h2>Quiet Hours</h2>
          <p className="section-description">
            Set times when you don't want to receive notifications (urgent alerts will still come through)
          </p>

          <div className="master-toggle">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={settings.quietHoursEnabled}
                onChange={() => handleToggle('quietHoursEnabled')}
              />
              <span className="toggle-text">Enable quiet hours</span>
            </label>
          </div>

          <div className={`quiet-hours-settings ${!settings.quietHoursEnabled ? 'disabled' : ''}`}>
            <div className="time-inputs">
              <div className="form-group">
                <label htmlFor="quietStart">Start time</label>
                <input
                  type="time"
                  id="quietStart"
                  value={settings.quietHoursStart}
                  onChange={(e) => handleInputChange('quietHoursStart', e.target.value)}
                  disabled={!settings.quietHoursEnabled}
                />
              </div>

              <div className="form-group">
                <label htmlFor="quietEnd">End time</label>
                <input
                  type="time"
                  id="quietEnd"
                  value={settings.quietHoursEnd}
                  onChange={(e) => handleInputChange('quietHoursEnd', e.target.value)}
                  disabled={!settings.quietHoursEnabled}
                />
              </div>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={settings.weekendQuietHours}
                onChange={() => handleToggle('weekendQuietHours')}
                disabled={!settings.quietHoursEnabled}
              />
              <span>Extend quiet hours on weekends</span>
            </label>
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => saveSettings('quietHours')}
              disabled={saving === 'quietHours'}
              loading={saving === 'quietHours'}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="notification-section">
          <h2>Notification Preferences</h2>

          <div className="preference-grid">
            <div className="form-group">
              <label htmlFor="emailDigest">Email digest frequency</label>
              <select
                id="emailDigest"
                value={settings.emailDigest}
                onChange={(e) => handleInputChange('emailDigest', e.target.value)}
              >
                <option value="realtime">Real-time</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly summary</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="alertThreshold">
                Minimum alert threshold ($)
              </label>
              <input
                type="number"
                id="alertThreshold"
                value={settings.minimumAlertThreshold}
                onChange={(e) => handleInputChange('minimumAlertThreshold', parseInt(e.target.value) || 0)}
                min="0"
                step="50"
              />
              <small>Only alert for transactions above this amount</small>
            </div>

            <div className="form-group">
              <label htmlFor="preferredContact">Preferred contact method</label>
              <select
                id="preferredContact"
                value={settings.preferredContact}
                onChange={(e) => handleInputChange('preferredContact', e.target.value)}
              >
                <option value="email">Email only</option>
                <option value="sms">SMS only</option>
                <option value="both">Both email and SMS</option>
              </select>
            </div>
          </div>

          <h3>Contact Information</h3>
          <div className="contact-info">
            <div className="form-group">
              <label htmlFor="notificationEmail">Notification email</label>
              <input
                type="email"
                id="notificationEmail"
                value={settings.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notificationPhone">SMS phone number</label>
              <input
                type="tel"
                id="notificationPhone"
                value={settings.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div className="section-actions">
            <Button
              size="small"
              onClick={() => saveSettings('preferences')}
              disabled={saving === 'preferences'}
              loading={saving === 'preferences'}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
