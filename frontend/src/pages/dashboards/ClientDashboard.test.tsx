// frontend/src/pages/dashboards/ClientDashboard.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientDashboard } from './ClientDashboard';
import { createTestStore } from '@/utils/test-utils';
import { Role } from '@/types';

// Mock the hooks
vi.mock('@/hooks/usePortfolio', () => ({
  usePortfolio: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock the API service
vi.mock('@/services/api/ClientService', () => ({
  clientService: {
    getPortfolio: vi.fn(),
    getInvestments: vi.fn(),
  },
}));

import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/hooks/useAuth';

const mockUsePortfolio = usePortfolio as jest.MockedFunction<typeof usePortfolio>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('ClientDashboard', () => {
  const mockUser = {
    id: 1,
    email: 'client@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: Role.CLIENT,
  };

  const mockPortfolio = {
    clientId: 1,
    totalValue: 150000,
    totalCost: 120000,
    totalGainLoss: 30000,
    totalGainLossPercentage: 25,
    investments: [
      {
        id: 1,
        stockSymbol: 'AAPL',
        stockName: 'Apple Inc.',
        quantity: 100,
        purchasePrice: 150,
        currentPrice: 180,
        purchaseDate: '2024-01-15',
        status: 'ACTIVE',
      },
      {
        id: 2,
        stockSymbol: 'GOOGL',
        stockName: 'Alphabet Inc.',
        quantity: 50,
        purchasePrice: 2800,
        currentPrice: 2900,
        purchaseDate: '2024-02-20',
        status: 'ACTIVE',
      },
    ],
  };

  const defaultMocks = {
    user: mockUser,
    isAuthenticated: true,
    loading: false,
    error: null,
    portfolio: mockPortfolio,
    investments: mockPortfolio.investments,
    refreshPortfolio: vi.fn(),
  };

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: defaultMocks.user,
      isAuthenticated: defaultMocks.isAuthenticated,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      loading: false,
      error: null,
    });

    mockUsePortfolio.mockReturnValue({
      portfolio: defaultMocks.portfolio,
      investments: defaultMocks.investments,
      loading: defaultMocks.loading,
      error: defaultMocks.error,
      refreshPortfolio: defaultMocks.refreshPortfolio,
      addInvestment: vi.fn(),
      updateInvestment: vi.fn(),
      deleteInvestment: vi.fn(),
    });
  });

  const renderDashboard = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <ClientDashboard />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render welcome message with user name', () => {
    renderDashboard();

    expect(screen.getByText(`Welcome back, ${mockUser.firstName}!`)).toBeInTheDocument();
    expect(screen.getByText(/your investment portfolio overview/i)).toBeInTheDocument();
  });

  it('should display portfolio summary cards', () => {
    renderDashboard();

    // Total Value card
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
    expect(screen.getByText('$150,000.00')).toBeInTheDocument();

    // Total Gain/Loss card
    expect(screen.getByText('Total Gain/Loss')).toBeInTheDocument();
    expect(screen.getByText('$30,000.00')).toBeInTheDocument();
    expect(screen.getByText('(25.00%)')).toBeInTheDocument();

    // Number of Investments card
    expect(screen.getByText('Active Investments')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    // Total Cost Basis card
    expect(screen.getByText('Total Cost Basis')).toBeInTheDocument();
    expect(screen.getByText('$120,000.00')).toBeInTheDocument();
  });

  it('should show positive gain with green color', () => {
    renderDashboard();

    const gainElement = screen.getByText('$30,000.00');
    expect(gainElement).toHaveClass('metric-card__value--positive');
  });

  it('should show negative loss with red color', () => {
    mockUsePortfolio.mockReturnValue({
      ...defaultMocks,
      portfolio: {
        ...mockPortfolio,
        totalGainLoss: -5000,
        totalGainLossPercentage: -4.17,
      },
    });

    renderDashboard();

    const lossElement = screen.getByText('-$5,000.00');
    expect(lossElement).toHaveClass('metric-card__value--negative');
  });

  it('should display recent investments table', () => {
    renderDashboard();

    expect(screen.getByText('Recent Investments')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Table headers
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Current Value')).toBeInTheDocument();
    expect(screen.getByText('Gain/Loss')).toBeInTheDocument();

    // Investment data
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should navigate to portfolio page when View All clicked', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const viewAllLink = screen.getByRole('link', { name: /view all investments/i });
    expect(viewAllLink).toHaveAttribute('href', '/portfolio');

    await user.click(viewAllLink);
  });

  it('should display quick actions', () => {
    renderDashboard();

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add investment/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view portfolio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /messages/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /account settings/i })).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUsePortfolio.mockReturnValue({
      ...defaultMocks,
      loading: true,
      portfolio: null,
      investments: [],
    });

    renderDashboard();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUsePortfolio.mockReturnValue({
      ...defaultMocks,
      error: 'Failed to load portfolio data',
      portfolio: null,
      investments: [],
    });

    renderDashboard();

    expect(screen.getByText(/failed to load portfolio data/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('should refresh portfolio when Try Again clicked', async () => {
    const user = userEvent.setup();
    const refreshPortfolio = vi.fn();

    mockUsePortfolio.mockReturnValue({
      ...defaultMocks,
      error: 'Failed to load portfolio data',
      portfolio: null,
      investments: [],
      refreshPortfolio,
    });

    renderDashboard();

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    await user.click(tryAgainButton);

    expect(refreshPortfolio).toHaveBeenCalledTimes(1);
  });

  it('should show empty state when no investments', () => {
    mockUsePortfolio.mockReturnValue({
      ...defaultMocks,
      portfolio: {
        ...mockPortfolio,
        investments: [],
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        totalGainLossPercentage: 0,
      },
      investments: [],
    });

    renderDashboard();

    expect(screen.getByText(/no investments yet/i)).toBeInTheDocument();
    expect(screen.getByText(/start building your portfolio/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /add your first investment/i })).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    renderDashboard();

    // Check currency formatting
    expect(screen.getByText('$150,000.00')).toBeInTheDocument();
    expect(screen.getByText('$30,000.00')).toBeInTheDocument();
    expect(screen.getByText('$120,000.00')).toBeInTheDocument();
  });

  it('should show percentage with correct decimal places', () => {
    mockUsePortfolio.mockReturnValue({
      ...defaultMocks,
      portfolio: {
        ...mockPortfolio,
        totalGainLossPercentage: 12.5678,
      },
    });

    renderDashboard();

    expect(screen.getByText('(12.57%)')).toBeInTheDocument();
  });

  it('should refresh portfolio data on mount', async () => {
    const refreshPortfolio = vi.fn();
    mockUsePortfolio.mockReturnValue({
      ...defaultMocks,
      refreshPortfolio,
    });

    renderDashboard();

    await waitFor(() => {
      expect(refreshPortfolio).toHaveBeenCalledTimes(1);
    });
  });

  it('should display market status indicator', () => {
    renderDashboard();

    // Market status should be shown
    expect(screen.getByText(/market status/i)).toBeInTheDocument();
  });

  it('should show last updated time', () => {
    renderDashboard();

    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });
});
