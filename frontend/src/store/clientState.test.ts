// frontend/src/store/slices/clientSlice.test.ts

import { configureStore } from '@reduxjs/toolkit';
import clientReducer, {
  fetchPortfolio,
  fetchInvestments,
  fetchInvestmentById,
  createInvestment,
  updateInvestment,
  deleteInvestment,
  setSelectedInvestment,
  clearSelectedInvestment,
  setPortfolioFilter,
  selectClient,
  selectPortfolio,
  selectInvestments,
  selectSelectedInvestment,
  selectPortfolioFilter,
  selectFilteredInvestments,
  ClientState,
} from './clientSlice';
import { clientService } from '@/api';
import {
  PortfolioDTO,
  InvestmentDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentStatus,
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

describe('clientSlice', () => {
  let store: ReturnType<typeof configureStore>;

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

  beforeEach(() => {
    store = configureStore({
      reducer: {
        client: clientReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().client;
      expect(state).toEqual({
        portfolio: null,
        investments: [],
        selectedInvestment: null,
        portfolioFilter: 'all',
        loading: false,
        error: null,
      });
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle setSelectedInvestment', () => {
      const investment = mockInvestments[0];
      store.dispatch(setSelectedInvestment(investment));
      
      expect(store.getState().client.selectedInvestment).toEqual(investment);
    });

    it('should handle clearSelectedInvestment', () => {
      store.dispatch(setSelectedInvestment(mockInvestments[0]));
      store.dispatch(clearSelectedInvestment());
      
      expect(store.getState().client.selectedInvestment).toBeNull();
    });

    it('should handle setPortfolioFilter', () => {
      store.dispatch(setPortfolioFilter('active'));
      expect(store.getState().client.portfolioFilter).toBe('active');

      store.dispatch(setPortfolioFilter('sold'));
      expect(store.getState().client.portfolioFilter).toBe('sold');
    });
  });

  describe('Async Actions', () => {
    describe('fetchPortfolio', () => {
      it('should handle successful portfolio fetch', async () => {
        (clientService.getPortfolio as jest.Mock).mockResolvedValueOnce(mockPortfolio);

        await store.dispatch(fetchPortfolio() as any);
        const state = store.getState().client;

        expect(clientService.getPortfolio).toHaveBeenCalled();
        expect(state.portfolio).toEqual(mockPortfolio);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle portfolio fetch failure', async () => {
        const error = new Error('Failed to fetch portfolio');
        (clientService.getPortfolio as jest.Mock).mockRejectedValueOnce(error);

        await store.dispatch(fetchPortfolio() as any);
        const state = store.getState().client;

        expect(state.portfolio).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to fetch portfolio');
      });
    });

    describe('fetchInvestments', () => {
      it('should handle successful investments fetch', async () => {
        (clientService.getInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);

        await store.dispatch(fetchInvestments() as any);
        const state = store.getState().client;

        expect(clientService.getInvestments).toHaveBeenCalled();
        expect(state.investments).toEqual(mockInvestments);
        expect(state.loading).toBe(false);
      });

      it('should handle investments fetch with status filter', async () => {
        (clientService.getInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);

        await store.dispatch(fetchInvestments(InvestmentStatus.ACTIVE) as any);

        expect(clientService.getInvestments).toHaveBeenCalledWith(InvestmentStatus.ACTIVE);
      });
    });

    describe('fetchInvestmentById', () => {
      it('should handle successful single investment fetch', async () => {
        const investment = mockInvestments[0];
        (clientService.getInvestmentById as jest.Mock).mockResolvedValueOnce(investment);

        await store.dispatch(fetchInvestmentById(1) as any);
        const state = store.getState().client;

        expect(clientService.getInvestmentById).toHaveBeenCalledWith(1);
        expect(state.selectedInvestment).toEqual(investment);
      });
    });

    describe('createInvestment', () => {
      it('should handle successful investment creation', async () => {
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

        await store.dispatch(createInvestment(newInvestmentData) as any);
        const state = store.getState().client;

        expect(clientService.createInvestment).toHaveBeenCalledWith(newInvestmentData);
        expect(state.investments).toContainEqual(createdInvestment);
      });
    });

    describe('updateInvestment', () => {
      it('should handle successful investment update', async () => {
        // Set initial investments
        (clientService.getInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);
        await store.dispatch(fetchInvestments() as any);

        const updateData: UpdateInvestmentRequest = {
          quantity: 150,
          status: InvestmentStatus.SOLD,
        };

        const updatedInvestment: InvestmentDTO = {
          ...mockInvestments[0],
          ...updateData,
        };

        (clientService.updateInvestment as jest.Mock).mockResolvedValueOnce(updatedInvestment);

        await store.dispatch(updateInvestment({ id: 1, data: updateData }) as any);
        const state = store.getState().client;

        expect(clientService.updateInvestment).toHaveBeenCalledWith(1, updateData);
        
        const investment = state.investments.find(i => i.id === 1);
        expect(investment?.quantity).toBe(150);
        expect(investment?.status).toBe(InvestmentStatus.SOLD);
      });
    });

    describe('deleteInvestment', () => {
      it('should handle successful investment deletion', async () => {
        // Set initial investments
        (clientService.getInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);
        await store.dispatch(fetchInvestments() as any);

        (clientService.deleteInvestment as jest.Mock).mockResolvedValueOnce(undefined);

        await store.dispatch(deleteInvestment(1) as any);
        const state = store.getState().client;

        expect(clientService.deleteInvestment).toHaveBeenCalledWith(1);
        expect(state.investments).toHaveLength(1);
        expect(state.investments.find(i => i.id === 1)).toBeUndefined();
      });

      it('should clear selected investment if deleted', async () => {
        // Set initial state
        (clientService.getInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);
        await store.dispatch(fetchInvestments() as any);
        store.dispatch(setSelectedInvestment(mockInvestments[0]));

        (clientService.deleteInvestment as jest.Mock).mockResolvedValueOnce(undefined);

        await store.dispatch(deleteInvestment(1) as any);
        const state = store.getState().client;

        expect(state.selectedInvestment).toBeNull();
      });
    });
  });

  describe('Selectors', () => {
    const mockState = {
      client: {
        portfolio: mockPortfolio,
        investments: mockInvestments,
        selectedInvestment: mockInvestments[0],
        portfolioFilter: 'active',
        loading: false,
        error: null,
      } as ClientState,
    };

    it('should select client state', () => {
      expect(selectClient(mockState as any)).toEqual(mockState.client);
    });

    it('should select portfolio', () => {
      expect(selectPortfolio(mockState as any)).toEqual(mockPortfolio);
    });

    it('should select investments', () => {
      expect(selectInvestments(mockState as any)).toEqual(mockInvestments);
    });

    it('should select selected investment', () => {
      expect(selectSelectedInvestment(mockState as any)).toEqual(mockInvestments[0]);
    });

    it('should select portfolio filter', () => {
      expect(selectPortfolioFilter(mockState as any)).toBe('active');
    });

    it('should select filtered investments - all', () => {
      const stateWithAllFilter = {
        ...mockState,
        client: { ...mockState.client, portfolioFilter: 'all' },
      };
      const filtered = selectFilteredInvestments(stateWithAllFilter as any);
      expect(filtered).toEqual(mockInvestments);
    });

    it('should select filtered investments - active only', () => {
      const mixedInvestments = [
        ...mockInvestments,
        { ...mockInvestments[0], id: 3, status: InvestmentStatus.SOLD },
      ];
      const stateWithMixed = {
        client: {
          ...mockState.client,
          investments: mixedInvestments,
          portfolioFilter: 'active',
        },
      };
      
      const filtered = selectFilteredInvestments(stateWithMixed as any);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(i => i.status === InvestmentStatus.ACTIVE)).toBe(true);
    });

    it('should select filtered investments - sold only', () => {
      const mixedInvestments = [
        { ...mockInvestments[0], status: InvestmentStatus.SOLD },
        mockInvestments[1],
      ];
      const stateWithMixed = {
        client: {
          ...mockState.client,
          investments: mixedInvestments,
          portfolioFilter: 'sold',
        },
      };
      
      const filtered = selectFilteredInvestments(stateWithMixed as any);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].status).toBe(InvestmentStatus.SOLD);
    });
  });
});
