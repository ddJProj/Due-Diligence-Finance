// frontend/src/api/ClientService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientService } from './ClientService';
import { apiClient } from './apiClient';
import {
  PortfolioDTO,
  InvestmentDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentStatus,
  CreateMessageRequest,
  MessageDTO,
  MessageThread,
  PageRequest,
  Page,
  SortDirection,
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

describe('ClientService', () => {
  let clientService: ClientService;

  beforeEach(() => {
    vi.clearAllMocks();
    clientService = ClientService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ClientService.getInstance();
      const instance2 = ClientService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Portfolio Management', () => {
    describe('getPortfolio', () => {
      it('should fetch client portfolio', async () => {
        const mockPortfolio: PortfolioDTO = {
          id: 1,
          clientId: 100,
          investments: [],
          totalValue: 150000,
          totalGainLoss: 15000,
          totalGainLossPercentage: 11.11,
          cashBalance: 25000,
          portfolioSummary: {
            totalInvestments: 5,
            totalSectors: 3,
            topPerformer: 'AAPL',
            worstPerformer: 'TSLA',
            riskScore: 65,
          },
          lastUpdated: '2025-01-15T10:00:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPortfolio });

        const result = await clientService.getPortfolio();

        expect(apiClient.get).toHaveBeenCalledWith('/clients/me/portfolio');
        expect(result).toEqual(mockPortfolio);
      });

      it('should handle portfolio fetch errors', async () => {
        const error = new Error('Failed to fetch portfolio');
        vi.mocked(apiClient.get).mockRejectedValueOnce(error);

        await expect(clientService.getPortfolio()).rejects.toThrow('Failed to fetch portfolio');
      });
    });

    describe('getPortfolioPerformance', () => {
      it('should fetch portfolio performance for date range', async () => {
        const startDate = '2025-01-01';
        const endDate = '2025-01-15';
        const mockPerformance = {
          data: [
            { date: '2025-01-01', value: 100000 },
            { date: '2025-01-15', value: 115000 },
          ],
          percentageChange: 15.0,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPerformance });

        const result = await clientService.getPortfolioPerformance(startDate, endDate);

        expect(apiClient.get).toHaveBeenCalledWith('/clients/me/portfolio/performance', {
          params: { startDate, endDate },
        });
        expect(result).toEqual(mockPerformance);
      });
    });
  });

  describe('Investment Management', () => {
    describe('getInvestments', () => {
      it('should fetch paginated investments', async () => {
        const pageRequest: PageRequest = {
          page: 0,
          size: 10,
          sort: 'purchaseDate',
          direction: SortDirection.DESC,
        };

        const mockPage: Page<InvestmentDTO> = {
          content: [
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
          ],
          totalElements: 25,
          totalPages: 3,
          size: 10,
          number: 0,
          first: true,
          last: false,
          numberOfElements: 10,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage });

        const result = await clientService.getInvestments(pageRequest);

        expect(apiClient.get).toHaveBeenCalledWith('/clients/me/investments', {
          params: pageRequest,
        });
        expect(result).toEqual(mockPage);
      });

      it('should fetch investments without pagination params', async () => {
        const mockPage: Page<InvestmentDTO> = {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 20,
          number: 0,
          first: true,
          last: true,
          numberOfElements: 0,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage });

        const result = await clientService.getInvestments();

        expect(apiClient.get).toHaveBeenCalledWith('/clients/me/investments', {
          params: undefined,
        });
        expect(result).toEqual(mockPage);
      });
    });

    describe('getInvestment', () => {
      it('should fetch single investment by ID', async () => {
        const investmentId = 123;
        const mockInvestment: InvestmentDTO = {
          id: investmentId,
          tickerSymbol: 'MSFT',
          quantity: 50,
          purchasePrice: 300.00,
          currentPrice: 350.00,
          status: InvestmentStatus.ACTIVE,
          purchaseDate: '2024-06-01T10:00:00Z',
          sector: 'Technology',
          totalValue: 17500,
          gainLoss: 2500,
          gainLossPercentage: 16.67,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockInvestment });

        const result = await clientService.getInvestment(investmentId);

        expect(apiClient.get).toHaveBeenCalledWith(`/clients/me/investments/${investmentId}`);
        expect(result).toEqual(mockInvestment);
      });
    });

    describe('createInvestmentRequest', () => {
      it('should create new investment request', async () => {
        const request: CreateInvestmentRequest = {
          tickerSymbol: 'GOOGL',
          quantity: 25,
          orderType: 'MARKET',
        };

        const mockResponse = {
          id: 456,
          status: 'PENDING',
          message: 'Investment request submitted successfully',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await clientService.createInvestmentRequest(request);

        expect(apiClient.post).toHaveBeenCalledWith('/clients/me/investments/request', request);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('updateInvestmentRequest', () => {
      it('should update existing investment', async () => {
        const investmentId = 789;
        const updateRequest: UpdateInvestmentRequest = {
          quantity: 150,
          notes: 'Increased position',
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
          notes: 'Increased position',
        };

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

        const result = await clientService.updateInvestmentRequest(investmentId, updateRequest);

        expect(apiClient.put).toHaveBeenCalledWith(
          `/clients/me/investments/${investmentId}`,
          updateRequest
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('sellInvestment', () => {
      it('should sell investment', async () => {
        const investmentId = 999;
        const sellQuantity = 50;

        const mockResponse = {
          id: 999,
          status: 'SOLD',
          message: 'Investment sold successfully',
          salePrice: 180.00,
          totalProceeds: 9000.00,
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await clientService.sellInvestment(investmentId, sellQuantity);

        expect(apiClient.post).toHaveBeenCalledWith(
          `/clients/me/investments/${investmentId}/sell`,
          { quantity: sellQuantity }
        );
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Messaging', () => {
    describe('getMessages', () => {
      it('should fetch client messages', async () => {
        const mockMessages: MessageThread[] = [
          {
            id: 1,
            subject: 'Portfolio Review',
            participants: ['client@example.com', 'advisor@ddfinance.com'],
            lastMessage: {
              id: 10,
              content: 'Your portfolio looks great!',
              timestamp: '2025-01-15T09:00:00Z',
              senderEmail: 'advisor@ddfinance.com',
            },
            unreadCount: 0,
            messageCount: 5,
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockMessages });

        const result = await clientService.getMessages();

        expect(apiClient.get).toHaveBeenCalledWith('/clients/me/messages');
        expect(result).toEqual(mockMessages);
      });
    });

    describe('getMessage', () => {
      it('should fetch single message thread', async () => {
        const threadId = 1;
        const mockThread: MessageThread = {
          id: threadId,
          subject: 'Investment Question',
          participants: ['client@example.com', 'advisor@ddfinance.com'],
          messages: [
            {
              id: 1,
              threadId: 1,
              senderEmail: 'client@example.com',
              recipientEmail: 'advisor@ddfinance.com',
              content: 'Should I invest in NVDA?',
              timestamp: '2025-01-14T10:00:00Z',
              read: true,
            },
            {
              id: 2,
              threadId: 1,
              senderEmail: 'advisor@ddfinance.com',
              recipientEmail: 'client@example.com',
              content: 'Let me analyze your portfolio first.',
              timestamp: '2025-01-14T11:00:00Z',
              read: true,
            },
          ],
          lastMessage: {
            id: 2,
            content: 'Let me analyze your portfolio first.',
            timestamp: '2025-01-14T11:00:00Z',
            senderEmail: 'advisor@ddfinance.com',
          },
          unreadCount: 0,
          messageCount: 2,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockThread });

        const result = await clientService.getMessage(threadId);

        expect(apiClient.get).toHaveBeenCalledWith(`/clients/me/messages/${threadId}`);
        expect(result).toEqual(mockThread);
      });
    });

    describe('sendMessage', () => {
      it('should send new message', async () => {
        const messageRequest: CreateMessageRequest = {
          recipientEmail: 'advisor@ddfinance.com',
          subject: 'Tax Question',
          content: 'What are the tax implications of selling AAPL?',
          attachments: [],
        };

        const mockResponse: MessageDTO = {
          id: 100,
          threadId: 5,
          senderEmail: 'client@example.com',
          recipientEmail: 'advisor@ddfinance.com',
          subject: 'Tax Question',
          content: 'What are the tax implications of selling AAPL?',
          timestamp: '2025-01-15T10:00:00Z',
          read: false,
          attachments: [],
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await clientService.sendMessage(messageRequest);

        expect(apiClient.post).toHaveBeenCalledWith('/clients/me/messages', messageRequest);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('markMessageAsRead', () => {
      it('should mark message as read', async () => {
        const messageId = 50;

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { success: true } });

        await clientService.markMessageAsRead(messageId);

        expect(apiClient.put).toHaveBeenCalledWith(`/clients/me/messages/${messageId}/read`);
      });
    });
  });

  describe('Profile Management', () => {
    describe('getProfile', () => {
      it('should fetch client profile', async () => {
        const mockProfile = {
          id: 1,
          email: 'client@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1234567890',
          dateOfBirth: '1985-01-15',
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          investmentGoals: 'Long-term growth',
          riskTolerance: 'MODERATE',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProfile });

        const result = await clientService.getProfile();

        expect(apiClient.get).toHaveBeenCalledWith('/clients/me/profile');
        expect(result).toEqual(mockProfile);
      });
    });

    describe('updateProfile', () => {
      it('should update client profile', async () => {
        const profileUpdate = {
          phoneNumber: '+0987654321',
          investmentGoals: 'Retirement planning',
        };

        const mockResponse = {
          id: 1,
          email: 'client@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+0987654321',
          investmentGoals: 'Retirement planning',
        };

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

        const result = await clientService.updateProfile(profileUpdate);

        expect(apiClient.put).toHaveBeenCalledWith('/clients/me/profile', profileUpdate);
        expect(result).toEqual(mockResponse);
      });
    });
  });
});
