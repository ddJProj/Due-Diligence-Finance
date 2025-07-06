package com.ddfinance.backend.service.investment;

import com.ddfinance.backend.dto.investment.InvestmentDTO;
import com.ddfinance.backend.dto.investment.InvestmentPerformanceDTO;
import com.ddfinance.backend.dto.investment.UpdateInvestmentRequest;
import com.ddfinance.core.domain.enums.InvestmentStatus;

import java.util.List;
import java.util.Map;

/**
 * Service interface for investment operations.
 * Handles investment management and performance tracking.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface InvestmentService {

    /**
     * Gets investment by ID.
     *
     * @param investmentId Investment ID
     * @return Investment details
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     */
    InvestmentDTO getInvestmentById(Long investmentId);

    /**
     * Updates investment.
     *
     * @param investmentId Investment ID
     * @param request Update request
     * @return Updated investment
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     */
    InvestmentDTO updateInvestment(Long investmentId, UpdateInvestmentRequest request);

    /**
     * Gets all investments.
     *
     * @return List of all investments
     */
    List<InvestmentDTO> getAllInvestments();

    /**
     * Gets investments by status.
     *
     * @param status Investment status
     * @return List of investments with status
     */
    List<InvestmentDTO> getInvestmentsByStatus(InvestmentStatus status);

    /**
     * Gets investment performance.
     *
     * @param investmentId Investment ID
     * @return Performance metrics
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     */
    InvestmentPerformanceDTO getInvestmentPerformance(Long investmentId);

    /**
     * Gets investment history.
     *
     * @param investmentId Investment ID
     * @return Transaction history
     * @throws com.ddfinance.core.exception.EntityNotFoundException if not found
     */
    List<Map<String, Object>> getInvestmentHistory(Long investmentId);

    /**
     * Gets system-wide analytics.
     *
     * @return Analytics data
     */
    Map<String, Object> getInvestmentAnalytics();

    /**
     * Refreshes prices for all active investments.
     *
     * @return Refresh result
     */
    Map<String, String> refreshAllPrices();

    /**
     * Calculates tax implications.
     *
     * @param investmentId Investment ID
     * @param sellQuantity Quantity to sell
     * @return Tax calculation
     */
    Map<String, Object> calculateTaxImplications(Long investmentId, Integer sellQuantity);

    /**
     * Processes dividend payment.
     *
     * @param investmentId Investment ID
     * @param amount Dividend amount
     */
    void processDividend(Long investmentId, Double amount);

    /**
     * Gets investments requiring attention.
     *
     * @return List of investments needing review
     */
    List<InvestmentDTO> getInvestmentsRequiringAttention();
}
