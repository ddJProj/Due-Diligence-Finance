// frontend/src/pages/admin/settings/FeatureTogglePage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { FeatureTogglePage } from './FeatureTogglePage';
import { store } from '../../../store/store';
import { adminService } from '../../../services/adminService';

// Mock the admin service
vi.mock('../../../services/adminService');

describe('FeatureTogglePage', () => {
  const mockFeatureFlags = {
    features: [
      {
        id: 'two_factor_auth',
        name: 'Two-Factor Authentication',
        description: 'Enable two-factor authentication for enhanced security',
        enabled: true,
        category: 'Security',
        dependencies: [],
        lastModified: '2025-01-15T10:00:00',
        modifiedBy: 'admin@example.com'
      },
      {
        id: 'guest_registration',
        name: 'Guest Registration',
        description: 'Allow new users to register as guests',
        enabled: true,
        category: 'Registration',
        dependencies: [],
        lastModified: '2025-01-14T15:30:00',
        modifiedBy: 'admin@example.com'
      },
      {
        id: 'advanced_analytics',
        name: 'Advanced Analytics',
        description: 'Enable advanced analytics dashboard for clients',
        enabled: false,
        category: 'Features',
        dependencies: ['data_collection'],
        lastModified: '2025-01-13T09:00:00',
        modifiedBy: 'admin@example.com'
      },
      {
        id: 'data_collection',
        name: 'Enhanced Data Collection',
        description: 'Collect additional metrics for analytics',
        enabled: false,
        category: 'Features',
        dependencies: [],
        lastModified: '2025-01-13T08:30:00',
        modifiedBy: 'admin@example.com'
      },
      {
        id: 'email_notifications',
        name: 'Email Notifications',
        description: 'Send email notifications for important events',
        enabled: true,
        category: 'Communication',
        dependencies: [],
        lastModified: '2025-01-12T14:00:00',
        modifiedBy: 'system@example.com'
      }
    ],
    lastSync: '2025-01-15T12:00:00'
  };

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <FeatureTogglePage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getFeatureFlags as any).mockResolvedValue(mockFeatureFlags);
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should load and display feature flags', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Guest Registration')).toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('Email Notifications')).toBeInTheDocument();
    });

    expect(adminService.getFeatureFlags).toHaveBeenCalled();
  });

  it('should display feature descriptions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/enable two-factor authentication/i)).toBeInTheDocument();
      expect(screen.getByText(/allow new users to register/i)).toBeInTheDocument();
    });
  });

  it('should show enabled/disabled states correctly', async () => {
    renderComponent();

    await waitFor(() => {
      const twoFactorToggle = screen.getByRole('switch', { name: /two-factor authentication/i });
      const analyticsToggle = screen.getByRole('switch', { name: /advanced analytics/i });

      expect(twoFactorToggle).toBeChecked();
      expect(analyticsToggle).not.toBeChecked();
    });
  });

  it('should handle feature toggle', async () => {
    (adminService.updateFeatureFlag as any).mockResolvedValue({
      feature: 'guest_registration',
      enabled: false,
      message: 'Feature updated successfully'
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Guest Registration')).toBeInTheDocument();
    });

    const guestRegToggle = screen.getByRole('switch', { name: /guest registration/i });
    fireEvent.click(guestRegToggle);

    await waitFor(() => {
      expect(adminService.updateFeatureFlag).toHaveBeenCalledWith('guest_registration', false);
      expect(screen.getByText(/feature updated successfully/i)).toBeInTheDocument();
    });
  });

  it('should show warning for features with dependencies', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
    });

    const analyticsToggle = screen.getByRole('switch', { name: /advanced analytics/i });
    fireEvent.click(analyticsToggle);

    expect(screen.getByText(/this feature requires/i)).toBeInTheDocument();
    expect(screen.getByText(/enhanced data collection/i)).toBeInTheDocument();
  });

  it('should disable dependent features when dependency is disabled', async () => {
    (adminService.updateFeatureFlag as any).mockResolvedValue({
      feature: 'data_collection',
      enabled: false,
      message: 'Feature updated successfully'
    });

    // Mock with data_collection enabled and advanced_analytics enabled
    const enabledDependencies = {
      ...mockFeatureFlags,
      features: mockFeatureFlags.features.map(f => ({
        ...f,
        enabled: f.id === 'data_collection' || f.id === 'advanced_analytics' ? true : f.enabled
      }))
    };
    (adminService.getFeatureFlags as any).mockResolvedValue(enabledDependencies);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Enhanced Data Collection')).toBeInTheDocument();
    });

    const dataCollectionToggle = screen.getByRole('switch', { name: /enhanced data collection/i });
    fireEvent.click(dataCollectionToggle);

    expect(screen.getByText(/this will also disable/i)).toBeInTheDocument();
    expect(screen.getByText(/advanced analytics/i)).toBeInTheDocument();
  });

  it('should filter features by category', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    const categoryFilter = screen.getByLabelText(/filter by category/i);
    fireEvent.change(categoryFilter, { target: { value: 'Security' } });

    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.queryByText('Guest Registration')).not.toBeInTheDocument();
  });

  it('should search features by name', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search features/i);
    fireEvent.change(searchInput, { target: { value: 'authentication' } });

    expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    expect(screen.queryByText('Guest Registration')).not.toBeInTheDocument();
  });

  it('should display last modified information', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/admin@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/system@example.com/)).toBeInTheDocument();
    });
  });

  it('should show last sync time', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/last synced:/i)).toBeInTheDocument();
    });
  });

  it('should handle refresh features', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(adminService.getFeatureFlags).toHaveBeenCalledTimes(2);
    });
  });

  it('should display error when loading fails', async () => {
    (adminService.getFeatureFlags as any).mockRejectedValue(new Error('Failed to load features'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load features/i)).toBeInTheDocument();
    });
  });

  it('should handle error during feature toggle', async () => {
    (adminService.updateFeatureFlag as any).mockRejectedValue(new Error('Update failed'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Guest Registration')).toBeInTheDocument();
    });

    const toggle = screen.getByRole('switch', { name: /guest registration/i });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it('should show enabled features count', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/3 of 5 features enabled/i)).toBeInTheDocument();
    });
  });

  it('should group features by category', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Security')).toBeInTheDocument();
      expect(screen.getByText('Registration')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(screen.getByText('Communication')).toBeInTheDocument();
    });
  });

  it('should show toggle confirmation for critical features', async () => {
    const criticalFeatures = {
      ...mockFeatureFlags,
      features: [
        ...mockFeatureFlags.features,
        {
          id: 'payment_processing',
          name: 'Payment Processing',
          description: 'Enable payment processing functionality',
          enabled: true,
          category: 'Critical',
          dependencies: [],
          isCritical: true,
          lastModified: '2025-01-15T10:00:00',
          modifiedBy: 'admin@example.com'
        }
      ]
    };
    (adminService.getFeatureFlags as any).mockResolvedValue(criticalFeatures);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Payment Processing')).toBeInTheDocument();
    });

    const criticalToggle = screen.getByRole('switch', { name: /payment processing/i });
    fireEvent.click(criticalToggle);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/critical feature/i)).toBeInTheDocument();
  });

  it('should export feature configuration', async () => {
    (adminService.exportFeatureConfig as any).mockResolvedValue(
      new Blob(['feature config'], { type: 'application/json' })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export configuration/i })).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export configuration/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(adminService.exportFeatureConfig).toHaveBeenCalled();
    });
  });
});
