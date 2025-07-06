package com.ddfinance.backend.dto.investment;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating investment details.
 * Contains fields that can be modified after investment creation.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateInvestmentRequest {

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    private Boolean autoReinvestDividends;

    // Alert settings
    private Double priceAlertHigh;
    private Double priceAlertLow;
    private Boolean enablePriceAlerts;

    // Tax settings
    private String taxStrategy; // FIFO, LIFO, SPECIFIC_LOT
    private Boolean taxLossHarvestingEnabled;
}
