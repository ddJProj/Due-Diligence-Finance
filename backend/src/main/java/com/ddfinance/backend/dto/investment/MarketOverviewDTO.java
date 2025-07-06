package com.ddfinance.backend.dto.investment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for market overview information.
 * Contains major market indices and status.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MarketOverviewDTO {

    private String indexName;
    private String indexSymbol;

    // Current values
    private Double currentValue;
    private Double previousClose;
    private Double dayChange;
    private Double dayChangePercentage;

    // Trading range
    private Double dayHigh;
    private Double dayLow;

    // Market status
    private String marketStatus; // OPEN, CLOSED, PRE_MARKET, AFTER_HOURS
    private String nextOpenTime;
    private String nextCloseTime;

    // Additional metrics
    private Long volume;
    private Integer advancers;
    private Integer decliners;
    private Integer unchanged;

    private LocalDateTime lastUpdated;
}
