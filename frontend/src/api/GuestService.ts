// frontend/src/api/GuestService.ts

import { apiClient } from './apiClient';

/**
 * Service for handling all guest/public API operations.
 * Includes public information, contact forms, and registration support.
 */
export class GuestService {
  private static instance: GuestService;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of GuestService
   */
  public static getInstance(): GuestService {
    if (!GuestService.instance) {
      GuestService.instance = new GuestService();
    }
    return GuestService.instance;
  }

  // Public Information
  // ==================

  /**
   * Get company information
   * @returns Company details and services
   */
  public async getCompanyInfo(): Promise<any> {
    const response = await apiClient.get('/public/company-info');
    return response.data;
  }

  /**
   * Get current market overview
   * @returns Market indices and status
   */
  public async getMarketOverview(): Promise<any> {
    const response = await apiClient.get('/public/market-overview');
    return response.data;
  }

  /**
   * Get educational resources
   * @returns List of educational materials
   */
  public async getEducationalResources(): Promise<any[]> {
    const response = await apiClient.get('/public/resources');
    return response.data;
  }

  /**
   * Get specific educational resource
   * @param resourceId - Resource ID
   * @returns Resource details
   */
  public async getResource(resourceId: number): Promise<any> {
    const response = await apiClient.get(`/public/resources/${resourceId}`);
    return response.data;
  }

  // Contact and Support
  // ===================

  /**
   * Submit contact form
   * @param contactData - Contact form data
   * @returns Submission result with ticket ID
   */
  public async submitContactForm(contactData: any): Promise<any> {
    const response = await apiClient.post('/public/contact', contactData);
    return response.data;
  }

  /**
   * Get frequently asked questions
   * @returns List of FAQs organized by category
   */
  public async getFAQ(): Promise<any[]> {
    const response = await apiClient.get('/public/faq');
    return response.data;
  }

  /**
   * Subscribe to newsletter
   * @param email - Email address
   * @returns Subscription result
   */
  public async subscribeNewsletter(email: string): Promise<any> {
    const response = await apiClient.post('/public/newsletter/subscribe', { email });
    return response.data;
  }

  // Investment Information
  // =====================

  /**
   * Get available investment options
   * @returns List of investment portfolios and strategies
   */
  public async getInvestmentOptions(): Promise<any[]> {
    const response = await apiClient.get('/public/investment-options');
    return response.data;
  }

  /**
   * Get historical performance data
   * @returns Performance history for different portfolios
   */
  public async getPerformanceHistory(): Promise<any> {
    const response = await apiClient.get('/public/performance-history');
    return response.data;
  }

  /**
   * Get fee structure
   * @returns Fee schedule and pricing information
   */
  public async getFeeStructure(): Promise<any> {
    const response = await apiClient.get('/public/fees');
    return response.data;
  }

  /**
   * Calculate potential returns
   * @param params - Investment parameters (amount, duration, risk level)
   * @returns Projected returns calculation
   */
  public async calculateReturns(params: any): Promise<any> {
    const response = await apiClient.post('/public/calculate-returns', params);
    return response.data;
  }

  // Registration Support
  // ===================

  /**
   * Check if email is available for registration
   * @param email - Email to check
   * @returns Availability status
   */
  public async checkEmailAvailability(email: string): Promise<any> {
    const response = await apiClient.post('/public/check-email', { email });
    return response.data;
  }

  /**
   * Get password requirements
   * @returns Password policy requirements
   */
  public async getPasswordRequirements(): Promise<any> {
    const response = await apiClient.get('/public/password-requirements');
    return response.data;
  }

  /**
   * Get registration requirements
   * @returns Information needed for registration
   */
  public async getRegistrationRequirements(): Promise<any> {
    const response = await apiClient.get('/public/registration-requirements');
    return response.data;
  }

  // Legal and Compliance
  // ===================

  /**
   * Get terms of service
   * @returns Current terms of service
   */
  public async getTermsOfService(): Promise<any> {
    const response = await apiClient.get('/public/terms');
    return response.data;
  }

  /**
   * Get privacy policy
   * @returns Current privacy policy
   */
  public async getPrivacyPolicy(): Promise<any> {
    const response = await apiClient.get('/public/privacy');
    return response.data;
  }

  /**
   * Get regulatory disclosures
   * @returns Required regulatory information
   */
  public async getRegulatoryDisclosures(): Promise<any> {
    const response = await apiClient.get('/public/disclosures');
    return response.data;
  }

  // Market Data
  // ===========

  /**
   * Get top performing stocks
   * @param limit - Number of stocks to return
   * @returns List of top performers
   */
  public async getTopPerformers(limit: number = 10): Promise<any[]> {
    const response = await apiClient.get('/public/market/top-performers', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get market news
   * @param category - News category (optional)
   * @returns Latest market news
   */
  public async getMarketNews(category?: string): Promise<any[]> {
    const response = await apiClient.get('/public/market/news', {
      params: category ? { category } : undefined,
    });
    return response.data;
  }

  /**
   * Get economic calendar
   * @returns Upcoming economic events
   */
  public async getEconomicCalendar(): Promise<any[]> {
    const response = await apiClient.get('/public/market/calendar');
    return response.data;
  }

  // Career Information
  // ==================

  /**
   * Get career opportunities
   * @returns List of open positions
   */
  public async getCareerOpportunities(): Promise<any[]> {
    const response = await apiClient.get('/public/careers');
    return response.data;
  }

  /**
   * Submit job application
   * @param application - Application data
   * @returns Application submission result
   */
  public async submitJobApplication(application: any): Promise<any> {
    const response = await apiClient.post('/public/careers/apply', application);
    return response.data;
  }
}

// Export singleton instance
export const guestService = GuestService.getInstance();
