package com.ddfinance.backend.dto.actions;

import com.ddfinance.core.domain.enums.UpgradeRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for guest upgrade request information.
 * Contains request details and status.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpgradeRequestDTO {

    private Long requestId;
    private Long guestId;

    // Request details
    private LocalDateTime requestDate;
    private UpgradeRequestStatus status;

    // Personal information
    private String phoneNumber;
    private String address;
    private String occupation;
    private Double annualIncome;

    // Investment information
    private String investmentGoals;
    private String riskTolerance;
    private Double expectedInvestmentAmount;
    private String sourceOfFunds;

    // Processing information
    private LocalDateTime reviewedDate;
    private String reviewedBy;
    private String reviewNotes;
    private String rejectionReason;
}
