package com.ddfinance.backend.dto.investment;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating new investments.
 * Used by employees to create investments for clients.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateInvestmentRequest {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotBlank(message = "Stock symbol is required")
    @Pattern(regexp = "^[A-Z]{1,5}$", message = "Stock symbol must be 1-5 uppercase letters")
    private String stockSymbol;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "Order type is required")
    @Pattern(regexp = "MARKET|LIMIT|STOP|STOP_LIMIT",
            message = "Order type must be MARKET, LIMIT, STOP, or STOP_LIMIT")
    private String orderType;

    // For LIMIT and STOP orders
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private Double targetPrice;

    // Optional fields
    private String notes;
    private Boolean autoReinvestDividends;

    // Risk acknowledgment
    @NotNull(message = "Risk acknowledgment is required")
    @AssertTrue(message = "Client must acknowledge investment risks")
    private Boolean riskAcknowledged;
}
