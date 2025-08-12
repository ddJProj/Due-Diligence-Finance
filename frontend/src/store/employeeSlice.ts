// frontend/src/store/slices/employeeSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { employeeService } from '@/api';
import {
  ClientDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentDTO,
  CreateMessageRequest,
} from '@/types';
import { RootState } from '../store';

export interface EmployeeState {
  clients: ClientDTO[];
  selectedClient: ClientDTO | null;
  dashboardStats: any | null; // Define proper type when available
  clientInvestments: InvestmentDTO[];
  clientFilter: 'all' | 'active' | 'inactive';
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  clients: [],
  selectedClient: null,
  dashboardStats: null,
  clientInvestments: [],
  clientFilter: 'all',
  loading: false,
  error: null,
};

// Async thunks
export const fetchClients = createAsyncThunk(
  'employee/fetchClients',
  async () => {
    const response = await employeeService.getClients();
    return response;
  }
);

export const fetchClientById = createAsyncThunk(
  'employee/fetchClientById',
  async (clientId: number, { dispatch }) => {
    const client = await employeeService.getClientById(clientId);
    // Also fetch client's investments
    const investments = await employeeService.getClientInvestments(clientId);
    dispatch(setClientInvestments(investments));
    return client;
  }
);

export const fetchDashboardStats = createAsyncThunk(
  'employee/fetchDashboardStats',
  async () => {
    const response = await employeeService.getDashboardStats();
    return response;
  }
);

export const createClientInvestment = createAsyncThunk(
  'employee/createClientInvestment',
  async ({ clientId, data }: { clientId: number; data: CreateInvestmentRequest }) => {
    const response = await employeeService.createInvestmentForClient(clientId, data);
    return response;
  }
);

export const updateClientInvestment = createAsyncThunk(
  'employee/updateClientInvestment',
  async ({ 
    clientId, 
    investmentId, 
    data 
  }: { 
    clientId: number; 
    investmentId: number; 
    data: UpdateInvestmentRequest 
  }) => {
    const response = await employeeService.updateInvestmentForClient(clientId, investmentId, data);
    return response;
  }
);

export const deleteClientInvestment = createAsyncThunk(
  'employee/deleteClientInvestment',
  async ({ clientId, investmentId }: { clientId: number; investmentId: number }) => {
    await employeeService.deleteInvestmentForClient(clientId, investmentId);
    return investmentId;
  }
);

export const sendMessageToClient = createAsyncThunk(
  'employee/sendMessageToClient',
  async (data: CreateMessageRequest) => {
    const response = await employeeService.sendMessageToClient(data);
    return response;
  }
);

// Slice
const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {
    setSelectedClient: (state, action: PayloadAction<ClientDTO>) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
      state.clientInvestments = [];
    },
    setClientFilter: (state, action: PayloadAction<'all' | 'active' | 'inactive'>) => {
      state.clientFilter = action.payload;
    },
    setClientInvestments: (state, action: PayloadAction<InvestmentDTO[]>) => {
      state.clientInvestments = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Clients
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch clients';
      });

    // Fetch Client By Id
    builder
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch client';
      });

    // Fetch Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      });

    // Create Client Investment
    builder
      .addCase(createClientInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClientInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.clientInvestments.push(action.payload);
      })
      .addCase(createClientInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create investment';
      });

    // Update Client Investment
    builder
      .addCase(updateClientInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClientInvestment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clientInvestments.findIndex(i => i.id === action.payload.id);
        if (index !== -1) {
          state.clientInvestments[index] = action.payload;
        }
      })
      .addCase(updateClientInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update investment';
      });

    // Delete Client Investment
    builder
      .addCase(deleteClientInvestment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClientInvestment.fulfilled, (state, action) => {
        state.loading = false;
        state.clientInvestments = state.clientInvestments.filter(i => i.id !== action.payload);
      })
      .addCase(deleteClientInvestment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete investment';
      });

    // Send Message to Client
    builder
      .addCase(sendMessageToClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessageToClient.fulfilled, (state) => {
        state.loading = false;
        // Message sent successfully, no state update needed
      })
      .addCase(sendMessageToClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      });
  },
});

// Actions
export const {
  setSelectedClient,
  clearSelectedClient,
  setClientFilter,
  setClientInvestments,
} = employeeSlice.actions;

// Selectors
export const selectEmployee = (state: RootState) => state.employee;
export const selectClients = (state: RootState) => state.employee.clients;
export const selectSelectedClient = (state: RootState) => state.employee.selectedClient;
export const selectDashboardStats = (state: RootState) => state.employee.dashboardStats;
export const selectClientFilter = (state: RootState) => state.employee.clientFilter;
export const selectClientInvestments = (state: RootState) => state.employee.clientInvestments;

// Filtered clients selector
export const selectFilteredClients = (state: RootState) => {
  const { clients, clientFilter } = state.employee;
  
  // Since ClientDTO doesn't have a status field in current types,
  // we'll return all clients for now. This can be updated when
  // the backend adds client status.
  switch (clientFilter) {
    case 'active':
    case 'inactive':
    case 'all':
    default:
      return clients;
  }
};

// Reducer
export default employeeSlice.reducer;
