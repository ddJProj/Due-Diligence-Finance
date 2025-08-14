// frontend/src/pages/dashboards/GuestDashboard.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { GuestDashboard } from './GuestDashboard';
import guestService from '../../api/GuestService';
import authSlice from '../../store/authSlice';

// Mock the GuestService
vi.mock('../../api/GuestService', () => ({
  default: {
    getPublicInfo: vi.fn(),
    submitContactForm: vi.fn(),
    requestAccountUpgrade: vi.fn(),
  },
}));

// Mock LoadingSpinner
vi.mock('../../components/common/LoadingSpinner', () => ({
  default: ({ message }: { message?: string }) => (
    <div data-testid="loading-spinner">{message || 'Loading...'}</div>
  ),
}));

const mockUser = {
  id: 1,
  email: 'guest@example.com',
  firstName: 'Guest',
  lastName: 'User',
  role: 'GUEST' as const,
};

const mockPublicInfo = {
  companyName: 'Due Diligence Finance',
  description: 'Your trusted partner in investment management',
  features: [
    'Professional investment guidance',
    'Real-time portfolio tracking',
    'Secure and compliant platform',
    'Expert financial advisors',
  ],
  statistics: {
    totalClients: 500,
    totalAssets: 125000000,
    yearsInBusiness: 10,
    satisfactionRate: 98.5,
  },
};

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: mockUser,
        loading: false,
        error: null,
      },
      ...initialState,
    },
  });
};

const renderWithProviders = (component: React.ReactElement, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe('GuestDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(guestService.getPublicInfo).mockResolvedValue(mockPublicInfo);
  });

  it('should render without errors', () => {
    renderWithProviders(<GuestDashboard />);
    expect(screen.getByText(/Welcome to Due Diligence Finance/i)).toBeInTheDocument();
  });

  it('should display guest user greeting', () => {
    renderWithProviders(<GuestDashboard />);
    expect(screen.getByText(/Hello, Guest!/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    renderWithProviders(<GuestDashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should fetch and display public information', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Your trusted partner in investment management')).toBeInTheDocument();
      expect(guestService.getPublicInfo).toHaveBeenCalledTimes(1);
    });
  });

  it('should display company features', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Professional investment guidance')).toBeInTheDocument();
      expect(screen.getByText('Real-time portfolio tracking')).toBeInTheDocument();
      expect(screen.getByText('Secure and compliant platform')).toBeInTheDocument();
      expect(screen.getByText('Expert financial advisors')).toBeInTheDocument();
    });
  });

  it('should display company statistics', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('500+')).toBeInTheDocument();
      expect(screen.getByText('Happy Clients')).toBeInTheDocument();
      expect(screen.getByText('$125M+')).toBeInTheDocument();
      expect(screen.getByText('Assets Managed')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Years Experience')).toBeInTheDocument();
      expect(screen.getByText('98.5%')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction Rate')).toBeInTheDocument();
    });
  });

  it('should display account upgrade section', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Ready to Start Investing?')).toBeInTheDocument();
      expect(screen.getByText(/Upgrade your account to unlock full features/i)).toBeInTheDocument();
      expect(screen.getByText('Request Account Upgrade')).toBeInTheDocument();
    });
  });

  it('should display quick actions for guest users', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Learn More')).toBeInTheDocument();
      expect(screen.getByText('View Features')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Sign Up')).toBeInTheDocument();
    });
  });

  it('should handle error when fetching public info', async () => {
    const errorMessage = 'Failed to fetch public information';
    vi.mocked(guestService.getPublicInfo).mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading information/i)).toBeInTheDocument();
    });
  });

  it('should handle account upgrade request', async () => {
    vi.mocked(guestService.requestAccountUpgrade).mockResolvedValue({
      message: 'Upgrade request submitted successfully',
      requestId: '12345',
    });

    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Request Account Upgrade')).toBeInTheDocument();
    });

    const upgradeButton = screen.getByText('Request Account Upgrade');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(guestService.requestAccountUpgrade).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Upgrade request submitted successfully/i)).toBeInTheDocument();
    });
  });

  it('should show loading state during upgrade request', async () => {
    let resolveUpgrade: any;
    const upgradePromise = new Promise((resolve) => {
      resolveUpgrade = resolve;
    });
    vi.mocked(guestService.requestAccountUpgrade).mockReturnValue(upgradePromise);

    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Request Account Upgrade')).toBeInTheDocument();
    });

    const upgradeButton = screen.getByText('Request Account Upgrade');
    fireEvent.click(upgradeButton);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(upgradeButton).toBeDisabled();

    resolveUpgrade({ message: 'Success' });
  });

  it('should handle error during upgrade request', async () => {
    vi.mocked(guestService.requestAccountUpgrade).mockRejectedValue(
      new Error('Failed to submit upgrade request')
    );

    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Request Account Upgrade')).toBeInTheDocument();
    });

    const upgradeButton = screen.getByText('Request Account Upgrade');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to submit upgrade request/i)).toBeInTheDocument();
    });
  });

  it('should display information cards', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Why Choose Us?')).toBeInTheDocument();
      expect(screen.getByText('How It Works')).toBeInTheDocument();
      expect(screen.getByText('Get Started Today')).toBeInTheDocument();
    });
  });

  it('should have proper navigation links', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      const learnMoreLink = screen.getByText('Learn More').closest('a');
      expect(learnMoreLink).toHaveAttribute('href', '/about');

      const contactLink = screen.getByText('Contact Us').closest('a');
      expect(contactLink).toHaveAttribute('href', '/contact');

      const signUpLink = screen.getByText('Sign Up').closest('a');
      expect(signUpLink).toHaveAttribute('href', '/register');
    });
  });

  it('should format large numbers correctly', async () => {
    const largeNumberInfo = {
      ...mockPublicInfo,
      statistics: {
        totalClients: 1234567,
        totalAssets: 9876543210,
        yearsInBusiness: 25,
        satisfactionRate: 99.9,
      },
    };
    vi.mocked(guestService.getPublicInfo).mockResolvedValue(largeNumberInfo);

    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1.2M+')).toBeInTheDocument();
      expect(screen.getByText('$9.9B+')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('99.9%')).toBeInTheDocument();
    });
  });

  it('should handle empty features list', async () => {
    const emptyFeaturesInfo = {
      ...mockPublicInfo,
      features: [],
    };
    vi.mocked(guestService.getPublicInfo).mockResolvedValue(emptyFeaturesInfo);

    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.queryByText('Professional investment guidance')).not.toBeInTheDocument();
    });
  });

  it('should show upgrade success state', async () => {
    renderWithProviders(<GuestDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Request Account Upgrade')).toBeInTheDocument();
    });

    vi.mocked(guestService.requestAccountUpgrade).mockResolvedValue({
      message: 'Success',
      requestId: '123',
    });

    const upgradeButton = screen.getByText('Request Account Upgrade');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByText('✓ Request Submitted')).toBeInTheDocument();
      expect(upgradeButton).toBeDisabled();
    });
  });
});
