package com.ddfinance.backend.dto.admin;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    private Long id;

    @NotNull(message = "Maintenance mode flag is required")
    private boolean maintenanceMode;

    private String maintenanceMessage;

    @NotNull(message = "Max upload size is required")
    @Min(value = 1048576, message = "Max upload size must be at least 1MB")
    private Long maxUploadSize; // in bytes

    @NotNull(message = "Session timeout is required")
    @Min(value = 5, message = "Session timeout must be at least 5 minutes")
    private Integer sessionTimeout; // in minutes

    @NotNull(message = "Password min length is required")
    @Min(value = 6, message = "Password minimum length must be at least 6")
    private Integer passwordMinLength;

    @NotNull(message = "Password require special char flag is required")
    private boolean passwordRequireSpecialChar;

    @NotNull(message = "Password require number flag is required")
    private boolean passwordRequireNumber;

    @NotNull(message = "Password expiry days is required")
    @Min(value = 30, message = "Password expiry must be at least 30 days")
    private Integer passwordExpiryDays;

    @NotNull(message = "Max login attempts is required")
    @Min(value = 3, message = "Max login attempts must be at least 3")
    private Integer maxLoginAttempts;

    @NotNull(message = "Login lockout minutes is required")
    @Min(value = 5, message = "Login lockout must be at least 5 minutes")
    private Integer loginLockoutMinutes;

    private boolean requireTwoFactor;

    private boolean allowGuestRegistration;

    @Min(value = 1, message = "Investment approval threshold must be positive")
    private Double investmentApprovalThreshold;

    private LocalDateTime lastModified;

    private String modifiedBy;
}
