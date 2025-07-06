package com.ddfinance.backend.dto.investment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for client portfolio summary.
 * Provides overview of all investments and performance metrics.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PortfolioSummaryDTO {

    // Portfolio overview
    private Integer totalInvestments;
    private Double totalValue;
    private Double totalCost;
    private Double totalProfitLoss;
    private Double totalProfitLossPercentage;

    // Daily performance
    private Double dayChange;
    private Double dayChangePercentage;

    // Asset allocation
    private Map<String, Double> sectorAllocation;
    private Map<String, Double> stockAllocation;

    // Top performers
    private List<InvestmentDTO> topGainers;
    private List<InvestmentDTO> topLosers;

    // All investments
    private List<InvestmentDTO> investments;

    // Metadata
    private LocalDateTime lastUpdated;
    private String currency;
}
