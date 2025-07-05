package com.ddfinance.core.domain.enums;

import lombok.Getter;

@Getter
public enum Role {
    GUEST("Guest user with limited access, can request account upgrade"),
    CLIENT("Client user who can view their investments and account details"),
    EMPLOYEE("Employee who can manage clients and create investments"),
    ADMIN("Administrator with full system access and user management capabilities");


    private final String description;

    /**
     * Constructor for Role enum
     * @param description description of the role's capabilities
     */
    Role(String description) {
        this.description = description;
    }

    /**
     * Check if this role has higher or equal privileges than another role
     * @param other the role to compare against
     * @return true if this role has higher or equal privileges
     */
    public boolean isHigherThanOrEqualTo(Role other) {
        return this.ordinal() >= other.ordinal();
    }

    /**
     * Check if this role can be upgraded to another role
     * @param targetRole the role to upgrade to
     * @return true if upgrade is possible (target role is higher)
     */
    public boolean canUpgradeTo(Role targetRole) {
        return this.ordinal() < targetRole.ordinal();
    }

    /**
     * Get the default role for new users
     * @return GUEST role as the default
     */
    public static Role getDefaultRole() {
        return GUEST;
    }

    /**
     * Check if this is an administrative role
     * @return true if this role is ADMIN
     */
    public boolean isAdmin() {
        return this == ADMIN;
    }

    /**
     * Check if this role can manage other users
     * @return true if this role is EMPLOYEE or ADMIN
     */
    public boolean canManageUsers() {
        return this == EMPLOYEE || this == ADMIN;
    }

    /**
     * Check if this role can approve client upgrades
     * @return true if this role is EMPLOYEE or ADMIN
     */
    public boolean canApproveClientUpgrades() {
        return this == EMPLOYEE || this == ADMIN;
    }
}

