// frontend/src/api/EmployeeService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeService } from './EmployeeService';
import { apiClient } from './apiClient';
import {
  ClientDTO,
  InvestmentDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentStatus,
  MessageDTO,
  PageRequest,
  Page,
  Role,
  EmployeeDTO,
} from '@/types';

// Mock the apiClient
vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('EmployeeService', () => {
  let employeeService: EmployeeService;

  beforeEach(() => {
    vi.clearAllMocks();
    employeeService = EmployeeService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = EmployeeService.getInstance();
      const instance2 = EmployeeService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Client Management', () => {
    describe('getAssignedClients', () => {
      it('should fetch assigned clients with pagination', async () => {
        const pageRequest: PageRequest = {
          page: 0,
          size: 20,
        };

        const mockPage: Page<ClientDTO> = {
          content: [
            {
              id: 1,
              email: 'client1@example.com',
              firstName: 'John',
              lastName: 'Doe',
              phoneNumber: '+1234567890',
              role: Role.CLIENT,
              emailVerified: true,
              active: true,
              createdDate: '2024-01-15T10:00:00Z',
              investmentGoals: 'Long-term growth',
              riskTolerance: 'MODERATE',
              totalPortfolioValue: 150000,
            },
            {
              id: 2,
              email: 'client2@example.com',
              firstName: 'Jane',
              lastName: 'Smith',
              phoneNumber: '+0987654321',
              role: Role.CLIENT,
              emailVerified: true,
              active: true,
              createdDate: '2024-02-01T10:00:00Z',
              investmentGoals: 'Retirement',
              riskTolerance: 'CONSERVATIVE',
              totalPortfolioValue: 250000,
            },
          ],
          totalElements: 45,
          totalPages: 3,
          size: 20,
          number: 0,
          first: true,
          last: false,
          numberOfElements: 20,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage });

        const result = await employeeService.getAssignedClients(pageRequest);

        expect(apiClient.get).toHaveBeenCalledWith('/employees/clients', {
          params: pageRequest,
        });
        expect(result).toEqual(mockPage);
      });
    });

    describe('getClient', () => {
      it('should fetch specific client details', async () => {
        const clientId = 123;
        const mockClient: ClientDTO = {
          id: clientId,
          email: 'client@example.com',
          firstName: 'Test',
          lastName: 'Client',
          phoneNumber: '+1234567890',
          role: Role.CLIENT,
          emailVerified: true,
          active: true,
          createdDate: '2024-01-15T10:00:00Z',
          investmentGoals: 'Growth and income',
          riskTolerance: 'MODERATE',
          totalPortfolioValue: 175000,
          lastActivity: '2025-01-14T15:30:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockClient });

        const result = await employeeService.getClient(clientId);

        expect(apiClient.get).toHaveBeenCalledWith(`/employees/clients/${clientId}`);
        expect(result).toEqual(mockClient);
      });
    });

    describe('searchClients', () => {
      it('should search clients by query', async () => {
        const searchQuery = 'john';
        const mockResults: ClientDTO[] = [
          {
            id: 1,
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1234567890',
            role: Role.CLIENT,
            emailVerified: true,
            active: true,
            createdDate: '2024-01-15T10:00:00Z',
          },
          {
            id: 2,
            email: 'johnny.smith@example.com',
            firstName: 'Johnny',
            lastName: 'Smith',
            phoneNumber: '+0987654321',
            role: Role.CLIENT,
            emailVerified: true,
            active: true,
            createdDate: '2024-02-01T10:00:00Z',
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResults });

        const result = await employeeService.searchClients(searchQuery);

        expect(apiClient.get).toHaveBeenCalledWith('/employees/clients/search', {
          params: { q: searchQuery },
        });
        expect(result).toEqual(mockResults);
      });
    });
  });

  describe('Investment Management', () => {
    describe('getClientInvestments', () => {
      it('should fetch investments for a specific client', async () => {
        const clientId = 456;
        const mockInvestments: InvestmentDTO[] = [
          {
            id: 1,
            tickerSymbol: 'AAPL',
            quantity: 100,
            purchasePrice: 150.00,
            currentPrice: 175.00,
            status: InvestmentStatus.ACTIVE,
            purchaseDate: '2024-01-15T10:00:00Z',
            sector: 'Technology',
            totalValue: 17500,
            gainLoss: 2500,
            gainLossPercentage: 16.67,
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockInvestments });

        const result = await employeeService.getClientInvestments(clientId);

        expect(apiClient.get).toHaveBeenCalledWith(`/employees/clients/${clientId}/investments`);
        expect(result).toEqual(mockInvestments);
      });
    });

    describe('createInvestmentForClient', () => {
      it('should create investment for client', async () => {
        const clientId = 789;
        const request: CreateInvestmentRequest = {
          tickerSymbol: 'MSFT',
          quantity: 50,
          orderType: 'LIMIT',
          limitPrice: 400.00,
        };

        const mockResponse: InvestmentDTO = {
          id: 999,
          tickerSymbol: 'MSFT',
          quantity: 50,
          purchasePrice: 400.00,
          currentPrice: 400.00,
          status: InvestmentStatus.PENDING,
          purchaseDate: '2025-01-15T10:00:00Z',
          sector: 'Technology',
          totalValue: 20000,
          gainLoss: 0,
          gainLossPercentage: 0,
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await employeeService.createInvestmentForClient(clientId, request);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/employees/clients/${clientId}/investments`,
          request
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateClientInvestment', () => {
      it('should update client investment', async () => {
        const clientId = 123;
        const investmentId = 456;
        const updateRequest: UpdateInvestmentRequest = {
          quantity: 150,
          notes: 'Increased position per client request',
        };

        const mockResponse: InvestmentDTO = {
          id: investmentId,
          tickerSymbol: 'AAPL',
          quantity: 150,
          purchasePrice: 150.00,
          currentPrice: 175.00,
          status: InvestmentStatus.ACTIVE,
          purchaseDate: '2024-01-15T10:00:00Z',
          sector: 'Technology',
          totalValue: 26250,
          gainLoss: 3750,
          gainLossPercentage: 16.67,
          notes: 'Increased position per client request',
        };

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

        const result = await employeeService.updateClientInvestment(
          clientId,
          investmentId,
          updateRequest
        );

        expect(apiClient.put).toHaveBeenCalledWith(
          `/employees/clients/${clientId}/investments/${investmentId}`,
          updateRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('processInvestmentOrder', () => {
      it('should process pending investment order', async () => {
        const orderId = 111;
        const action = 'APPROVE';

        const mockResponse = {
          id: orderId,
          status: 'APPROVED',
          message: 'Investment order approved successfully',
          processedAt: '2025-01-15T11:00:00Z',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await employeeService.processInvestmentOrder(orderId, action);

        expect(apiClient.post).toHaveBeenCalledWith(`/employees/orders/${orderId}/process`, {
          action,
        });
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Employee Dashboard', () => {
    describe('getDashboardStats', () => {
      it('should fetch employee dashboard statistics', async () => {
        const mockStats = {
          totalClients: 45,
          activeClients: 42,
          pendingOrders: 5,
          totalAUM: 5750000, // Assets Under Management
          monthlyGrowth: 3.5,
          upcomingAppointments: 3,
          unreadMessages: 7,
          recentActivity: [
            {
              type: 'ORDER_PLACED',
              clientName: 'John Doe',
              description: 'New order for 100 shares of AAPL',
              timestamp: '2025-01-15T09:00:00Z',
            },
          ],
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStats });

        const result = await employeeService.getDashboardStats();

        expect(apiClient.get).toHaveBeenCalledWith('/employees/dashboard/stats');
        expect(result).toEqual(mockStats);
      });
    });

    describe('getPendingOrders', () => {
      it('should fetch pending investment orders', async () => {
        const mockOrders = [
          {
            id: 1,
            clientId: 100,
            clientName: 'John Doe',
            tickerSymbol: 'TSLA',
            quantity: 25,
            orderType: 'MARKET',
            status: 'PENDING',
            submittedAt: '2025-01-15T08:00:00Z',
          },
          {
            id: 2,
            clientId: 101,
            clientName: 'Jane Smith',
            tickerSymbol: 'GOOGL',
            quantity: 10,
            orderType: 'LIMIT',
            limitPrice: 150.00,
            status: 'PENDING',
            submittedAt: '2025-01-15T08:30:00Z',
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockOrders });

        const result = await employeeService.getPendingOrders();

        expect(apiClient.get).toHaveBeenCalledWith('/employees/orders/pending');
        expect(result).toEqual(mockOrders);
      });
    });
  });

  describe('Communication', () => {
    describe('sendMessageToClient', () => {
      it('should send message to client', async () => {
        const clientId = 222;
        const message = {
          subject: 'Portfolio Review',
          content: 'Your portfolio performed well this quarter.',
          attachments: [],
        };

        const mockResponse: MessageDTO = {
          id: 333,
          threadId: 10,
          senderEmail: 'employee@ddfinance.com',
          recipientEmail: 'client@example.com',
          subject: 'Portfolio Review',
          content: 'Your portfolio performed well this quarter.',
          timestamp: '2025-01-15T10:00:00Z',
          read: false,
          attachments: [],
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await employeeService.sendMessageToClient(clientId, message);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/employees/clients/${clientId}/messages`,
          message
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getClientMessages', () => {
      it('should fetch messages with a client', async () => {
        const clientId = 444;
        const mockMessages = [
          {
            id: 1,
            threadId: 1,
            senderEmail: 'client@example.com',
            recipientEmail: 'employee@ddfinance.com',
            content: 'Question about my investments',
            timestamp: '2025-01-14T10:00:00Z',
            read: true,
          },
          {
            id: 2,
            threadId: 1,
            senderEmail: 'employee@ddfinance.com',
            recipientEmail: 'client@example.com',
            content: 'I will review and get back to you',
            timestamp: '2025-01-14T11:00:00Z',
            read: true,
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockMessages });

        const result = await employeeService.getClientMessages(clientId);

        expect(apiClient.get).toHaveBeenCalledWith(`/employees/clients/${clientId}/messages`);
        expect(result).toEqual(mockMessages);
      });
    });
  });

  describe('Employee Profile', () => {
    describe('getProfile', () => {
      it('should fetch employee profile', async () => {
        const mockProfile: EmployeeDTO = {
          id: 1,
          email: 'employee@ddfinance.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phoneNumber: '+1234567890',
          role: Role.EMPLOYEE,
          emailVerified: true,
          active: true,
          createdDate: '2023-01-15T10:00:00Z',
          employeeId: 'EMP001',
          department: 'Investment Advisory',
          position: 'Senior Advisor',
          hireDate: '2023-01-15',
          supervisor: 'Mike Wilson',
          officeLocation: 'New York',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProfile });

        const result = await employeeService.getProfile();

        expect(apiClient.get).toHaveBeenCalledWith('/employees/me/profile');
        expect(result).toEqual(mockProfile);
      });
    });

    describe('updateProfile', () => {
      it('should update employee profile', async () => {
        const profileUpdate = {
          phoneNumber: '+0987654321',
          officeLocation: 'San Francisco',
        };

        const mockResponse: EmployeeDTO = {
          id: 1,
          email: 'employee@ddfinance.com',
          firstName: 'Sarah',
          lastName: 'Johnson',
          phoneNumber: '+0987654321',
          role: Role.EMPLOYEE,
          emailVerified: true,
          active: true,
          createdDate: '2023-01-15T10:00:00Z',
          employeeId: 'EMP001',
          department: 'Investment Advisory',
          position: 'Senior Advisor',
          hireDate: '2023-01-15',
          supervisor: 'Mike Wilson',
          officeLocation: 'San Francisco',
        };

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

        const result = await employeeService.updateProfile(profileUpdate);

        expect(apiClient.put).toHaveBeenCalledWith('/employees/me/profile', profileUpdate);
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
