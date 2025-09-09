// frontend/src/pages/admin/reports/AdminReportsPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { AdminReportsPage } from './AdminReportsPage';
import { store } from '../../../store/store';
import { adminService } from '../../../services/adminService';

// Mock the admin service
vi.mock('../../../services/adminService');

// Mock chart.js
vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>
}));

describe('AdminReportsPage', () => {
  const mockBusinessMetrics = {
    revenue: {
      monthly: 250000,
      quarterly: 750000,
      yearly: 3000000,
      growth: 15.5,
      trend: [180000, 200000, 220000, 250000]
    },
    clients: {
      total: 950,
      new: 45,
      churnRate: 2.1,
      averagePortfolioValue: 131578.95,
      growthRate: 5.2
    },
    investments: {
      totalVolume: 125000000,
      totalTransactions: 3500,
      topPerformingStock: 'NVDA',
      averageROI: 12.3,
      distribution: {
        stocks: 65,
        bonds: 20,
        etfs: 10,
        other: 5
      }
    },
    users: {
      totalActive: 1250,
      byRole: {
        clients: 950,
        employees: 280,
        admins: 20
      },
      activeToday: 423,
      newThisMonth: 67
    }
  };

  const mockSystemMetrics = {
    performance: {
      avgResponseTime: 125,
      uptime: 99.95,
      errorRate: 0.05,
      activeUsers: 423
    },
    database: {
      size: 15.7,
      connections: 45,
      avgQueryTime: 12
    },
    server: {
      cpuUsage: 35,
      memoryUsage: 68,
      diskUsage: 42
    }
  };

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <AdminReportsPage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getBusinessMetrics as any).mockResolvedValue(mockBusinessMetrics);
    (adminService.getSystemMetrics as any).mockResolvedValue(mockSystemMetrics);
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should load and display business metrics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('$250,000')).toBeInTheDocument(); // Monthly revenue
      expect(screen.getByText('950')).toBeInTheDocument(); // Total clients
      expect(screen.getByText('12.3%')).toBeInTheDocument(); // Average ROI
    });

    expect(adminService.getBusinessMetrics).toHaveBeenCalled();
  });

  it('should display revenue growth percentage', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('15.5%')).toBeInTheDocument();
      expect(screen.getByText(/growth/i)).toBeInTheDocument();
    });
  });

  it('should display charts for data visualization', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument(); // Revenue trend
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument(); // Investment distribution
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument(); // User by role
    });
  });

  it('should switch between report tabs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Business Metrics')).toBeInTheDocument();
    });

    // Switch to System Performance tab
    const systemTab = screen.getByRole('tab', { name: /system performance/i });
    fireEvent.click(systemTab);

    await waitFor(() => {
      expect(screen.getByText('99.95%')).toBeInTheDocument(); // Uptime
      expect(screen.getByText('125ms')).toBeInTheDocument(); // Response time
    });
  });

  it('should handle date range selection', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
    });

    const dateRangeSelect = screen.getByLabelText(/date range/i);
    fireEvent.change(dateRangeSelect, { target: { value: 'last_quarter' } });

    await waitFor(() => {
      expect(adminService.getBusinessMetrics).toHaveBeenCalledWith({
        dateRange: 'last_quarter'
      });
    });
  });

  it('should generate custom report', async () => {
    (adminService.generateSystemReport as any).mockResolvedValue({
      reportId: 'report-123',
      status: 'GENERATING',
      message: 'Report generation started'
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
    });

    // Open report generation modal
    const generateButton = screen.getByRole('button', { name: /generate report/i });
    fireEvent.click(generateButton);

    expect(screen.getByText(/custom report generation/i)).toBeInTheDocument();

    // Select report options
    const includeFinancial = screen.getByLabelText(/financial summary/i);
    const includeUserAnalytics = screen.getByLabelText(/user analytics/i);
    
    fireEvent.click(includeFinancial);
    fireEvent.click(includeUserAnalytics);

    // Generate report
    const confirmButton = screen.getByRole('button', { name: /generate/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminService.generateSystemReport).toHaveBeenCalledWith({
        type: 'MONTHLY',
        includeFinancialSummary: true,
        includeUserAnalytics: true,
        includeSystemHealth: false,
        includeActivityLogs: false,
        format: 'PDF'
      });
      expect(screen.getByText(/report generation started/i)).toBeInTheDocument();
    });
  });

  it('should export current view data', async () => {
    (adminService.exportReportData as any).mockResolvedValue(
      new Blob(['report data'], { type: 'text/csv' })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export data/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(adminService.exportReportData).toHaveBeenCalledWith({
        type: 'business_metrics',
        format: 'CSV'
      });
    });
  });

  it('should display key performance indicators', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Key Performance Indicators')).toBeInTheDocument();
      expect(screen.getByText('Client Acquisition')).toBeInTheDocument();
      expect(screen.getByText('Revenue per Client')).toBeInTheDocument();
      expect(screen.getByText('System Reliability')).toBeInTheDocument();
    });
  });

  it('should show top performing investments', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Top Performing Investment')).toBeInTheDocument();
      expect(screen.getByText('NVDA')).toBeInTheDocument();
    });
  });

  it('should refresh metrics data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(adminService.getBusinessMetrics).toHaveBeenCalledTimes(2);
      expect(adminService.getSystemMetrics).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle errors when loading metrics', async () => {
    (adminService.getBusinessMetrics as any).mockRejectedValue(new Error('Failed to load metrics'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load metrics/i)).toBeInTheDocument();
    });
  });

  it('should display system health indicators', async () => {
    renderComponent();

    await waitFor(() => {
      const systemTab = screen.getByRole('tab', { name: /system performance/i });
      fireEvent.click(systemTab);
    });

    await waitFor(() => {
      expect(screen.getByText('CPU Usage')).toBeInTheDocument();
      expect(screen.getByText('35%')).toBeInTheDocument();
      expect(screen.getByText('Memory Usage')).toBeInTheDocument();
      expect(screen.getByText('68%')).toBeInTheDocument();
    });
  });

  it('should show report generation history', async () => {
    const mockReportHistory = [
      {
        reportId: 'report-001',
        generatedAt: '2025-01-15T10:00:00',
        generatedBy: 'admin@example.com',
        type: 'Monthly Report',
        status: 'COMPLETED'
      },
      {
        reportId: 'report-002',
        generatedAt: '2025-01-14T15:30:00',
        generatedBy: 'admin@example.com',
        type: 'User Analytics',
        status: 'COMPLETED'
      }
    ];

    (adminService.getReportHistory as any).mockResolvedValue(mockReportHistory);

    renderComponent();

    const historyTab = screen.getByRole('tab', { name: /report history/i });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('Monthly Report')).toBeInTheDocument();
      expect(screen.getByText('User Analytics')).toBeInTheDocument();
      expect(screen.getAllByText('COMPLETED')).toHaveLength(2);
    });
  });

  it('should download completed reports', async () => {
    const mockReportHistory = [{
      reportId: 'report-001',
      generatedAt: '2025-01-15T10:00:00',
      type: 'Monthly Report',
      status: 'COMPLETED',
      downloadUrl: '/api/admin/reports/download/report-001'
    }];

    (adminService.getReportHistory as any).mockResolvedValue(mockReportHistory);

    renderComponent();

    const historyTab = screen.getByRole('tab', { name: /report history/i });
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /download/i });
    fireEvent.click(downloadButton);

    // Should trigger download
  });

  it('should display comparison metrics', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/vs last month/i)).toBeInTheDocument();
      expect(screen.getByText(/vs last quarter/i)).toBeInTheDocument();
    });
  });

  it('should handle print functionality', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /print report/i })).toBeInTheDocument();
    });

    const printButton = screen.getByRole('button', { name: /print report/i });
    fireEvent.click(printButton);

    // Should trigger print dialog
  });
});
