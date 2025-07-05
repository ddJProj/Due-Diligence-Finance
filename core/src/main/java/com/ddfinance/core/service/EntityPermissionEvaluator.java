package com.ddfinance.core.service;

import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import org.springframework.stereotype.Service;

/**
 * Service implementation for entity-specific permission evaluation.
 * This service checks permissions in the context of specific domain entities,
 * implementing business rules for resource-level access control.
 *
 * Examples of entity-specific rules:
 * - Employees can only view/edit clients assigned to them
 * - Clients can only view their own investments
 * - Users can only edit their own account details
 * - Guests cannot access any entity-specific resources
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
public class EntityPermissionEvaluator implements PermissionEvaluator {

    /**
     * Evaluates whether a user has a specific permission for a given resource.
     *
     * @param userAccount The user account requesting permission
     * @param permissionType The type of permission being requested
     * @param resourceObject The specific resource/entity being accessed (can be null)
     * @return true if the user has permission, false otherwise
     */
    @Override
    public boolean hasPermission(UserAccount userAccount, Permissions permissionType, Object resourceObject) {
        // Null checks
        if (userAccount == null || permissionType == null) {
            return false;
        }

        // Admin bypass - admins have all permissions
        if (userAccount.getRole() == Role.ADMIN) {
            return true;
        }

        // First check if user has the base permission
        if (!hasBasePermission(userAccount, permissionType)) {
            return false;
        }

        // If no specific resource, permission is granted based on base check
        if (resourceObject == null) {
            return true;
        }

        // Guests cannot access any entity-specific resources
        if (userAccount.getRole() == Role.GUEST) {
            return false;
        }

        // Entity-specific permission checks
        return checkEntitySpecificPermission(userAccount, permissionType, resourceObject);
    }

    /**
     * Checks if the user has the base permission through role or custom assignment.
     *
     * @param userAccount The user account
     * @param permissionType The permission to check
     * @return true if user has the base permission
     */
    private boolean hasBasePermission(UserAccount userAccount, Permissions permissionType) {
        if (userAccount.getPermissions() == null) {
            return false;
        }

        return userAccount.getPermissions().stream()
                .anyMatch(permission -> permission.getPermissionType() == permissionType);
    }

    /**
     * Performs entity-specific permission checks based on business rules.
     *
     * @param userAccount The user account
     * @param permissionType The permission type
     * @param resourceObject The resource being accessed
     * @return true if entity-specific permission is granted
     */
    private boolean checkEntitySpecificPermission(UserAccount userAccount,
                                                  Permissions permissionType,
                                                  Object resourceObject) {
        // Handle different entity types
        if (resourceObject instanceof Client) {
            return checkClientPermission(userAccount, permissionType, (Client) resourceObject);
        }

        if (resourceObject instanceof Investment) {
            return checkInvestmentPermission(userAccount, permissionType, (Investment) resourceObject);
        }

        if (resourceObject instanceof UserAccount) {
            return checkUserAccountPermission(userAccount, permissionType, (UserAccount) resourceObject);
        }

        if (resourceObject instanceof Employee) {
            return checkEmployeePermission(userAccount, permissionType, (Employee) resourceObject);
        }

        // Default deny for unknown resource types
        return false;
    }

    /**
     * Checks permissions for Client entity access.
     * Employees can only access clients assigned to them.
     */
    private boolean checkClientPermission(UserAccount userAccount, Permissions permissionType, Client client) {
        // For employee role, check if client is assigned to them
        if (userAccount.getRole() == Role.EMPLOYEE) {
            if (client.getAssignedEmployee() == null) {
                return false;
            }

            // Check if the employee's user account matches
            Employee assignedEmployee = client.getAssignedEmployee();
            if (assignedEmployee.getUserAccount() == null) {
                return false;
            }

            return assignedEmployee.getUserAccount().getId() != null &&
                    assignedEmployee.getUserAccount().getId().equals(userAccount.getId());
        }

        // Clients cannot access other client entities
        if (userAccount.getRole() == Role.CLIENT) {
            return false;
        }

        return false;
    }

    /**
     * Checks permissions for Investment entity access.
     * Clients can only view their own investments.
     */
    private boolean checkInvestmentPermission(UserAccount userAccount, Permissions permissionType, Investment investment) {
        // For client role, check if investment belongs to them
        if (userAccount.getRole() == Role.CLIENT) {
            if (investment.getClient() == null || investment.getClient().getUserAccount() == null) {
                return false;
            }

            Long clientUserId = investment.getClient().getUserAccount().getId();
            return clientUserId != null && clientUserId.equals(userAccount.getId());
        }

        // Employees can view/edit investments of their assigned clients
        if (userAccount.getRole() == Role.EMPLOYEE) {
            if (investment.getClient() == null || investment.getClient().getAssignedEmployee() == null) {
                return false;
            }

            Employee assignedEmployee = investment.getClient().getAssignedEmployee();
            if (assignedEmployee.getUserAccount() == null) {
                return false;
            }

            return assignedEmployee.getUserAccount().getId() != null &&
                    assignedEmployee.getUserAccount().getId().equals(userAccount.getId());
        }

        return false;
    }

    /**
     * Checks permissions for UserAccount entity access.
     * Users can only edit their own account details.
     */
    private boolean checkUserAccountPermission(UserAccount userAccount, Permissions permissionType, UserAccount targetAccount) {
        // For self-modifying permissions, check if it's the same account
        if (permissionType == Permissions.EDIT_MY_DETAILS ||
                permissionType == Permissions.UPDATE_MY_PASSWORD) {
            return userAccount.getId() != null &&
                    userAccount.getId().equals(targetAccount.getId());
        }

        // For viewing, employees can view their assigned clients' accounts
        if (permissionType == Permissions.VIEW_ACCOUNT && userAccount.getRole() == Role.EMPLOYEE) {
            // TODO: check if target account belongs to an assigned client
            return false;
        }

        return false;
    }

    /**
     * Checks permissions for Employee entity access.
     * Handles special cases like MESSAGE_PARTNER permission.
     */
    private boolean checkEmployeePermission(UserAccount userAccount, Permissions permissionType, Employee employee) {
        // For MESSAGE_PARTNER, clients can only message their assigned employee
        if (permissionType == Permissions.MESSAGE_PARTNER && userAccount.getRole() == Role.CLIENT) {
            // TODO: inject ClientRepository and verify employee assignment
            return false;
        }

        return false;
    }

    /**
     * Helper method to check if two IDs match (null-safe).
     *
     * @param id1 First ID
     * @param id2 Second ID
     * @return true if both IDs are non-null and equal
     */
    private boolean idsMatch(Long id1, Long id2) {
        return id1 != null && id2 != null && id1.equals(id2);
    }
}