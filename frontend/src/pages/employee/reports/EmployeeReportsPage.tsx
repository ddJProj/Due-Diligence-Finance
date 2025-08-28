// frontend/src/pages/employee/reports/EmployeeReportsPage.tsx
import React, { useState, useEffect } from 'react';
import { reportService } from '../../../services/api/report.service';
import { ReportType, ReportFormat } from '../../../types/report.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import './EmployeeReportsPage.css';

interface ReportData {
  clientMetrics: {
    totalClients: number;
    activeClients: number;
    newClientsThisMonth: number;
    clientGrowthRate: number;
    averagePortfolioValue: number;
    totalAUM: number;
  };
  investmentMetrics: {
    totalInvestments: number;
    investmentsByType: Record<string, number>;
    topPerformingInvestments: Array<{
      name: string;
      symbol: string;
      performance: number;
    }>;
  };
  transactionMetrics: {
    totalTransactions: number;
    transactionsThisMonth: number;
    buyTransactions: number;
    sellTransactions: number;
    averageTransactionSize: number;
    totalVolume: number;
  };
  approvalMetrics: {
    pendingApprovals: number;
    approvedThisMonth: number;
    rejectedThisMonth: number;
    averageApprovalTime: number;
    approvalRate: number;
  };
}

type ViewType = 'overview' | 'clients' | 'investments' | 'transactions';

const EmployeeReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchReportData = async (dateRange?: { startDate: string; endDate: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await reportService.getEmployeeReports(dateRange);
      setReportData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleDateFilter = () => {
    if (startDate && endDate) {
      fetchReportData({ startDate, endDate });
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  const handleGenerateReport = async (type: ReportType) => {
    try {
      setGenerating(true);
      const response = await reportService.generateReport({
        type,
        format: ReportFormat.PDF
      });
      
      // In a real app, this would handle the download
      window.open(response.data.url, '_blank');
    } catch (err) {
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const csvData = [
      ['Metric', 'Value'],
      ['Total Clients', reportData.clientMetrics.totalClients],
      ['Active Clients', reportData.clientMetrics.activeClients],
      ['Total AUM', reportData.clientMetrics.totalAUM],
      ['Total Investments', reportData.investmentMetrics.totalInvestments],
      ['Total Transactions', reportData.transactionMetrics.totalTransactions],
      ['Pending Approvals', reportData.approvalMetrics.pendingApprovals]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="employee-reports-page">
        <LoadingSpinner message="Loading reports..." />
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="employee-reports-page">
        <ErrorMessage
          title="Error loading reports"
          message={error || 'Failed to load report data'}
          onRetry={() => fetchReportData()}
        />
      </div>
    );
  }

  return (
    <div className="employee-reports-page">
      <div className="page-header">
        <h1>Employee Reports Dashboard</h1>
        <div className="header-actions">
          <Button variant="secondary" onClick={() => fetchReportData()}>
            Refresh
          </Button>
          <Button variant="secondary" onClick={exportToCSV}>
            Export Data
          </Button>
        </div>
      </div>

      <Card>
        <div className="date-filters">
          <div className="filter-group">
            <label htmlFor="start-date">Start Date</label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="end-date">End Date</label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          <Button 
            variant="primary" 
            onClick={handleDateFilter}
            disabled={!startDate || !endDate}
          >
            Apply Filter
          </Button>
        </div>
      </Card>

      <div className="view-tabs">
        <button
          className={`tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeView === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveView('clients')}
        >
          Clients
        </button>
        <button
          className={`tab ${activeView === 'investments' ? 'active' : ''}`}
          onClick={() => setActiveView('investments')}
        >
          Investments
        </button>
        <button
          className={`tab ${activeView === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveView('transactions')}
        >
          Transactions
        </button>
      </div>

      {activeView === 'overview' && (
        <div className="report-content">
          <div className="metrics-grid">
            <Card>
              <div className="metric-card">
                <h3>Total Clients</h3>
                <div className="metric-value">{formatNumber(reportData.clientMetrics.totalClients)}</div>
                <div className="metric-subtext">
                  {reportData.clientMetrics.activeClients} active
                </div>
              </div>
            </Card>
            <Card>
              <div className="metric-card">
                <h3>Total AUM</h3>
                <div className="metric-value">{formatCurrency(reportData.clientMetrics.totalAUM)}</div>
                <div className="metric-subtext">
                  Avg: {formatCurrency(reportData.clientMetrics.averagePortfolioValue)}
                </div>
              </div>
            </Card>
            <Card>
              <div className="metric-card">
                <h3>Total Investments</h3>
                <div className="metric-value">{formatNumber(reportData.investmentMetrics.totalInvestments)}</div>
              </div>
            </Card>
            <Card>
              <div className="metric-card">
                <h3>Total Transactions</h3>
                <div className="metric-value">{formatNumber(reportData.transactionMetrics.totalTransactions)}</div>
                <div className="metric-subtext">
                  Volume: {formatCurrency(reportData.transactionMetrics.totalVolume)}
                </div>
              </div>
            </Card>
          </div>

          <Card>
            <div className="quick-stats">
              <h2>Quick Stats</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">New Clients This Month</span>
                  <span className="stat-value">{reportData.clientMetrics.newClientsThisMonth}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Client Growth Rate</span>
                  <span className="stat-value positive">{formatPercentage(reportData.clientMetrics.clientGrowthRate)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Transactions This Month</span>
                  <span className="stat-value">{reportData.transactionMetrics.transactionsThisMonth}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Avg Transaction Size</span>
                  <span className="stat-value">{formatCurrency(reportData.transactionMetrics.averageTransactionSize)}</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="report-actions">
            <Button 
              variant="primary"
              onClick={() => handleGenerateReport(ReportType.CLIENT_SUMMARY)}
              disabled={generating}
            >
              Generate Client Report
            </Button>
            <Button 
              variant="primary"
              onClick={() => handleGenerateReport(ReportType.INVESTMENT_PERFORMANCE)}
              disabled={generating}
            >
              Generate Investment Report
            </Button>
            <Button 
              variant="primary"
              onClick={() => handleGenerateReport(ReportType.TRANSACTION_SUMMARY)}
              disabled={generating}
            >
              Generate Transaction Report
            </Button>
          </div>
        </div>
      )}

      {activeView === 'clients' && (
        <div className="report-content">
          <Card>
            <h2>Client Metrics</h2>
            <div className="detail-metrics">
              <div className="metric-row">
                <span>Total Clients</span>
                <span>{formatNumber(reportData.clientMetrics.totalClients)}</span>
              </div>
              <div className="metric-row">
                <span>Active Clients</span>
                <span>{formatNumber(reportData.clientMetrics.activeClients)}</span>
              </div>
              <div className="metric-row">
                <span>New Clients (This Month)</span>
                <span>{reportData.clientMetrics.newClientsThisMonth}</span>
              </div>
              <div className="metric-row">
                <span>Client Growth Rate</span>
                <span className="positive">{formatPercentage(reportData.clientMetrics.clientGrowthRate)}</span>
              </div>
              <div className="metric-row">
                <span>Total AUM</span>
                <span>{formatCurrency(reportData.clientMetrics.totalAUM)}</span>
              </div>
              <div className="metric-row">
                <span>Average Portfolio Value</span>
                <span>{formatCurrency(reportData.clientMetrics.averagePortfolioValue)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeView === 'investments' && (
        <div className="report-content">
          <Card>
            <h2>Investment Distribution</h2>
            <div className="investment-types">
              {Object.entries(reportData.investmentMetrics.investmentsByType).map(([type, count]) => (
                <div key={type} className="type-row">
                  <span>{type}: {formatNumber(count)}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${(count / reportData.investmentMetrics.totalInvestments) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2>Top Performing Investments</h2>
            <div className="top-investments">
              {reportData.investmentMetrics.topPerformingInvestments.map((inv, index) => (
                <div key={index} className="investment-item">
                  <div className="investment-info">
                    <span className="investment-name">{inv.name}</span>
                    <span className="investment-symbol">{inv.symbol}</span>
                  </div>
                  <span className="performance positive">{formatPercentage(inv.performance)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeView === 'transactions' && (
        <div className="report-content">
          <Card>
            <h2>Transaction Metrics</h2>
            <div className="detail-metrics">
              <div className="metric-row">
                <span>Total Transactions</span>
                <span>{formatNumber(reportData.transactionMetrics.totalTransactions)}</span>
              </div>
              <div className="metric-row">
                <span>Transactions This Month</span>
                <span>{reportData.transactionMetrics.transactionsThisMonth}</span>
              </div>
              <div className="metric-row">
                <span>Buy Transactions</span>
                <span>{formatNumber(reportData.transactionMetrics.buyTransactions)}</span>
              </div>
              <div className="metric-row">
                <span>Sell Transactions</span>
                <span>{formatNumber(reportData.transactionMetrics.sellTransactions)}</span>
              </div>
              <div className="metric-row">
                <span>Average Transaction Size</span>
                <span>{formatCurrency(reportData.transactionMetrics.averageTransactionSize)}</span>
              </div>
              <div className="metric-row">
                <span>Total Volume</span>
                <span>{formatCurrency(reportData.transactionMetrics.totalVolume)}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h2>Approval Metrics</h2>
            <div className="detail-metrics">
              <div className="metric-row">
                <span>Pending Approvals</span>
                <span className="urgent">{reportData.approvalMetrics.pendingApprovals}</span>
              </div>
              <div className="metric-row">
                <span>Approved This Month</span>
                <span>{reportData.approvalMetrics.approvedThisMonth}</span>
              </div>
              <div className="metric-row">
                <span>Rejected This Month</span>
                <span>{reportData.approvalMetrics.rejectedThisMonth}</span>
              </div>
              <div className="metric-row">
                <span>Approval Rate</span>
                <span>{reportData.approvalMetrics.approvalRate}%</span>
              </div>
              <div className="metric-row">
                <span>Average Approval Time</span>
                <span>{reportData.approvalMetrics.averageApprovalTime} hours</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmployeeReportsPage;
