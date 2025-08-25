// frontend/src/pages/employee/approvals/PendingApprovalsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { approvalService } from '../../../services/api/approval.service';
import { Approval, ApprovalType } from '../../../types/approval.types';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import Button from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import './PendingApprovalsPage.css';

const PendingApprovalsPage: React.FC = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ApprovalType | 'ALL'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await approvalService.getPendingApprovals();
      setApprovals(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const filteredAndSortedApprovals = useMemo(() => {
    let filtered = approvals;

    // Type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(a => a.type === typeFilter);
    }

    // Risk filter
    if (riskFilter !== 'ALL') {
      filtered = filtered.filter(a => a.riskLevel === riskFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
        case 'date-asc':
          return new Date(a.requestDate).getTime() - new Date(b.requestDate).getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return sorted;
  }, [approvals, typeFilter, riskFilter, sortBy]);

  const statistics = useMemo(() => {
    const totalAmount = approvals.reduce((sum, a) => sum + a.amount, 0);
    const highRiskCount = approvals.filter(a => a.riskLevel === 'HIGH').length;
    const urgentCount = approvals.filter(a => a.urgency === 'HIGH').length;

    return {
      total: approvals.length,
      totalAmount,
      highRiskCount,
      urgentCount
    };
  }, [approvals]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours === 1) return '1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  const getTypeBadgeVariant = (type: ApprovalType) => {
    switch (type) {
      case ApprovalType.NEW_INVESTMENT:
        return 'primary';
      case ApprovalType.LARGE_TRANSACTION:
        return 'warning';
      case ApprovalType.HIGH_RISK_INVESTMENT:
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = (type: ApprovalType) => {
    switch (type) {
      case ApprovalType.NEW_INVESTMENT:
        return 'NEW INVESTMENT';
      case ApprovalType.LARGE_TRANSACTION:
        return 'LARGE TRANSACTION';
      case ApprovalType.HIGH_RISK_INVESTMENT:
        return 'HIGH RISK';
      default:
        return type;
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'success';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency) {
      case 'LOW':
        return 'secondary';
      case 'NORMAL':
        return 'primary';
      case 'HIGH':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const handleApprove = async (approval: Approval) => {
    try {
      setProcessing(true);
      await approvalService.approveRequest(approval.id, { notes: approvalNotes });
      setApprovals(approvals.filter(a => a.id !== approval.id));
      setSelectedApproval(null);
      setApprovalNotes('');
    } catch (err) {
      alert('Failed to approve request');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApproval || !rejectReason.trim()) return;

    try {
      setProcessing(true);
      await approvalService.rejectRequest(selectedApproval.id, { reason: rejectReason });
      setApprovals(approvals.filter(a => a.id !== selectedApproval.id));
      setShowRejectDialog(false);
      setSelectedApproval(null);
      setRejectReason('');
    } catch (err) {
      alert('Failed to reject request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="pending-approvals-page">
        <LoadingSpinner message="Loading approvals..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="pending-approvals-page">
        <ErrorMessage
          title="Error loading approvals"
          message={error}
          onRetry={fetchApprovals}
        />
      </div>
    );
  }

  return (
    <div className="pending-approvals-page">
      <div className="page-header">
        <h1>Pending Approvals</h1>
        <Button variant="secondary" onClick={fetchApprovals}>
          Refresh
        </Button>
      </div>

      <div className="statistics-cards">
        <Card>
          <div className="stat-card">
            <span className="stat-label">Total Pending</span>
            <span className="stat-value">{statistics.total}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value">{formatCurrency(statistics.totalAmount)}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">High Risk</span>
            <span className="stat-value urgent">{statistics.highRiskCount}</span>
          </div>
        </Card>
        <Card>
          <div className="stat-card">
            <span className="stat-label">Urgent</span>
            <span className="stat-value urgent">{statistics.urgentCount}</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="filters">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="filter-select"
            aria-label="Filter by type"
          >
            <option value="ALL">All Types</option>
            <option value={ApprovalType.NEW_INVESTMENT}>New Investments</option>
            <option value={ApprovalType.LARGE_TRANSACTION}>Large Transactions</option>
            <option value={ApprovalType.HIGH_RISK_INVESTMENT}>High Risk</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as typeof riskFilter)}
            className="filter-select"
            aria-label="Filter by risk"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="filter-select"
            aria-label="Sort by"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>
        </div>
      </Card>

      {filteredAndSortedApprovals.length === 0 ? (
        <Card>
          <div className="empty-state">
            <h2>No pending approvals</h2>
            <p>All investment requests have been processed.</p>
          </div>
        </Card>
      ) : (
        <div className="approvals-grid">
          {filteredAndSortedApprovals.map((approval) => (
            <Card key={approval.id} data-testid="approval-card">
              <div className="approval-card">
                <div className="approval-header">
                  <div className="approval-badges">
                    <Badge variant={getTypeBadgeVariant(approval.type)}>
                      {getTypeLabel(approval.type)}
                    </Badge>
                    <Badge variant={getUrgencyBadgeVariant(approval.urgency)}>
                      {approval.urgency} PRIORITY
                    </Badge>
                  </div>
                  <span className="request-time">{getTimeAgo(approval.requestDate)}</span>
                </div>

                <div className="approval-content">
                  <div className="client-info">
                    <span className="label">Client:</span>
                    <a 
                      className="client-link"
                      onClick={() => navigate(`/employee/clients/${approval.clientId}`)}
                    >
                      {approval.clientName}
                    </a>
                  </div>

                  <div className="investment-info">
                    <h3>{approval.investmentName}</h3>
                    <span className="symbol">{approval.investmentSymbol}</span>
                  </div>

                  <div className="approval-details">
                    <div className="detail-row">
                      <span>Amount:</span>
                      <span className="amount">{formatCurrency(approval.amount)}</span>
                    </div>
                    <div className="detail-row">
                      <span>Quantity:</span>
                      <span>{approval.quantity}</span>
                    </div>
                    <div className="detail-row">
                      <span>Risk Level:</span>
                      <Badge variant={getRiskBadgeVariant(approval.riskLevel)}>
                        {approval.riskLevel} RISK
                      </Badge>
                    </div>
                  </div>

                  <div className="description">
                    <p>{approval.description}</p>
                  </div>

                  {selectedApproval?.id === approval.id && (
                    <div className="approval-notes">
                      <label htmlFor={`notes-${approval.id}`}>Add approval notes (optional)</label>
                      <textarea
                        id={`notes-${approval.id}`}
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add any notes about this approval..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>

                <div className="approval-actions">
                  {selectedApproval?.id === approval.id ? (
                    <>
                      <Button
                        variant="success"
                        size="small"
                        onClick={() => handleApprove(approval)}
                        disabled={processing}
                      >
                        Confirm Approval
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                          setSelectedApproval(null);
                          setApprovalNotes('');
                        }}
                        disabled={processing}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="primary"
                        size="small"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="error"
                        size="small"
                        onClick={() => {
                          setSelectedApproval(approval);
                          setShowRejectDialog(true);
                        }}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => setSelectedApproval(approval)}
                      >
                        View Details
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showRejectDialog && selectedApproval && (
        <Modal
          isOpen={showRejectDialog}
          onClose={() => {
            setShowRejectDialog(false);
            setRejectReason('');
          }}
          title="Reject Request"
        >
          <div className="reject-dialog">
            <p>Please provide a reason for rejecting this investment request:</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              rows={4}
              autoFocus
            />
            <div className="dialog-actions">
              <Button
                variant="error"
                onClick={handleReject}
                disabled={!rejectReason.trim() || processing}
              >
                Confirm Rejection
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectReason('');
                }}
                disabled={processing}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PendingApprovalsPage;
