// frontend/src/pages/admin/settings/SystemSettingsPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { SystemSettingsPage } from './SystemSettingsPage';
import { store } from '../../../store/store';
import { adminService } from '../../../services/adminService';
import type { SystemConfigDTO } from '../../../types/admin.types';

// Mock the admin service
vi.mock('../../../services/adminService');

describe('SystemSettingsPage', () => {
  const mockSystemConfig: SystemConfigDTO = {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance',
    maxUploadSize: 10485760, // 10MB in bytes
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
    lastModified: '2025-01-15T10:00:00',
    modifiedBy: 'admin@example.com'
  };

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <SystemSettingsPage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getSystemConfig as any).mockResolvedValue(mockSystemConfig);
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should load and display system configuration', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // Session timeout
      expect(screen.getByDisplayValue('8')).toBeInTheDocument(); // Password min length
      expect(screen.getByDisplayValue('90')).toBeInTheDocument(); // Password expiry days
      expect(screen.getByDisplayValue('5')).toBeInTheDocument(); // Max login attempts
      expect(screen.getByDisplayValue('30')).toBeInTheDocument(); // Login lockout minutes
      expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Max upload size in MB
      expect(screen.getByDisplayValue('10000')).toBeInTheDocument(); // Investment threshold
    });

    expect(adminService.getSystemConfig).toHaveBeenCalled();
  });

  it('should display error when loading fails', async () => {
    (adminService.getSystemConfig as any).mockRejectedValue(new Error('Failed to load configuration'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load configuration/i)).toBeInTheDocument();
    });
  });

  it('should handle maintenance mode toggle', async () => {
    (adminService.toggleMaintenanceMode as any).mockResolvedValue({
      maintenanceMode: true,
      message: 'Maintenance mode enabled'
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/maintenance mode/i)).toBeInTheDocument();
    });

    const maintenanceToggle = screen.getByLabelText(/maintenance mode/i);
    expect(maintenanceToggle).not.toBeChecked();

    fireEvent.click(maintenanceToggle);

    await waitFor(() => {
      expect(adminService.toggleMaintenanceMode).toHaveBeenCalledWith(true);
      expect(screen.getByText(/maintenance mode enabled/i)).toBeInTheDocument();
    });
  });

  it('should validate session timeout', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/session timeout/i)).toBeInTheDocument();
    });

    const sessionTimeoutInput = screen.getByLabelText(/session timeout/i);
    fireEvent.change(sessionTimeoutInput, { target: { value: '3' } });
    fireEvent.blur(sessionTimeoutInput);

    expect(screen.getByText(/must be at least 5 minutes/i)).toBeInTheDocument();
  });

  it('should validate password minimum length', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/minimum password length/i)).toBeInTheDocument();
    });

    const passwordLengthInput = screen.getByLabelText(/minimum password length/i);
    fireEvent.change(passwordLengthInput, { target: { value: '4' } });
    fireEvent.blur(passwordLengthInput);

    expect(screen.getByText(/must be at least 6 characters/i)).toBeInTheDocument();
  });

  it('should validate max upload size', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/max upload size/i)).toBeInTheDocument();
    });

    const uploadSizeInput = screen.getByLabelText(/max upload size/i);
    fireEvent.change(uploadSizeInput, { target: { value: '0' } });
    fireEvent.blur(uploadSizeInput);

    expect(screen.getByText(/must be at least 1 MB/i)).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    const updatedConfig = { ...mockSystemConfig, sessionTimeout: 45 };
    (adminService.updateSystemConfig as any).mockResolvedValue(updatedConfig);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/session timeout/i)).toBeInTheDocument();
    });

    const sessionTimeoutInput = screen.getByLabelText(/session timeout/i);
    fireEvent.change(sessionTimeoutInput, { target: { value: '45' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(adminService.updateSystemConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionTimeout: 45
        })
      );
      expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
    });
  });

  it('should display password requirement toggles', async () => {
    renderComponent();

    await waitFor(() => {
      const specialCharToggle = screen.getByLabelText(/require special characters/i);
      const numberToggle = screen.getByLabelText(/require numbers/i);

      expect(specialCharToggle).toBeChecked();
      expect(numberToggle).toBeChecked();
    });
  });

  it('should display security settings section', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/security settings/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/two-factor authentication/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/guest registration/i)).toBeInTheDocument();
    });
  });

  it('should display system information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/last modified:/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@example.com/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors during save', async () => {
    (adminService.updateSystemConfig as any).mockRejectedValue(new Error('Failed to save settings'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save settings/i)).toBeInTheDocument();
    });
  });

  it('should reset form to original values', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });

    const sessionTimeoutInput = screen.getByLabelText(/session timeout/i);
    fireEvent.change(sessionTimeoutInput, { target: { value: '45' } });

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(sessionTimeoutInput).toHaveValue(30);
  });

  it('should convert bytes to MB for display', async () => {
    renderComponent();

    await waitFor(() => {
      const uploadSizeInput = screen.getByLabelText(/max upload size/i);
      expect(uploadSizeInput).toHaveValue(10); // 10485760 bytes = 10 MB
    });
  });

  it('should disable save button when form is invalid', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/session timeout/i)).toBeInTheDocument();
    });

    const sessionTimeoutInput = screen.getByLabelText(/session timeout/i);
    fireEvent.change(sessionTimeoutInput, { target: { value: '3' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('should show maintenance message input when maintenance mode is enabled', async () => {
    const configWithMaintenance = { ...mockSystemConfig, maintenanceMode: true };
    (adminService.getSystemConfig as any).mockResolvedValue(configWithMaintenance);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/maintenance message/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue(/system is under maintenance/i)).toBeInTheDocument();
    });
  });

  it('should disable form during submission', async () => {
    (adminService.updateSystemConfig as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockSystemConfig), 1000))
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });
});
