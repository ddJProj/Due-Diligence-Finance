package com.ddfinance.backend.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for bulk user operations.
 * Allows performing operations on multiple users at once.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BulkUserOperationRequest {

    @NotEmpty(message = "User IDs list cannot be empty")
    private List<Long> userIds;

    @NotNull(message = "Operation is required")
    @Pattern(regexp = "ACTIVATE|DEACTIVATE|RESET_PASSWORD|DELETE",
            message = "Operation must be one of: ACTIVATE, DEACTIVATE, RESET_PASSWORD, DELETE")
    private String operation;

    // Optional parameters for specific operations
    private String reason;
    private Boolean sendNotification;
}