// frontend/src/pages/employee/clients/ClientDetailsPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import { renderWithProviders } from '../../../test/test-utils';
import ClientDetailsPage from './ClientDetailsPage';
import { userService } from '../../../services/api/user.service';
import { portfolioService } from '../../../services/api/portfolio.service';
import { investmentService } from '../../../services/api/investment.service';
import { transactionService } from '../../../services/api/transaction.service';
import { UserRole } from '../../../types/auth.types';
import { InvestmentType } from '../../../types/investment.types';
import { TransactionType, TransactionStatus } from '../../../types/transaction.types';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useParams: vi.fn(),
  useNavigate: vi.fn()
}));

vi.mock('../../../services/api/user.service');
vi.mock('../../../services/api/portfolio.service');
vi.mock('../../../services/api/investment.service');
vi.mock('../../../services/api/transaction.service');

const mockClient = {
  id: 1,
  username: 'john.doe',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: UserRole.CLIENT,
  enabled: true,
  createdAt: '2024-01-01T10:00:00',
  lastLoginAt: '2024-01-15T14:30:00'
};

const mockPortfolio = {
  totalValue: 150000.00,
  totalCost: 140000.00,
  totalGainLoss: 10000.00,
  totalGainLossPercentage: 7.14,
  dayChange: 500.00,
  dayChangePercentage: 0.33,
  cashBalance: 5000.00,
  investmentCount: 12
};

const mockInvestments = [
  {
    id: 1,
    investmentName: 'Apple Inc.',
    symbol: 'AAPL',
    type: InvestmentType.STOCK,
    quantity: 50,
    averageCost: 145.00,
    currentPrice: 150.00,
    currentValue: 7500.00,
    totalCost: 7250.00,
    totalGainLoss: 250.00,
    totalGainLossPercentage: 3.45
  },
  {
    id: 2,
    investmentName: 'Vanguard S&P 500 ETF',
    symbol: 'VOO',
    type: InvestmentType.ETF,
    quantity: 20,
    averageCost: 380.00,
    currentPrice: 390.00,
    currentValue: 7800.00,
    totalCost: 7600.00,
    totalGainLoss: 200.00,
    totalGainLossPercentage: 2.63
  }
];

const mockTransactions = [
  {
    id: 1,
    investmentId: 1,
    investmentName: 'Apple Inc.',
    type: TransactionType.BUY,
    quantity: 50,
    pricePerUnit: 145.00,
    totalAmount: 7250.00,
    fee: 10.00,
    status: TransactionStatus.COMPLETED,
    transactionDate: '2024-01-10T10:30:00'
  },
  {
    id: 2,
    investmentId: 2,
    investmentName: 'Vanguard S&P 500 ETF',
    type: TransactionType.BUY,
    quantity: 20,
    pricePerUnit: 380.00,
    totalAmount: 7600.00,
    fee: 10.00,
    status: TransactionStatus.COMPLETED,
    transactionDate: '2024-01-12T14:20:00'
  }
];

describe('ClientDetailsPage', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useParams).mockReturnValue({ id: '1' });
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('should render without errors', () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: [] });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: [] });
    
    renderWithProviders(<ClientDetailsPage />);
    expect(screen.getByText('Loading client details...')).toBeInTheDocument();
  });

  it('should display loading state while fetching data', () => {
    vi.mocked(userService.getById).mockImplementation(() => new Promise(() => {}));
    
    renderWithProviders(<ClientDetailsPage />);
    expect(screen.getByText('Loading client details...')).toBeInTheDocument();
  });

  it('should display client information when loaded', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('should display error state when fetching fails', async () => {
    vi.mocked(userService.getById).mockRejectedValue(new Error('Client not found'));
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading client details')).toBeInTheDocument();
      expect(screen.getByText('Client not found')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching when retry button is clicked', async () => {
    vi.mocked(userService.getById)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading client details')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display portfolio summary', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$150,000.00')).toBeInTheDocument(); // Total value
      expect(screen.getByText('+$10,000.00')).toBeInTheDocument(); // Total gain
      expect(screen.getByText('+7.14%')).toBeInTheDocument(); // Gain percentage
      expect(screen.getByText('12')).toBeInTheDocument(); // Investment count
    });
  });

  it('should display investments list', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Vanguard S&P 500 ETF')).toBeInTheDocument();
      expect(screen.getByText('VOO')).toBeInTheDocument();
    });
  });

  it('should display recent transactions', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
      const transactions = screen.getAllByText('Apple Inc.');
      expect(transactions.length).toBeGreaterThan(0);
    });
  });

  it('should navigate back to client list', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('← Back to Clients')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('← Back to Clients'));
    expect(mockNavigate).toHaveBeenCalledWith('/employee/clients');
  });

  it('should handle send message action', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Send Message')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Send Message'));
    expect(mockNavigate).toHaveBeenCalledWith('/employee/messages/compose?to=1');
  });

  it('should display client status correctly', async () => {
    const inactiveClient = { ...mockClient, enabled: false };
    vi.mocked(userService.getById).mockResolvedValue({ data: inactiveClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  it('should switch between tabs', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Investments')).toBeInTheDocument();
      expect(screen.getByText('Transactions')).toBeInTheDocument();
    });
    
    // Click on Investments tab
    fireEvent.click(screen.getByText('Investments'));
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    
    // Click on Transactions tab
    fireEvent.click(screen.getByText('Transactions'));
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
  });

  it('should display empty states', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: { ...mockPortfolio, investmentCount: 0 } });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: [] });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: [] });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Investments'));
      expect(screen.getByText('No investments yet')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Transactions'));
      expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument(); // Member since
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument(); // Last login
    });
  });

  it('should handle client with no last login', async () => {
    const clientNoLogin = { ...mockClient, lastLoginAt: null };
    vi.mocked(userService.getById).mockResolvedValue({ data: clientNoLogin });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  it('should display investment type badges', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Investments'));
      expect(screen.getByText('STOCK')).toBeInTheDocument();
      expect(screen.getByText('ETF')).toBeInTheDocument();
    });
  });

  it('should display transaction details', async () => {
    vi.mocked(userService.getById).mockResolvedValue({ data: mockClient });
    vi.mocked(portfolioService.getByUserId).mockResolvedValue({ data: mockPortfolio });
    vi.mocked(investmentService.getByUserId).mockResolvedValue({ data: mockInvestments });
    vi.mocked(transactionService.getByUserId).mockResolvedValue({ data: mockTransactions });
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Transactions'));
      expect(screen.getByText('$7,260.00')).toBeInTheDocument(); // 7250 + 10 fee
      expect(screen.getByText('$7,610.00')).toBeInTheDocument(); // 7600 + 10 fee
    });
  });

  it('should handle invalid client ID', async () => {
    vi.mocked(useParams).mockReturnValue({ id: 'invalid' });
    vi.mocked(userService.getById).mockRejectedValue(new Error('Invalid client ID'));
    
    renderWithProviders(<ClientDetailsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading client details')).toBeInTheDocument();
      expect(screen.getByText('Invalid client ID')).toBeInTheDocument();
    });
  });
});
