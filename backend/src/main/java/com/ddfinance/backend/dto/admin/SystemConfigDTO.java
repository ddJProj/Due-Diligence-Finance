package com.ddfinance.backend.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for system configuration settings.
 * Contains configurable system parameters.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SystemConfigDTO {

    @NotNull(message = "Max login attempts is required")
    @Min(value = 1, message = "Max login attempts must be at least 1")
    private Integer maxLoginAttempts;

    @NotNull(message = "Session timeout is required")
    @Min(value = 5, message = "Session timeout must be at least 5 minutes")
    private Integer sessionTimeout; // in minutes

    @NotNull(message = "Password expiry days is required")
    @Min(value = 30, message = "Password expiry must be at least 30 days")
    private Integer passwordExpiryDays;

    @NotNull(message = "Maintenance mode flag is required")
    private Boolean maintenanceMode;

    private String maintenanceMessage;

    @Min(value = 1, message = "Min password length must be at least 1")
    private Integer minPasswordLength;

    private Boolean requireTwoFactor;
    private Boolean allowGuestRegistration;

    @Min(value = 1, message = "Investment approval threshold must be positive")
    private Double investmentApprovalThreshold;
}