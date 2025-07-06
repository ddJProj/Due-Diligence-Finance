package com.ddfinance.backend.dto.roles;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for detailed client information.
 * Contains comprehensive client profile and portfolio summary.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClientDetailsDTO {

    private Long id;
    private String clientId;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;

    private LocalDateTime dateJoined;
    private LocalDateTime lastActivity;

    private EmployeeDTO assignedEmployee;

    // Portfolio summary
    private Integer totalInvestments;
    private Double portfolioValue;
    private Double totalInvested;
    private Double totalProfitLoss;
    private Double totalProfitLossPercentage;

    // Account status
    private Boolean isActive;
    private String accountStatus;

    // Investment preferences
    private String riskTolerance;
    private String investmentHorizon;
}