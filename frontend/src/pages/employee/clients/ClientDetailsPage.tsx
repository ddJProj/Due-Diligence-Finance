// frontend/src/pages/employee/clients/ClientDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../../services/api/user.service';
import { portfolioService } from '../../../services/api/portfolio.service';
import { investmentService } from '../../../services/api/investment.service';
import { transactionService } from '../../../services/api/transaction.service';
import { User } from '../../../types/auth.types';
import { Portfolio } from '../../../types/portfolio.types';
import { Investment } from '../../../types/investment.types';
import { Transaction, TransactionType } from '../../../types/transaction.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import './ClientDetailsPage.css';

type TabType = 'portfolio' | 'investments' | 'transactions';

const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<User | null>(null);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('portfolio');

  const fetchClientData = async () => {
    if (!id) {
      setError('Invalid client ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [clientRes, portfolioRes, investmentsRes, transactionsRes] = await Promise.all([
        userService.getById(Number(id)),
        portfolioService.getByUserId(Number(id)),
        investmentService.getByUserId(Number(id)),
        transactionService.getByUserId(Number(id))
      ]);

      setClient(clientRes.data);
      setPortfolio(portfolioRes.data);
      setInvestments(investmentsRes.data);
      setTransactions(transactionsRes.data.slice(0, 10)); // Show only recent 10
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };

  const getInvestmentTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'STOCK':
        return 'primary';
      case 'BOND':
        return 'secondary';
      case 'ETF':
        return 'success';
      case 'MUTUAL_FUND':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getTransactionTypeBadgeVariant = (type: TransactionType) => {
    return type === TransactionType.BUY ? 'success' : 'warning';
  };

  if (loading) {
    return (
      <div className="client-details-page">
        <LoadingSpinner message="Loading client details..." />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="client-details-page">
        <ErrorMessage
          title="Error loading client details"
          message={error || 'Client not found'}
          onRetry={fetchClientData}
        />
      </div>
    );
  }

  return (
    <div className="client-details-page">
      <div className="page-header">
        <Button
          variant="secondary"
          onClick={() => navigate('/employee/clients')}
        >
          ← Back to Clients
        </Button>
      </div>

      <div className="client-header">
        <div className="client-info">
          <h1>{client.firstName} {client.lastName}</h1>
          <div className="client-meta">
            <span className="email">{client.email}</span>
            <Badge variant={client.enabled ? 'success' : 'secondary'}>
              {client.enabled ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div className="client-dates">
            <span>Member since: {formatDate(client.createdAt)}</span>
            <span>Last login: {formatDate(client.lastLoginAt)}</span>
          </div>
        </div>
        <div className="client-actions">
          <Button
            variant="primary"
            onClick={() => navigate(`/employee/messages/compose?to=${client.id}`)}
          >
            Send Message
          </Button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio
        </button>
        <button
          className={`tab ${activeTab === 'investments' ? 'active' : ''}`}
          onClick={() => setActiveTab('investments')}
        >
          Investments
        </button>
        <button
          className={`tab ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'portfolio' && portfolio && (
        <div className="tab-content">
          <div className="portfolio-summary">
            <Card>
              <div className="summary-item">
                <span className="label">Total Value</span>
                <span className="value">{formatCurrency(portfolio.totalValue)}</span>
              </div>
            </Card>
            <Card>
              <div className="summary-item">
                <span className="label">Total Gain/Loss</span>
                <span className={`value ${portfolio.totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
                  {portfolio.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(portfolio.totalGainLoss)}
                  <span className="percentage">{formatPercentage(portfolio.totalGainLossPercentage)}</span>
                </span>
              </div>
            </Card>
            <Card>
              <div className="summary-item">
                <span className="label">Cash Balance</span>
                <span className="value">{formatCurrency(portfolio.cashBalance)}</span>
              </div>
            </Card>
            <Card>
              <div className="summary-item">
                <span className="label">Investments</span>
                <span className="value">{portfolio.investmentCount}</span>
              </div>
            </Card>
          </div>

          <Card>
            <div className="portfolio-details">
              <h2>Portfolio Details</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Total Cost Basis</span>
                  <span className="value">{formatCurrency(portfolio.totalCost)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Day Change</span>
                  <span className={`value ${portfolio.dayChange >= 0 ? 'positive' : 'negative'}`}>
                    {portfolio.dayChange >= 0 ? '+' : ''}{formatCurrency(portfolio.dayChange)}
                    <span className="percentage">{formatPercentage(portfolio.dayChangePercentage)}</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'investments' && (
        <div className="tab-content">
          {investments.length === 0 ? (
            <Card>
              <div className="empty-state">
                <h3>No investments yet</h3>
                <p>This client has not made any investments.</p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="investments-table-container">
                <table className="investments-table">
                  <thead>
                    <tr>
                      <th>Investment</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Avg Cost</th>
                      <th>Current Price</th>
                      <th>Current Value</th>
                      <th>Gain/Loss</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investments.map((investment) => (
                      <tr key={investment.id}>
                        <td>
                          <div className="investment-name">
                            <span className="name">{investment.investmentName}</span>
                            <span className="symbol">{investment.symbol}</span>
                          </div>
                        </td>
                        <td>
                          <Badge variant={getInvestmentTypeBadgeVariant(investment.type)}>
                            {investment.type}
                          </Badge>
                        </td>
                        <td>{investment.quantity}</td>
                        <td>{formatCurrency(investment.averageCost)}</td>
                        <td>{formatCurrency(investment.currentPrice)}</td>
                        <td>{formatCurrency(investment.currentValue)}</td>
                        <td className={investment.totalGainLoss >= 0 ? 'positive' : 'negative'}>
                          {investment.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(investment.totalGainLoss)}
                          <span className="percentage">{formatPercentage(investment.totalGainLossPercentage)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="tab-content">
          <h2>Recent Transactions</h2>
          {transactions.length === 0 ? (
            <Card>
              <div className="empty-state">
                <h3>No transactions yet</h3>
                <p>This client has not made any transactions.</p>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="transactions-table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Investment</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>{formatDateTime(transaction.transactionDate)}</td>
                        <td>{transaction.investmentName}</td>
                        <td>
                          <Badge variant={getTransactionTypeBadgeVariant(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td>{transaction.quantity}</td>
                        <td>{formatCurrency(transaction.pricePerUnit)}</td>
                        <td>{formatCurrency(transaction.totalAmount + transaction.fee)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientDetailsPage;
