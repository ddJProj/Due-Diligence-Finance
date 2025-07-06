package com.ddfinance.backend.dto.investment;

import com.ddfinance.core.domain.enums.InvestmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for investment information.
 * Contains investment details with live stock data.
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
    private Long clientId;

    // Stock information
    private String stockSymbol;
    private String stockName;
    private String exchange;
    private String sector;

    // Investment details
    private Integer quantity;
    private Double purchasePrice;
    private Double currentPrice;
    private Double totalValue;
    private Double totalCost;

    // Performance
    private Double profitLoss;
    private Double profitLossPercentage;
    private Double dayChange;
    private Double dayChangePercentage;

    // Status and dates
    private InvestmentStatus status;
    private LocalDateTime purchaseDate;
    private LocalDateTime lastUpdated;

    // Additional info
    private String notes;
    private Boolean autoReinvestDividends;
}