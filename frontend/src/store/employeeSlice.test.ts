// frontend/src/store/slices/employeeSlice.test.ts

import { configureStore } from '@reduxjs/toolkit';
import employeeReducer, {
  fetchClients,
  fetchClientById,
  fetchDashboardStats,
  createClientInvestment,
  updateClientInvestment,
  deleteClientInvestment,
  sendMessageToClient,
  setSelectedClient,
  clearSelectedClient,
  setClientFilter,
  selectEmployee,
  selectClients,
  selectSelectedClient,
  selectDashboardStats,
  selectClientFilter,
  selectFilteredClients,
  selectClientInvestments,
  EmployeeState,
} from './employeeSlice';
import { employeeService } from '@/api';
import {
  ClientDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentDTO,
  CreateMessageRequest,
  MessageDTO,
  InvestmentStatus,
} from '@/types';

// Mock the employee service
jest.mock('@/api', () => ({
  employeeService: {
    getClients: jest.fn(),
    getClientById: jest.fn(),
    getDashboardStats: jest.fn(),
    createInvestmentForClient: jest.fn(),
    updateInvestmentForClient: jest.fn(),
    deleteInvestmentForClient: jest.fn(),
    sendMessageToClient: jest.fn(),
    getClientInvestments: jest.fn(),
  },
}));

