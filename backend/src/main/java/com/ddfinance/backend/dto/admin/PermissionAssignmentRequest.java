package com.ddfinance.backend.dto.admin;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * DTO for permission assignment requests.
 * Used to assign or remove permissions for users.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PermissionAssignmentRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotEmpty(message = "At least one permission ID is required")
    private Set<Long> permissionIds;
}
