// frontend/src/api/GuestService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GuestService } from './GuestService';
import { apiClient } from './apiClient';

// Mock the apiClient
vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('GuestService', () => {
  let guestService: GuestService;

  beforeEach(() => {
    vi.clearAllMocks();
    guestService = GuestService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = GuestService.getInstance();
      const instance2 = GuestService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Public Information', () => {
    describe('getCompanyInfo', () => {
      it('should fetch company information', async () => {
        const mockCompanyInfo = {
          name: 'Due Diligence Finance',
          description: 'Professional investment management services',
          founded: '2020',
          headquarters: 'New York, NY',
          employees: '50-100',
          services: [
            'Portfolio Management',
            'Investment Advisory',
            'Financial Planning',
            'Tax Optimization',
          ],
          certifications: ['SEC Registered', 'FINRA Member'],
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCompanyInfo });

        const result = await guestService.getCompanyInfo();

        expect(apiClient.get).toHaveBeenCalledWith('/public/company-info');
        expect(result).toEqual(mockCompanyInfo);
      });
    });

    describe('getMarketOverview', () => {
      it('should fetch market overview', async () => {
        const mockMarketData = {
          indices: [
            {
              symbol: 'SPX',
              name: 'S&P 500',
              value: 4783.45,
              change: 23.45,
              changePercent: 0.49,
            },
            {
              symbol: 'DJI',
              name: 'Dow Jones',
              value: 37592.98,
              change: 157.23,
              changePercent: 0.42,
            },
            {
              symbol: 'IXIC',
              name: 'NASDAQ',
              value: 15123.67,
              change: 89.12,
              changePercent: 0.59,
            },
          ],
          lastUpdate: '2025-01-15T16:00:00Z',
          marketStatus: 'CLOSED',
          nextOpen: '2025-01-16T09:30:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockMarketData });

        const result = await guestService.getMarketOverview();

        expect(apiClient.get).toHaveBeenCalledWith('/public/market-overview');
        expect(result).toEqual(mockMarketData);
      });
    });

    describe('getEducationalResources', () => {
      it('should fetch educational resources', async () => {
        const mockResources = [
          {
            id: 1,
            title: 'Introduction to Stock Market Investing',
            description: 'Learn the basics of stock market investing',
            type: 'ARTICLE',
            difficulty: 'BEGINNER',
            readTime: '10 min',
            url: '/resources/intro-to-investing',
          },
          {
            id: 2,
            title: 'Understanding Portfolio Diversification',
            description: 'How to build a balanced investment portfolio',
            type: 'VIDEO',
            difficulty: 'INTERMEDIATE',
            duration: '15 min',
            url: '/resources/portfolio-diversification',
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResources });

        const result = await guestService.getEducationalResources();

        expect(apiClient.get).toHaveBeenCalledWith('/public/resources');
        expect(result).toEqual(mockResources);
      });
    });
  });

  describe('Contact and Support', () => {
    describe('submitContactForm', () => {
      it('should submit contact form', async () => {
        const contactData = {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          subject: 'Investment Inquiry',
          message: 'I would like to learn more about your services',
          preferredContactMethod: 'EMAIL',
        };

        const mockResponse = {
          success: true,
          ticketId: 'CONTACT-2025-0115-001',
          message: 'Thank you for contacting us. We will respond within 24 hours.',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await guestService.submitContactForm(contactData);

        expect(apiClient.post).toHaveBeenCalledWith('/public/contact', contactData);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getFAQ', () => {
      it('should fetch frequently asked questions', async () => {
        const mockFAQ = [
          {
            id: 1,
            category: 'Account',
            question: 'How do I open an account?',
            answer: 'You can register for an account by clicking the Sign Up button...',
            order: 1,
          },
          {
            id: 2,
            category: 'Investments',
            question: 'What is the minimum investment amount?',
            answer: 'The minimum initial investment is $10,000...',
            order: 1,
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockFAQ });

        const result = await guestService.getFAQ();

        expect(apiClient.get).toHaveBeenCalledWith('/public/faq');
        expect(result).toEqual(mockFAQ);
      });
    });
  });

  describe('Investment Information', () => {
    describe('getInvestmentOptions', () => {
      it('should fetch available investment options', async () => {
        const mockOptions = [
          {
            id: 1,
            name: 'Growth Portfolio',
            description: 'High-growth stocks for long-term appreciation',
            riskLevel: 'HIGH',
            expectedReturn: '12-15%',
            minimumInvestment: 25000,
            features: ['Quarterly rebalancing', 'Tax optimization', 'Monthly reports'],
          },
          {
            id: 2,
            name: 'Balanced Portfolio',
            description: 'Mix of stocks and bonds for steady growth',
            riskLevel: 'MODERATE',
            expectedReturn: '8-10%',
            minimumInvestment: 10000,
            features: ['Diversified holdings', 'Income generation', 'Lower volatility'],
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockOptions });

        const result = await guestService.getInvestmentOptions();

        expect(apiClient.get).toHaveBeenCalledWith('/public/investment-options');
        expect(result).toEqual(mockOptions);
      });
    });

    describe('getPerformanceHistory', () => {
      it('should fetch historical performance data', async () => {
        const mockPerformance = {
          portfolios: [
            {
              name: 'Growth Portfolio',
              data: [
                { year: 2023, return: 18.5 },
                { year: 2024, return: 14.2 },
              ],
            },
            {
              name: 'Balanced Portfolio',
              data: [
                { year: 2023, return: 9.8 },
                { year: 2024, return: 8.7 },
              ],
            },
          ],
          benchmark: {
            name: 'S&P 500',
            data: [
              { year: 2023, return: 16.2 },
              { year: 2024, return: 12.1 },
            ],
          },
          disclaimer: 'Past performance does not guarantee future results',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPerformance });

        const result = await guestService.getPerformanceHistory();

        expect(apiClient.get).toHaveBeenCalledWith('/public/performance-history');
        expect(result).toEqual(mockPerformance);
      });
    });
  });

  describe('Registration Support', () => {
    describe('checkEmailAvailability', () => {
      it('should check if email is available', async () => {
        const email = 'newuser@example.com';
        const mockResponse = {
          available: true,
          message: 'Email is available for registration',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await guestService.checkEmailAvailability(email);

        expect(apiClient.post).toHaveBeenCalledWith('/public/check-email', { email });
        expect(result).toEqual(mockResponse);
      });

      it('should handle unavailable email', async () => {
        const email = 'existing@example.com';
        const mockResponse = {
          available: false,
          message: 'Email is already registered',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await guestService.checkEmailAvailability(email);

        expect(apiClient.post).toHaveBeenCalledWith('/public/check-email', { email });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getPasswordRequirements', () => {
      it('should fetch password requirements', async () => {
        const mockRequirements = {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumber: true,
          requireSpecialChar: true,
          specialChars: '!@#$%^&*',
          preventCommon: true,
          preventPersonalInfo: true,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockRequirements });

        const result = await guestService.getPasswordRequirements();

        expect(apiClient.get).toHaveBeenCalledWith('/public/password-requirements');
        expect(result).toEqual(mockRequirements);
      });
    });
  });

  describe('Legal and Compliance', () => {
    describe('getTermsOfService', () => {
      it('should fetch terms of service', async () => {
        const mockTerms = {
          version: '2.0',
          effectiveDate: '2025-01-01',
          content: 'Terms of Service content...',
          lastUpdated: '2024-12-15T10:00:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockTerms });

        const result = await guestService.getTermsOfService();

        expect(apiClient.get).toHaveBeenCalledWith('/public/terms');
        expect(result).toEqual(mockTerms);
      });
    });

    describe('getPrivacyPolicy', () => {
      it('should fetch privacy policy', async () => {
        const mockPolicy = {
          version: '1.5',
          effectiveDate: '2025-01-01',
          content: 'Privacy Policy content...',
          lastUpdated: '2024-12-15T10:00:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPolicy });

        const result = await guestService.getPrivacyPolicy();

        expect(apiClient.get).toHaveBeenCalledWith('/public/privacy');
        expect(result).toEqual(mockPolicy);
      });
    });
  });
});
