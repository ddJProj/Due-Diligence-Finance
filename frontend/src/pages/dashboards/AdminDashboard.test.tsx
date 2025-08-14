// frontend/src/pages/dashboards/AdminDashboard.test.tsx

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import adminService from '../../api/AdminService';
import authSlice from '../../store/authSlice';

// Mock the AdminService
vi.mock('../../api/AdminService', () => ({
  default: {
    getSystemStats: vi.fn(),
    getSystemHealth: vi.fn(),
    getActivityLogs: vi.fn(),
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
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN' as const,
};

const mockDashboardStats = {
  totalUsers: 125,
  activeUsers: 98,
  totalClients: 85,
  totalEmployees: 12,
  totalAdmins: 3,
  totalInvestments: 456,
  totalPortfolioValue: 2345678.90,
  systemHealth: 'HEALTHY' as const,
  lastBackup: '2025-08-14T02:00:00Z',
  diskUsagePercent: 45.8,
  averageResponseTime: 120,
};

const mockSystemHealth = {
  status: 'HEALTHY' as const,
  database: { status: 'UP', responseTime: 15 },
  cache: { status: 'UP', responseTime: 2 },
  messageQueue: { status: 'UP', queueSize: 125 },
  stockApi: { status: 'UP', lastSync: '2025-08-14T10:00:00Z' },
  uptime: '15 days, 4 hours',
  lastRestart: '2025-08-01T00:00:00Z',
};

const mockUserActivity = [
  {
    id: 1,
    userId: 2,
    userEmail: 'john.doe@example.com',
    activityType: 'LOGIN',
    activityTime: '2025-08-14T10:30:00Z',
    ipAddress: '192.168.1.100',
    description: 'User login',
  },
  {
    id: 2,
    userId: 3,
    userEmail: 'jane.smith@example.com',
    activityType: 'CREATED_INVESTMENT',
    activityTime: '2025-08-14T10:15:00Z',
    ipAddress: '192.168.1.101',
    description: 'Created investment: AAPL',
  },
  {
    id: 3,
    userId: 4,
    userEmail: 'bob.johnson@example.com',
    activityType: 'UPDATED_PROFILE',
    activityTime: '2025-08-14T09:45:00Z',
    ipAddress: '192.168.1.102',
    description: 'Updated profile information',
  },
];

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

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminService.getSystemStats).mockResolvedValue(mockDashboardStats);
    vi.mocked(adminService.getSystemHealth).mockResolvedValue(mockSystemHealth);
    vi.mocked(adminService.getActivityLogs).mockResolvedValue(mockUserActivity);
  });

  it('should render without errors', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  it('should display welcome message with admin name', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByText(/Welcome back, Admin!/i)).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    renderWithProviders(<AdminDashboard />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should fetch and display dashboard statistics', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('125')).toBeInTheDocument();
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('98')).toBeInTheDocument();
      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('456')).toBeInTheDocument();
      expect(screen.getByText('Total Investments')).toBeInTheDocument();
      expect(screen.getByText('$2,345,678.90')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
    });

    expect(adminService.getSystemStats).toHaveBeenCalledTimes(1);
  });

  it('should display system health information', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('HEALTHY')).toBeInTheDocument();
      expect(screen.getByText(/Uptime:/)).toBeInTheDocument();
      expect(screen.getByText('15 days, 4 hours')).toBeInTheDocument();
      expect(screen.getByText(/Database:/)).toBeInTheDocument();
      expect(screen.getByText('UP')).toBeInTheDocument();
    });

    expect(adminService.getSystemHealth).toHaveBeenCalledTimes(1);
  });

  it('should display recent user activity', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('LOGIN')).toBeInTheDocument();
      expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByText('CREATED_INVESTMENT')).toBeInTheDocument();
      expect(screen.getByText('bob.johnson@example.com')).toBeInTheDocument();
      expect(screen.getByText('UPDATED_PROFILE')).toBeInTheDocument();
    });

    expect(adminService.getActivityLogs).toHaveBeenCalledTimes(1);
  });

  it('should show additional statistics', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Total Employees')).toBeInTheDocument();
    });
  });

  it('should display quick actions for admin tasks', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
      expect(screen.getByText('System Configuration')).toBeInTheDocument();
      expect(screen.getByText('View Activity Logs')).toBeInTheDocument();
      expect(screen.getByText('Generate Reports')).toBeInTheDocument();
      expect(screen.getByText('Backup System')).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching dashboard data', async () => {
    const errorMessage = 'Failed to fetch dashboard data';
    vi.mocked(adminService.getSystemStats).mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Error loading dashboard data/i)).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching system health', async () => {
    const errorMessage = 'Failed to fetch system health';
    vi.mocked(adminService.getSystemHealth).mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/System Health/i)).toBeInTheDocument();
      expect(screen.getByText(/Error loading system health/i)).toBeInTheDocument();
    });
  });

  it('should handle errors when fetching user activity', async () => {
    const errorMessage = 'Failed to fetch user activity';
    vi.mocked(adminService.getActivityLogs).mockRejectedValue(new Error(errorMessage));

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
      expect(screen.getByText(/Error loading activity/i)).toBeInTheDocument();
    });
  });

  it('should refresh data when refresh button is clicked', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('125')).toBeInTheDocument();
    });

    // Clear mock calls
    vi.clearAllMocks();

    // Click refresh button
    const refreshButton = screen.getByLabelText(/Refresh dashboard/i);
    fireEvent.click(refreshButton);

    // Should show loading state
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    // Should refetch all data
    await waitFor(() => {
      expect(adminService.getSystemStats).toHaveBeenCalledTimes(1);
      expect(adminService.getSystemHealth).toHaveBeenCalledTimes(1);
      expect(adminService.getActivityLogs).toHaveBeenCalledTimes(1);
    });
  });

  it('should display last updated timestamp', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
    });
  });

  it('should handle empty user activity', async () => {
    vi.mocked(adminService.getActivityLogs).mockResolvedValue([]);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('No recent activity')).toBeInTheDocument();
    });
  });

  it('should format large numbers correctly', async () => {
    const largeNumberStats = {
      ...mockDashboardStats,
      totalUsers: 1234567,
      totalPortfolioValue: 9876543210.12,
    };
    vi.mocked(adminService.getSystemStats).mockResolvedValue(largeNumberStats);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
      expect(screen.getByText('$9,876,543,210.12')).toBeInTheDocument();
    });
  });

  it('should show system status with appropriate styling', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      const healthyStatus = screen.getByText('HEALTHY');
      expect(healthyStatus).toHaveClass('status--healthy');
    });
  });

  it('should show warning status when system health is degraded', async () => {
    const degradedHealth = {
      ...mockSystemHealth,
      status: 'DEGRADED' as const,
    };
    vi.mocked(adminService.getSystemHealth).mockResolvedValue(degradedHealth);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      const degradedStatus = screen.getByText('DEGRADED');
      expect(degradedStatus).toHaveClass('status--warning');
    });
  });

  it('should show error status when system health is critical', async () => {
    const criticalHealth = {
      ...mockSystemHealth,
      status: 'CRITICAL' as const,
    };
    vi.mocked(adminService.getSystemHealth).mockResolvedValue(criticalHealth);

    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      const criticalStatus = screen.getByText('CRITICAL');
      expect(criticalStatus).toHaveClass('status--error');
    });
  });

  it('should display backup time in readable format', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Last Backup:/i)).toBeInTheDocument();
      // Should format the ISO date to a readable format
      expect(screen.getByText(/Aug 14, 2025/i)).toBeInTheDocument();
    });
  });

  it('should handle navigation for quick actions', async () => {
    renderWithProviders(<AdminDashboard />);

    await waitFor(() => {
      const manageUsersLink = screen.getByText('Manage Users').closest('a');
      expect(manageUsersLink).toHaveAttribute('href', '/admin/users');

      const configLink = screen.getByText('System Configuration').closest('a');
      expect(configLink).toHaveAttribute('href', '/admin/config');

      const logsLink = screen.getByText('View Activity Logs').closest('a');
      expect(logsLink).toHaveAttribute('href', '/admin/logs');

      const reportsLink = screen.getByText('Generate Reports').closest('a');
      expect(reportsLink).toHaveAttribute('href', '/admin/reports');
    });
  });
});
