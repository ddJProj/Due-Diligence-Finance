// frontend/src/pages/client/transactions/TransactionDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { transactionService } from '../../../services/api/transaction.service';
import { Transaction, TransactionType, TransactionStatus } from '../../../types/transaction.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import './TransactionDetailsPage.css';

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = async () => {
    if (!id) {
      setError('Invalid transaction ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getById(Number(id));
      setTransaction(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transaction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
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

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would generate and download a PDF
    alert('PDF download functionality would be implemented here');
  };

  if (loading) {
    return (
      <div className="transaction-details-page">
        <LoadingSpinner message="Loading transaction details..." />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="transaction-details-page">
        <ErrorMessage
          title="Error loading transaction"
          message={error || 'Transaction not found'}
          onRetry={fetchTransaction}
        />
      </div>
    );
  }

  return (
    <div className="transaction-details-page">
      <div className="page-header">
        <Button
          variant="secondary"
          onClick={() => navigate('/client/transactions')}
        >
          ← Back to History
        </Button>
        <div className="header-actions">
          <Button variant="secondary" onClick={handlePrint}>
            Print
          </Button>
          <Button variant="secondary" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </div>
      </div>

      <h1>Transaction Details</h1>

      <div className="details-grid">
        <Card>
          <div className="detail-section">
            <h2>Basic Information</h2>
            <div className="detail-items">
              <div className="detail-item">
                <span className="detail-label">Reference Number</span>
                <span className="detail-value">{transaction.referenceNumber}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Type</span>
                <Badge variant={getTypeBadgeVariant(transaction.type)}>
                  {transaction.type}
                </Badge>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <Badge variant={getStatusBadgeVariant(transaction.status)}>
                  {transaction.status}
                </Badge>
              </div>
              <div className="detail-item">
                <span className="detail-label">Transaction Date</span>
                <span className="detail-value">{formatDate(transaction.transactionDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Settlement Date</span>
                <span className="detail-value">
                  {transaction.settlementDate ? formatDate(transaction.settlementDate) : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="detail-section">
            <h2>Investment Details</h2>
            <div className="detail-items">
              <div className="detail-item">
                <span className="detail-label">Investment</span>
                <span className="detail-value">
                  {transaction.investmentName} ({transaction.investmentSymbol})
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Quantity</span>
                <span className="detail-value">{transaction.quantity}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Price per Unit</span>
                <span className="detail-value">{formatCurrency(transaction.pricePerUnit)}</span>
              </div>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(`/client/investments/${transaction.investmentId}`)}
              className="view-investment-btn"
            >
              View Investment
            </Button>
          </div>
        </Card>

        <Card>
          <div className="detail-section">
            <h2>Financial Summary</h2>
            <div className="detail-items">
              <div className="detail-item">
                <span className="detail-label">Subtotal</span>
                <span className="detail-value">{formatCurrency(transaction.totalAmount)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fee</span>
                <span className="detail-value">{formatCurrency(transaction.fee)}</span>
              </div>
              <div className="detail-item total-row">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value total-amount">
                  {formatCurrency(transaction.totalAmount + transaction.fee)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="detail-section">
            <h2>Additional Information</h2>
            <div className="detail-items">
              <div className="detail-item full-width">
                <span className="detail-label">Notes</span>
                <span className="detail-value notes">
                  {transaction.notes || 'No notes provided'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Created</span>
                <span className="detail-value">{formatDate(transaction.createdAt)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value">{formatDate(transaction.updatedAt)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {transaction.status === TransactionStatus.PENDING && (
        <Card>
          <div className="pending-notice">
            <h3>Transaction Pending</h3>
            <p>
              This transaction is currently being processed. Settlement typically occurs within 
              2-3 business days. You will receive a notification once the transaction is complete.
            </p>
          </div>
        </Card>
      )}

      {transaction.status === TransactionStatus.FAILED && (
        <Card>
          <div className="failed-notice">
            <h3>Transaction Failed</h3>
            <p>
              This transaction could not be completed. Please contact support for more information 
              or try initiating a new transaction.
            </p>
            <Button variant="primary" onClick={() => navigate('/client/support')}>
              Contact Support
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TransactionDetailsPage;
