// frontend/src/pages/admin/reports/AdminReportsPage.tsx

import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useAppDispatch } from '../../../hooks/redux';
import { adminService } from '../../../services/adminService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Select } from '../../../components/common/Select';
import { showToast } from '../../../store/slices/uiSlice';
import { formatCurrency } from '../../../utils/formatters';
import './AdminReportsPage.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface BusinessMetrics {
  revenue: {
    monthly: number;
    quarterly: number;
    yearly: number;
    growth: number;
    trend: number[];
  };
  clients: {
    total: number;
    new: number;
    churnRate: number;
    averagePortfolioValue: number;
    growthRate: number;
  };
  investments: {
    totalVolume: number;
    totalTransactions: number;
    topPerformingStock: string;
    averageROI: number;
    distribution: Record<string, number>;
  };
  users: {
    totalActive: number;
    byRole: Record<string, number>;
    activeToday: number;
    newThisMonth: number;
  };
}

interface SystemMetrics {
  performance: {
    avgResponseTime: number;
    uptime: number;
    errorRate: number;
    activeUsers: number;
  };
  database: {
    size: number;
    connections: number;
    avgQueryTime: number;
  };
  server: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

interface ReportHistory {
  reportId: string;
  generatedAt: string;
  generatedBy: string;
  type: string;
  status: string;
  downloadUrl?: string;
}

interface ReportOptions {
  type: string;
  includeFinancialSummary: boolean;
  includeUserAnalytics: boolean;
  includeSystemHealth: boolean;
  includeActivityLogs: boolean;
  format: string;
}

type TabType = 'business' | 'system' | 'history';

export const AdminReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [reportHistory, setReportHistory] = useState<ReportHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('business');
  const [dateRange, setDateRange] = useState('last_month');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // Report generation state
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    type: 'MONTHLY',
    includeFinancialSummary: false,
    includeUserAnalytics: false,
    includeSystemHealth: false,
    includeActivityLogs: false,
    format: 'PDF'
  });

  // Load metrics
  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  // Load report history when switching to history tab
  useEffect(() => {
    if (activeTab === 'history') {
      loadReportHistory();
    }
  }, [activeTab]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const [business, system] = await Promise.all([
        adminService.getBusinessMetrics({ dateRange }),
        adminService.getSystemMetrics()
      ]);
      setBusinessMetrics(business);
      setSystemMetrics(system);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const loadReportHistory = async () => {
    try {
      const history = await adminService.getReportHistory();
      setReportHistory(history);
    } catch (err: any) {
      dispatch(showToast({
        message: 'Failed to load report history',
        type: 'error'
      }));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    setRefreshing(false);
    dispatch(showToast({
      message: 'Metrics refreshed successfully',
      type: 'success'
    }));
  };

  const handleGenerateReport = async () => {
    try {
      const result = await adminService.generateSystemReport(reportOptions);
      dispatch(showToast({
        message: result.message || 'Report generation started',
        type: 'success'
      }));
      setShowGenerateModal(false);
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to generate report',
        type: 'error'
      }));
    }
  };

  const handleExportData = async () => {
    try {
      const blob = await adminService.exportReportData({
        type: activeTab === 'business' ? 'business_metrics' : 'system_metrics',
        format: 'CSV'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-metrics_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      dispatch(showToast({
        message: 'Data exported successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to export data',
        type: 'error'
      }));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadReport = (downloadUrl: string) => {
    window.open(downloadUrl, '_blank');
  };

  if (loading && !businessMetrics) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error && !businessMetrics) {
    return (
      <div className="admin-reports-page">
        <Card>
          <div className="error-state">
            <p>{error}</p>
            <Button onClick={loadMetrics} variant="primary">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Chart configurations
  const revenueChartData = {
    labels: ['Month 1', 'Month 2', 'Month 3', 'Month 4'],
    datasets: [{
      label: 'Revenue',
      data: businessMetrics?.revenue.trend || [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4
    }]
  };

  const investmentDistributionData = {
    labels: Object.keys(businessMetrics?.investments.distribution || {}),
    datasets: [{
      data: Object.values(businessMetrics?.investments.distribution || {}),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  };

  const userDistributionData = {
    labels: Object.keys(businessMetrics?.users.byRole || {}),
    datasets: [{
      label: 'Users by Role',
      data: Object.values(businessMetrics?.users.byRole || {}),
      backgroundColor: 'rgba(59, 130, 246, 0.8)'
    }]
  };

  return (
    <div className="admin-reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Comprehensive business and system performance metrics</p>
      </div>

      <div className="controls-section">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'business' ? 'active' : ''}`}
            onClick={() => setActiveTab('business')}
            role="tab"
            aria-selected={activeTab === 'business'}
          >
            Business Metrics
          </button>
          <button
            className={`tab ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
            role="tab"
            aria-selected={activeTab === 'system'}
          >
            System Performance
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            role="tab"
            aria-selected={activeTab === 'history'}
          >
            Report History
          </button>
        </div>

        <div className="controls">
          {activeTab !== 'history' && (
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Date range"
            >
              <option value="last_week">Last Week</option>
              <option value="last_month">Last Month</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="last_year">Last Year</option>
            </Select>
          )}
          
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="secondary" onClick={handleExportData}>
            Export Data
          </Button>
          <Button variant="secondary" onClick={handlePrint}>
            Print Report
          </Button>
          <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
            Generate Report
          </Button>
        </div>
      </div>

      <div className="report-content">
        {activeTab === 'business' && businessMetrics && (
          <div className="business-metrics">
            <div className="metrics-grid">
              <Card className="metric-card">
                <h3>Monthly Revenue</h3>
                <div className="metric-value">{formatCurrency(businessMetrics.revenue.monthly)}</div>
                <div className="metric-change">
                  <Badge variant={businessMetrics.revenue.growth > 0 ? 'success' : 'danger'}>
                    {businessMetrics.revenue.growth > 0 ? '+' : ''}{businessMetrics.revenue.growth}%
                  </Badge>
                  <span>vs last month</span>
                </div>
              </Card>

              <Card className="metric-card">
                <h3>Total Clients</h3>
                <div className="metric-value">{businessMetrics.clients.total}</div>
                <div className="metric-subtext">
                  {businessMetrics.clients.new} new this month
                </div>
              </Card>

              <Card className="metric-card">
                <h3>Average ROI</h3>
                <div className="metric-value">{businessMetrics.investments.averageROI}%</div>
                <div className="metric-subtext">
                  Across all portfolios
                </div>
              </Card>

              <Card className="metric-card">
                <h3>Active Users</h3>
                <div className="metric-value">{businessMetrics.users.totalActive}</div>
                <div className="metric-subtext">
                  {businessMetrics.users.activeToday} active today
                </div>
              </Card>
            </div>

            <div className="charts-section">
              <Card className="chart-card">
                <h3>Revenue Trend</h3>
                <Line data={revenueChartData} options={{ responsive: true }} />
              </Card>

              <Card className="chart-card">
                <h3>Investment Distribution</h3>
                <Doughnut data={investmentDistributionData} options={{ responsive: true }} />
              </Card>

              <Card className="chart-card">
                <h3>Users by Role</h3>
                <Bar data={userDistributionData} options={{ responsive: true }} />
              </Card>
            </div>

            <Card className="kpi-section">
              <h3>Key Performance Indicators</h3>
              <div className="kpi-grid">
                <div className="kpi-item">
                  <span className="kpi-label">Client Acquisition</span>
                  <span className="kpi-value">+{businessMetrics.clients.growthRate}%</span>
                </div>
                <div className="kpi-item">
                  <span className="kpi-label">Revenue per Client</span>
                  <span className="kpi-value">
                    {formatCurrency(businessMetrics.revenue.monthly / businessMetrics.clients.total)}
                  </span>
                </div>
                <div className="kpi-item">
                  <span className="kpi-label">Top Performing Investment</span>
                  <span className="kpi-value">{businessMetrics.investments.topPerformingStock}</span>
                </div>
                <div className="kpi-item">
                  <span className="kpi-label">Client Churn Rate</span>
                  <span className="kpi-value">{businessMetrics.clients.churnRate}%</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'system' && systemMetrics && (
          <div className="system-metrics">
            <div className="metrics-grid">
              <Card className="metric-card">
                <h3>System Uptime</h3>
                <div className="metric-value">{systemMetrics.performance.uptime}%</div>
                <Badge variant="success">Healthy</Badge>
              </Card>

              <Card className="metric-card">
                <h3>Response Time</h3>
                <div className="metric-value">{systemMetrics.performance.avgResponseTime}ms</div>
                <div className="metric-subtext">Average</div>
              </Card>

              <Card className="metric-card">
                <h3>Error Rate</h3>
                <div className="metric-value">{systemMetrics.performance.errorRate}%</div>
                <Badge variant={systemMetrics.performance.errorRate < 1 ? 'success' : 'warning'}>
                  {systemMetrics.performance.errorRate < 1 ? 'Low' : 'Moderate'}
                </Badge>
              </Card>

              <Card className="metric-card">
                <h3>Database Size</h3>
                <div className="metric-value">{systemMetrics.database.size}GB</div>
                <div className="metric-subtext">
                  {systemMetrics.database.connections} active connections
                </div>
              </Card>
            </div>

            <Card className="resource-usage">
              <h3>Resource Usage</h3>
              <div className="usage-grid">
                <div className="usage-item">
                  <span className="usage-label">CPU Usage</span>
                  <div className="usage-bar">
                    <div 
                      className="usage-fill" 
                      style={{ width: `${systemMetrics.server.cpuUsage}%` }}
                    />
                  </div>
                  <span className="usage-value">{systemMetrics.server.cpuUsage}%</span>
                </div>

                <div className="usage-item">
                  <span className="usage-label">Memory Usage</span>
                  <div className="usage-bar">
                    <div 
                      className="usage-fill" 
                      style={{ width: `${systemMetrics.server.memoryUsage}%` }}
                    />
                  </div>
                  <span className="usage-value">{systemMetrics.server.memoryUsage}%</span>
                </div>

                <div className="usage-item">
                  <span className="usage-label">Disk Usage</span>
                  <div className="usage-bar">
                    <div 
                      className="usage-fill" 
                      style={{ width: `${systemMetrics.server.diskUsage}%` }}
                    />
                  </div>
                  <span className="usage-value">{systemMetrics.server.diskUsage}%</span>
                </div>
              </div>
            </Card>

            <Card className="system-info">
              <h3>System Reliability</h3>
              <p className="reliability-score">
                Overall system health score: <strong>98.5%</strong>
              </p>
              <p className="metric-comparison">vs last quarter: +2.3%</p>
            </Card>
          </div>
        )}

        {activeTab === 'history' && (
          <Card className="report-history">
            <h3>Generated Reports</h3>
            {reportHistory.length === 0 ? (
              <p className="empty-state">No reports generated yet</p>
            ) : (
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Report Type</th>
                    <th>Generated At</th>
                    <th>Generated By</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reportHistory.map(report => (
                    <tr key={report.reportId}>
                      <td>{report.type}</td>
                      <td>{new Date(report.generatedAt).toLocaleString()}</td>
                      <td>{report.generatedBy}</td>
                      <td>
                        <Badge variant={report.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {report.status}
                        </Badge>
                      </td>
                      <td>
                        {report.downloadUrl && (
                          <Button
                            size="small"
                            variant="primary"
                            onClick={() => downloadReport(report.downloadUrl!)}
                          >
                            Download
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        )}
      </div>

      {/* Report Generation Modal */}
      <Modal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        title="Custom Report Generation"
      >
        <div className="report-options">
          <div className="form-group">
            <label htmlFor="reportType">Report Type</label>
            <Select
              id="reportType"
              value={reportOptions.type}
              onChange={(e) => setReportOptions(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="DAILY">Daily Report</option>
              <option value="WEEKLY">Weekly Report</option>
              <option value="MONTHLY">Monthly Report</option>
              <option value="QUARTERLY">Quarterly Report</option>
              <option value="YEARLY">Yearly Report</option>
              <option value="CUSTOM">Custom Report</option>
            </Select>
          </div>

          <div className="form-group">
            <label>Include in Report</label>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={reportOptions.includeFinancialSummary}
                  onChange={(e) => setReportOptions(prev => ({
                    ...prev,
                    includeFinancialSummary: e.target.checked
                  }))}
                />
                Financial Summary
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={reportOptions.includeUserAnalytics}
                  onChange={(e) => setReportOptions(prev => ({
                    ...prev,
                    includeUserAnalytics: e.target.checked
                  }))}
                />
                User Analytics
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={reportOptions.includeSystemHealth}
                  onChange={(e) => setReportOptions(prev => ({
                    ...prev,
                    includeSystemHealth: e.target.checked
                  }))}
                />
                System Health
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={reportOptions.includeActivityLogs}
                  onChange={(e) => setReportOptions(prev => ({
                    ...prev,
                    includeActivityLogs: e.target.checked
                  }))}
                />
                Activity Logs
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reportFormat">Export Format</label>
            <Select
              id="reportFormat"
              value={reportOptions.format}
              onChange={(e) => setReportOptions(prev => ({ ...prev, format: e.target.value }))}
            >
              <option value="PDF">PDF</option>
              <option value="EXCEL">Excel</option>
              <option value="CSV">CSV</option>
            </Select>
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerateReport}>
              Generate
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
