// frontend/src/pages/client/investments/InvestmentDetailsPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import { store } from '../../../store';
import { InvestmentDetailsPage } from './InvestmentDetailsPage';
import { investmentApi } from '../../../services/api/investmentApi';

// Mock the investment API
vi.mock('../../../services/api/investmentApi', () => ({
  investmentApi: {
    getInvestmentById: vi.fn(),
    updateInvestment: vi.fn(),
    deleteInvestment: vi.fn(),
    getInvestmentHistory: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockInvestment = {
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
  description: 'Technology company focused on consumer electronics',
  notes: 'Long-term investment for portfolio growth',
  sector: 'Technology',
  exchange: 'NASDAQ',
  lastUpdated: '2024-01-15T10:30:00Z',
};

const mockHistory = [
  {
    date: '2024-01-15',
    price: 175.50,
    value: 17550.00,
    dayChange: 250.00,
    dayChangePercentage: 1.45,
  },
  {
    date: '2024-01-14',
    price: 173.00,
    value: 17300.00,
    dayChange: -100.00,
    dayChangePercentage: -0.57,
  },
  {
    date: '2024-01-13',
    price: 174.00,
    value: 17400.00,
    dayChange: 150.00,
    dayChangePercentage: 0.87,
  },
];

const renderWithRouter = (investmentId = '1') => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/client/investments/${investmentId}`]}>
        <Routes>
          <Route path="/client/investments/:id" element={<InvestmentDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('InvestmentDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment);
    (investmentApi.getInvestmentHistory as ReturnType<typeof vi.fn>).mockResolvedValue(mockHistory);
  });

  it('should render without errors', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
    });
  });

  it('should fetch investment details on mount', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(investmentApi.getInvestmentById).toHaveBeenCalledWith(1);
      expect(investmentApi.getInvestmentHistory).toHaveBeenCalledWith(1);
    });
  });

  it('should display investment information', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('STOCK')).toBeInTheDocument();
      expect(screen.getByText('Technology')).toBeInTheDocument();
      expect(screen.getByText('NASDAQ')).toBeInTheDocument();
    });
  });

  it('should display financial metrics', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Current Value')).toBeInTheDocument();
      expect(screen.getByText('$17,550.00')).toBeInTheDocument();
      expect(screen.getByText('Total Gain/Loss')).toBeInTheDocument();
      expect(screen.getByText('+$2,550.00')).toBeInTheDocument();
      expect(screen.getByText('+17.00%')).toBeInTheDocument();
    });
  });

  it('should display quantity and prices', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Purchase Price')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
      expect(screen.getByText('Current Price')).toBeInTheDocument();
      expect(screen.getByText('$175.50')).toBeInTheDocument();
    });
  });

  it('should display investment description and notes', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Technology company focused on consumer electronics')).toBeInTheDocument();
      expect(screen.getByText('Long-term investment for portfolio growth')).toBeInTheDocument();
    });
  });

  it('should display price history', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('Price History')).toBeInTheDocument();
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('$175.50')).toBeInTheDocument();
      expect(screen.getByText('+1.45%')).toBeInTheDocument();
    });
  });

  it('should have edit button', async () => {
    renderWithRouter();

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit investment/i });
      expect(editButton).toBeInTheDocument();
    });
  });

  it('should navigate to edit page when edit button is clicked', async () => {
    renderWithRouter();

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit investment/i });
      fireEvent.click(editButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/client/investments/1/edit');
  });

  it('should have delete button', async () => {
    renderWithRouter();

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete investment/i });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it('should show confirmation dialog when delete is clicked', async () => {
    renderWithRouter();

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete investment/i });
      fireEvent.click(deleteButton);
    });

    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should delete investment when confirmed', async () => {
    (investmentApi.deleteInvestment as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    
    renderWithRouter();

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete investment/i });
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(investmentApi.deleteInvestment).toHaveBeenCalledWith(1);
      expect(mockNavigate).toHaveBeenCalledWith('/client/investments');
    });
  });

  it('should have back button', async () => {
    renderWithRouter();

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to investments/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  it('should navigate back when back button is clicked', async () => {
    renderWithRouter();

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back to investments/i });
      fireEvent.click(backButton);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/client/investments');
  });

  it('should show loading state', () => {
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    renderWithRouter();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading investment details...')).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to fetch investment');
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load investment details/)).toBeInTheDocument();
    });
  });

  it('should handle 404 not found', async () => {
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Investment not found/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to investments/i })).toBeInTheDocument();
    });
  });

  it('should display last updated time', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('should handle negative gains correctly', async () => {
    const negativeInvestment = {
      ...mockInvestment,
      gainLoss: -1000.00,
      gainLossPercentage: -6.67,
    };

    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockResolvedValue(negativeInvestment);
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText('-$1,000.00')).toBeInTheDocument();
      expect(screen.getByText('-6.67%')).toBeInTheDocument();
    });
  });
});
