package com.ddfinance.core.domain.enums;

/**
 * Enum representing the different statuses of a guest upgrade request.
 * This enum is used to track the lifecycle of requests from guests to upgrade
 * their account to client status.
 *
 * <p>Status flow:
 * <ol>
 *   <li>PENDING - Request has been submitted and is awaiting review</li>
 *   <li>APPROVED - Request has been approved and user can be upgraded</li>
 *   <li>REJECTED - Request has been rejected and user remains as guest</li>
 * </ol>
 * </p>
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-03-15
 */
public enum UpgradeRequestStatus {

    /**
     * Request is pending approval from an administrator or employee.
     * This is the initial state when a guest submits an upgrade request.
     */
    PENDING,

    /**
     * Request has been approved by an administrator or employee.
     * The guest can now be upgraded to client status.
     */
    APPROVED,

    /**
     * Request has been rejected by an administrator or employee.
     * The guest will remain in their current role and may submit a new request.
     */
    REJECTED;

    /**
     * Checks if this status represents a pending request.
     *
     * @return true if the status is PENDING, false otherwise
     */
    public boolean isPending() {
        return this == PENDING;
    }

    /**
     * Checks if this status represents a processed request (either approved or rejected).
     *
     * @return true if the status is APPROVED or REJECTED, false otherwise
     */
    public boolean isProcessed() {
        return this == APPROVED || this == REJECTED;
    }

    /**
     * Checks if this status represents an approved request.
     *
     * @return true if the status is APPROVED, false otherwise
     */
    public boolean isApproved() {
        return this == APPROVED;
    }

    /**
     * Checks if this status represents a rejected request.
     *
     * @return true if the status is REJECTED, false otherwise
     */
    public boolean isRejected() {
        return this == REJECTED;
    }

    /**
     * Returns a human-readable description of the status.
     *
     * @return a descriptive string for the status
     */
    public String getDescription() {
        return switch (this) {
            case PENDING -> "Request is pending approval";
            case APPROVED -> "Request has been approved";
            case REJECTED -> "Request has been rejected";
        };
    }

    /**
     * Converts a string to the corresponding UpgradeRequestStatus enum value.
     * This method is case-insensitive and handles common variations.
     *
     * @param statusString the string to convert
     * @return the corresponding UpgradeRequestStatus
     * @throws IllegalArgumentException if the string doesn't match any enum value
     */
    public static UpgradeRequestStatus fromString(String statusString) {
        if (statusString == null) {
            throw new IllegalArgumentException("Status string cannot be null");
        }

        String upperCaseStatus = statusString.trim().toUpperCase();

        return switch (upperCaseStatus) {
            case "PENDING" -> PENDING;
            case "APPROVED" -> APPROVED;
            case "REJECTED" -> REJECTED;
            default -> throw new IllegalArgumentException("Unknown status: " + statusString);
        };
    }
}
