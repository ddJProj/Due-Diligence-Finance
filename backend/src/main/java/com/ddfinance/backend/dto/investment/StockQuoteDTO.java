package com.ddfinance.backend.dto.investment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for real-time stock quote information.
 * Contains current market data for a stock.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockQuoteDTO {

    private String symbol;
    private String companyName;
    private String exchange;

    // Price information
    private Double currentPrice;
    private Double previousClose;
    private Double dayChange;
    private Double dayChangePercentage;

    // Day trading range
    private Double dayHigh;
    private Double dayLow;
    private Double openPrice;

    // Volume
    private Long volume;
    private Long averageVolume;

    // 52-week range
    private Double week52High;
    private Double week52Low;

    // Market data
    private Long marketCap;
    private Double peRatio;
    private Double eps;
    private Double dividendYield;

    // Additional info
    private String sector;
    private String industry;
    private LocalDateTime lastUpdated;
    private String currency;
}
