// frontend/src/types/investment.types.test.ts
import { describe, it, expect } from 'vitest';
import type {
  InvestmentDTO,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  PortfolioDTO,
  PortfolioSummary,
  InvestmentPerformance,
  StockQuote,
  StockSearchResult,
  MarketData,
  AssetAllocation,
} from './investment.types';

describe('Investment Types', () => {
  describe('InvestmentDTO', () => {
    it('should have correct structure for investment data', () => {
      const validInvestment: InvestmentDTO = {
        id: 1,
        clientId: 100,
        tickerSymbol: 'AAPL',
        companyName: 'Apple Inc.',
        quantity: 100,
        purchasePrice: 150.50,
        purchaseDate: '2024-01-15',
        currentPrice: 175.25,
        currentValue: 17525.00,
        totalReturn: 2475.00,
        percentageReturn: 16.45,
        status: 'APPROVED',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-12-15T10:00:00Z',
        createdBy: 'employee@example.com',
      };

      expect(validInvestment.id).toBe(1);
      expect(validInvestment.tickerSymbol).toBe('AAPL');
      expect(validInvestment.quantity).toBe(100);
      expect(validInvestment.purchasePrice).toBe(150.50);
      expect(validInvestment.currentValue).toBe(17525.00);
      expect(validInvestment.status).toBe('APPROVED');
    });
  });

  describe('CreateInvestmentRequest', () => {
    it('should have correct structure for creating investment', () => {
      const validRequest: CreateInvestmentRequest = {
        clientId: 100,
        tickerSymbol: 'MSFT',
        quantity: 50,
        purchasePrice: 300.00,
        purchaseDate: '2024-06-01',
        notes: 'Long-term investment for retirement portfolio',
      };

      expect(validRequest.clientId).toBe(100);
      expect(validRequest.tickerSymbol).toBe('MSFT');
      expect(validRequest.quantity).toBe(50);
      expect(validRequest.purchasePrice).toBe(300.00);
      expect(validRequest.notes).toBeDefined();
    });

    it('should allow creation without optional notes', () => {
      const validRequest: CreateInvestmentRequest = {
        clientId: 100,
        tickerSymbol: 'GOOGL',
        quantity: 25,
        purchasePrice: 2500.00,
        purchaseDate: '2024-03-15',
      };

      expect(validRequest.notes).toBeUndefined();
    });
  });

  describe('UpdateInvestmentRequest', () => {
    it('should have correct structure for updating investment', () => {
      const validUpdate: UpdateInvestmentRequest = {
        quantity: 150,
        purchasePrice: 145.00,
        purchaseDate: '2024-01-10',
        status: 'APPROVED',
        notes: 'Updated after stock split',
      };

      expect(validUpdate.quantity).toBe(150);
      expect(validUpdate.purchasePrice).toBe(145.00);
      expect(validUpdate.status).toBe('APPROVED');
    });

    it('should allow partial updates', () => {
      const partialUpdate: UpdateInvestmentRequest = {
        status: 'CANCELLED',
      };

      expect(partialUpdate.status).toBe('CANCELLED');
      expect(partialUpdate.quantity).toBeUndefined();
      expect(partialUpdate.purchasePrice).toBeUndefined();
    });
  });

  describe('PortfolioDTO', () => {
    it('should have correct structure for portfolio data', () => {
      const validPortfolio: PortfolioDTO = {
        clientId: 100,
        clientName: 'John Doe',
        investments: [
          {
            id: 1,
            clientId: 100,
            tickerSymbol: 'AAPL',
            companyName: 'Apple Inc.',
            quantity: 100,
            purchasePrice: 150.50,
            purchaseDate: '2024-01-15',
            currentPrice: 175.25,
            currentValue: 17525.00,
            totalReturn: 2475.00,
            percentageReturn: 16.45,
            status: 'APPROVED',
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-12-15T10:00:00Z',
            createdBy: 'employee@example.com',
          },
        ],
        summary: {
          totalInvested: 15050.00,
          currentValue: 17525.00,
          totalReturn: 2475.00,
          percentageReturn: 16.45,
          numberOfInvestments: 1,
          bestPerformer: {
            tickerSymbol: 'AAPL',
            companyName: 'Apple Inc.',
            percentageReturn: 16.45,
          },
          worstPerformer: {
            tickerSymbol: 'AAPL',
            companyName: 'Apple Inc.',
            percentageReturn: 16.45,
          },
        },
        assetAllocation: [
          {
            sector: 'Technology',
            value: 17525.00,
            percentage: 100.0,
          },
        ],
        lastUpdated: '2024-12-15T10:00:00Z',
      };

      expect(validPortfolio.clientId).toBe(100);
      expect(validPortfolio.investments).toHaveLength(1);
      expect(validPortfolio.summary.totalInvested).toBe(15050.00);
      expect(validPortfolio.assetAllocation).toHaveLength(1);
    });
  });

  describe('StockQuote', () => {
    it('should have correct structure for stock quote data', () => {
      const validQuote: StockQuote = {
        symbol: 'NVDA',
        companyName: 'NVIDIA Corporation',
        currentPrice: 875.50,
        change: 25.75,
        changePercent: 3.03,
        dayHigh: 880.00,
        dayLow: 850.25,
        volume: 45678900,
        marketCap: 2157500000000,
        peRatio: 65.5,
        dividendYield: 0.02,
        fiftyTwoWeekHigh: 974.94,
        fiftyTwoWeekLow: 393.89,
        lastUpdated: '2024-12-15T16:00:00Z',
      };

      expect(validQuote.symbol).toBe('NVDA');
      expect(validQuote.currentPrice).toBe(875.50);
      expect(validQuote.changePercent).toBe(3.03);
      expect(validQuote.marketCap).toBe(2157500000000);
    });
  });

  describe('StockSearchResult', () => {
    it('should have correct structure for stock search results', () => {
      const validResult: StockSearchResult = {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        type: 'Common Stock',
        exchange: 'NASDAQ',
        currency: 'USD',
        country: 'United States',
        sector: 'Consumer Cyclical',
        industry: 'Auto Manufacturers',
      };

      expect(validResult.symbol).toBe('TSLA');
      expect(validResult.exchange).toBe('NASDAQ');
      expect(validResult.sector).toBe('Consumer Cyclical');
    });
  });

  describe('MarketData', () => {
    it('should have correct structure for market indices', () => {
      const validMarket: MarketData = {
        indices: [
          {
            symbol: '^GSPC',
            name: 'S&P 500',
            value: 4719.55,
            change: 45.25,
            changePercent: 0.97,
          },
          {
            symbol: '^DJI',
            name: 'Dow Jones Industrial Average',
            value: 37305.16,
            change: 250.50,
            changePercent: 0.68,
          },
          {
            symbol: '^IXIC',
            name: 'NASDAQ Composite',
            value: 14813.92,
            change: 125.75,
            changePercent: 0.86,
          },
        ],
        lastUpdated: '2024-12-15T16:00:00Z',
      };

      expect(validMarket.indices).toHaveLength(3);
      expect(validMarket.indices[0].symbol).toBe('^GSPC');
      expect(validMarket.lastUpdated).toBeDefined();
    });
  });
});
