package com.ddfinance.backend.dto.investment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for client portfolio summary information.
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

    private String clientId;

    private String clientName;

    private Integer totalInvestments;

    private BigDecimal totalValue;

    private BigDecimal totalCost;

    private BigDecimal totalGain;

    private BigDecimal totalGainPercentage;

    private BigDecimal totalDividendsReceived;

    private BigDecimal averageRiskLevel;

    private List<InvestmentDTO> investments;

    private LocalDateTime lastUpdated;

    // Performance metrics
    private BigDecimal dailyChange;

    private BigDecimal dailyChangePercentage;

    private BigDecimal weeklyChange;

    private BigDecimal weeklyChangePercentage;

    private BigDecimal monthlyChange;

    private BigDecimal monthlyChangePercentage;

    private BigDecimal yearlyChange;

    private BigDecimal yearlyChangePercentage;

    // Asset allocation
    private List<AssetAllocation> assetAllocation;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AssetAllocation {
        private String assetType;
        private BigDecimal value;
        private BigDecimal percentage;
        private Integer count;
    }
}
