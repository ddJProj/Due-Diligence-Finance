// frontend/src/pages/client/transactions/TransactionDetailsPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import { renderWithProviders } from '../../../test/test-utils';
import TransactionDetailsPage from './TransactionDetailsPage';
import { transactionService } from '../../../services/api/transaction.service';
import { TransactionStatus, TransactionType } from '../../../types/transaction.types';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: vi.fn(),
  useNavigate: vi.fn()
}));

vi.mock('../../../services/api/transaction.service');

const mockTransaction = {
  id: 1,
  investmentId: 101,
  investmentName: 'Apple Inc.',
  investmentSymbol: 'AAPL',
  type: TransactionType.BUY,
  quantity: 10,
  pricePerUnit: 150.00,
  totalAmount: 1500.00,
  fee: 10.00,
  status: TransactionStatus.COMPLETED,
  transactionDate: '2024-01-15T10:30:00',
  settlementDate: '2024-01-17T10:30:00',
  notes: 'Initial purchase of Apple stock',
  referenceNumber: 'TXN-2024-001',
  createdAt: '2024-01-15T10:30:00',
  updatedAt: '2024-01-15T10:30:00'
};

describe('TransactionDetailsPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: '1' });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('should render without errors', () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    renderWithProviders(<TransactionDetailsPage />);
    expect(screen.getByText('Loading transaction details...')).toBeInTheDocument();
  });

  it('should display loading state while fetching transaction', () => {
    vi.mocked(transactionService.getById).mockImplementation(() => 
      new Promise(() => {})
    );
    renderWithProviders(<TransactionDetailsPage />);
    expect(screen.getByText('Loading transaction details...')).toBeInTheDocument();
  });

  it('should display transaction details when loaded', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('TXN-2024-001')).toBeInTheDocument();
    });
  });

  it('should display error state when fetching fails', async () => {
    vi.mocked(transactionService.getById).mockRejectedValue(
      new Error('Transaction not found')
    );
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading transaction')).toBeInTheDocument();
      expect(screen.getByText('Transaction not found')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching when retry button is clicked', async () => {
    vi.mocked(transactionService.getById)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading transaction')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('Transaction Details')).toBeInTheDocument();
    });
  });

  it('should display all transaction information', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      // Basic info
      expect(screen.getByText('Reference Number')).toBeInTheDocument();
      expect(screen.getByText('TXN-2024-001')).toBeInTheDocument();
      
      // Investment info
      expect(screen.getByText('Investment')).toBeInTheDocument();
      expect(screen.getByText('Apple Inc. (AAPL)')).toBeInTheDocument();
      
      // Transaction details
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('BUY')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('Price per Unit')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      
      // Financial details
      expect(screen.getByText('Subtotal')).toBeInTheDocument();
      expect(screen.getByText('$1,500.00')).toBeInTheDocument();
      expect(screen.getByText('Fee')).toBeInTheDocument();
      expect(screen.getByText('$10.00')).toBeInTheDocument();
      expect(screen.getByText('Total Amount')).toBeInTheDocument();
      expect(screen.getByText('$1,510.00')).toBeInTheDocument();
      
      // Status
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      
      // Notes
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('Initial purchase of Apple stock')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Transaction Date')).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2024, 10:30 AM')).toBeInTheDocument();
      
      expect(screen.getByText('Settlement Date')).toBeInTheDocument();
      expect(screen.getByText('Jan 17, 2024, 10:30 AM')).toBeInTheDocument();
    });
  });

  it('should display correct badge variant for transaction type', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      const buyBadge = screen.getByText('BUY').closest('.badge');
      expect(buyBadge).toHaveClass('badge--success');
    });
  });

  it('should display correct badge variant for transaction status', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      const statusBadge = screen.getByText('COMPLETED').closest('.badge');
      expect(statusBadge).toHaveClass('badge--success');
    });
  });

  it('should navigate back when back button is clicked', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Back to History')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Back to History'));
    expect(mockNavigate).toHaveBeenCalledWith('/client/transactions');
  });

  it('should navigate to investment details when view investment is clicked', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('View Investment')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('View Investment'));
    expect(mockNavigate).toHaveBeenCalledWith('/client/investments/101');
  });

  it('should handle transactions without notes', async () => {
    const transactionWithoutNotes = { ...mockTransaction, notes: null };
    vi.mocked(transactionService.getById).mockResolvedValue({ data: transactionWithoutNotes });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Notes')).toBeInTheDocument();
      expect(screen.getByText('No notes provided')).toBeInTheDocument();
    });
  });

  it('should handle different transaction statuses', async () => {
    const pendingTransaction = { 
      ...mockTransaction, 
      status: TransactionStatus.PENDING,
      settlementDate: null 
    };
    vi.mocked(transactionService.getById).mockResolvedValue({ data: pendingTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      const statusBadge = screen.getByText('PENDING').closest('.badge');
      expect(statusBadge).toHaveClass('badge--warning');
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  it('should display print button and handle print', async () => {
    const mockPrint = vi.fn();
    global.window.print = mockPrint;
    
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Print')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Print'));
    expect(mockPrint).toHaveBeenCalled();
  });

  it('should display download PDF button', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });
  });

  it('should handle sell transactions correctly', async () => {
    const sellTransaction = { 
      ...mockTransaction, 
      type: TransactionType.SELL 
    };
    vi.mocked(transactionService.getById).mockResolvedValue({ data: sellTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      const sellBadge = screen.getByText('SELL').closest('.badge');
      expect(sellBadge).toHaveClass('badge--warning');
    });
  });

  it('should display timestamps', async () => {
    vi.mocked(transactionService.getById).mockResolvedValue({ data: mockTransaction });
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Last Updated')).toBeInTheDocument();
    });
  });

  it('should handle invalid transaction ID', async () => {
    vi.mocked(useParams).mockReturnValue({ id: 'invalid' });
    vi.mocked(transactionService.getById).mockRejectedValue(
      new Error('Invalid transaction ID')
    );
    
    renderWithProviders(<TransactionDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading transaction')).toBeInTheDocument();
      expect(screen.getByText('Invalid transaction ID')).toBeInTheDocument();
    });
  });
});
