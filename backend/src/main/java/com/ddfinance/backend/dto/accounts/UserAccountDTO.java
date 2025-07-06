package com.ddfinance.backend.dto.accounts;

import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

/**
 * DTO for UserAccount entity.
 * Used for transferring user account data between layers.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserAccountDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private Role role;
    private Set<Permissions> permissions;

    // Password is never included in DTO for security
    // Use separate DTOs for password operations
}
