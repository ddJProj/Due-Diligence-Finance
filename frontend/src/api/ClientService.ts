// frontend/src/api/ClientService.ts

import { apiClient } from './apiClient';
import { buildQueryString } from './helpers';
import {
  PortfolioDTO,
  InvestmentDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  CreateMessageRequest,
  MessageDTO,
  MessageThread,
  PageRequest,
  Page,
  ClientDTO,
} from '@/types';

/**
 * Service for handling all client-specific API operations.
 * Includes portfolio management, investments, messaging, and profile management.
 */
export class ClientService {
  private static instance: ClientService;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of ClientService
   */
  public static getInstance(): ClientService {
    if (!ClientService.instance) {
      ClientService.instance = new ClientService();
    }
    return ClientService.instance;
  }

  // Portfolio Management
  // ====================

  /**
   * Get the client's portfolio summary
   * @returns Portfolio with investments and summary
   */
  public async getPortfolio(): Promise<PortfolioDTO> {
    const response = await apiClient.get<PortfolioDTO>('/clients/me/portfolio');
    return response.data;
  }

  /**
   * Get portfolio performance over time
   * @param startDate - Start date for performance data
   * @param endDate - End date for performance data
   * @returns Performance data with percentage changes
   */
  public async getPortfolioPerformance(startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get('/clients/me/portfolio/performance', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  // Investment Management
  // ====================

  /**
   * Get paginated list of client investments
   * @param pageRequest - Optional pagination parameters
   * @returns Page of investments
   */
  public async getInvestments(pageRequest?: PageRequest): Promise<Page<InvestmentDTO>> {
    const response = await apiClient.get<Page<InvestmentDTO>>('/clients/me/investments', {
      params: pageRequest,
    });
    return response.data;
  }

  /**
   * Get a specific investment by ID
   * @param investmentId - Investment ID
   * @returns Investment details
   */
  public async getInvestment(investmentId: number): Promise<InvestmentDTO> {
    const response = await apiClient.get<InvestmentDTO>(`/clients/me/investments/${investmentId}`);
    return response.data;
  }

  /**
   * Create a new investment request
   * @param request - Investment creation request
   * @returns Response with request status
   */
  public async createInvestmentRequest(request: CreateInvestmentRequest): Promise<any> {
    const response = await apiClient.post('/clients/me/investments/request', request);
    return response.data;
  }

  /**
   * Update an existing investment
   * @param investmentId - Investment ID to update
   * @param updateRequest - Update data
   * @returns Updated investment
   */
  public async updateInvestmentRequest(
    investmentId: number,
    updateRequest: UpdateInvestmentRequest
  ): Promise<InvestmentDTO> {
    const response = await apiClient.put<InvestmentDTO>(
      `/clients/me/investments/${investmentId}`,
      updateRequest
    );
    return response.data;
  }

  /**
   * Sell an investment
   * @param investmentId - Investment ID to sell
   * @param quantity - Quantity to sell
   * @returns Sale confirmation
   */
  public async sellInvestment(investmentId: number, quantity: number): Promise<any> {
    const response = await apiClient.post(`/clients/me/investments/${investmentId}/sell`, {
      quantity,
    });
    return response.data;
  }

  // Messaging
  // =========

  /**
   * Get all message threads for the client
   * @returns List of message threads
   */
  public async getMessages(): Promise<MessageThread[]> {
    const response = await apiClient.get<MessageThread[]>('/clients/me/messages');
    return response.data;
  }

  /**
   * Get a specific message thread
   * @param threadId - Thread ID
   * @returns Message thread with all messages
   */
  public async getMessage(threadId: number): Promise<MessageThread> {
    const response = await apiClient.get<MessageThread>(`/clients/me/messages/${threadId}`);
    return response.data;
  }

  /**
   * Send a new message
   * @param message - Message to send
   * @returns Created message
   */
  public async sendMessage(message: CreateMessageRequest): Promise<MessageDTO> {
    const response = await apiClient.post<MessageDTO>('/clients/me/messages', message);
    return response.data;
  }

  /**
   * Mark a message as read
   * @param messageId - Message ID to mark as read
   */
  public async markMessageAsRead(messageId: number): Promise<void> {
    await apiClient.put(`/clients/me/messages/${messageId}/read`);
  }

  // Profile Management
  // ==================

  /**
   * Get client profile information
   * @returns Client profile
   */
  public async getProfile(): Promise<ClientDTO> {
    const response = await apiClient.get<ClientDTO>('/clients/me/profile');
    return response.data;
  }

  /**
   * Update client profile
   * @param profileData - Profile data to update
   * @returns Updated profile
   */
  public async updateProfile(profileData: Partial<ClientDTO>): Promise<ClientDTO> {
    const response = await apiClient.put<ClientDTO>('/clients/me/profile', profileData);
    return response.data;
  }

  // Stock Market Data
  // =================

  /**
   * Search for stocks by symbol or name
   * @param query - Search query
   * @returns List of matching stocks
   */
  public async searchStocks(query: string): Promise<any[]> {
    const response = await apiClient.get('/stocks/search', {
      params: { q: query },
    });
    return response.data;
  }

  /**
   * Get current stock quote
   * @param symbol - Stock ticker symbol
   * @returns Current stock quote
   */
  public async getStockQuote(symbol: string): Promise<any> {
    const response = await apiClient.get(`/stocks/quote/${symbol}`);
    return response.data;
  }

  /**
   * Get historical stock data
   * @param symbol - Stock ticker symbol
   * @param period - Time period (1D, 1W, 1M, 3M, 1Y, 5Y)
   * @returns Historical price data
   */
  public async getStockHistory(symbol: string, period: string = '1M'): Promise<any> {
    const response = await apiClient.get(`/stocks/history/${symbol}`, {
      params: { period },
    });
    return response.data;
  }

  // Reports and Documents
  // ====================

  /**
   * Get investment report
   * @param year - Year for report
   * @param type - Report type (annual, quarterly, tax)
   * @returns Report URL or data
   */
  public async getInvestmentReport(year: number, type: string = 'annual'): Promise<any> {
    const response = await apiClient.get('/clients/me/reports', {
      params: { year, type },
    });
    return response.data;
  }

  /**
   * Download tax documents
   * @param year - Tax year
   * @returns Document download URL
   */
  public async getTaxDocuments(year: number): Promise<any> {
    const response = await apiClient.get('/clients/me/tax-documents', {
      params: { year },
    });
    return response.data;
  }
}

// Export singleton instance
export const clientService = ClientService.getInstance();
