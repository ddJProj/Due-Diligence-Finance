package com.ddfinance.core.domain.enums;

import java.util.Arrays;
import java.util.Set;

/**
 * Enumeration representing the status of an investment throughout its lifecycle.
 * This enum tracks investments from initial submission through completion or termination,
 * providing comprehensive status management for the investment portfolio system.
 *
 * @author DDFinance Team
 * @version 1.0
 * @since 2025-01-15
 */
public enum InvestmentStatus {

    /**
     * Investment request has been submitted and is awaiting initial processing.
     * This is the initial state when a client submits an investment request.
     */
    PENDING("Investment request is awaiting initial processing", "Pending Review", "warning"),

    /**
     * Investment is currently active and generating returns.
     * The investment has been approved and funds are deployed in the market.
     */
    ACTIVE("Investment is currently active and generating returns", "Active Investment", "success"),

    /**
     * Investment has been successfully completed according to its terms.
     * All objectives have been met and returns have been realized.
     */
    COMPLETED("Investment has been successfully completed", "Completed", "success"),

    /**
     * Investment has been cancelled before activation.
     * This typically occurs during the approval process or at client request.
     */
    CANCELLED("Investment has been cancelled before activation", "Cancelled", "danger"),

    /**
     * Investment is under detailed review by the investment team.
     * Due diligence and risk assessment are being performed.
     */
    UNDER_REVIEW("Investment is under detailed review by the investment team", "Under Review", "info"),

    /**
     * Investment has been approved and is ready for activation.
     * All necessary approvals have been obtained and funds can be deployed.
     */
    APPROVED("Investment has been approved and is ready for activation", "Approved", "success"),

    /**
     * Investment request has been rejected after review.
     * The investment does not meet criteria or risk parameters.
     */
    REJECTED("Investment request has been rejected after review", "Rejected", "danger"),

    /**
     * Active investment has been temporarily suspended.
     * This may be due to market conditions or regulatory requirements.
     */
    SUSPENDED("Active investment has been temporarily suspended", "Suspended", "warning"),

    /**
     * Investment has been liquidated and converted to cash.
     * This represents an early termination with proceeds returned to client.
     */
    LIQUIDATED("Investment has been liquidated and converted to cash", "Liquidated", "secondary"),

    /**
     * Investment has reached its maturity date and concluded naturally.
     * This is the planned completion of a term-based investment.
     */
    MATURED("Investment has reached its maturity date and concluded naturally", "Matured", "primary");

    private final String description;
    private final String displayName;
    private final String statusColor;

    /**
     * Constructor for InvestmentStatus enum values
     *
     * @param description Detailed description of the status
     * @param displayName User-friendly display name
     * @param statusColor Color indicator for UI display
     */
    InvestmentStatus(String description, String displayName, String statusColor) {
        this.description = description;
        this.displayName = displayName;
        this.statusColor = statusColor;
    }

    /**
     * Gets the detailed description of this status
     *
     * @return The status description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Gets the user-friendly display name
     *
     * @return The display name for UI
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Gets the color indicator for this status
     *
     * @return Color name for UI styling (success, warning, danger, info, primary, secondary)
     */
    public String getStatusColor() {
        return statusColor;
    }

    /**
     * Checks if this status represents an active investment
     *
     * @return true if the investment is currently active
     */
    public boolean isActiveStatus() {
        return this == ACTIVE;
    }

    /**
     * Checks if this status represents a pending state
     *
     * @return true if the investment is pending action
     */
    public boolean isPendingStatus() {
        return this == PENDING || this == UNDER_REVIEW;
    }

    /**
     * Checks if this status represents a completed investment
     *
     * @return true if the investment has reached a completion state
     */
    public boolean isCompletedStatus() {
        return this == COMPLETED || this == CANCELLED || this == LIQUIDATED || this == MATURED;
    }

    /**
     * Checks if this status is terminal (no further transitions allowed)
     *
     * @return true if this is a final state
     */
    public boolean isTerminalStatus() {
        return this == CANCELLED || this == REJECTED || this == LIQUIDATED || this == MATURED;
    }

    /**
     * Checks if this status requires approval workflow
     *
     * @return true if approval is needed
     */
    public boolean requiresApproval() {
        return this == PENDING || this == UNDER_REVIEW;
    }

    /**
     * Determines if a transition to another status is valid
     *
     * @param targetStatus The status to transition to
     * @return true if the transition is allowed
     */
    public boolean canTransitionTo(InvestmentStatus targetStatus) {
        if (targetStatus == null) return false;
        if (this == targetStatus) return false; // No self-transitions
        if (isTerminalStatus()) return false; // Terminal states cannot transition

        // Define valid transitions based on business rules
        switch (this) {
            case PENDING:
                return targetStatus == UNDER_REVIEW || targetStatus == CANCELLED;

            case UNDER_REVIEW:
                return targetStatus == APPROVED || targetStatus == REJECTED || targetStatus == CANCELLED;

            case APPROVED:
                return targetStatus == ACTIVE || targetStatus == CANCELLED;

            case ACTIVE:
                return targetStatus == COMPLETED || targetStatus == SUSPENDED ||
                        targetStatus == LIQUIDATED || targetStatus == MATURED;

            case SUSPENDED:
                return targetStatus == ACTIVE || targetStatus == LIQUIDATED || targetStatus == CANCELLED;

            default:
                return false; // Terminal or unknown states
        }
    }

    /**
     * Creates an InvestmentStatus from a string value (case insensitive)
     *
     * @param statusString The status string
     * @return The corresponding InvestmentStatus, or null if not found
     */
    public static InvestmentStatus fromString(String statusString) {
        if (statusString == null || statusString.trim().isEmpty()) {
            return null;
        }

        try {
            return valueOf(statusString.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Gets all active investment statuses
     *
     * @return Set of statuses that represent active investments
     */
    public static Set<InvestmentStatus> getActiveStatuses() {
        return Set.of(ACTIVE, SUSPENDED);
    }

    /**
     * Gets all pending investment statuses
     *
     * @return Set of statuses that represent pending investments
     */
    public static Set<InvestmentStatus> getPendingStatuses() {
        return Set.of(PENDING, UNDER_REVIEW, APPROVED);
    }

    /**
     * Gets all completed investment statuses
     *
     * @return Set of statuses that represent completed investments
     */
    public static Set<InvestmentStatus> getCompletedStatuses() {
        return Set.of(COMPLETED, CANCELLED, LIQUIDATED, MATURED);
    }

    /**
     * Gets all terminal investment statuses
     *
     * @return Set of statuses that are final and cannot be changed
     */
    public static Set<InvestmentStatus> getTerminalStatuses() {
        return Set.of(CANCELLED, REJECTED, LIQUIDATED, MATURED);
    }

    @Override
    public String toString() {
        return name();
    }
}