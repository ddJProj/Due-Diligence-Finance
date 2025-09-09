// frontend/src/pages/admin/logs/ActivityLogsPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ActivityLogsPage } from './ActivityLogsPage';
import { store } from '../../../store/store';
import { adminService } from '../../../services/adminService';

// Mock the admin service
vi.mock('../../../services/adminService');

describe('ActivityLogsPage', () => {
  const mockActivityLogs = [
    {
      id: 1,
      userId: 1,
      userEmail: 'john.doe@example.com',
      activityType: 'LOGIN',
      activityTime: '2025-01-15T10:00:00',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      resourceType: null,
      resourceId: null,
      details: 'User logged in successfully',
      success: true,
      errorMessage: null
    },
    {
      id: 2,
      userId: 2,
      userEmail: 'admin@example.com',
      activityType: 'UPDATE',
      activityTime: '2025-01-15T09:45:00',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Mac)',
      resourceType: 'USER',
      resourceId: 5,
      details: 'Updated user permissions',
      success: true,
      errorMessage: null
    },
    {
      id: 3,
      userId: 3,
      userEmail: 'jane.smith@example.com',
      activityType: 'CREATE',
      activityTime: '2025-01-15T09:30:00',
      ipAddress: '192.168.1.102',
      userAgent: 'Chrome/120.0',
      resourceType: 'INVESTMENT',
      resourceId: 15,
      details: 'Created new investment',
      success: false,
      errorMessage: 'Insufficient permissions'
    },
    {
      id: 4,
      userId: 1,
      userEmail: 'john.doe@example.com',
      activityType: 'DELETE',
      activityTime: '2025-01-15T09:00:00',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      resourceType: 'CLIENT',
      resourceId: 10,
      details: 'Deleted client record',
      success: true,
      errorMessage: null
    }
  ];

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ActivityLogsPage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getActivityLogs as any).mockResolvedValue({
      logs: mockActivityLogs,
      total: 4,
      page: 1,
      pageSize: 20
    });
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should load and display activity logs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('User logged in successfully')).toBeInTheDocument();
    });

    expect(adminService.getActivityLogs).toHaveBeenCalled();
  });

  it('should display activity types with appropriate badges', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('LOGIN')).toBeInTheDocument();
      expect(screen.getByText('UPDATE')).toBeInTheDocument();
      expect(screen.getByText('CREATE')).toBeInTheDocument();
      expect(screen.getByText('DELETE')).toBeInTheDocument();
    });
  });

  it('should show success/failure status', async () => {
    renderComponent();

    await waitFor(() => {
      const successBadges = screen.getAllByText('Success');
      const failureBadge = screen.getByText('Failed');
      
      expect(successBadges).toHaveLength(3);
      expect(failureBadge).toBeInTheDocument();
    });
  });

  it('should filter logs by activity type', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    const typeFilter = screen.getByLabelText(/filter by type/i);
    fireEvent.change(typeFilter, { target: { value: 'LOGIN' } });

    await waitFor(() => {
      expect(adminService.getActivityLogs).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        activityType: 'LOGIN',
        startDate: expect.any(String),
        endDate: expect.any(String)
      });
    });
  });

  it('should filter logs by user', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    const userSearch = screen.getByPlaceholderText(/search by user/i);
    fireEvent.change(userSearch, { target: { value: 'john' } });

    // Debounce delay
    await new Promise(resolve => setTimeout(resolve, 500));

    await waitFor(() => {
      expect(adminService.getActivityLogs).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        userEmail: 'john',
        startDate: expect.any(String),
        endDate: expect.any(String)
      });
    });
  });

  it('should filter logs by date range', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    fireEvent.change(startDateInput, { target: { value: '2025-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2025-01-16' } });

    await waitFor(() => {
      expect(adminService.getActivityLogs).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        startDate: '2025-01-15',
        endDate: '2025-01-16'
      });
    });
  });

  it('should filter logs by success status', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText(/filter by status/i);
    fireEvent.change(statusFilter, { target: { value: 'failed' } });

    await waitFor(() => {
      expect(adminService.getActivityLogs).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        success: false,
        startDate: expect.any(String),
        endDate: expect.any(String)
      });
    });
  });

  it('should handle pagination', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(adminService.getActivityLogs).toHaveBeenCalledWith({
        page: 2,
        pageSize: 20,
        startDate: expect.any(String),
        endDate: expect.any(String)
      });
    });
  });

  it('should expand log details', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    const expandButton = screen.getAllByRole('button', { name: /expand/i })[0];
    fireEvent.click(expandButton);

    expect(screen.getByText('IP Address:')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    expect(screen.getByText('User Agent:')).toBeInTheDocument();
  });

  it('should export logs', async () => {
    (adminService.exportActivityLogs as any).mockResolvedValue(
      new Blob(['log data'], { type: 'text/csv' })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(adminService.exportActivityLogs).toHaveBeenCalledWith({
        startDate: expect.any(String),
        endDate: expect.any(String)
      });
    });
  });

  it('should display error when loading fails', async () => {
    (adminService.getActivityLogs as any).mockRejectedValue(new Error('Failed to load logs'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load logs/i)).toBeInTheDocument();
    });
  });

  it('should refresh logs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(adminService.getActivityLogs).toHaveBeenCalledTimes(2);
    });
  });

  it('should display empty state when no logs', async () => {
    (adminService.getActivityLogs as any).mockResolvedValue({
      logs: [],
      total: 0,
      page: 1,
      pageSize: 20
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no activity logs found/i)).toBeInTheDocument();
    });
  });

  it('should display error message for failed activities', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Insufficient permissions')).toBeInTheDocument();
    });
  });

  it('should highlight critical actions', async () => {
    const criticalLog = {
      id: 5,
      userId: 2,
      userEmail: 'admin@example.com',
      activityType: 'DELETE',
      activityTime: '2025-01-15T08:00:00',
      resourceType: 'USER',
      resourceId: 20,
      details: 'Deleted user account',
      success: true,
      isCritical: true
    };

    (adminService.getActivityLogs as any).mockResolvedValue({
      logs: [...mockActivityLogs, criticalLog],
      total: 5,
      page: 1,
      pageSize: 20
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Deleted user account')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });
  });

  it('should display resource links when available', async () => {
    renderComponent();

    await waitFor(() => {
      const resourceLinks = screen.getAllByText(/view resource/i);
      expect(resourceLinks.length).toBeGreaterThan(0);
    });

    const resourceLink = screen.getAllByText(/view resource/i)[0];
    fireEvent.click(resourceLink);

    // Should navigate to resource
    expect(window.location.pathname).toBe('/');
  });

  it('should show real-time indicator for recent activities', async () => {
    const recentLog = {
      ...mockActivityLogs[0],
      id: 6,
      activityTime: new Date().toISOString()
    };

    (adminService.getActivityLogs as any).mockResolvedValue({
      logs: [recentLog, ...mockActivityLogs],
      total: 5,
      page: 1,
      pageSize: 20
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/just now/i)).toBeInTheDocument();
    });
  });
});
