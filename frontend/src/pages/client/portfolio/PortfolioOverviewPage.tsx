// frontend/src/pages/client/portfolio/PortfolioOverviewPage.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { store } from '../../../store';
import { PortfolioOverviewPage } from './PortfolioOverviewPage';
import { portfolioApi } from '../../../services/api/portfolioApi';

// Mock the portfolio API
vi.mock('../../../services/api/portfolioApi', () => ({
  portfolioApi: {
    getPortfolioSummary: vi.fn(),
    getPortfolioPerformance: vi.fn(),
    getAssetAllocation: vi.fn(),
  },
}));

// Mock chart components to avoid canvas issues in tests
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

const mockPortfolioSummary = {
  totalValue: 1500000,
  totalGainLoss: 150000,
  totalGainLossPercentage: 11.11,
  dayChange: 5000,
  dayChangePercentage: 0.33,
  numberOfInvestments: 12,
  cashBalance: 50000,
};

const mockPerformanceData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Portfolio Value',
    data: [1350000, 1380000, 1420000, 1400000, 1480000, 1500000],
  }],
};

const mockAssetAllocation = [
  { category: 'Stocks', value: 750000, percentage: 50 },
  { category: 'Bonds', value: 300000, percentage: 20 },
  { category: 'Real Estate', value: 225000, percentage: 15 },
  { category: 'Commodities', value: 150000, percentage: 10 },
  { category: 'Cash', value: 75000, percentage: 5 },
];

const renderWithProviders = () => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <PortfolioOverviewPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('PortfolioOverviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (portfolioApi.getPortfolioSummary as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolioSummary);
    (portfolioApi.getPortfolioPerformance as ReturnType<typeof vi.fn>).mockResolvedValue(mockPerformanceData);
    (portfolioApi.getAssetAllocation as ReturnType<typeof vi.fn>).mockResolvedValue(mockAssetAllocation);
  });

  it('should render without errors', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('Portfolio Overview')).toBeInTheDocument();
    });
  });

  it('should fetch portfolio data on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(portfolioApi.getPortfolioSummary).toHaveBeenCalled();
      expect(portfolioApi.getPortfolioPerformance).toHaveBeenCalled();
      expect(portfolioApi.getAssetAllocation).toHaveBeenCalled();
    });
  });

  it('should display portfolio summary statistics', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText('$1,500,000.00')).toBeInTheDocument();
      expect(screen.getByText('Total Gain/Loss')).toBeInTheDocument();
      expect(screen.getByText('+$150,000.00')).toBeInTheDocument();
      expect(screen.getByText('+11.11%')).toBeInTheDocument();
    });
  });

  it('should display day change information', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Day Change')).toBeInTheDocument();
      expect(screen.getByText('+$5,000.00')).toBeInTheDocument();
      expect(screen.getByText('+0.33%')).toBeInTheDocument();
    });
  });

  it('should display investment count and cash balance', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Investments')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('Cash Balance')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    });
  });

  it('should render performance chart', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Performance History')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('should render asset allocation chart', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  it('should display asset allocation breakdown', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Stocks')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('$750,000.00')).toBeInTheDocument();
    });
  });

  it('should show loading state while fetching data', () => {
    (portfolioApi.getPortfolioSummary as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    renderWithProviders();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading portfolio data...')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch portfolio data');
    (portfolioApi.getPortfolioSummary as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load portfolio data/)).toBeInTheDocument();
    });
  });

  it('should have action buttons', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /view investments/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add investment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download report/i })).toBeInTheDocument();
    });
  });

  it('should navigate to investments page', async () => {
    renderWithProviders();

    await waitFor(() => {
      const investmentsLink = screen.getByRole('link', { name: /view investments/i });
      expect(investmentsLink).toHaveAttribute('href', '/client/investments');
    });
  });

  it('should have proper page layout', async () => {
    const { container } = renderWithProviders();

    await waitFor(() => {
      expect(container.querySelector('.portfolio-overview-page')).toBeInTheDocument();
      expect(container.querySelector('.portfolio-header')).toBeInTheDocument();
      expect(container.querySelector('.portfolio-content')).toBeInTheDocument();
    });
  });

  it('should have responsive grid layout', async () => {
    const { container } = renderWithProviders();

    await waitFor(() => {
      expect(container.querySelector('.stats-grid')).toBeInTheDocument();
      expect(container.querySelector('.charts-grid')).toBeInTheDocument();
    });
  });

  it('should format negative values correctly', async () => {
    const negativeSummary = {
      ...mockPortfolioSummary,
      totalGainLoss: -50000,
      totalGainLossPercentage: -3.23,
      dayChange: -2000,
      dayChangePercentage: -0.13,
    };

    (portfolioApi.getPortfolioSummary as ReturnType<typeof vi.fn>).mockResolvedValue(negativeSummary);
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('-$50,000.00')).toBeInTheDocument();
      expect(screen.getByText('-3.23%')).toBeInTheDocument();
      expect(screen.getByText('-$2,000.00')).toBeInTheDocument();
      expect(screen.getByText('-0.13%')).toBeInTheDocument();
    });
  });

  it('should have proper accessibility attributes', async () => {
    renderWithProviders();

    await waitFor(() => {
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Portfolio Overview');
    });
  });
});
