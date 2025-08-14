// frontend/src/pages/dashboards/GuestDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import guestService from '../../api/GuestService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './GuestDashboard.css';

interface PublicInfo {
  companyName: string;
  description: string;
  features: string[];
  statistics: {
    totalClients: number;
    totalAssets: number;
    yearsInBusiness: number;
    satisfactionRate: number;
  };
}

export const GuestDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [publicInfo, setPublicInfo] = useState<PublicInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicInfo();
  }, []);

  const fetchPublicInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await guestService.getPublicInfo();
      setPublicInfo(data);
    } catch (err) {
      setError('Error loading information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeRequest = async () => {
    try {
      setUpgradeLoading(true);
      setUpgradeError(null);
      const response = await guestService.requestAccountUpgrade();
      setUpgradeSuccess(true);
      // Show success message
      if (response.message) {
        // Could integrate with toast system here
        console.log(response.message);
      }
    } catch (err: any) {
      setUpgradeError(err.message || 'Failed to submit upgrade request');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    }
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(0)}M`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <LoadingSpinner message="Loading information..." />;
  }

  return (
    <div className="guest-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome to Due Diligence Finance</h1>
          <p>Hello, {user?.firstName || 'Guest'}!</p>
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {publicInfo && (
        <>
          <section className="intro-section">
            <p className="intro-text">{publicInfo.description}</p>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{formatNumber(publicInfo.statistics.totalClients)}+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{formatCurrency(publicInfo.statistics.totalAssets)}+</div>
              <div className="stat-label">Assets Managed</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{publicInfo.statistics.yearsInBusiness}</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{publicInfo.statistics.satisfactionRate}%</div>
              <div className="stat-label">Satisfaction Rate</div>
            </div>
          </section>

          {publicInfo.features.length > 0 && (
            <section className="features-section">
              <h2>Our Features</h2>
              <div className="features-grid">
                {publicInfo.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="dashboard-content">
        <div className="content-main">
          <section className="upgrade-section">
            <h2>Ready to Start Investing?</h2>
            <p>Upgrade your account to unlock full features and start building your portfolio today.</p>
            {upgradeError && (
              <div className="error-message">{upgradeError}</div>
            )}
            {upgradeSuccess && (
              <div className="success-message">
                Upgrade request submitted successfully! Our team will review your request shortly.
              </div>
            )}
            <button
              onClick={handleUpgradeRequest}
              disabled={upgradeLoading || upgradeSuccess}
              className={`btn btn--primary ${upgradeSuccess ? 'btn--success' : ''}`}
            >
              {upgradeLoading ? 'Submitting...' : upgradeSuccess ? '✓ Request Submitted' : 'Request Account Upgrade'}
            </button>
          </section>

          <div className="info-cards">
            <div className="info-card">
              <h3>Why Choose Us?</h3>
              <p>
                With over a decade of experience and billions in managed assets, 
                we provide professional investment guidance tailored to your goals.
              </p>
            </div>
            <div className="info-card">
              <h3>How It Works</h3>
              <p>
                Simply upgrade your account, connect with an advisor, and start 
                building your personalized investment portfolio.
              </p>
            </div>
            <div className="info-card">
              <h3>Get Started Today</h3>
              <p>
                Join hundreds of satisfied clients who trust us with their 
                financial future. Your journey to financial success starts here.
              </p>
            </div>
          </div>
        </div>

        <aside className="dashboard-sidebar">
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <nav className="actions-nav">
              <Link to="/about" className="action-link">
                📖 Learn More
              </Link>
              <Link to="/features" className="action-link">
                ✨ View Features
              </Link>
              <Link to="/contact" className="action-link">
                📧 Contact Us
              </Link>
              <Link to="/register" className="action-link">
                🚀 Sign Up
              </Link>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
};
