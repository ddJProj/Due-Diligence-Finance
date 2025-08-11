// frontend/src/types/investment.types.ts

import { InvestmentStatus } from './common.types';

export interface InvestmentDTO {
  id: number;
  clientId: number;
  tickerSymbol: string;
  companyName: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  currentValue: number;
  totalReturn: number;
  percentageReturn: number;
  status: InvestmentStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CreateInvestmentRequest {
  clientId: number;
  tickerSymbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
}

export interface UpdateInvestmentRequest {
  quantity?: number;
  purchasePrice?: number;
  purchaseDate?: string;
  status?: InvestmentStatus;
  notes?: string;
}

export interface PortfolioDTO {
  clientId: number;
  clientName: string;
  investments: InvestmentDTO[];
  summary: PortfolioSummary;
  assetAllocation: AssetAllocation[];
  lastUpdated: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalReturn: number;
  percentageReturn: number;
  numberOfInvestments: number;
  bestPerformer: InvestmentPerformance;
  worstPerformer: InvestmentPerformance;
}

export interface InvestmentPerformance {
  tickerSymbol: string;
  companyName: string;
  percentageReturn: number;
}

export interface AssetAllocation {
  sector: string;
  value: number;
  percentage: number;
}

export interface StockQuote {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  lastUpdated: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
}

export interface MarketData {
  indices: MarketIndex[];
  lastUpdated: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}
