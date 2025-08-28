// frontend/src/pages/employee/reports/EmployeeReportsPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import EmployeeReportsPage from './EmployeeReportsPage';
import { reportService } from '../../../services/api/report.service';
import { ReportType, ReportFormat } from '../../../types/report.types';

vi.mock('../../../services/api/report.service');

const mockReportData = {
  clientMetrics: {
    totalClients: 150,
    activeClients: 145,
    newClientsThisMonth: 12,
    clientGrowthRate: 8.5,
    averagePortfolioValue: 185000,
    totalAUM: 27750000
  },
  investmentMetrics: {
    totalInvestments: 2450,
    investmentsByType: {
      STOCK: 1200,
      BOND: 450,
      ETF: 600,
      MUTUAL_FUND: 200
    },
    topPerformingInvestments: [
      { name: 'Apple Inc.', symbol: 'AAPL', performance: 25.5 },
      { name: 'Microsoft Corp.', symbol: 'MSFT', performance: 22.3 },
      { name: 'Amazon.com Inc.', symbol: 'AMZN', performance: 18.7 }
    ]
  },
  transactionMetrics: {
    totalTransactions: 5800,
    transactionsThisMonth: 480,
    buyTransactions: 3200,
    sellTransactions: 2600,
    averageTransactionSize: 12500,
    totalVolume: 72500000
  },
  approvalMetrics: {
    pendingApprovals: 8,
    approvedThisMonth: 95,
    rejectedThisMonth: 12,
    averageApprovalTime: 2.4,
    approvalRate: 88.8
  }
};

describe('EmployeeReportsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ data: mockReportData });
    renderWithProviders(<EmployeeReportsPage />);
    expect(screen.getByText('Employee Reports Dashboard')).toBeInTheDocument();
  });

  it('should display loading state while fetching data', () => {
    vi.mocked(reportService.getEmployeeReports).mockImplementation(() => 
      new Promise(() => {})
    );
    renderWithProviders(<EmployeeReportsPage />);
    expect(screen.getByText('Loading reports...')).toBeInTheDocument();
  });

  it('should display report data when loaded', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      // Client metrics
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('145')).toBeInTheDocument();
      expect(screen.getByText('$27.75M')).toBeInTheDocument();
      
      // Investment metrics
      expect(screen.getByText('2,450')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      
      // Transaction metrics
      expect(screen.getByText('5,800')).toBeInTheDocument();
      expect(screen.getByText('$72.50M')).toBeInTheDocument();
    });
  });

  it('should display error state when fetching fails', async () => {
    vi.mocked(reportService.getEmployeeReports).mockRejectedValue(
      new Error('Failed to fetch reports')
    );
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading reports')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch reports')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching when retry button is clicked', async () => {
    vi.mocked(reportService.getEmployeeReports)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockReportData });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading reports')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
    });
  });

  it('should handle date range filtering', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Employee Reports Dashboard')).toBeInTheDocument();
    });
    
    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
    
    fireEvent.click(screen.getByText('Apply Filter'));
    
    await waitFor(() => {
      expect(vi.mocked(reportService.getEmployeeReports)).toHaveBeenCalledWith({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      });
    });
  });

  it('should generate client report', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    vi.mocked(reportService.generateReport).mockResolvedValue({ 
      data: { url: 'http://example.com/report.pdf' } 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Generate Client Report')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Generate Client Report'));
    
    await waitFor(() => {
      expect(vi.mocked(reportService.generateReport)).toHaveBeenCalledWith({
        type: ReportType.CLIENT_SUMMARY,
        format: ReportFormat.PDF
      });
    });
  });

  it('should display investment type distribution', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Investment Distribution')).toBeInTheDocument();
      expect(screen.getByText('STOCK: 1,200')).toBeInTheDocument();
      expect(screen.getByText('BOND: 450')).toBeInTheDocument();
      expect(screen.getByText('ETF: 600')).toBeInTheDocument();
      expect(screen.getByText('MUTUAL_FUND: 200')).toBeInTheDocument();
    });
  });

  it('should display top performing investments', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Top Performing Investments')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('+25.5%')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.getByText('+22.3%')).toBeInTheDocument();
    });
  });

  it('should display approval metrics', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Approval Metrics')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // Pending
      expect(screen.getByText('88.8%')).toBeInTheDocument(); // Approval rate
      expect(screen.getByText('2.4 hours')).toBeInTheDocument(); // Avg time
    });
  });

  it('should refresh data when refresh button is clicked', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Refresh'));
    
    expect(vi.mocked(reportService.getEmployeeReports)).toHaveBeenCalledTimes(2);
  });

  it('should format large numbers correctly', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$27.75M')).toBeInTheDocument(); // Total AUM
      expect(screen.getByText('$185.0K')).toBeInTheDocument(); // Avg portfolio
      expect(screen.getByText('$72.50M')).toBeInTheDocument(); // Total volume
    });
  });

  it('should display growth indicators', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('+8.5%')).toBeInTheDocument(); // Client growth rate
      expect(screen.getByText('12')).toBeInTheDocument(); // New clients
    });
  });

  it('should switch between report views', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Investments')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
    
    // Switch to Clients view
    fireEvent.click(screen.getByText('Clients'));
    expect(screen.getByText('Client Metrics')).toBeInTheDocument();
    
    // Switch to Investments view
    fireEvent.click(screen.getByText('Investments'));
    expect(screen.getByText('Investment Distribution')).toBeInTheDocument();
  });

  it('should export report data', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    const mockCreateElement = document.createElement.bind(document);
    const mockClick = vi.fn();
    document.createElement = vi.fn((tagName) => {
      const element = mockCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Export Data')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Export Data'));
    
    expect(mockClick).toHaveBeenCalled();
    
    document.createElement = mockCreateElement;
  });

  it('should display quick stats', async () => {
    vi.mocked(reportService.getEmployeeReports).mockResolvedValue({ 
      data: mockReportData 
    });
    
    renderWithProviders(<EmployeeReportsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Stats')).toBeInTheDocument();
      expect(screen.getByText('480')).toBeInTheDocument(); // Transactions this month
      expect(screen.getByText('$12.5K')).toBeInTheDocument(); // Avg transaction size
    });
  });
});
