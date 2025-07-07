package com.ddfinance.core.domain.enums;

/**
 * Enum representing the different statuses of a contact request.
 * Tracks the lifecycle of contact form submissions from initial receipt to completion.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public enum ContactStatus {

    /**
     * New contact request that hasn't been reviewed yet
     */
    NEW("New", "Contact request received and awaiting review"),

    /**
     * Contact request has been assigned to an employee
     */
    ASSIGNED("Assigned", "Contact request assigned to employee for follow-up"),

    /**
     * Employee is actively working on the contact request
     */
    IN_PROGRESS("In Progress", "Contact request is being processed"),

    /**
     * Contact request has been successfully handled
     */
    COMPLETED("Completed", "Contact request has been resolved"),

    /**
     * Contact request identified as spam
     */
    SPAM("Spam", "Contact request marked as spam");

    private final String displayName;
    private final String description;

    /**
     * Constructor for ContactStatus
     * @param displayName Human-readable name for display
     * @param description Detailed description of the status
     */
    ContactStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    /**
     * Get the display name for UI presentation
     * @return Human-readable status name
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Get the detailed description of the status
     * @return Status description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Check if this status represents an active state
     * @return true if status is NEW, ASSIGNED, or IN_PROGRESS
     */
    public boolean isActive() {
        return this == NEW || this == ASSIGNED || this == IN_PROGRESS;
    }

    /**
     * Check if this status represents a completed state
     * @return true if status is COMPLETED or SPAM
     */
    public boolean isFinal() {
        return this == COMPLETED || this == SPAM;
    }

    /**
     * Check if this status requires employee attention
     * @return true if status needs employee action
     */
    public boolean requiresAttention() {
        return this == NEW || this == ASSIGNED;
    }

    /**
     * Get the next logical status in the workflow
     * @return Next status or null if final state
     */
    public ContactStatus getNextStatus() {
        return switch (this) {
            case NEW -> ASSIGNED;
            case ASSIGNED -> IN_PROGRESS;
            case IN_PROGRESS -> COMPLETED;
            case COMPLETED, SPAM -> null;
        };
    }

    /**
     * Check if transition to another status is valid
     * @param targetStatus The status to transition to
     * @return true if transition is allowed
     */
    public boolean canTransitionTo(ContactStatus targetStatus) {
        if (targetStatus == null || this == targetStatus) {
            return false;
        }

        return switch (this) {
            case NEW -> targetStatus == ASSIGNED || targetStatus == SPAM;
            case ASSIGNED -> targetStatus == IN_PROGRESS || targetStatus == SPAM || targetStatus == COMPLETED;
            case IN_PROGRESS -> targetStatus == COMPLETED || targetStatus == SPAM;
            case COMPLETED, SPAM -> false;
        };
    }

    /**
     * Get status by display name (case-insensitive)
     * @param displayName The display name to search for
     * @return Matching ContactStatus or null if not found
     */
    public static ContactStatus fromDisplayName(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            return null;
        }

        for (ContactStatus status : values()) {
            if (status.displayName.equalsIgnoreCase(displayName.trim())) {
                return status;
            }
        }
        return null;
    }

    /**
     * Get status from string value (case-insensitive)
     * @param value The string value to parse
     * @return Matching ContactStatus
     * @throws IllegalArgumentException if value doesn't match any status
     */
    public static ContactStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Status value cannot be null or empty");
        }

        String normalized = value.trim().toUpperCase().replace(" ", "_");

        try {
            return ContactStatus.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            // Try to match by display name
            ContactStatus status = fromDisplayName(value);
            if (status != null) {
                return status;
            }
            throw new IllegalArgumentException("Invalid contact status: " + value);
        }
    }
}
