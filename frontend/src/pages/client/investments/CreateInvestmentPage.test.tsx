// frontend/src/pages/client/investments/CreateInvestmentPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { store } from '../../../store';
import { CreateInvestmentPage } from './CreateInvestmentPage';
import { investmentApi } from '../../../services/api/investmentApi';

// Mock the investment API
vi.mock('../../../services/api/investmentApi', () => ({
  investmentApi: {
    createInvestment: vi.fn(),
    getInvestmentTypes: vi.fn(),
    searchSecurities: vi.fn(),
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

const mockInvestmentTypes = [
  'STOCK',
  'BOND',
  'MUTUAL_FUND',
  'ETF',
  'REAL_ESTATE',
  'COMMODITY',
  'CRYPTOCURRENCY',
  'OTHER',
];

const mockSecuritySearchResults = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
];

const renderWithProviders = () => {
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <CreateInvestmentPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('CreateInvestmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (investmentApi.getInvestmentTypes as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestmentTypes);
  });

  it('should render without errors', () => {
    renderWithProviders();
    expect(screen.getByText('Add New Investment')).toBeInTheDocument();
  });

  it('should fetch investment types on mount', async () => {
    renderWithProviders();

    await waitFor(() => {
      expect(investmentApi.getInvestmentTypes).toHaveBeenCalled();
    });
  });

  it('should display form fields', () => {
    renderWithProviders();

    expect(screen.getByLabelText(/investment name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/symbol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purchase price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purchase date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('should display investment type options', async () => {
    renderWithProviders();

    await waitFor(() => {
      const typeSelect = screen.getByLabelText(/type/i);
      fireEvent.click(typeSelect);
    });

    mockInvestmentTypes.forEach(type => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  it('should search for securities when typing symbol', async () => {
    (investmentApi.searchSecurities as ReturnType<typeof vi.fn>).mockResolvedValue(mockSecuritySearchResults);
    
    renderWithProviders();
    const symbolInput = screen.getByLabelText(/symbol/i);

    await userEvent.type(symbolInput, 'AAP');

    await waitFor(() => {
      expect(investmentApi.searchSecurities).toHaveBeenCalledWith('AAP');
    });
  });

  it('should show security search results', async () => {
    (investmentApi.searchSecurities as ReturnType<typeof vi.fn>).mockResolvedValue(mockSecuritySearchResults);
    
    renderWithProviders();
    const symbolInput = screen.getByLabelText(/symbol/i);

    await userEvent.type(symbolInput, 'A');

    await waitFor(() => {
      expect(screen.getByText('Apple Inc.')).toBeInTheDocument();
      expect(screen.getByText('Microsoft Corporation')).toBeInTheDocument();
    });
  });

  it('should autocomplete fields when security is selected', async () => {
    (investmentApi.searchSecurities as ReturnType<typeof vi.fn>).mockResolvedValue(mockSecuritySearchResults);
    
    renderWithProviders();
    const symbolInput = screen.getByLabelText(/symbol/i);

    await userEvent.type(symbolInput, 'A');

    await waitFor(() => {
      const appleOption = screen.getByText('Apple Inc.');
      fireEvent.click(appleOption);
    });

    expect(screen.getByLabelText(/investment name/i)).toHaveValue('Apple Inc.');
    expect(screen.getByLabelText(/symbol/i)).toHaveValue('AAPL');
  });

  it('should validate required fields', async () => {
    renderWithProviders();
    
    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/symbol is required/i)).toBeInTheDocument();
      expect(screen.getByText(/type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/quantity is required/i)).toBeInTheDocument();
      expect(screen.getByText(/purchase price is required/i)).toBeInTheDocument();
      expect(screen.getByText(/purchase date is required/i)).toBeInTheDocument();
    });
  });

  it('should validate quantity is positive', async () => {
    renderWithProviders();
    
    const quantityInput = screen.getByLabelText(/quantity/i);
    await userEvent.type(quantityInput, '-5');
    
    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/quantity must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('should validate purchase price is positive', async () => {
    renderWithProviders();
    
    const priceInput = screen.getByLabelText(/purchase price/i);
    await userEvent.type(priceInput, '-100');
    
    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/purchase price must be greater than 0/i)).toBeInTheDocument();
    });
  });

  it('should validate purchase date is not in future', async () => {
    renderWithProviders();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const dateInput = screen.getByLabelText(/purchase date/i);
    fireEvent.change(dateInput, { target: { value: tomorrowStr } });
    
    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/purchase date cannot be in the future/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockResponse = { id: 1, success: true };
    (investmentApi.createInvestment as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    renderWithProviders();

    // Fill form
    await userEvent.type(screen.getByLabelText(/investment name/i), 'Apple Inc.');
    await userEvent.type(screen.getByLabelText(/symbol/i), 'AAPL');
    await userEvent.selectOptions(screen.getByLabelText(/type/i), 'STOCK');
    await userEvent.type(screen.getByLabelText(/quantity/i), '100');
    await userEvent.type(screen.getByLabelText(/purchase price/i), '150.50');
    fireEvent.change(screen.getByLabelText(/purchase date/i), { target: { value: '2023-01-15' } });
    await userEvent.type(screen.getByLabelText(/description/i), 'Technology stock');
    await userEvent.type(screen.getByLabelText(/notes/i), 'Long-term hold');

    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(investmentApi.createInvestment).toHaveBeenCalledWith({
        name: 'Apple Inc.',
        symbol: 'AAPL',
        type: 'STOCK',
        quantity: 100,
        purchasePrice: 150.50,
        purchaseDate: '2023-01-15',
        description: 'Technology stock',
        notes: 'Long-term hold',
      });
    });
  });

  it('should navigate to investments list after successful creation', async () => {
    const mockResponse = { id: 1, success: true };
    (investmentApi.createInvestment as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    renderWithProviders();

    // Fill minimum required fields
    await userEvent.type(screen.getByLabelText(/investment name/i), 'Apple Inc.');
    await userEvent.type(screen.getByLabelText(/symbol/i), 'AAPL');
    await userEvent.selectOptions(screen.getByLabelText(/type/i), 'STOCK');
    await userEvent.type(screen.getByLabelText(/quantity/i), '100');
    await userEvent.type(screen.getByLabelText(/purchase price/i), '150.50');
    fireEvent.change(screen.getByLabelText(/purchase date/i), { target: { value: '2023-01-15' } });

    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/client/investments');
    });
  });

  it('should show loading state during submission', async () => {
    (investmentApi.createInvestment as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );
    
    renderWithProviders();

    // Fill form
    await userEvent.type(screen.getByLabelText(/investment name/i), 'Apple Inc.');
    await userEvent.type(screen.getByLabelText(/symbol/i), 'AAPL');
    await userEvent.selectOptions(screen.getByLabelText(/type/i), 'STOCK');
    await userEvent.type(screen.getByLabelText(/quantity/i), '100');
    await userEvent.type(screen.getByLabelText(/purchase price/i), '150.50');
    fireEvent.change(screen.getByLabelText(/purchase date/i), { target: { value: '2023-01-15' } });

    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/adding investment/i)).toBeInTheDocument();
    });
  });

  it('should handle submission errors', async () => {
    const error = new Error('Failed to create investment');
    (investmentApi.createInvestment as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    
    renderWithProviders();

    // Fill form
    await userEvent.type(screen.getByLabelText(/investment name/i), 'Apple Inc.');
    await userEvent.type(screen.getByLabelText(/symbol/i), 'AAPL');
    await userEvent.selectOptions(screen.getByLabelText(/type/i), 'STOCK');
    await userEvent.type(screen.getByLabelText(/quantity/i), '100');
    await userEvent.type(screen.getByLabelText(/purchase price/i), '150.50');
    fireEvent.change(screen.getByLabelText(/purchase date/i), { target: { value: '2023-01-15' } });

    const submitButton = screen.getByRole('button', { name: /add investment/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create investment/i)).toBeInTheDocument();
    });
  });

  it('should have cancel button that navigates back', () => {
    renderWithProviders();
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/client/investments');
  });

  it('should calculate total cost preview', async () => {
    renderWithProviders();

    await userEvent.type(screen.getByLabelText(/quantity/i), '100');
    await userEvent.type(screen.getByLabelText(/purchase price/i), '150.50');

    await waitFor(() => {
      expect(screen.getByText(/total cost/i)).toBeInTheDocument();
      expect(screen.getByText('$15,050.00')).toBeInTheDocument();
    });
  });

  it('should clear form when reset button is clicked', async () => {
    renderWithProviders();

    // Fill form
    await userEvent.type(screen.getByLabelText(/investment name/i), 'Apple Inc.');
    await userEvent.type(screen.getByLabelText(/symbol/i), 'AAPL');

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(screen.getByLabelText(/investment name/i)).toHaveValue('');
    expect(screen.getByLabelText(/symbol/i)).toHaveValue('');
  });
});
