// frontend/src/pages/client/investments/EditInvestmentPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { store } from '../../../store';
import { EditInvestmentPage } from './EditInvestmentPage';
import { investmentApi } from '../../../services/api/investmentApi';

// Mock the investment API
vi.mock('../../../services/api/investmentApi', () => ({
  investmentApi: {
    getInvestmentById: vi.fn(),
    updateInvestment: vi.fn(),
    getInvestmentTypes: vi.fn(),
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
  purchaseDate: '2023-01-15',
  description: 'Technology company',
  notes: 'Long-term hold',
};

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

const renderWithRouter = (investmentId = '1') => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/client/investments/${investmentId}/edit`]}>
        <Routes>
          <Route path="/client/investments/:id/edit" element={<EditInvestmentPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('EditInvestmentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestment);
    (investmentApi.getInvestmentTypes as ReturnType<typeof vi.fn>).mockResolvedValue(mockInvestmentTypes);
  });

  it('should render without errors', async () => {
    renderWithRouter();
    
    await waitFor(() => {
      expect(screen.getByText('Edit Investment')).toBeInTheDocument();
    });
  });

  it('should fetch investment data on mount', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(investmentApi.getInvestmentById).toHaveBeenCalledWith(1);
      expect(investmentApi.getInvestmentTypes).toHaveBeenCalled();
    });
  });

  it('should populate form with existing investment data', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByLabelText(/investment name/i)).toHaveValue('Apple Inc.');
      expect(screen.getByLabelText(/symbol/i)).toHaveValue('AAPL');
      expect(screen.getByLabelText(/type/i)).toHaveValue('STOCK');
      expect(screen.getByLabelText(/quantity/i)).toHaveValue('100');
      expect(screen.getByLabelText(/purchase price/i)).toHaveValue('150');
      expect(screen.getByLabelText(/purchase date/i)).toHaveValue('2023-01-15');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Technology company');
      expect(screen.getByLabelText(/notes/i)).toHaveValue('Long-term hold');
    });
  });

  it('should disable symbol field', async () => {
    renderWithRouter();

    await waitFor(() => {
      const symbolInput = screen.getByLabelText(/symbol/i);
      expect(symbolInput).toBeDisabled();
    });
  });

  it('should update form fields when changed', async () => {
    renderWithRouter();

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/investment name/i);
      expect(nameInput).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/investment name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Apple Corporation');

    expect(nameInput).toHaveValue('Apple Corporation');
  });

  it('should validate required fields', async () => {
    renderWithRouter();

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/investment name/i);
      expect(nameInput).toBeInTheDocument();
    });

    // Clear required fields
    const nameInput = screen.getByLabelText(/investment name/i);
    const quantityInput = screen.getByLabelText(/quantity/i);
    const priceInput = screen.getByLabelText(/purchase price/i);

    await userEvent.clear(nameInput);
    await userEvent.clear(quantityInput);
    await userEvent.clear(priceInput);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/quantity is required/i)).toBeInTheDocument();
      expect(screen.getByText(/purchase price is required/i)).toBeInTheDocument();
    });
  });

  it('should submit form with updated data', async () => {
    const mockResponse = { id: 1, success: true };
    (investmentApi.updateInvestment as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    renderWithRouter();

    await waitFor(() => {
      const quantityInput = screen.getByLabelText(/quantity/i);
      expect(quantityInput).toBeInTheDocument();
    });

    // Update quantity
    const quantityInput = screen.getByLabelText(/quantity/i);
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '150');

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(investmentApi.updateInvestment).toHaveBeenCalledWith(1, {
        name: 'Apple Inc.',
        type: 'STOCK',
        quantity: 150,
        purchasePrice: 150,
        purchaseDate: '2023-01-15',
        description: 'Technology company',
        notes: 'Long-term hold',
      });
    });
  });

  it('should navigate to investment details after successful update', async () => {
    const mockResponse = { id: 1, success: true };
    (investmentApi.updateInvestment as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);
    
    renderWithRouter();

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      expect(submitButton).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/client/investments/1');
    });
  });

  it('should show loading state during submission', async () => {
    (investmentApi.updateInvestment as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );
    
    renderWithRouter();

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      expect(submitButton).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/saving changes/i)).toBeInTheDocument();
    });
  });

  it('should handle submission errors', async () => {
    const error = new Error('Failed to update investment');
    (investmentApi.updateInvestment as ReturnType<typeof vi.fn>).mockRejectedValue(error);
    
    renderWithRouter();

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /save changes/i });
      expect(submitButton).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update investment/i)).toBeInTheDocument();
    });
  });

  it('should have cancel button that navigates back', async () => {
    renderWithRouter();

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/client/investments/1');
  });

  it('should show loading state while fetching data', () => {
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockImplementation(() => 
      new Promise(() => {}) // Never resolves
    );

    renderWithRouter();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading investment data...')).toBeInTheDocument();
  });

  it('should handle investment not found', async () => {
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/Investment not found/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to investments/i })).toBeInTheDocument();
    });
  });

  it('should handle error loading investment', async () => {
    const error = new Error('Failed to fetch investment');
    (investmentApi.getInvestmentById as ReturnType<typeof vi.fn>).mockRejectedValue(error);

    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/failed to load investment data/i)).toBeInTheDocument();
    });
  });

  it('should calculate and display total cost', async () => {
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByText(/total cost/i)).toBeInTheDocument();
      expect(screen.getByText('$15,000.00')).toBeInTheDocument();
    });
  });

  it('should update total cost when quantity or price changes', async () => {
    renderWithRouter();

    await waitFor(() => {
      const quantityInput = screen.getByLabelText(/quantity/i);
      expect(quantityInput).toBeInTheDocument();
    });

    const quantityInput = screen.getByLabelText(/quantity/i);
    await userEvent.clear(quantityInput);
    await userEvent.type(quantityInput, '200');

    await waitFor(() => {
      expect(screen.getByText('$30,000.00')).toBeInTheDocument();
    });
  });

  it('should reset form to original values', async () => {
    renderWithRouter();

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/investment name/i);
      expect(nameInput).toBeInTheDocument();
    });

    // Change name
    const nameInput = screen.getByLabelText(/investment name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Changed Name');

    // Reset
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(nameInput).toHaveValue('Apple Inc.');
  });
});
