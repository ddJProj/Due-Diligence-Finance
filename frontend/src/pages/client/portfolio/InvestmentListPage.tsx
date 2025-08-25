// frontend/src/pages/client/investments/InvestmentListPage.tsx

import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { investmentApi } from '../../../services/api/investmentApi';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../../components/common/ErrorMessage';
import './InvestmentListPage.css';

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
}

interface InvestmentResponse {
  investments: Investment[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const InvestmentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('name-asc');

  useEffect(() => {
    fetchInvestments();
  }, [filterType, sortBy]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchInvestments();
      } else {
        fetchInvestments();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sortField, sortOrder] = sortBy.split('-');
      const params = {
        type: filterType !== 'ALL' ? filterType : undefined,
        sortBy: sortField,
        sortOrder: sortOrder,
        page: 1,
        pageSize: 50,
      };

      const response = await investmentApi.getInvestments(params);
      setInvestments(response.investments);
    } catch (err) {
      setError('Failed to load investments. Please try again later.');
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await investmentApi.searchInvestments(searchTerm, {
        type: filterType !== 'ALL' ? filterType : undefined,
      });
      setInvestments(response.investments);
    } catch (err) {
      setError('Failed to search investments. Please try again later.');
      console.error('Error searching investments:', err);
    } finally {
      setLoading(false);
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

  const getValueClass = (value: number): string => {
    return value >= 0 ? 'positive' : 'negative';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleRowClick = (investmentId: number) => {
    navigate(`/client/investments/${investmentId}`);
  };

  const summary = useMemo(() => {
    const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
    const totalGainLoss = investments.reduce((sum, inv) => sum + inv.gainLoss, 0);
    const totalCost = investments.reduce((sum, inv) => sum + (inv.purchasePrice * inv.quantity), 0);
    const totalGainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return {
      totalValue,
      totalGainLoss,
      totalGainLossPercentage,
      count: investments.length,
    };
  }, [investments]);

  if (loading && investments.length === 0) {
    return (
      <div className="investment-list-page">
        <div className="loading-container" role="status">
          <LoadingSpinner />
          <p>Loading investments...</p>
        </div>
      </div>
    );
  }

  if (error && investments.length === 0) {
    return (
      <div className="investment-list-page">
        <div className="error-container" role="alert">
          <ErrorMessage message={error} onRetry={fetchInvestments} />
        </div>
      </div>
    );
  }

  return (
    <div className="investment-list-page">
      <main role="main">
        <div className="page-header">
          <h1>My Investments</h1>
          <Link to="/client/investments/new" className="add-button">
            Add Investment
          </Link>
        </div>

        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Value</h3>
            <p className="summary-value">{formatCurrency(summary.totalValue)}</p>
          </div>
          <div className="summary-card">
            <h3>Total Gain/Loss</h3>
            <p className={`summary-value ${getValueClass(summary.totalGainLoss)}`}>
              {summary.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(summary.totalGainLoss)}
            </p>
            <p className={`summary-percentage ${getValueClass(summary.totalGainLossPercentage)}`}>
              {formatPercentage(summary.totalGainLossPercentage)}
            </p>
          </div>
          <div className="summary-card">
            <h3>Number of Investments</h3>
            <p className="summary-value">{summary.count}</p>
          </div>
        </div>

        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search investments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Search investments"
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
              aria-label="Filter by type"
            >
              <option value="ALL">All Types</option>
              <option value="STOCK">Stocks</option>
              <option value="BOND">Bonds</option>
              <option value="MUTUAL_FUND">Mutual Funds</option>
              <option value="ETF">ETFs</option>
              <option value="REAL_ESTATE">Real Estate</option>
              <option value="COMMODITY">Commodities</option>
              <option value="CRYPTOCURRENCY">Cryptocurrency</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              aria-label="Sort by"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="value-desc">Value (High to Low)</option>
              <option value="value-asc">Value (Low to High)</option>
              <option value="gainLoss-desc">Gain/Loss (High to Low)</option>
              <option value="gainLoss-asc">Gain/Loss (Low to High)</option>
              <option value="purchaseDate-desc">Purchase Date (Newest)</option>
              <option value="purchaseDate-asc">Purchase Date (Oldest)</option>
            </select>
          </div>
        </div>

        {investments.length === 0 ? (
          <div className="empty-state">
            <p>No investments found.</p>
            <Link to="/client/investments/new" className="empty-state-link">
              Add your first investment
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-view">
              <table className="investments-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Purchase Price</th>
                    <th>Current Price</th>
                    <th>Current Value</th>
                    <th>Gain/Loss</th>
                    <th>Purchase Date</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((investment) => (
                    <tr 
                      key={investment.id}
                      onClick={() => handleRowClick(investment.id)}
                      className="investment-row"
                    >
                      <td className="investment-name">{investment.name}</td>
                      <td className="investment-symbol">{investment.symbol}</td>
                      <td className="investment-type">{investment.type}</td>
                      <td className="investment-quantity">{investment.quantity}</td>
                      <td className="investment-price">{formatCurrency(investment.purchasePrice)}</td>
                      <td className="investment-price">{formatCurrency(investment.currentPrice)}</td>
                      <td className="investment-value">{formatCurrency(investment.totalValue)}</td>
                      <td className="investment-gain-loss">
                        <span className={getValueClass(investment.gainLoss)}>
                          {investment.gainLoss >= 0 ? '+' : ''}{formatCurrency(investment.gainLoss)}
                        </span>
                        <span className={`gain-loss-percentage ${getValueClass(investment.gainLossPercentage)}`}>
                          {formatPercentage(investment.gainLossPercentage)}
                        </span>
                      </td>
                      <td className="investment-date">{formatDate(investment.purchaseDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-cards">
              {investments.map((investment) => (
                <div 
                  key={investment.id}
                  className="investment-card"
                  onClick={() => handleRowClick(investment.id)}
                >
                  <div className="card-header">
                    <div>
                      <h3>{investment.name}</h3>
                      <p className="card-symbol">{investment.symbol} • {investment.type}</p>
                    </div>
                    <div className="card-value">
                      <p>{formatCurrency(investment.totalValue)}</p>
                      <p className={`gain-loss ${getValueClass(investment.gainLoss)}`}>
                        {investment.gainLoss >= 0 ? '+' : ''}{formatCurrency(investment.gainLoss)}
                        <span className="gain-loss-percentage">
                          {formatPercentage(investment.gainLossPercentage)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="card-details">
                    <div className="detail-item">
                      <span className="detail-label">Quantity:</span>
                      <span className="detail-value">{investment.quantity}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Purchase Price:</span>
                      <span className="detail-value">{formatCurrency(investment.purchasePrice)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Current Price:</span>
                      <span className="detail-value">{formatCurrency(investment.currentPrice)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Purchase Date:</span>
                      <span className="detail-value">{formatDate(investment.purchaseDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};
