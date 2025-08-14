// frontend/src/pages/dashboards/EmployeeDashboard.tsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common';
import { employeeService } from '@/services/api/EmployeeService';
import './EmployeeDashboard.css';

interface ClientInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  portfolioValue: number;
  investmentCount: number;
  lastActivity: string;
}

interface DashboardStats {
  totalClients: number;
  activeClients: number;
  pendingRequests: number;
  totalPortfolioValue: number;
  monthlyGrowth: number;
  newClientsThisMonth: number;
}

interface PendingRequest {
  id: number;
  clientName: string;
  type: string;
  stockSymbol: string;
  quantity: number;
  submittedAt: string;
  status: string;
}

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [clientsResponse, statsResponse, requestsResponse] = await Promise.all([
        employeeService.getAssignedClients(),
        employeeService.getDashboardStats(),
        employeeService.getPendingRequests(),
      ]);

      setClients(clientsResponse.data);
      setStats(statsResponse.data);
      setPendingRequests(requestsResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleReviewRequest = (requestId: number) => {
    navigate(`/requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="employee-dashboard employee-dashboard--loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-dashboard employee-dashboard--error">
        <div className="error-container">
          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn--primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Sort clients by last activity (most recent first)
  const sortedClients = [...clients].sort((a, b) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );

  return (
    <div className="employee-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.firstName}!</h1>
          <p className="dashboard-subtitle">
            Manage your clients and investment requests
          </p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <h3 className="stat-card__title">Total Clients</h3>
          <p className="stat-card__value">{stats?.totalClients || 0}</p>
          <p className="stat-card__subtitle">
            {stats?.newClientsThisMonth || 0} new this month
          </p>
        </div>

        <div className="stat-card">
          <h3 className="stat-card__title">Active Clients</h3>
          <p className="stat-card__value">{stats?.activeClients || 0}</p>
        </div>

        <div className="stat-card stat-card--highlight">
          <h3 className="stat-card__title">Pending Requests</h3>
          <p className="stat-card__value">{stats?.pendingRequests || 0}</p>
        </div>

        <div className="stat-card">
          <h3 className="stat-card__title">Total Portfolio Value</h3>
          <p className="stat-card__value">
            {formatCurrency(stats?.totalPortfolioValue || 0)}
          </p>
          <p className="stat-card__subtitle">
            Monthly growth: {stats?.monthlyGrowth || 0}%
          </p>
        </div>
      </section>

      <div className="dashboard-content">
        <section className="clients-section">
          <div className="section-header">
            <h2>Your Clients</h2>
            <Link to="/clients" className="view-all-link">
              View All →
            </Link>
          </div>

          {sortedClients.length > 0 ? (
            <div className="clients-list">
              {sortedClients.slice(0, 5).map((client) => (
                <Link
                  key={client.id}
                  to={`/clients/${client.id}`}
                  className="client-card"
                >
                  <div className="client-info">
                    <h4 data-testid="client-name">
                      {client.firstName} {client.lastName}
                    </h4>
                    <p className="client-email">{client.email}</p>
                    <p className="client-meta">
                      {client.investmentCount} investments · Last activity: {formatDate(client.lastActivity)}
                    </p>
                  </div>
                  <div className="client-value">
                    <p className="portfolio-value">
                      {formatCurrency(client.portfolioValue)}
                    </p>
                    <p className="value-label">Portfolio Value</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No clients assigned yet</p>
              <Link to="/clients/new" className="btn btn--primary">
                Add New Client
              </Link>
            </div>
          )}
        </section>

        <section className="requests-section">
          <div className="section-header">
            <h2>Pending Investment Requests</h2>
            {pendingRequests.length > 0 && (
              <Link to="/requests" className="view-all-link">
                View All →
              </Link>
            )}
          </div>

          {pendingRequests.length > 0 ? (
            <div className="requests-list">
              {pendingRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-info">
                    <h4>{request.clientName}</h4>
                    <p className="request-type">
                      {request.type.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="request-details">
                      {request.stockSymbol} - {request.quantity} shares
                    </p>
                    <p className="request-time">
                      {formatDate(request.submittedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleReviewRequest(request.id)}
                    className="btn btn--primary btn--small"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No pending requests</p>
              <p className="empty-state__subtitle">
                All investment requests have been processed
              </p>
            </div>
          )}
        </section>

        <aside className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-list">
            <Link to="/clients" className="action-item">
              <span className="action-icon">👥</span>
              <span>View All Clients</span>
            </Link>
            <Link to="/requests" className="action-item">
              <span className="action-icon">📋</span>
              <span>Pending Requests</span>
            </Link>
            <Link to="/clients/new" className="action-item">
              <span className="action-icon">➕</span>
              <span>Add New Client</span>
            </Link>
            <Link to="/reports" className="action-item">
              <span className="action-icon">📊</span>
              <span>Reports</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};
