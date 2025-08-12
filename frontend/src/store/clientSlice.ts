// frontend/src/store/slices/clientSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { clientService } from '@/api';
import {
  PortfolioDTO,
  InvestmentDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentStatus,
} from '@/types/investment.types';
import { RootState } from '../store';

export interface ClientState {
  portfolio: PortfolioDTO | null;
  investments: InvestmentDTO[];
  selectedInvestment: InvestmentDTO | null;
  portfolioFilter: 'all' | 'active' | 'sold';
  loading: boolean;
  error: string | null;
}

const initialState: ClientState = {
  portfolio: null,
  investments: [],
  selectedInvestment: null,
  portfolioFilter: 'all',
  loading: false,
  error: null,
};

// Async thunks
export const fetchPortfolio = createAsyncThunk(
  'client/fetchPortfolio',
  async () => {
    const response = await clientService.getPortfolio();
    return response;
  }
);

export const fetchInvestments = createAsyncThunk(
  'client/fetchInvestments',
  async (status?: InvestmentStatus) => {
    const response = await clientService.getInvestments(status);
    return response;
  }
);

export const fetchInvestmentById = createAsyncThunk(
  'client/fetchInvestmentById',
  async (id: number) => {
    const response = await clientService.getInvestmentById(id);
    return response;
  }
);

export const createInvestment = createAsyncThunk(
  'client/createInvestment',
  async (data: CreateInvestmentRequest) => {
    const response = await clientService.createInvestment(data);
    return response;
  }
);

export const updateInvestment = createAsyncThunk(
  'client/updateInvestment',
  async ({ id, data }: { id: number; data: UpdateInvestmentRequest }) => {
    const response = await clientService.updateInvestment(id, data);
    return response;
  }
);

export const deleteInvestment = createAsyncThunk(
  'client/deleteInvestment',
  async (id: number) => {
    await clientService.deleteInvestment(id);
    return id;
  }
);

// Slice
const clientSlice = createSlice({
  name: 'client',
  initialState,
  reducers: {
    setSelectedInvestment: (state, action: PayloadAction<InvestmentDTO>) => {
      state.selectedInvestment = action.payload;
    },
    clearSelectedInvestment: (state) => {
      state.selectedInvestment = null;
    },
    setPortfolioFilter: (state, action: PayloadAction<'all' | 'active' | 'sold'>) => {
      state.portfolioFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Portfolio
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.portfolio = action.payload;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch portfolio';
      });

    // Fetch Investments
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = action.payload;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investments';
      });

    // Fetch Investment By Id
    builder
      .addCase(fetchInvestmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvestmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInvestment = action.payload;
      })
      .addCase(fetchInvestmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch investment';
      });

    // Create Investment
    builder
      .addCase(createInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.investments.push(action.payload);
      })
      .addCase(createInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create investment';
      });

    // Update Investment
    builder
      .addCase(updateInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.investments.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.investments[index] = action.payload;
        }
        // Update selected investment if it's the one being updated
        if (state.selectedInvestment?.id === action.payload.id) {
          state.selectedInvestment = action.payload;
        }
      })
      .addCase(updateInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update investment';
      });

    // Delete Investment
    builder
      .addCase(deleteInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.investments = state.investments.filter(i => i.id !== action.payload);
        // Clear selected investment if it was deleted
        if (state.selectedInvestment?.id === action.payload) {
          state.selectedInvestment = null;
        }
      })
      .addCase(deleteInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete investment';
      });
  },
});

// Actions
export const {
  setSelectedInvestment,
  clearSelectedInvestment,
  setPortfolioFilter,
} = clientSlice.actions;

// Selectors
export const selectClient = (state: RootState) => state.client;
export const selectPortfolio = (state: RootState) => state.client.portfolio;
export const selectInvestments = (state: RootState) => state.client.investments;
export const selectSelectedInvestment = (state: RootState) => state.client.selectedInvestment;
export const selectPortfolioFilter = (state: RootState) => state.client.portfolioFilter;

// Filtered investments selector
export const selectFilteredInvestments = (state: RootState) => {
  const { investments, portfolioFilter } = state.client;
  
  switch (portfolioFilter) {
    case 'active':
      return investments.filter(i => i.status === InvestmentStatus.ACTIVE);
    case 'sold':
      return investments.filter(i => i.status === InvestmentStatus.SOLD);
    case 'all':
    default:
      return investments;
  }
};

// Reducer
export default clientSlice.reducer;
