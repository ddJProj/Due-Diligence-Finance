// frontend/src/pages/shared/SettingsPage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import SettingsPage from './SettingsPage';
import { authSlice } from '@/store/slices/authSlice';
import { authService } from '@/api/AuthService';
import { adminService } from '@/api/AdminService';

// Mock the API services
vi.mock('@/api/AuthService', () => ({
  authService: {
    changePassword: vi.fn(),
    updateEmail: vi.fn(),
    deleteAccount: vi.fn(),
  },
}));

vi.mock('@/api/AdminService', () => ({
  adminService: {
    getUserPreferences: vi.fn(),
    updateUserPreferences: vi.fn(),
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

describe('SettingsPage', () => {
  let store: any;
  const user = userEvent.setup();
  const mockDispatch = vi.fn();

  const mockPreferences = {
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorEnabled: false,
    sessionTimeout: 30,
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
    
    store.dispatch = mockDispatch;
    vi.mocked(adminService.getUserPreferences).mockResolvedValue(mockPreferences);
  });

  const renderSettingsPage = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    renderSettingsPage();
    expect(screen.getByText(/loading settings/i)).toBeInTheDocument();
  });

  it('should display settings sections', async () => {
    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Account Settings')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  describe('Account Settings', () => {
    it('should display current email', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
      });
    });

    it('should handle email change', async () => {
      vi.mocked(authService.updateEmail).mockResolvedValue({ success: true });

      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
      });

      // Change email
      const emailInput = screen.getByLabelText(/email address/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'newemail@example.com');

      // Save
      const saveButton = screen.getByRole('button', { name: /update email/i });
      await user.click(saveButton);

      // Should require password confirmation
      expect(screen.getByText(/enter your password to confirm/i)).toBeInTheDocument();

      // Enter password
      const passwordInput = screen.getByLabelText(/current password/i);
      await user.type(passwordInput, 'password123');

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(vi.mocked(authService.updateEmail)).toHaveBeenCalledWith({
        newEmail: 'newemail@example.com',
        currentPassword: 'password123',
      });
    });

    it('should validate email format', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByDisplayValue('user@example.com')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email address/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');

      const saveButton = screen.getByRole('button', { name: /update email/i });
      await user.click(saveButton);

      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  describe('Password Change', () => {
    it('should show password change form', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByText('Account Settings')).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changePasswordButton);

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('should validate password requirements', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByText('Account Settings')).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changePasswordButton);

      // Type weak password
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      await user.type(newPasswordInput, 'weak');

      const saveButton = screen.getByRole('button', { name: /save new password/i });
      await user.click(saveButton);

      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    it('should validate password match', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByText('Account Settings')).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changePasswordButton);

      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);

      await user.type(newPasswordInput, 'StrongPass123!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');

      const saveButton = screen.getByRole('button', { name: /save new password/i });
      await user.click(saveButton);

      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });

    it('should change password successfully', async () => {
      vi.mocked(authService.changePassword).mockResolvedValue({ success: true });

      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByText('Account Settings')).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await user.click(changePasswordButton);

      await user.type(screen.getByLabelText(/current password/i), 'oldpass123');
      await user.type(screen.getByLabelText(/^new password$/i), 'NewPass123!');
      await user.type(screen.getByLabelText(/confirm new password/i), 'NewPass123!');

      const saveButton = screen.getByRole('button', { name: /save new password/i });
      await user.click(saveButton);

      expect(vi.mocked(authService.changePassword)).toHaveBeenCalledWith({
        currentPassword: 'oldpass123',
        newPassword: 'NewPass123!',
      });
    });
  });

  describe('Preferences', () => {
    it('should display current preferences', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/theme/i)).toHaveValue('light');
        expect(screen.getByLabelText(/language/i)).toHaveValue('en');
        expect(screen.getByLabelText(/timezone/i)).toHaveValue('America/New_York');
        expect(screen.getByLabelText(/currency/i)).toHaveValue('USD');
      });
    });

    it('should update preferences', async () => {
      vi.mocked(adminService.updateUserPreferences).mockResolvedValue(mockPreferences);

      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
      });

      // Change theme
      const themeSelect = screen.getByLabelText(/theme/i);
      await user.selectOptions(themeSelect, 'dark');

      // Save
      const saveButton = screen.getAllByRole('button', { name: /save changes/i })[0];
      await user.click(saveButton);

      expect(vi.mocked(adminService.updateUserPreferences)).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
        })
      );
    });
  });

  describe('Notifications', () => {
    it('should display notification settings', async () => {
      renderSettingsPage();

      await waitFor(() => {
        const emailNotif = screen.getByLabelText(/email notifications/i);
        expect(emailNotif).toBeChecked();
        
        const smsNotif = screen.getByLabelText(/sms notifications/i);
        expect(smsNotif).not.toBeChecked();
        
        const marketingEmails = screen.getByLabelText(/marketing emails/i);
        expect(marketingEmails).not.toBeChecked();
      });
    });

    it('should update notification settings', async () => {
      vi.mocked(adminService.updateUserPreferences).mockResolvedValue({
        ...mockPreferences,
        smsNotifications: true,
      });

      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/sms notifications/i)).toBeInTheDocument();
      });

      // Toggle SMS notifications
      const smsCheckbox = screen.getByLabelText(/sms notifications/i);
      await user.click(smsCheckbox);

      // Save
      const saveButtons = screen.getAllByRole('button', { name: /save changes/i });
      const notificationSaveButton = saveButtons[1];
      await user.click(notificationSaveButton);

      expect(vi.mocked(adminService.updateUserPreferences)).toHaveBeenCalledWith(
        expect.objectContaining({
          smsNotifications: true,
        })
      );
    });
  });

  describe('Security', () => {
    it('should display security settings', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByText(/two-factor authentication/i)).toBeInTheDocument();
        expect(screen.getByText(/session timeout/i)).toBeInTheDocument();
      });
    });

    it('should toggle two-factor authentication', async () => {
      vi.mocked(adminService.updateUserPreferences).mockResolvedValue({
        ...mockPreferences,
        twoFactorEnabled: true,
      });

      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByLabelText(/enable two-factor/i)).toBeInTheDocument();
      });

      const twoFactorCheckbox = screen.getByLabelText(/enable two-factor/i);
      await user.click(twoFactorCheckbox);

      // Should show confirmation
      expect(screen.getByText(/enter your password/i)).toBeInTheDocument();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'password123');

      const confirmButton = screen.getByRole('button', { name: /enable/i });
      await user.click(confirmButton);

      expect(vi.mocked(adminService.updateUserPreferences)).toHaveBeenCalled();
    });
  });

  describe('Account Deletion', () => {
    it('should show delete account option', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByText(/danger zone/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
      });
    });

    it('should confirm before deleting account', async () => {
      renderSettingsPage();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      await user.click(deleteButton);

      // First confirmation
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      
      const firstConfirm = screen.getByRole('button', { name: /yes, continue/i });
      await user.click(firstConfirm);

      // Second confirmation with typing
      expect(screen.getByText(/type "DELETE" to confirm/i)).toBeInTheDocument();
      
      const confirmInput = screen.getByPlaceholderText(/type DELETE/i);
      await user.type(confirmInput, 'DELETE');

      const finalDelete = screen.getByRole('button', { name: /permanently delete/i });
      await user.click(finalDelete);

      expect(vi.mocked(authService.deleteAccount)).toHaveBeenCalled();
    });
  });

  it('should handle loading state', () => {
    vi.mocked(adminService.getUserPreferences).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderSettingsPage();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading settings/i)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    vi.mocked(adminService.getUserPreferences).mockRejectedValue(new Error('Failed to load'));

    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText(/failed to load settings/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should navigate to notification settings', async () => {
    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    const advancedButton = screen.getByRole('button', { name: /advanced notification settings/i });
    await user.click(advancedButton);

    expect(mockNavigate).toHaveBeenCalledWith('/settings/notifications');
  });

  it('should prevent guest users from accessing settings', () => {
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
          <SettingsPage />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText(/please log in to access settings/i)).toBeInTheDocument();
  });
});
