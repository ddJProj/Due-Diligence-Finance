// frontend/src/pages/dashboards/ClientDashboard.tsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolio } from '@/hooks/usePortfolio';
import { LoadingSpinner } from '@/components/common';
import './ClientDashboard.css';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { portfolio, investments, loading, error, refreshPortfolio } = usePortfolio();

  useEffect(() => {
    refreshPortfolio();
  }, [refreshPortfolio]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '' : ''}${value.toFixed(2)}%`;
  };

  const getMarketStatus = (): { status: string; isOpen: boolean } => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const time = hour + minute / 60;

    // Market is closed on weekends
    if (day === 0 || day === 6) {
      return { status: 'Closed (Weekend)', isOpen: false };
    }

    // Market hours: 9:30 AM - 4:00 PM ET
    if (time >= 9.5 && time < 16) {
      return { status: 'Open', isOpen: true };
    }

    if (time < 9.5) {
      return { status: 'Pre-Market', isOpen: false };
    }

    return { status: 'After Hours', isOpen: false };
  };

  if (loading) {
    return (
      <div className="client-dashboard client-dashboard--loading">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-dashboard client-dashboard--error">
        <div className="error-container">
          <h2>Unable to Load Dashboard</h2>
          <p>{error}</p>
          <button onClick={refreshPortfolio} className="btn btn--primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const marketStatus = getMarketStatus();
  const lastUpdated = new Date().toLocaleTimeString();
  const hasInvestments = investments && investments.length > 0;

  return (
    <div className="client-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.firstName}!</h1>
          <p className="dashboard-subtitle">
            Here's your investment portfolio overview
          </p>
        </div>
        <div className="market-info">
          <span className="market-status">
            Market Status: 
            <span className={`status-indicator ${marketStatus.isOpen ? 'status-indicator--open' : 'status-indicator--closed'}`}>
              {marketStatus.status}
            </span>
          </span>
          <span className="last-updated">Last updated: {lastUpdated}</span>
        </div>
      </header>

      <section className="metrics-grid">
        <div className="metric-card">
          <h3 className="metric-card__title">Total Portfolio Value</h3>
          <p className="metric-card__value metric-card__value--primary">
            {formatCurrency(portfolio?.totalValue || 0)}
          </p>
        </div>

        <div className="metric-card">
          <h3 className="metric-card__title">Total Gain/Loss</h3>
          <p className={`metric-card__value ${
            (portfolio?.totalGainLoss || 0) >= 0 
              ? 'metric-card__value--positive' 
              : 'metric-card__value--negative'
          }`}>
            {(portfolio?.totalGainLoss || 0) >= 0 ? '' : '-'}
            {formatCurrency(Math.abs(portfolio?.totalGainLoss || 0))}
            <span className="metric-card__percentage">
              ({formatPercentage(portfolio?.totalGainLossPercentage || 0)})
            </span>
          </p>
        </div>

        <div className="metric-card">
          <h3 className="metric-card__title">Active Investments</h3>
          <p className="metric-card__value">
            {investments?.length || 0}
          </p>
        </div>

        <div className="metric-card">
          <h3 className="metric-card__title">Total Cost Basis</h3>
          <p className="metric-card__value">
            {formatCurrency(portfolio?.totalCost || 0)}
          </p>
        </div>
      </section>

      <section className="dashboard-content">
        <div className="recent-investments">
          <div className="section-header">
            <h2>Recent Investments</h2>
            {hasInvestments && (
              <Link to="/portfolio" className="view-all-link">
                View All Investments →
              </Link>
            )}
          </div>

          {hasInvestments ? (
            <div className="investments-table-container">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Quantity</th>
                    <th>Current Value</th>
                    <th>Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.slice(0, 5).map((investment) => {
                    const currentValue = investment.quantity * investment.currentPrice;
                    const costBasis = investment.quantity * investment.purchasePrice;
                    const gainLoss = currentValue - costBasis;
                    const gainLossPercent = (gainLoss / costBasis) * 100;

                    return (
                      <tr key={investment.id}>
                        <td className="symbol">{investment.stockSymbol}</td>
                        <td>{investment.stockName}</td>
                        <td>{investment.quantity}</td>
                        <td>{formatCurrency(currentValue)}</td>
                        <td className={gainLoss >= 0 ? 'positive' : 'negative'}>
                          {formatCurrency(gainLoss)}
                          <span className="percentage">
                            ({formatPercentage(gainLossPercent)})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No investments yet</p>
              <p className="empty-state__subtitle">
                Start building your portfolio today
              </p>
              <Link to="/investments/new" className="btn btn--primary">
                Add Your First Investment
              </Link>
            </div>
          )}
        </div>

        <aside className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-list">
            <Link to="/investments/new" className="action-item">
              <span className="action-icon">+</span>
              <span>Add Investment</span>
            </Link>
            <Link to="/portfolio" className="action-item">
              <span className="action-icon">📊</span>
              <span>View Portfolio</span>
            </Link>
            <Link to="/messages" className="action-item">
              <span className="action-icon">💬</span>
              <span>Messages</span>
            </Link>
            <Link to="/settings" className="action-item">
              <span className="action-icon">⚙️</span>
              <span>Account Settings</span>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  );
};