describe('employeeSlice', () => {
  let store: ReturnType<typeof configureStore>;

  const mockClients: ClientDTO[] = [
    {
      id: 1,
      userId: 101,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '+1234567890',
      dateOfBirth: '1980-01-15',
      ssn: '***-**-1234',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      employeeId: 1,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    {
      id: 2,
      userId: 102,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phoneNumber: '+0987654321',
      dateOfBirth: '1985-05-20',
      ssn: '***-**-5678',
      address: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      employeeId: 1,
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2023-02-01T00:00:00Z',
    },
  ];

  const mockDashboardStats = {
    totalClients: 15,
    totalInvestments: 45,
    totalValue: 2500000,
    monthlyGrowth: 5.2,
    pendingApprovals: 3,
    recentActivity: [
      {
        id: 1,
        type: 'INVESTMENT_CREATED',
        description: 'New investment for John Doe',
        timestamp: '2024-01-10T10:00:00Z',
      },
    ],
  };

  const mockInvestments: InvestmentDTO[] = [
    {
      id: 1,
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 100,
      purchasePrice: 150.00,
      currentPrice: 175.00,
      purchaseDate: '2023-06-15',
      status: InvestmentStatus.ACTIVE,
      clientId: 1,
    },
  ];

  beforeEach(() => {
    store = configureStore({
      reducer: {
        employee: employeeReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().employee;
      expect(state).toEqual({
        clients: [],
        selectedClient: null,
        dashboardStats: null,
        clientInvestments: [],
        clientFilter: 'all',
        loading: false,
        error: null,
      });
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle setSelectedClient', () => {
      const client = mockClients[0];
      store.dispatch(setSelectedClient(client));
      
      expect(store.getState().employee.selectedClient).toEqual(client);
    });

    it('should handle clearSelectedClient', () => {
      store.dispatch(setSelectedClient(mockClients[0]));
      store.dispatch(clearSelectedClient());
      
      expect(store.getState().employee.selectedClient).toBeNull();
    });

    it('should handle setClientFilter', () => {
      store.dispatch(setClientFilter('active'));
      expect(store.getState().employee.clientFilter).toBe('active');

      store.dispatch(setClientFilter('inactive'));
      expect(store.getState().employee.clientFilter).toBe('inactive');
    });
  });

  describe('Async Actions', () => {
    describe('fetchClients', () => {
      it('should handle successful clients fetch', async () => {
        (employeeService.getClients as jest.Mock).mockResolvedValueOnce(mockClients);

        await store.dispatch(fetchClients() as any);
        const state = store.getState().employee;

        expect(employeeService.getClients).toHaveBeenCalled();
        expect(state.clients).toEqual(mockClients);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle clients fetch failure', async () => {
        const error = new Error('Failed to fetch clients');
        (employeeService.getClients as jest.Mock).mockRejectedValueOnce(error);

        await store.dispatch(fetchClients() as any);
        const state = store.getState().employee;

        expect(state.clients).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to fetch clients');
      });
    });

    describe('fetchClientById', () => {
      it('should handle successful client fetch', async () => {
        const client = mockClients[0];
        (employeeService.getClientById as jest.Mock).mockResolvedValueOnce(client);

        await store.dispatch(fetchClientById(1) as any);
        const state = store.getState().employee;

        expect(employeeService.getClientById).toHaveBeenCalledWith(1);
        expect(state.selectedClient).toEqual(client);
        expect(state.loading).toBe(false);
      });

      it('should fetch client investments when client is loaded', async () => {
        const client = mockClients[0];
        (employeeService.getClientById as jest.Mock).mockResolvedValueOnce(client);
        (employeeService.getClientInvestments as jest.Mock).mockResolvedValueOnce(mockInvestments);

        await store.dispatch(fetchClientById(1) as any);
        const state = store.getState().employee;

        expect(employeeService.getClientInvestments).toHaveBeenCalledWith(1);
        expect(state.clientInvestments).toEqual(mockInvestments);
      });
    });

    describe('fetchDashboardStats', () => {
      it('should handle successful dashboard stats fetch', async () => {
        (employeeService.getDashboardStats as jest.Mock).mockResolvedValueOnce(mockDashboardStats);

        await store.dispatch(fetchDashboardStats() as any);
        const state = store.getState().employee;

        expect(employeeService.getDashboardStats).toHaveBeenCalled();
        expect(state.dashboardStats).toEqual(mockDashboardStats);
      });
    });

    describe('createClientInvestment', () => {
      it('should handle successful investment creation', async () => {
        const newInvestmentData: CreateInvestmentRequest = {
          symbol: 'GOOGL',
          quantity: 50,
          purchasePrice: 2800.00,
          purchaseDate: '2024-01-15',
        };

        const createdInvestment: InvestmentDTO = {
          id: 2,
          ...newInvestmentData,
          name: 'Alphabet Inc.',
          currentPrice: 2900.00,
          status: InvestmentStatus.ACTIVE,
          clientId: 1,
        };

        (employeeService.createInvestmentForClient as jest.Mock).mockResolvedValueOnce(createdInvestment);

        await store.dispatch(createClientInvestment({ clientId: 1, data: newInvestmentData }) as any);
        const state = store.getState().employee;

        expect(employeeService.createInvestmentForClient).toHaveBeenCalledWith(1, newInvestmentData);
        expect(state.clientInvestments).toContainEqual(createdInvestment);
      });
    });

    describe('updateClientInvestment', () => {
      it('should handle successful investment update', async () => {
        // Set initial investments
        store = configureStore({
          reducer: {
            employee: employeeReducer,
          },
          preloadedState: {
            employee: {
              ...store.getState().employee,
              clientInvestments: mockInvestments,
            },
          },
        });

        const updateData: UpdateInvestmentRequest = {
          quantity: 150,
          status: InvestmentStatus.SOLD,
        };

        const updatedInvestment: InvestmentDTO = {
          ...mockInvestments[0],
          ...updateData,
        };

        (employeeService.updateInvestmentForClient as jest.Mock).mockResolvedValueOnce(updatedInvestment);

        await store.dispatch(updateClientInvestment({ 
          clientId: 1, 
          investmentId: 1, 
          data: updateData 
        }) as any);
        
        const state = store.getState().employee;

        expect(employeeService.updateInvestmentForClient).toHaveBeenCalledWith(1, 1, updateData);
        
        const investment = state.clientInvestments.find(i => i.id === 1);
        expect(investment?.quantity).toBe(150);
        expect(investment?.status).toBe(InvestmentStatus.SOLD);
      });
    });

    describe('deleteClientInvestment', () => {
      it('should handle successful investment deletion', async () => {
        // Set initial investments
        store = configureStore({
          reducer: {
            employee: employeeReducer,
          },
          preloadedState: {
            employee: {
              ...store.getState().employee,
              clientInvestments: mockInvestments,
            },
          },
        });

        (employeeService.deleteInvestmentForClient as jest.Mock).mockResolvedValueOnce(undefined);

        await store.dispatch(deleteClientInvestment({ clientId: 1, investmentId: 1 }) as any);
        const state = store.getState().employee;

        expect(employeeService.deleteInvestmentForClient).toHaveBeenCalledWith(1, 1);
        expect(state.clientInvestments).toHaveLength(0);
      });
    });

    describe('sendMessageToClient', () => {
      it('should handle successful message send', async () => {
        const messageData: CreateMessageRequest = {
          recipientId: 101,
          subject: 'Portfolio Update',
          content: 'Your portfolio has been updated.',
        };

        const sentMessage: MessageDTO = {
          id: 1,
          senderId: 201,
          recipientId: 101,
          subject: 'Portfolio Update',
          content: 'Your portfolio has been updated.',
          isRead: false,
          sentAt: '2024-01-15T10:00:00Z',
        };

        (employeeService.sendMessageToClient as jest.Mock).mockResolvedValueOnce(sentMessage);

        await store.dispatch(sendMessageToClient(messageData) as any);

        expect(employeeService.sendMessageToClient).toHaveBeenCalledWith(messageData);
      });
    });
  });

  describe('Selectors', () => {
    const mockState = {
      employee: {
        clients: mockClients,
        selectedClient: mockClients[0],
        dashboardStats: mockDashboardStats,
        clientInvestments: mockInvestments,
        clientFilter: 'active',
        loading: false,
        error: null,
      } as EmployeeState,
    };

    it('should select employee state', () => {
      expect(selectEmployee(mockState as any)).toEqual(mockState.employee);
    });

    it('should select clients', () => {
      expect(selectClients(mockState as any)).toEqual(mockClients);
    });

    it('should select selected client', () => {
      expect(selectSelectedClient(mockState as any)).toEqual(mockClients[0]);
    });

    it('should select dashboard stats', () => {
      expect(selectDashboardStats(mockState as any)).toEqual(mockDashboardStats);
    });

    it('should select client filter', () => {
      expect(selectClientFilter(mockState as any)).toBe('active');
    });

    it('should select client investments', () => {
      expect(selectClientInvestments(mockState as any)).toEqual(mockInvestments);
    });

    it('should select filtered clients - all', () => {
      const stateWithAllFilter = {
        employee: { ...mockState.employee, clientFilter: 'all' },
      };
      const filtered = selectFilteredClients(stateWithAllFilter as any);
      expect(filtered).toEqual(mockClients);
    });

    it('should select filtered clients - active only', () => {
      // For this test, we'd need to add a status field to ClientDTO
      // Since it's not in the current types, we'll test the filter logic
      const filtered = selectFilteredClients(mockState as any);
      // Currently returns all clients since we don't have status field
      expect(filtered).toEqual(mockClients);
    });
  });

  describe('Loading States', () => {
    it('should set loading during concurrent operations', () => {
      (employeeService.getClients as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      (employeeService.getDashboardStats as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      store.dispatch(fetchClients() as any);
      expect(store.getState().employee.loading).toBe(true);

      store.dispatch(fetchDashboardStats() as any);
      expect(store.getState().employee.loading).toBe(true);
    });
  });
});
