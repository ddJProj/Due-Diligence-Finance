package com.ddfinance.backend.dto.investment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for stock search results.
 * Contains basic information for stock selection.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StockSearchResultDTO {

    private String symbol;
    private String name;
    private String exchange;
    private String type; // Common Stock, ETF, Mutual Fund, etc.
    private String sector;
    private String industry;
    private String country;
    private Boolean tradable;
}
