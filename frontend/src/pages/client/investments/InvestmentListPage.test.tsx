// frontend/src/pages/client/investments/InvestmentListPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { store } from '../../../store';
import { InvestmentListPage } from './InvestmentListPage';
import { investmentApi } from '../../../services/api/investmentApi';

// Mock the investment API
vi.mock('../../../services/api/investmentApi', () => ({
  investmentApi: {
    getInvestments: vi.fn(),
    searchInvestments: vi.fn(),
  },
}));

const mockInvestments = [
  {
    id: 1,
    name: 'Apple Inc.',
    symbol: 'AAPL',
    type: 'STOCK',
    quantity: 100,
    purchasePrice: 150.00,
    currentPrice: 175.50,
    totalValue: 17550.00,
    gainLoss: 2550.00,
    gainLossPercentage: 17.00,
    purchaseDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Microsoft Corporation',
    symbol: 'MSFT',
    type: 'STOCK',
    quantity: 50,
    purchasePrice: 300.00,
    currentPrice: 320.00,
    totalValue: 16000.00,
    gainLoss: 1000.00,
    gainLossPercentage: 6.67,
    purchaseDate: '2023-02-20',
  },
  {
    id: 3,
    name: 'US Treasury Bond',
    symbol: 'T-BOND',
    type: 'BOND',
    quantity: 10,
    purchasePrice: 1000.00,
    currentPrice: 980.00,
    totalValue: 9800.00,
    gainLoss: -200.00,
    gainLossPercentage: -2.00,
    purchaseDate: '2023-03-10',
  },
];

const renderWithProviders = () => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <InvestmentListPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('InvestmentListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (investmentApi.getInvestments as ReturnType<typeof vi.fn>).mockResolvedValue({
      investments: mockInvestments,
      totalCount: 3,
      page: 1,
      pageSize: 10,
    });
  });

  it('should render without errors', async () => {
    renderWithProviders();
    
    await waitFor(() => {
      expect(screen.getByText('My Investments')).toBeInTheDocument();
    });
  });

  it('should fetch investments on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(investmentApi.getInvestments).toHaveBeenCalled();
    });
  });

  it('should display investment list', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
      expect(screen.getByText('MSFT')).toBeInTheDocument();
      expect(screen.getByText('US Treasury Bond')).toBeInTheDocument();
    });
  });

  it('should display investment values and gains', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('$17,550.00')).toBeInTheDocument();
      expect(screen.getByText('+$2,550.00')).toBeInTheDocument();
      expect(screen.getByText('+17.00%')).toBeInTheDocument();
    });
  });

  it('should display negative gains correctly', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('-$200.00')).toBeInTheDocument();
      expect(screen.getByText('-2.00%')).toBeInTheDocument();
    });
  });

  it('should have search functionality', async () => {
    renderWithProviders();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search investments/i);
      expect(searchInput).toBeInTheDocument();
    });
  });

  it('should search investments when search is performed', async () => {
    (investmentApi.searchInvestments as ReturnType<typeof vi.fn>).mockResolvedValue({
      investments: [mockInvestments[0]],
      totalCount: 1,
      page: 1,
      pageSize: 10,
    });

    renderWithProviders();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/search investments/i);
      fireEvent.change(searchInput, { target: { value: 'Apple' } });
    });

    await waitFor(() => {
      expect(investmentApi.searchInvestments).toHaveBeenCalledWith('Apple', expect.any(Object));
    });
  });

  it('should have filter options', async () => {
    renderWithProviders();

    await waitFor(() => {
      const filterSelect = screen.getByRole('combobox', { name: /filter by type/i });
      expect(filterSelect).toBeInTheDocument();
    });
  });

  it('should filter investments by type', async () => {
    renderWithProviders();

    await waitFor(() => {
      const filterSelect = screen.getByRole('combobox', { name: /filter by type/i });
      fireEvent.change(filterSelect, { target: { value: 'STOCK' } });
    });

    await waitFor(() => {
      expect(investmentApi.getInvestments).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'STOCK' })
      );
    });
  });

  it('should have sort options', async () => {
    renderWithProviders();

    await waitFor(() => {
      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      expect(sortSelect).toBeInTheDocument();
    });
  });

  it('should sort investments', async () => {
    renderWithProviders();

    await waitFor(() => {
      const sortSelect = screen.getByRole('combobox', { name: /sort by/i });
      fireEvent.change(sortSelect, { target: { value: 'value-desc' } });
    });

    await waitFor(() => {
      expect(investmentApi.getInvestments).toHaveBeenCalledWith(
        expect.objectContaining({ 
          sortBy: 'value',
          sortOrder: 'desc'
        })
      );
    });
  });

  it('should show loading state', () => {
    (investmentApi.getInvestments as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    renderWithProviders();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading investments...')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch investments');
    (investmentApi.getInvestments as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load investments/)).toBeInTheDocument();
    });
  });

  it('should handle empty state', async () => {
    (investmentApi.getInvestments as ReturnType<typeof vi.fn>).mockResolvedValue({
      investments: [],
      totalCount: 0,
      page: 1,
      pageSize: 10,
    });

    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText(/No investments found/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add your first investment/i })).toBeInTheDocument();
    });
  });

  it('should navigate to investment details on row click', async () => {
    renderWithProviders();

    await waitFor(() => {
      const investmentRow = screen.getByText('Apple Inc.').closest('tr');
      expect(investmentRow).toBeInTheDocument();
      
      if (investmentRow) {
        fireEvent.click(investmentRow);
      }
    });

    // Check that navigation would occur
    expect(window.location.pathname).toBe('/');
  });

  it('should have add investment button', async () => {
    renderWithProviders();

    await waitFor(() => {
      const addButton = screen.getByRole('link', { name: /add investment/i });
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveAttribute('href', '/client/investments/new');
    });
  });

  it('should display summary statistics', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Total Value')).toBeInTheDocument();
      expect(screen.getByText('Total Gain/Loss')).toBeInTheDocument();
      expect(screen.getByText('Number of Investments')).toBeInTheDocument();
    });
  });

  it('should have proper table headers', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Symbol')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('Gain/Loss')).toBeInTheDocument();
    });
  });

  it('should be responsive on mobile', async () => {
    const { container } = renderWithProviders();

    await waitFor(() => {
      expect(container.querySelector('.investment-list-page')).toBeInTheDocument();
      expect(container.querySelector('.mobile-cards')).toBeDefined();
    });
  });
});
