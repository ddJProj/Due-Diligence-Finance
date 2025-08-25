// frontend/src/pages/client/investments/InvestmentDetailsPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { investmentApi } from '../../../services/api/investmentApi';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import './InvestmentDetailsPage.css';

interface Investment {
  id: number;
  name: string;
  symbol: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercentage: number;
  purchaseDate: string;
  description?: string;
  notes?: string;
  sector?: string;
  exchange?: string;
  lastUpdated?: string;
}

interface PriceHistory {
  date: string;
  price: number;
  value: number;
  dayChange: number;
  dayChangePercentage: number;
}

export const InvestmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState<Investment | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvestmentDetails();
    }
  }, [id]);

  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const investmentId = parseInt(id!, 10);
      const [investmentData, historyData] = await Promise.all([
        investmentApi.getInvestmentById(investmentId),
        investmentApi.getInvestmentHistory(investmentId),
      ]);

      if (!investmentData) {
        setError('Investment not found');
      } else {
        setInvestment(investmentData);
        setPriceHistory(historyData);
      }
    } catch (err) {
      setError('Failed to load investment details. Please try again later.');
      console.error('Error fetching investment details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/client/investments/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!investment) return;

    try {
      setDeleting(true);
      await investmentApi.deleteInvestment(investment.id);
      navigate('/client/investments');
    } catch (err) {
      setError('Failed to delete investment. Please try again.');
      console.error('Error deleting investment:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getValueClass = (value: number): string => {
    return value >= 0 ? 'positive' : 'negative';
  };

  if (loading) {
    return (
      <div className="investment-details-page">
        <div className="loading-container" role="status">
          <LoadingSpinner />
          <p>Loading investment details...</p>
        </div>
      </div>
    );
  }

  if (error && !investment) {
    return (
      <div className="investment-details-page">
        <div className="error-container" role="alert">
          {error === 'Investment not found' ? (
            <div className="not-found">
              <h2>Investment not found</h2>
              <p>The investment you're looking for doesn't exist or has been removed.</p>
              <Link to="/client/investments" className="back-link">
                Back to Investments
              </Link>
            </div>
          ) : (
            <ErrorMessage message={error} onRetry={fetchInvestmentDetails} />
          )}
        </div>
      </div>
    );
  }

  if (!investment) {
    return null;
  }

  return (
    <div className="investment-details-page">
      <main role="main">
        <div className="page-header">
          <button
            onClick={() => navigate('/client/investments')}
            className="back-button"
            aria-label="Back to Investments"
          >
            ← Back to Investments
          </button>
          
          <div className="header-actions">
            <button
              onClick={handleEdit}
              className="edit-button"
              aria-label="Edit Investment"
            >
              Edit Investment
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="delete-button"
              aria-label="Delete Investment"
            >
              Delete Investment
            </button>
          </div>
        </div>

        <div className="investment-header">
          <div className="investment-title">
            <h1>{investment.name}</h1>
            <div className="investment-meta">
              <span className="symbol">{investment.symbol}</span>
              <span className="type">{investment.type}</span>
              {investment.sector && <span className="sector">{investment.sector}</span>}
              {investment.exchange && <span className="exchange">{investment.exchange}</span>}
            </div>
          </div>
        </div>

        <div className="investment-content">
          <div className="metrics-grid">
            <div className="metric-card metric-card--primary">
              <h3>Current Value</h3>
              <p className="metric-value">{formatCurrency(investment.totalValue)}</p>
            </div>

            <div className="metric-card">
              <h3>Total Gain/Loss</h3>
              <p className={`metric-value ${getValueClass(investment.gainLoss)}`}>
                {investment.gainLoss >= 0 ? '+' : ''}{formatCurrency(investment.gainLoss)}
              </p>
              <p className={`metric-percentage ${getValueClass(investment.gainLossPercentage)}`}>
                {formatPercentage(investment.gainLossPercentage)}
              </p>
            </div>

            <div className="metric-card">
              <h3>Quantity</h3>
              <p className="metric-value">{investment.quantity}</p>
            </div>

            <div className="metric-card">
              <h3>Purchase Price</h3>
              <p className="metric-value">{formatCurrency(investment.purchasePrice)}</p>
              <p className="metric-label">per share</p>
            </div>

            <div className="metric-card">
              <h3>Current Price</h3>
              <p className="metric-value">{formatCurrency(investment.currentPrice)}</p>
              <p className="metric-label">per share</p>
            </div>

            <div className="metric-card">
              <h3>Purchase Date</h3>
              <p className="metric-value">{formatDate(investment.purchaseDate)}</p>
            </div>
          </div>

          {(investment.description || investment.notes) && (
            <div className="investment-info">
              {investment.description && (
                <div className="info-section">
                  <h3>Description</h3>
                  <p>{investment.description}</p>
                </div>
              )}

              {investment.notes && (
                <div className="info-section">
                  <h3>Notes</h3>
                  <p>{investment.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="price-history">
            <h2>Price History</h2>
            {priceHistory.length > 0 ? (
              <div className="history-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Price</th>
                      <th>Value</th>
                      <th>Day Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((history, index) => (
                      <tr key={index}>
                        <td>{formatDate(history.date)}</td>
                        <td>{formatCurrency(history.price)}</td>
                        <td>{formatCurrency(history.value)}</td>
                        <td>
                          <span className={getValueClass(history.dayChange)}>
                            {history.dayChange >= 0 ? '+' : ''}{formatCurrency(history.dayChange)}
                          </span>
                          <span className={`change-percentage ${getValueClass(history.dayChangePercentage)}`}>
                            {formatPercentage(history.dayChangePercentage)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-history">No price history available.</p>
            )}
          </div>

          {investment.lastUpdated && (
            <div className="last-updated">
              <p>Last updated: {formatDateTime(investment.lastUpdated)}</p>
            </div>
          )}
        </div>

        {showDeleteConfirm && (
          <ConfirmDialog
            title="Delete Investment"
            message={`Are you sure you want to delete ${investment.name}? This action cannot be undone.`}
            confirmLabel="Delete"
            cancelLabel="Cancel"
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            isDestructive
            loading={deleting}
          />
        )}
      </main>
    </div>
  );
};
