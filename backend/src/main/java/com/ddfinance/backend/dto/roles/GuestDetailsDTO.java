package com.ddfinance.backend.dto.roles;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for guest user information.
 * Contains limited profile data and upgrade request status.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GuestDetailsDTO {

    private Long guestId;
    private String email;
    private String firstName;
    private String lastName;

    // Contact information (optional)
    private String phoneNumber;
    private String address;

    // Account status
    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;
    private Boolean profileComplete;

    // Upgrade request status
    private Boolean hasUpgradeRequest;
    private String upgradeRequestStatus;
    private LocalDateTime upgradeRequestDate;

    // Limited access info
    private Integer daysUntilExpiry;
    private Integer allowedActions;
}
