// frontend/src/pages/client/transactions/TransactionHistoryPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../../../services/api/transaction.service';
import { Transaction, TransactionType, TransactionStatus } from '../../../types/transaction.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import './TransactionHistoryPage.css';

const TransactionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getAll();
      setTransactions(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.investmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(t => t.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Date range filter
    if (startDate) {
      filtered = filtered.filter(t => 
        new Date(t.transactionDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(t => 
        new Date(t.transactionDate) <= new Date(endDate + 'T23:59:59')
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
        case 'date-asc':
          return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
        case 'amount-desc':
          return (b.totalAmount + b.fee) - (a.totalAmount + a.fee);
        case 'amount-asc':
          return (a.totalAmount + a.fee) - (b.totalAmount + b.fee);
        default:
          return 0;
      }
    });

    return sorted;
  }, [transactions, searchTerm, typeFilter, statusFilter, sortBy, startDate, endDate]);

  const summary = useMemo(() => {
    const total = filteredAndSortedTransactions.reduce((sum, t) => sum + t.totalAmount + t.fee, 0);
    const buyCount = filteredAndSortedTransactions.filter(t => t.type === TransactionType.BUY).length;
    const sellCount = filteredAndSortedTransactions.filter(t => t.type === TransactionType.SELL).length;

    return {
      count: filteredAndSortedTransactions.length,
      total,
      buyCount,
      sellCount
    };
  }, [filteredAndSortedTransactions]);

  const formatDate = (dateString: string) => {
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

  const getTypeBadgeVariant = (type: TransactionType) => {
    return type === TransactionType.BUY ? 'success' : 'warning';
  };

  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'success';
      case TransactionStatus.PENDING:
        return 'warning';
      case TransactionStatus.FAILED:
        return 'error';
      case TransactionStatus.CANCELLED:
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Investment', 'Type', 'Quantity', 'Price', 'Amount', 'Fee', 'Total', 'Status'];
    const rows = filteredAndSortedTransactions.map(t => [
      formatDate(t.transactionDate),
      t.investmentName,
      t.type,
      t.quantity,
      t.pricePerUnit,
      t.totalAmount,
      t.fee,
      t.totalAmount + t.fee,
      t.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="transaction-history-page">
        <LoadingSpinner message="Loading transactions..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="transaction-history-page">
        <ErrorMessage
          title="Error loading transactions"
          message={error}
          onRetry={fetchTransactions}
        />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transaction-history-page">
        <div className="empty-state">
          <h2>No transactions yet</h2>
          <p>Your transaction history will appear here once you make your first investment transaction.</p>
          <Button onClick={() => navigate('/client/investments')}>
            View Investments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history-page">
      <div className="page-header">
        <h1>Transaction History</h1>
        <Button variant="secondary" onClick={exportToCSV}>
          Export CSV
        </Button>
      </div>

      <div className="summary-cards">
        <Card>
          <div className="summary-card">
            <span className="summary-label">Total Transactions</span>
            <span className="summary-value">{summary.count}</span>
          </div>
        </Card>
        <Card>
          <div className="summary-card">
            <span className="summary-label">Total Amount</span>
            <span className="summary-value">{formatCurrency(summary.total)}</span>
          </div>
        </Card>
        <Card>
          <div className="summary-card">
            <span className="summary-label">Buy Orders</span>
            <span className="summary-value">{summary.buyCount}</span>
          </div>
        </Card>
        <Card>
          <div className="summary-card">
            <span className="summary-label">Sell Orders</span>
            <span className="summary-value">{summary.sellCount}</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="filters">
          <div className="filter-row">
            <input
              type="text"
              placeholder="Search by investment name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'ALL')}
              className="filter-select"
              aria-label="Filter by type"
            >
              <option value="ALL">All Types</option>
              <option value={TransactionType.BUY}>Buy</option>
              <option value={TransactionType.SELL}>Sell</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'ALL')}
              className="filter-select"
              aria-label="Filter by status"
            >
              <option value="ALL">All Status</option>
              <option value={TransactionStatus.PENDING}>Pending</option>
              <option value={TransactionStatus.COMPLETED}>Completed</option>
              <option value={TransactionStatus.FAILED}>Failed</option>
              <option value={TransactionStatus.CANCELLED}>Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="filter-select"
              aria-label="Sort by"
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
            </select>
          </div>

          <div className="date-filters">
            <div className="date-filter">
              <label htmlFor="start-date">Start date</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            <div className="date-filter">
              <label htmlFor="end-date">End date</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        </div>
      </Card>

      {isMobile ? (
        <div className="transaction-cards">
          {filteredAndSortedTransactions.map((transaction) => (
            <Card key={transaction.id} data-testid="transaction-card">
              <div className="transaction-card">
                <div className="transaction-card-header">
                  <h3>{transaction.investmentName}</h3>
                  <Badge variant={getTypeBadgeVariant(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </div>
                
                <div className="transaction-card-details">
                  <div className="detail-row">
                    <span>Date:</span>
                    <span>{formatDate(transaction.transactionDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Quantity:</span>
                    <span>{transaction.quantity}</span>
                  </div>
                  <div className="detail-row">
                    <span>Price:</span>
                    <span>{formatCurrency(transaction.pricePerUnit)}</span>
                  </div>
                  <div className="detail-row">
                    <span>Total:</span>
                    <span className="total-amount">
                      {formatCurrency(transaction.totalAmount + transaction.fee)}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Status:</span>
                    <Badge variant={getStatusBadgeVariant(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => navigate(`/client/transactions/${transaction.id}`)}
                  fullWidth
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="transaction-table-container">
            <table className="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Investment</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.transactionDate)}</td>
                    <td>{transaction.investmentName}</td>
                    <td>
                      <Badge variant={getTypeBadgeVariant(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </td>
                    <td>{transaction.quantity}</td>
                    <td>{formatCurrency(transaction.pricePerUnit)}</td>
                    <td>{formatCurrency(transaction.totalAmount + transaction.fee)}</td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => navigate(`/client/transactions/${transaction.id}`)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TransactionHistoryPage;
