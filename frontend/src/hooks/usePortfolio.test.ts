// frontend/src/hooks/usePortfolio.test.ts

import { renderHook, act } from '@testing-library/react-hooks';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import React from 'react';
import { usePortfolio } from './usePortfolio';
import clientReducer, { ClientState } from '@/store/slices/clientSlice';
import apiReducer from '@/store/slices/apiSlice';
import { clientService } from '@/api';
import {
  PortfolioDTO,
  InvestmentDTO,
  InvestmentStatus,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
} from '@/types/investment.types';

// Mock the client service
jest.mock('@/api', () => ({
  clientService: {
    getPortfolio: jest.fn(),
    getInvestments: jest.fn(),
    getInvestmentById: jest.fn(),
    createInvestment: jest.fn(),
    updateInvestment: jest.fn(),
    deleteInvestment: jest.fn(),
  },
}));

describe('usePortfolio', () => {
  const mockPortfolio: PortfolioDTO = {
    totalValue: 100000,
    totalGainLoss: 5000,
    totalGainLossPercentage: 5.0,
    investments: [],
    summary: {
      totalInvestments: 10,
      totalValue: 100000,
      totalCost: 95000,
      totalGainLoss: 5000,
      totalGainLossPercentage: 5.26,
      bestPerformer: {
        id: 1,
        symbol: 'AAPL',
        name: 'Apple Inc.',
        gainLossPercentage: 15.5,
      },
      worstPerformer: {
        id: 2,
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        gainLossPercentage: -8.3,
      },
    },
  };

  const mockInvestments: InvestmentDTO[] = [
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 100,
      purchasePrice: 150.00,
      currentPrice: 173.25,
      purchaseDate: '2023-01-15',
      status: InvestmentStatus.ACTIVE,
      clientId: 1,
    },
    {
      id: 2,
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      quantity: 50,
      purchasePrice: 2800.00,
      currentPrice: 2950.00,
      purchaseDate: '2023-02-20',
      status: InvestmentStatus.ACTIVE,
      clientId: 1,
    },
  ];

  // Helper to create test store
  const createTestStore = (initialClientState?: Partial<ClientState>) => {
    return configureStore({
      reducer: {
        client: clientReducer,
        api: apiReducer,
      },
      preloadedState: initialClientState ? {
        client: {
          portfolio: null,
          investments: [],
          selectedInvestment: null,
          portfolioFilter: 'all',
          loading: false,
          error: null,
          ...initialClientState,
        },
      } : undefined,
    });
  };

  // Helper to create wrapper with store
  const createWrapper = (store: ReturnType<typeof createTestStore>) => {
    return ({ children }: { children: React.ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('State Access', () => {
    it('should provide portfolio state', () => {
      const store = createTestStore({
        portfolio: mockPortfolio,
        investments: mockInvestments,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      expect(result.current.portfolio).toEqual(mockPortfolio);
      expect(result.current.investments).toEqual(mockInvestments);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide filtered investments', () => {
      const mixedInvestments = [
        ...mockInvestments,
        { ...mockInvestments[0], id: 3, status: InvestmentStatus.SOLD },
      ];
      
      const store = createTestStore({
        investments: mixedInvestments,
        portfolioFilter: 'active',
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      expect(result.current.filteredInvestments).toHaveLength(2);
      expect(result.current.filteredInvestments.every(i => i.status === InvestmentStatus.ACTIVE)).toBe(true);
    });
  });

  describe('Portfolio Operations', () => {
    it('should refresh portfolio data', async () => {
      (clientService.getPortfolio as jest.Mock).mockResolvedValueOnce(mockPortfolio);

      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      await act(async () => {
        await result.current.refreshPortfolio();
      });

      expect(clientService.getPortfolio).toHaveBeenCalled();
    });

    it('should refresh investments', async () => {
      (clientService.getInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);

      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      await act(async () => {
        await result.current.refreshInvestments();
      });

      expect(clientService.getInvestments).toHaveBeenCalled();
    });

    it('should refresh all data', async () => {
      (clientService.getPortfolio as jest.Mock).mockResolvedValueOnce(mockPortfolio);
      (clientService.getInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);

      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      await act(async () => {
        await result.current.refreshAll();
      });

      expect(clientService.getPortfolio).toHaveBeenCalled();
      expect(clientService.getInvestments).toHaveBeenCalled();
    });
  });

  describe('Investment CRUD Operations', () => {
    it('should create new investment', async () => {
      const newInvestmentData: CreateInvestmentRequest = {
        symbol: 'MSFT',
        quantity: 75,
        purchasePrice: 350.00,
        purchaseDate: '2024-01-10',
      };

      const createdInvestment: InvestmentDTO = {
        id: 3,
        ...newInvestmentData,
        name: 'Microsoft Corporation',
        currentPrice: 380.00,
        status: InvestmentStatus.ACTIVE,
        clientId: 1,
      };

      (clientService.createInvestment as jest.Mock).mockResolvedValueOnce(createdInvestment);

      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      await act(async () => {
        await result.current.addInvestment(newInvestmentData);
      });

      expect(clientService.createInvestment).toHaveBeenCalledWith(newInvestmentData);
    });

    it('should update investment', async () => {
      const updateData: UpdateInvestmentRequest = {
        quantity: 150,
        status: InvestmentStatus.SOLD,
      };

      const updatedInvestment: InvestmentDTO = {
        ...mockInvestments[0],
        ...updateData,
      };

      (clientService.updateInvestment as jest.Mock).mockResolvedValueOnce(updatedInvestment);

      const store = createTestStore({ investments: mockInvestments });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      await act(async () => {
        await result.current.updateInvestment(1, updateData);
      });

      expect(clientService.updateInvestment).toHaveBeenCalledWith(1, updateData);
    });

    it('should remove investment', async () => {
      (clientService.deleteInvestment as jest.Mock).mockResolvedValueOnce(undefined);

      const store = createTestStore({ investments: mockInvestments });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      await act(async () => {
        await result.current.removeInvestment(1);
      });

      expect(clientService.deleteInvestment).toHaveBeenCalledWith(1);
    });
  });

  describe('Investment Selection', () => {
    it('should select investment', () => {
      const store = createTestStore({ investments: mockInvestments });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      act(() => {
        result.current.selectInvestment(mockInvestments[0]);
      });

      expect(result.current.selectedInvestment).toEqual(mockInvestments[0]);
    });

    it('should get investment by id', () => {
      const store = createTestStore({ investments: mockInvestments });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      const investment = result.current.getInvestmentById(1);
      expect(investment).toEqual(mockInvestments[0]);
    });

    it('should return undefined for non-existent investment', () => {
      const store = createTestStore({ investments: mockInvestments });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      const investment = result.current.getInvestmentById(999);
      expect(investment).toBeUndefined();
    });
  });

  describe('Filtering', () => {
    it('should change portfolio filter', () => {
      const store = createTestStore();
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      act(() => {
        result.current.setFilter('active');
      });

      expect(result.current.filter).toBe('active');
    });

    it('should filter investments by status', () => {
      const mixedInvestments = [
        mockInvestments[0],
        { ...mockInvestments[1], status: InvestmentStatus.SOLD },
      ];

      const store = createTestStore({
        investments: mixedInvestments,
        portfolioFilter: 'sold',
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      expect(result.current.filteredInvestments).toHaveLength(1);
      expect(result.current.filteredInvestments[0].status).toBe(InvestmentStatus.SOLD);
    });
  });

  describe('Portfolio Calculations', () => {
    it('should calculate total portfolio value', () => {
      const store = createTestStore({
        investments: mockInvestments,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      // AAPL: 100 shares * $173.25 = $17,325
      // GOOGL: 50 shares * $2,950 = $147,500
      // Total: $164,825
      expect(result.current.totalValue).toBe(164825);
    });

    it('should calculate total gain/loss', () => {
      const store = createTestStore({
        investments: mockInvestments,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      // AAPL: 100 * ($173.25 - $150) = $2,325
      // GOOGL: 50 * ($2,950 - $2,800) = $7,500
      // Total: $9,825
      expect(result.current.totalGainLoss).toBe(9825);
    });

    it('should calculate gain/loss percentage', () => {
      const store = createTestStore({
        investments: mockInvestments,
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      // Total cost: (100 * $150) + (50 * $2,800) = $155,000
      // Total gain: $9,825
      // Percentage: ($9,825 / $155,000) * 100 = 6.34%
      expect(result.current.totalGainLossPercentage).toBeCloseTo(6.34, 2);
    });

    it('should return 0 for calculations when no investments', () => {
      const store = createTestStore({
        investments: [],
      });
      const wrapper = createWrapper(store);

      const { result } = renderHook(() => usePortfolio(), { wrapper });

      expect(result.current.totalValue).toBe(0);
      expect(result.current.totalGainLoss).toBe(0);
      expect(result.current.totalGainLossPercentage).toBe(0);
    });
  });
});
