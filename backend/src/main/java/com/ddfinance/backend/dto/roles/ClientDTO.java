package com.ddfinance.backend.dto.roles;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for client information used by employees.
 * Contains client summary for employee management.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;

    // Account information
    private LocalDateTime dateJoined;
    private LocalDateTime lastActivity;
    private Boolean isActive;

    // Portfolio summary
    private Double portfolioValue;
    private Integer totalInvestments;
    private Double yearToDateReturn;

    // Investment profile
    private String riskTolerance;
    private String investmentGoals;
    private String preferredSectors;

    // Communication preferences
    private String preferredContactMethod;
    private Boolean emailNotifications;

    // Compliance
    private Boolean kycCompleted;
    private LocalDateTime lastReviewDate;
}
