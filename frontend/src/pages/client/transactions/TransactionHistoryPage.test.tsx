// frontend/src/pages/client/transactions/TransactionHistoryPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import TransactionHistoryPage from './TransactionHistoryPage';
import { transactionService } from '../../../services/api/transaction.service';
import { TransactionStatus, TransactionType } from '../../../types/transaction.types';

vi.mock('../../../services/api/transaction.service');

const mockTransactions = [
  {
    id: 1,
    investmentId: 101,
    investmentName: 'Apple Inc.',
    type: TransactionType.BUY,
    quantity: 10,
    pricePerUnit: 150.00,
    totalAmount: 1500.00,
    fee: 10.00,
    status: TransactionStatus.COMPLETED,
    transactionDate: '2024-01-15T10:30:00',
    notes: 'Initial purchase'
  },
  {
    id: 2,
    investmentId: 102,
    investmentName: 'Microsoft Corp.',
    type: TransactionType.SELL,
    quantity: 5,
    pricePerUnit: 380.00,
    totalAmount: 1900.00,
    fee: 12.00,
    status: TransactionStatus.COMPLETED,
    transactionDate: '2024-01-10T14:20:00',
    notes: 'Partial sell'
  },
  {
    id: 3,
    investmentId: 103,
    investmentName: 'Tesla Inc.',
    type: TransactionType.BUY,
    quantity: 15,
    pricePerUnit: 200.00,
    totalAmount: 3000.00,
    fee: 15.00,
    status: TransactionStatus.PENDING,
    transactionDate: '2024-01-20T09:15:00',
    notes: null
  }
];

describe('TransactionHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ data: [] });
    renderWithProviders(<TransactionHistoryPage />);
    expect(screen.getByText('Transaction History')).toBeInTheDocument();
  });

  it('should display loading state while fetching transactions', () => {
    vi.mocked(transactionService.getAll).mockImplementation(() => 
      new Promise(() => {})
    );
    renderWithProviders(<TransactionHistoryPage />);
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });

  it('should display transactions when data is loaded', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument();
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    });
  });

  it('should display empty state when no transactions exist', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ data: [] });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
      expect(screen.getByText('Your transaction history will appear here once you make your first investment transaction.')).toBeInTheDocument();
    });
  });

  it('should display error state when fetching fails', async () => {
    vi.mocked(transactionService.getAll).mockRejectedValue(
      new Error('Failed to fetch transactions')
    );
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading transactions')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch transactions')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching when retry button is clicked', async () => {
    vi.mocked(transactionService.getAll)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockTransactions });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading transactions')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
  });

  it('should filter transactions by type', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
    
    // Filter by BUY type
    const typeFilter = screen.getByLabelText('Filter by type');
    fireEvent.change(typeFilter, { target: { value: 'BUY' } });
    
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Microsoft Corp.')).not.toBeInTheDocument();
  });

  it('should filter transactions by status', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    });
    
    // Filter by PENDING status
    const statusFilter = screen.getByLabelText('Filter by status');
    fireEvent.change(statusFilter, { target: { value: 'PENDING' } });
    
    expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Apple Inc.')).not.toBeInTheDocument();
    expect(screen.queryByText('Microsoft Corp.')).not.toBeInTheDocument();
  });

  it('should search transactions by investment name', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search by investment name...');
    fireEvent.change(searchInput, { target: { value: 'apple' } });
    
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.queryByText('Microsoft Corp.')).not.toBeInTheDocument();
    expect(screen.queryByText('Tesla Inc.')).not.toBeInTheDocument();
  });

  it('should sort transactions by date', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Tesla Inc.')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'date-asc' } });
    
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // Skip header row
    expect(within(firstDataRow).getByText('Microsoft Corp.')).toBeInTheDocument();
  });

  it('should navigate to transaction details when clicked', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
    
    const viewButton = screen.getAllByText('View')[0];
    fireEvent.click(viewButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/client/transactions/1');
  });

  it('should display correct transaction type badges', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      const buyBadges = screen.getAllByText('BUY');
      const sellBadges = screen.getAllByText('SELL');
      
      expect(buyBadges).toHaveLength(2);
      expect(sellBadges).toHaveLength(1);
    });
  });

  it('should display correct status badges', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      const completedBadges = screen.getAllByText('COMPLETED');
      const pendingBadges = screen.getAllByText('PENDING');
      
      expect(completedBadges).toHaveLength(2);
      expect(pendingBadges).toHaveLength(1);
    });
  });

  it('should format currency values correctly', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$1,510.00')).toBeInTheDocument(); // 1500 + 10 fee
      expect(screen.getByText('$1,912.00')).toBeInTheDocument(); // 1900 + 12 fee
      expect(screen.getByText('$3,015.00')).toBeInTheDocument(); // 3000 + 15 fee
    });
  });

  it('should display summary statistics', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total transactions
      expect(screen.getByText('$6,437.00')).toBeInTheDocument(); // Total amount
      expect(screen.getByText('2')).toBeInTheDocument(); // Buy transactions
      expect(screen.getByText('1')).toBeInTheDocument(); // Sell transactions
    });
  });

  it('should export transactions as CSV', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    const mockCreateElement = document.createElement.bind(document);
    const mockClick = vi.fn();
    document.createElement = vi.fn((tagName) => {
      const element = mockCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(mockClick).toHaveBeenCalled();
    
    document.createElement = mockCreateElement;
  });

  it('should handle date range filtering', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(4); // Header + 3 transactions
    });
    
    const startDateInput = screen.getByLabelText('Start date');
    const endDateInput = screen.getByLabelText('End date');
    
    fireEvent.change(startDateInput, { target: { value: '2024-01-12' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-18' } });
    
    // Should only show Apple transaction (Jan 15)
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.queryByText('Microsoft Corp.')).not.toBeInTheDocument();
      expect(screen.queryByText('Tesla Inc.')).not.toBeInTheDocument();
    });
  });

  it('should switch between table and card view on mobile', async () => {
    vi.mocked(transactionService.getAll).mockResolvedValue({ 
      data: mockTransactions 
    });
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    window.dispatchEvent(new Event('resize'));
    
    renderWithProviders(<TransactionHistoryPage />);
    
    await waitFor(() => {
      // Should show cards on mobile
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('transaction-card')).toHaveLength(3);
    });
  });
});
