// frontend/src/api/EmployeeService.ts

import { apiClient } from './apiClient';
import {
  ClientDTO,
  InvestmentDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  CreateMessageRequest,
  MessageDTO,
  PageRequest,
  Page,
  EmployeeDTO,
} from '@/types';

/**
 * Service for handling all employee-specific API operations.
 * Includes client management, investment processing, and communication.
 */
export class EmployeeService {
  private static instance: EmployeeService;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of EmployeeService
   */
  public static getInstance(): EmployeeService {
    if (!EmployeeService.instance) {
      EmployeeService.instance = new EmployeeService();
    }
    return EmployeeService.instance;
  }

  // Client Management
  // =================

  /**
   * Get paginated list of assigned clients
   * @param pageRequest - Pagination parameters
   * @returns Page of assigned clients
   */
  public async getAssignedClients(pageRequest?: PageRequest): Promise<Page<ClientDTO>> {
    const response = await apiClient.get<Page<ClientDTO>>('/employees/clients', {
      params: pageRequest,
    });
    return response.data;
  }

  /**
   * Get detailed information for a specific client
   * @param clientId - Client ID
   * @returns Client details
   */
  public async getClient(clientId: number): Promise<ClientDTO> {
    const response = await apiClient.get<ClientDTO>(`/employees/clients/${clientId}`);
    return response.data;
  }

  /**
   * Search for clients by name, email, or other criteria
   * @param query - Search query
   * @returns List of matching clients
   */
  public async searchClients(query: string): Promise<ClientDTO[]> {
    const response = await apiClient.get<ClientDTO[]>('/employees/clients/search', {
      params: { q: query },
    });
    return response.data;
  }

  // Investment Management
  // ====================

  /**
   * Get all investments for a specific client
   * @param clientId - Client ID
   * @returns List of client investments
   */
  public async getClientInvestments(clientId: number): Promise<InvestmentDTO[]> {
    const response = await apiClient.get<InvestmentDTO[]>(
      `/employees/clients/${clientId}/investments`
    );
    return response.data;
  }

  /**
   * Create a new investment for a client
   * @param clientId - Client ID
   * @param request - Investment creation request
   * @returns Created investment
   */
  public async createInvestmentForClient(
    clientId: number,
    request: CreateInvestmentRequest
  ): Promise<InvestmentDTO> {
    const response = await apiClient.post<InvestmentDTO>(
      `/employees/clients/${clientId}/investments`,
      request
    );
    return response.data;
  }

  /**
   * Update a client's investment
   * @param clientId - Client ID
   * @param investmentId - Investment ID
   * @param updateRequest - Update data
   * @returns Updated investment
   */
  public async updateClientInvestment(
    clientId: number,
    investmentId: number,
    updateRequest: UpdateInvestmentRequest
  ): Promise<InvestmentDTO> {
    const response = await apiClient.put<InvestmentDTO>(
      `/employees/clients/${clientId}/investments/${investmentId}`,
      updateRequest
    );
    return response.data;
  }

  /**
   * Process a pending investment order
   * @param orderId - Order ID
   * @param action - Action to take (APPROVE, REJECT, etc.)
   * @returns Processing result
   */
  public async processInvestmentOrder(orderId: number, action: string): Promise<any> {
    const response = await apiClient.post(`/employees/orders/${orderId}/process`, { action });
    return response.data;
  }

  // Dashboard & Analytics
  // ====================

  /**
   * Get employee dashboard statistics
   * @returns Dashboard stats including clients, AUM, pending orders
   */
  public async getDashboardStats(): Promise<any> {
    const response = await apiClient.get('/employees/dashboard/stats');
    return response.data;
  }

  /**
   * Get all pending investment orders requiring approval
   * @returns List of pending orders
   */
  public async getPendingOrders(): Promise<any[]> {
    const response = await apiClient.get('/employees/orders/pending');
    return response.data;
  }

  /**
   * Get employee performance metrics
   * @param period - Time period (monthly, quarterly, yearly)
   * @returns Performance metrics
   */
  public async getPerformanceMetrics(period: string = 'monthly'): Promise<any> {
    const response = await apiClient.get('/employees/performance', {
      params: { period },
    });
    return response.data;
  }

  // Communication
  // =============

  /**
   * Send a message to a client
   * @param clientId - Client ID
   * @param message - Message content
   * @returns Sent message
   */
  public async sendMessageToClient(
    clientId: number,
    message: CreateMessageRequest
  ): Promise<MessageDTO> {
    const response = await apiClient.post<MessageDTO>(
      `/employees/clients/${clientId}/messages`,
      message
    );
    return response.data;
  }

  /**
   * Get all messages with a specific client
   * @param clientId - Client ID
   * @returns List of messages
   */
  public async getClientMessages(clientId: number): Promise<MessageDTO[]> {
    const response = await apiClient.get<MessageDTO[]>(`/employees/clients/${clientId}/messages`);
    return response.data;
  }

  /**
   * Get all unread messages across all clients
   * @returns List of unread messages
   */
  public async getUnreadMessages(): Promise<MessageDTO[]> {
    const response = await apiClient.get<MessageDTO[]>('/employees/messages/unread');
    return response.data;
  }

  // Employee Profile
  // ================

  /**
   * Get current employee's profile
   * @returns Employee profile
   */
  public async getProfile(): Promise<EmployeeDTO> {
    const response = await apiClient.get<EmployeeDTO>('/employees/me/profile');
    return response.data;
  }

  /**
   * Update employee profile
   * @param profileData - Profile data to update
   * @returns Updated profile
   */
  public async updateProfile(profileData: Partial<EmployeeDTO>): Promise<EmployeeDTO> {
    const response = await apiClient.put<EmployeeDTO>('/employees/me/profile', profileData);
    return response.data;
  }

  // Appointments & Schedule
  // ======================

  /**
   * Get employee's appointments
   * @param startDate - Start date for appointments
   * @param endDate - End date for appointments
   * @returns List of appointments
   */
  public async getAppointments(startDate?: string, endDate?: string): Promise<any[]> {
    const response = await apiClient.get('/employees/appointments', {
      params: { startDate, endDate },
    });
    return response.data;
  }

  /**
   * Schedule a new appointment with a client
   * @param appointment - Appointment details
   * @returns Created appointment
   */
  public async scheduleAppointment(appointment: any): Promise<any> {
    const response = await apiClient.post('/employees/appointments', appointment);
    return response.data;
  }

  // Reports & Analytics
  // ==================

  /**
   * Generate client portfolio report
   * @param clientId - Client ID
   * @param reportType - Type of report
   * @returns Report data or URL
   */
  public async generateClientReport(clientId: number, reportType: string): Promise<any> {
    const response = await apiClient.post(`/employees/clients/${clientId}/reports`, {
      type: reportType,
    });
    return response.data;
  }

  /**
   * Get market analysis and insights
   * @returns Market analysis data
   */
  public async getMarketAnalysis(): Promise<any> {
    const response = await apiClient.get('/employees/market-analysis');
    return response.data;
  }
}

// Export singleton instance
export const employeeService = EmployeeService.getInstance();
