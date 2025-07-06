package com.ddfinance.backend.dto.investment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Map;

/**
 * DTO for investment performance metrics.
 * Contains detailed performance calculations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvestmentPerformanceDTO {

    private Long investmentId;

    // Return metrics
    private Double totalReturn;
    private Double totalReturnPercentage;
    private Double annualizedReturn;
    private Double timeWeightedReturn;

    // Income metrics
    private Double dividendsEarned;
    private Double dividendYield;
    private Integer dividendPayments;

    // Risk metrics
    private Double volatility;
    private Double sharpeRatio;
    private Double beta;

    // Time periods
    private Double dayReturn;
    private Double weekReturn;
    private Double monthReturn;
    private Double yearReturn;

    // Comparison
    private Double benchmarkComparison; // vs S&P 500
    private Double sectorComparison;

    // Historical data
    private Map<LocalDate, Double> priceHistory;
    private Map<LocalDate, Double> returnHistory;
}
