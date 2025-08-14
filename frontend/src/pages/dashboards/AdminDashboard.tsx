// frontend/src/pages/dashboards/AdminDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import adminService from '../../api/AdminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AdminDashboard.css';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalClients: number;
  totalEmployees: number;
  totalAdmins: number;
  totalInvestments: number;
  totalPortfolioValue: number;
  systemHealth: string;
  lastBackup: string;
  diskUsagePercent: number;
  averageResponseTime: number;
}

interface SystemHealth {
  status: string;
  database?: { status: string; responseTime: number };
  cache?: { status: string; responseTime: number };
  messageQueue?: { status: string; queueSize: number };
  stockApi?: { status: string; lastSync: string };
  uptime: string;
  lastRestart: string;
}

interface UserActivity {
  id: number;
  userId: number;
  userEmail: string;
  activityType: string;
  activityTime: string;
  ipAddress?: string;
  description?: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [errors, setErrors] = useState({
    stats: '',
    health: '',
    activity: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrors({ stats: '', health: '', activity: '' });

    try {
      // Fetch all data in parallel
      const [statsData, healthData, activityData] = await Promise.allSettled([
        adminService.getSystemStats(),
        adminService.getSystemHealth(),
        adminService.getActivityLogs(),
      ]);

      // Handle stats
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      } else {
        setErrors((prev) => ({ ...prev, stats: 'Error loading dashboard data' }));
      }

      // Handle system health
      if (healthData.status === 'fulfilled') {
        setSystemHealth(healthData.value);
      } else {
        setErrors((prev) => ({ ...prev, health: 'Error loading system health' }));
      }

      // Handle user activity
      if (activityData.status === 'fulfilled') {
        setUserActivity(activityData.value);
      } else {
        setErrors((prev) => ({ ...prev, activity: 'Error loading activity' }));
      }

      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return 'status--healthy';
      case 'DEGRADED':
        return 'status--warning';
      case 'CRITICAL':
        return 'status--error';
      default:
        return '';
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.firstName || 'Admin'}!</p>
        </div>
        <div className="dashboard-actions">
          <button
            onClick={handleRefresh}
            className="btn btn--icon"
            aria-label="Refresh dashboard"
          >
            🔄
          </button>
          <p className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      </div>

      {errors.stats && (
        <div className="error-message">{errors.stats}</div>
      )}

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card__value">{formatNumber(stats.totalUsers)}</div>
            <div className="stat-card__label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatNumber(stats.activeUsers)}</div>
            <div className="stat-card__label">Active Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatNumber(stats.totalInvestments)}</div>
            <div className="stat-card__label">Total Investments</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatCurrency(stats.totalPortfolioValue)}</div>
            <div className="stat-card__label">Portfolio Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatNumber(stats.totalClients)}</div>
            <div className="stat-card__label">Total Clients</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__value">{formatNumber(stats.totalEmployees)}</div>
            <div className="stat-card__label">Total Employees</div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="system-health-card">
            <h2>System Health</h2>
            {errors.health ? (
              <p className="error-message">{errors.health}</p>
            ) : systemHealth ? (
              <div className="system-health-content">
                <div className="health-status">
                  <span>Status: </span>
                  <span className={`status ${getStatusClass(systemHealth.status)}`}>
                    {systemHealth.status}
                  </span>
                </div>
                <div className="health-metrics">
                  <div className="metric">
                    <span className="metric-label">Uptime:</span>
                    <span className="metric-value">{systemHealth.uptime}</span>
                  </div>
                  {systemHealth.database && (
                    <div className="metric">
                      <span className="metric-label">Database:</span>
                      <span className="metric-value">{systemHealth.database.status}</span>
                    </div>
                  )}
                  {systemHealth.cache && (
                    <div className="metric">
                      <span className="metric-label">Cache:</span>
                      <span className="metric-value">{systemHealth.cache.status}</span>
                    </div>
                  )}
                  {systemHealth.messageQueue && (
                    <div className="metric">
                      <span className="metric-label">Queue:</span>
                      <span className="metric-value">{systemHealth.messageQueue.status}</span>
                    </div>
                  )}
                  {stats && (
                    <div className="metric">
                      <span className="metric-label">Last Backup:</span>
                      <span className="metric-value">{formatDate(stats.lastBackup)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="recent-activity-card">
            <h2>Recent Activity</h2>
            {errors.activity ? (
              <p className="error-message">{errors.activity}</p>
            ) : userActivity.length > 0 ? (
              <div className="activity-list">
                {userActivity.map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-header">
                      <span className="activity-user">{activity.userEmail}</span>
                      <span className="activity-time">
                        {formatDate(activity.activityTime)}
                      </span>
                    </div>
                    <div className="activity-action">{activity.activityType}</div>
                    {activity.description && (
                      <div className="activity-details">{activity.description}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No recent activity</p>
            )}
          </div>
        </div>

        <aside className="dashboard-sidebar">
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <nav className="quick-actions-nav">
              <Link to="/admin/users" className="quick-action-link">
                👥 Manage Users
              </Link>
              <Link to="/admin/config" className="quick-action-link">
                ⚙️ System Configuration
              </Link>
              <Link to="/admin/logs" className="quick-action-link">
                📋 View Activity Logs
              </Link>
              <Link to="/admin/reports" className="quick-action-link">
                📊 Generate Reports
              </Link>
              <button className="quick-action-link">
                💾 Backup System
              </button>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AdminDashboard;
