package com.ddfinance.backend.dto.investment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for investment information.
 * Contains all details about a specific investment.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InvestmentDTO {

    private Long id;

    private String investmentId;

    private String tickerSymbol;

    private String name;

    private String investmentType;

    private BigDecimal shares;

    private BigDecimal purchasePricePerShare;

    private BigDecimal currentPrice;

    private BigDecimal currentValue;

    private BigDecimal totalCost;

    private BigDecimal unrealizedGain;

    private BigDecimal unrealizedGainPercentage;

    private BigDecimal realizedGain;

    private BigDecimal dividendsReceived;

    private String status;

    private String riskLevel;

    private LocalDateTime purchaseDate;

    private LocalDateTime lastPriceUpdate;

    private String notes;

    // Additional fields for detailed view
    private String exchange;

    private String sector;

    private BigDecimal dividendYield;

    private BigDecimal dayChange;

    private BigDecimal dayChangePercentage;

    private BigDecimal weekChange;

    private BigDecimal weekChangePercentage;

    private BigDecimal monthChange;

    private BigDecimal monthChangePercentage;

    private BigDecimal yearChange;

    private BigDecimal yearChangePercentage;

    // Market data
    private BigDecimal fiftyTwoWeekHigh;

    private BigDecimal fiftyTwoWeekLow;

    private BigDecimal marketCap;

    private BigDecimal peRatio;

    private BigDecimal volume;

    private BigDecimal averageVolume;

    // Metadata
    private LocalDateTime createdAt;

    private String createdBy;

    private LocalDateTime lastModifiedAt;

    private String modifiedBy;
}
