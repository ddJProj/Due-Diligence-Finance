package com.ddfinance.backend.dto.actions;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new upgrade request.
 * Contains required information for client account upgrade.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateUpgradeRequestDTO {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String phoneNumber;

    @NotBlank(message = "Address is required")
    @Size(min = 10, max = 500, message = "Address must be between 10 and 500 characters")
    private String address;

    @NotBlank(message = "Occupation is required")
    @Size(min = 2, max = 100, message = "Occupation must be between 2 and 100 characters")
    private String occupation;

    @NotNull(message = "Annual income is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Annual income must be positive")
    private Double annualIncome;

    @NotBlank(message = "Investment goals are required")
    @Size(min = 20, max = 1000, message = "Investment goals must be between 20 and 1000 characters")
    private String investmentGoals;

    @NotBlank(message = "Risk tolerance is required")
    @Pattern(regexp = "LOW|MODERATE|HIGH|AGGRESSIVE",
            message = "Risk tolerance must be LOW, MODERATE, HIGH, or AGGRESSIVE")
    private String riskTolerance;

    @NotNull(message = "Expected investment amount is required")
    @DecimalMin(value = "10000.0", message = "Minimum investment amount is $10,000")
    private Double expectedInvestmentAmount;

    @NotBlank(message = "Source of funds is required")
    @Size(min = 10, max = 500, message = "Source of funds must be between 10 and 500 characters")
    private String sourceOfFunds;

    // KYC information
    @NotNull(message = "Identity verification acknowledgment is required")
    @AssertTrue(message = "You must agree to identity verification")
    private Boolean agreeToIdentityVerification;

    @NotNull(message = "Terms acceptance is required")
    @AssertTrue(message = "You must accept the terms and conditions")
    private Boolean acceptTermsAndConditions;
}
