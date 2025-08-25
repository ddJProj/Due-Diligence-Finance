// frontend/src/pages/employee/approvals/PendingApprovalsPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import PendingApprovalsPage from './PendingApprovalsPage';
import { approvalService } from '../../../services/api/approval.service';
import { ApprovalStatus, ApprovalType } from '../../../types/approval.types';

vi.mock('../../../services/api/approval.service');

const mockApprovals = [
  {
    id: 1,
    type: ApprovalType.NEW_INVESTMENT,
    status: ApprovalStatus.PENDING,
    clientId: 101,
    clientName: 'John Doe',
    investmentName: 'Apple Inc.',
    investmentSymbol: 'AAPL',
    amount: 15000.00,
    quantity: 100,
    requestDate: '2024-01-15T10:30:00',
    description: 'Client wants to purchase 100 shares of AAPL',
    riskLevel: 'MEDIUM',
    urgency: 'HIGH'
  },
  {
    id: 2,
    type: ApprovalType.LARGE_TRANSACTION,
    status: ApprovalStatus.PENDING,
    clientId: 102,
    clientName: 'Jane Smith',
    investmentName: 'Vanguard Total Stock Market ETF',
    investmentSymbol: 'VTI',
    amount: 50000.00,
    quantity: 200,
    requestDate: '2024-01-14T09:15:00',
    description: 'Large transaction requiring approval',
    riskLevel: 'LOW',
    urgency: 'NORMAL'
  },
  {
    id: 3,
    type: ApprovalType.HIGH_RISK_INVESTMENT,
    status: ApprovalStatus.PENDING,
    clientId: 103,
    clientName: 'Bob Johnson',
    investmentName: 'Cryptocurrency Fund',
    investmentSymbol: 'CRYPTO',
    amount: 25000.00,
    quantity: 1000,
    requestDate: '2024-01-13T14:20:00',
    description: 'High-risk cryptocurrency investment',
    riskLevel: 'HIGH',
    urgency: 'LOW'
  }
];

describe('PendingApprovalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ data: [] });
    renderWithProviders(<PendingApprovalsPage />);
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
  });

  it('should display loading state while fetching approvals', () => {
    vi.mocked(approvalService.getPendingApprovals).mockImplementation(() => 
      new Promise(() => {})
    );
    renderWithProviders(<PendingApprovalsPage />);
    expect(screen.getByText('Loading approvals...')).toBeInTheDocument();
  });

  it('should display approvals when data is loaded', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('should display empty state when no approvals exist', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ data: [] });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No pending approvals')).toBeInTheDocument();
      expect(screen.getByText('All investment requests have been processed.')).toBeInTheDocument();
    });
  });

  it('should display error state when fetching fails', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockRejectedValue(
      new Error('Failed to fetch approvals')
    );
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading approvals')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch approvals')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching when retry button is clicked', async () => {
    vi.mocked(approvalService.getPendingApprovals)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockApprovals });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading approvals')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should filter approvals by type', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const typeFilter = screen.getByLabelText('Filter by type');
    fireEvent.change(typeFilter, { target: { value: 'NEW_INVESTMENT' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should filter approvals by risk level', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
    
    const riskFilter = screen.getByLabelText('Filter by risk');
    fireEvent.change(riskFilter, { target: { value: 'HIGH' } });
    
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('should sort approvals by date', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'date-asc' } });
    
    const cards = screen.getAllByTestId('approval-card');
    expect(within(cards[0]).getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('should display approval type badges', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('NEW INVESTMENT')).toBeInTheDocument();
      expect(screen.getByText('LARGE TRANSACTION')).toBeInTheDocument();
      expect(screen.getByText('HIGH RISK')).toBeInTheDocument();
    });
  });

  it('should display risk level badges', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('HIGH RISK')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM RISK')).toBeInTheDocument();
      expect(screen.getByText('LOW RISK')).toBeInTheDocument();
    });
  });

  it('should display urgency indicators', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('HIGH PRIORITY')).toBeInTheDocument();
      expect(screen.getByText('NORMAL PRIORITY')).toBeInTheDocument();
      expect(screen.getByText('LOW PRIORITY')).toBeInTheDocument();
    });
  });

  it('should handle approve action', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    vi.mocked(approvalService.approveRequest).mockResolvedValue({ 
      data: { ...mockApprovals[0], status: ApprovalStatus.APPROVED } 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const approveButtons = screen.getAllByText('Approve');
    fireEvent.click(approveButtons[0]);
    
    await waitFor(() => {
      expect(vi.mocked(approvalService.approveRequest)).toHaveBeenCalledWith(1, {
        notes: ''
      });
    });
  });

  it('should handle reject action with reason', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    vi.mocked(approvalService.rejectRequest).mockResolvedValue({ 
      data: { ...mockApprovals[0], status: ApprovalStatus.REJECTED } 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const rejectButtons = screen.getAllByText('Reject');
    fireEvent.click(rejectButtons[0]);
    
    // Should show reject dialog
    await waitFor(() => {
      expect(screen.getByText('Reject Request')).toBeInTheDocument();
    });
    
    const reasonInput = screen.getByPlaceholderText('Please provide a reason for rejection...');
    fireEvent.change(reasonInput, { target: { value: 'Risk too high' } });
    
    const confirmButton = screen.getByText('Confirm Rejection');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(vi.mocked(approvalService.rejectRequest)).toHaveBeenCalledWith(1, {
        reason: 'Risk too high'
      });
    });
  });

  it('should display statistics summary', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total pending
      expect(screen.getByText('$90,000.00')).toBeInTheDocument(); // Total amount
      expect(screen.getByText('1')).toBeInTheDocument(); // High risk count
    });
  });

  it('should navigate to client details when client name is clicked', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('John Doe'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/employee/clients/101');
  });

  it('should format currency values correctly', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$15,000.00')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
      expect(screen.getByText('$25,000.00')).toBeInTheDocument();
    });
  });

  it('should show time since request', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      // Should show relative time
      expect(screen.getByText(/ago/)).toBeInTheDocument();
    });
  });

  it('should refresh approvals when refresh button is clicked', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Refresh'));
    
    expect(vi.mocked(approvalService.getPendingApprovals)).toHaveBeenCalledTimes(2);
  });

  it('should show notes field when approving', async () => {
    vi.mocked(approvalService.getPendingApprovals).mockResolvedValue({ 
      data: mockApprovals 
    });
    
    renderWithProviders(<PendingApprovalsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByText('View Details');
    fireEvent.click(viewButtons[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Add approval notes (optional)')).toBeInTheDocument();
    });
  });
});
