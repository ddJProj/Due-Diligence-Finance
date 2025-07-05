package com.ddfinance.core.service;

import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Permissions;

/**
 * Interface for evaluating user permissions.
 * Implementations of this interface determine whether a user has a specific permission,
 * either globally or for a specific resource object.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface PermissionEvaluator {

    /**
     * Evaluates whether a user has a specific permission.
     *
     * @param userAccount The user account to check permissions for
     * @param permissionType The type of permission to check
     * @param resourceObject Optional resource object for context-specific permission checks
     * @return true if the user has the permission, false otherwise
     */
    boolean hasPermission(UserAccount userAccount, Permissions permissionType, Object resourceObject);

    /**
     * Evaluates whether a user has a specific permission globally (without resource context).
     *
     * @param userAccount The user account to check permissions for
     * @param permissionType The type of permission to check
     * @return true if the user has the permission, false otherwise
     */
    default boolean hasPermission(UserAccount userAccount, Permissions permissionType) {
        return hasPermission(userAccount, permissionType, null);
    }

    /**
     * Evaluates whether a user has any of the specified permissions.
     *
     * @param userAccount The user account to check permissions for
     * @param permissionTypes The types of permissions to check
     * @return true if the user has at least one of the permissions, false otherwise
     */
    default boolean hasAnyPermission(UserAccount userAccount, Permissions... permissionTypes) {
        if (userAccount == null || permissionTypes == null || permissionTypes.length == 0) {
            return false;
        }

        for (Permissions permission : permissionTypes) {
            if (hasPermission(userAccount, permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Evaluates whether a user has all specified permissions.
     *
     * @param userAccount The user account to check permissions for
     * @param permissionTypes The types of permissions to check
     * @return true if the user has all specified permissions. false otherwise
     */
    default boolean hasAllPermissions(UserAccount userAccount, Permissions... permissionTypes) {
        if (userAccount == null || permissionTypes == null || permissionTypes.length == 0) {
            return false;
        }

        for (Permissions permission : permissionTypes) {
            if (!hasPermission(userAccount, permission)) {
                return false;
            }
        }
        return true;
    }
}