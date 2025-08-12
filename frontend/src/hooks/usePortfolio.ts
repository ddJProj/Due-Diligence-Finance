// frontend/src/hooks/usePortfolio.ts

import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from './redux';
import {
  fetchPortfolio,
  fetchInvestments,
  createInvestment,
  updateInvestment as updateInvestmentAction,
  deleteInvestment,
  setSelectedInvestment,
  setPortfolioFilter,
  selectPortfolio,
  selectInvestments,
  selectSelectedInvestment,
  selectPortfolioFilter,
  selectFilteredInvestments,
  selectClient,
} from '@/store/slices/clientSlice';
import {
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentDTO,
  InvestmentStatus,
} from '@/types/investment.types';

/**
 * Custom hook for portfolio management
 * Provides access to portfolio data and investment operations
 * 
 * @example
 * const { portfolio, investments, addInvestment, totalValue } = usePortfolio();
 */
export const usePortfolio = () => {
  const dispatch = useAppDispatch();
  
  // Selectors
  const clientState = useAppSelector(selectClient);
  const portfolio = useAppSelector(selectPortfolio);
  const investments = useAppSelector(selectInvestments);
  const selectedInvestment = useAppSelector(selectSelectedInvestment);
  const filter = useAppSelector(selectPortfolioFilter);
  const filteredInvestments = useAppSelector(selectFilteredInvestments);

  // Refresh portfolio data
  const refreshPortfolio = useCallback(async () => {
    const result = await dispatch(fetchPortfolio());
    if (fetchPortfolio.rejected.match(result)) {
      throw new Error(result.error.message || 'Failed to fetch portfolio');
    }
    return result.payload;
  }, [dispatch]);

  // Refresh investments
  const refreshInvestments = useCallback(async (status?: InvestmentStatus) => {
    const result = await dispatch(fetchInvestments(status));
    if (fetchInvestments.rejected.match(result)) {
      throw new Error(result.error.message || 'Failed to fetch investments');
    }
    return result.payload;
  }, [dispatch]);

  // Refresh all data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      refreshPortfolio(),
      refreshInvestments(),
    ]);
  }, [refreshPortfolio, refreshInvestments]);

  // Add new investment
  const addInvestment = useCallback(async (data: CreateInvestmentRequest) => {
    const result = await dispatch(createInvestment(data));
    if (createInvestment.rejected.match(result)) {
      throw new Error(result.error.message || 'Failed to create investment');
    }
    return result.payload;
  }, [dispatch]);

  // Update investment
  const updateInvestment = useCallback(async (id: number, data: UpdateInvestmentRequest) => {
    const result = await dispatch(updateInvestmentAction({ id, data }));
    if (updateInvestmentAction.rejected.match(result)) {
      throw new Error(result.error.message || 'Failed to update investment');
    }
    return result.payload;
  }, [dispatch]);

  // Remove investment
  const removeInvestment = useCallback(async (id: number) => {
    const result = await dispatch(deleteInvestment(id));
    if (deleteInvestment.rejected.match(result)) {
      throw new Error(result.error.message || 'Failed to delete investment');
    }
  }, [dispatch]);

  // Select investment
  const selectInvestment = useCallback((investment: InvestmentDTO) => {
    dispatch(setSelectedInvestment(investment));
  }, [dispatch]);

  // Get investment by ID
  const getInvestmentById = useCallback((id: number): InvestmentDTO | undefined => {
    return investments.find(inv => inv.id === id);
  }, [investments]);

  // Set filter
  const setFilter = useCallback((newFilter: 'all' | 'active' | 'sold') => {
    dispatch(setPortfolioFilter(newFilter));
  }, [dispatch]);

  // Calculate total portfolio value
  const totalValue = useMemo(() => {
    return investments.reduce((total, inv) => {
      return total + (inv.quantity * inv.currentPrice);
    }, 0);
  }, [investments]);

  // Calculate total gain/loss
  const totalGainLoss = useMemo(() => {
    return investments.reduce((total, inv) => {
      const gain = inv.quantity * (inv.currentPrice - inv.purchasePrice);
      return total + gain;
    }, 0);
  }, [investments]);

  // Calculate total gain/loss percentage
  const totalGainLossPercentage = useMemo(() => {
    const totalCost = investments.reduce((total, inv) => {
      return total + (inv.quantity * inv.purchasePrice);
    }, 0);
    
    if (totalCost === 0) return 0;
    
    return (totalGainLoss / totalCost) * 100;
  }, [investments, totalGainLoss]);

  return {
    // State
    portfolio,
    investments,
    filteredInvestments,
    selectedInvestment,
    filter,
    loading: clientState.loading,
    error: clientState.error,

    // Actions
    refreshPortfolio,
    refreshInvestments,
    refreshAll,
    addInvestment,
    updateInvestment,
    removeInvestment,
    selectInvestment,
    getInvestmentById,
    setFilter,

    // Calculations
    totalValue,
    totalGainLoss,
    totalGainLossPercentage,
  };
};
