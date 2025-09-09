// frontend/src/pages/shared/NotificationSettingsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NotificationSettingsPage from './NotificationSettingsPage';
import { authSlice } from '@/store/slices/authSlice';
import { adminService } from '@/api/AdminService';

// Mock the API services
vi.mock('@/api/AdminService', () => ({
  adminService: {
    getNotificationSettings: vi.fn(),
    updateNotificationSettings: vi.fn(),
    testNotification: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('NotificationSettingsPage', () => {
  let store: any;
  const user = userEvent.setup();

  const mockNotificationSettings = {
    // Email Notifications
    emailEnabled: true,
    emailNewInvestment: true,
    emailInvestmentUpdate: true,
    emailTransactionAlert: true,
    emailMonthlyStatement: true,
    emailMarketAlert: false,
    emailSystemUpdate: true,
    emailPromotions: false,
    
    // SMS Notifications
    smsEnabled: false,
    smsUrgentAlerts: true,
    smsTransactionConfirmation: false,
    smsSecurityAlerts: true,
    
    // In-App Notifications
    inAppEnabled: true,
    inAppMessages: true,
    inAppInvestmentUpdates: true,
    inAppSystemAlerts: true,
    
    // Notification Schedule
    quietHoursEnabled: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    weekendQuietHours: true,
    
    // Notification Frequency
    emailDigest: 'daily', // 'realtime', 'daily', 'weekly'
    minimumAlertThreshold: 100, // Minimum transaction amount for alerts
    
    // Contact Preferences
    preferredContact: 'email', // 'email', 'sms', 'both'
    emailAddress: 'user@example.com',
    phoneNumber: '+1234567890',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    store = configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: 1,
            email: 'user@example.com',
            name: 'Test User',
            role: 'CLIENT',
          },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    });

    vi.mocked(adminService.getNotificationSettings).mockResolvedValue(mockNotificationSettings);
  });

  const renderNotificationSettingsPage = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <NotificationSettingsPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    renderNotificationSettingsPage();
    expect(screen.getByText(/loading notification settings/i)).toBeInTheDocument();
  });

  it('should display all notification sections', async () => {
    renderNotificationSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
      expect(screen.getByText('In-App Notifications')).toBeInTheDocument();
      expect(screen.getByText('Quiet Hours')).toBeInTheDocument();
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });
  });

  describe('Email Notifications', () => {
    it('should display email notification settings', async () => {
      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/enable email notifications/i)).toBeChecked();
        expect(screen.getByLabelText(/new investment alerts/i)).toBeChecked();
        expect(screen.getByLabelText(/investment updates/i)).toBeChecked();
        expect(screen.getByLabelText(/transaction alerts/i)).toBeChecked();
        expect(screen.getByLabelText(/monthly statements/i)).toBeChecked();
        expect(screen.getByLabelText(/market alerts/i)).not.toBeChecked();
      });
    });

    it('should disable all email options when master toggle is off', async () => {
      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/enable email notifications/i)).toBeChecked();
      });

      // Toggle off email notifications
      const emailToggle = screen.getByLabelText(/enable email notifications/i);
      await user.click(emailToggle);

      // All sub-options should be disabled
      expect(screen.getByLabelText(/new investment alerts/i)).toBeDisabled();
      expect(screen.getByLabelText(/investment updates/i)).toBeDisabled();
      expect(screen.getByLabelText(/transaction alerts/i)).toBeDisabled();
    });

    it('should update email notification settings', async () => {
      vi.mocked(adminService.updateNotificationSettings).mockResolvedValue({
        ...mockNotificationSettings,
        emailMarketAlert: true,
      });

      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/market alerts/i)).not.toBeChecked();
      });

      // Toggle market alerts
      const marketAlertsToggle = screen.getByLabelText(/market alerts/i);
      await user.click(marketAlertsToggle);

      // Save
      const saveButton = screen.getAllByRole('button', { name: /save changes/i })[0];
      await user.click(saveButton);

      expect(vi.mocked(adminService.updateNotificationSettings)).toHaveBeenCalledWith(
        expect.objectContaining({
          emailMarketAlert: true,
        })
      );
    });
  });

  describe('SMS Notifications', () => {
    it('should display SMS notification settings', async () => {
      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/enable sms notifications/i)).not.toBeChecked();
        expect(screen.getByLabelText(/urgent alerts only/i)).toBeChecked();
        expect(screen.getByLabelText(/transaction confirmations/i)).not.toBeChecked();
        expect(screen.getByLabelText(/security alerts/i)).toBeChecked();
      });
    });

    it('should validate phone number when enabling SMS', async () => {
      const settingsWithoutPhone = {
        ...mockNotificationSettings,
        phoneNumber: '',
      };
      vi.mocked(adminService.getNotificationSettings).mockResolvedValue(settingsWithoutPhone);

      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/enable sms notifications/i)).not.toBeChecked();
      });

      // Try to enable SMS
      const smsToggle = screen.getByLabelText(/enable sms notifications/i);
      await user.click(smsToggle);

      expect(screen.getByText(/please add a phone number/i)).toBeInTheDocument();
    });
  });

  describe('In-App Notifications', () => {
    it('should display in-app notification settings', async () => {
      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/enable in-app notifications/i)).toBeChecked();
        expect(screen.getByLabelText(/new messages/i)).toBeChecked();
        expect(screen.getByLabelText(/investment activity/i)).toBeChecked();
        expect(screen.getByLabelText(/system alerts/i)).toBeChecked();
      });
    });
  });

  describe('Quiet Hours', () => {
    it('should display quiet hours settings', async () => {
      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/enable quiet hours/i)).toBeChecked();
        expect(screen.getByDisplayValue('22:00')).toBeInTheDocument();
        expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
        expect(screen.getByLabelText(/extend quiet hours on weekends/i)).toBeChecked();
      });
    });

    it('should validate quiet hours times', async () => {
      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByDisplayValue('22:00')).toBeInTheDocument();
      });

      // Set invalid time range
      const startTime = screen.getByLabelText(/start time/i);
      const endTime = screen.getByLabelText(/end time/i);

      await user.clear(startTime);
      await user.type(startTime, '08:00');
      
      await user.clear(endTime);
      await user.type(endTime, '07:00');

      const saveButton = screen.getAllByRole('button', { name: /save changes/i })[3];
      await user.click(saveButton);

      expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
    });
  });

  describe('Notification Preferences', () => {
    it('should display notification preferences', async () => {
      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/email digest frequency/i)).toHaveValue('daily');
        expect(screen.getByLabelText(/minimum alert threshold/i)).toHaveValue('100');
        expect(screen.getByLabelText(/preferred contact method/i)).toHaveValue('email');
      });
    });

    it('should update contact information', async () => {
      vi.mocked(adminService.updateNotificationSettings).mockResolvedValue({
        ...mockNotificationSettings,
        emailAddress: 'newemail@example.com',
      });

      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
      });

      // Update email
      const emailInput = screen.getByLabelText(/notification email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'newemail@example.com');

      const saveButton = screen.getAllByRole('button', { name: /save changes/i })[4];
      await user.click(saveButton);

      expect(vi.mocked(adminService.updateNotificationSettings)).toHaveBeenCalledWith(
        expect.objectContaining({
          emailAddress: 'newemail@example.com',
        })
      );
    });
  });

  describe('Test Notifications', () => {
    it('should send test email notification', async () => {
      vi.mocked(adminService.testNotification).mockResolvedValue({ success: true });

      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: /test email/i });
      await user.click(testButton);

      expect(vi.mocked(adminService.testNotification)).toHaveBeenCalledWith('email');
      
      await waitFor(() => {
        expect(screen.getByText(/test email sent/i)).toBeInTheDocument();
      });
    });

    it('should send test SMS notification', async () => {
      const settingsWithSMS = {
        ...mockNotificationSettings,
        smsEnabled: true,
      };
      vi.mocked(adminService.getNotificationSettings).mockResolvedValue(settingsWithSMS);
      vi.mocked(adminService.testNotification).mockResolvedValue({ success: true });

      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: /test sms/i });
      await user.click(testButton);

      expect(vi.mocked(adminService.testNotification)).toHaveBeenCalledWith('sms');
    });

    it('should handle test notification failure', async () => {
      vi.mocked(adminService.testNotification).mockRejectedValue(new Error('Failed to send'));

      renderNotificationSettingsPage();

      await waitFor(() => {
        expect(screen.getByText('Email Notifications')).toBeInTheDocument();
      });

      const testButton = screen.getByRole('button', { name: /test email/i });
      await user.click(testButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to send test notification/i)).toBeInTheDocument();
      });
    });
  });

  it('should navigate back to settings', async () => {
    renderNotificationSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Notification Settings')).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to settings/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('should handle loading state', () => {
    vi.mocked(adminService.getNotificationSettings).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderNotificationSettingsPage();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading notification settings/i)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    vi.mocked(adminService.getNotificationSettings).mockRejectedValue(new Error('Failed to load'));

    renderNotificationSettingsPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load notification settings/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should prevent guest users from accessing', () => {
    store = configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: 4,
            email: 'guest@example.com',
            name: 'Guest User',
            role: 'GUEST',
          },
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <NotificationSettingsPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/please log in to manage notifications/i)).toBeInTheDocument();
  });
});
