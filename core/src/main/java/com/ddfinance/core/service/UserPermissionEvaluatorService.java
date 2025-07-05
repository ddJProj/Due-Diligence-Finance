package com.ddfinance.core.service;

import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 * Service implementation for evaluating user permissions.
 * This service checks if a user has specific permissions based on:
 * 1. Their role-based permissions
 * 2. Any custom permissions assigned to them
 * 3. Resource-specific permissions (if applicable)
 *
 * Admins always have all permissions.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
public class UserPermissionEvaluatorService implements PermissionEvaluator {

    private final RolePermissionService rolePermissionService;

    @Autowired
    public UserPermissionEvaluatorService(RolePermissionService rolePermissionService) {
        this.rolePermissionService = rolePermissionService;
    }

    /**
     * Evaluates whether a user has a specific permission.
     *
     * The evaluation follows this logic:
     * 1. If user is null or permission is null, return false
     * 2. If user is ADMIN, always return true
     * 3. If resourceObject is provided, check resource-specific permissions
     * 4. Otherwise, check both role-based and custom permissions
     *
     * @param userAccount The user account to check permissions for
     * @param permissionType The type of permission to check
     * @param resourceObject Optional resource object for context-specific permission checks
     * @return true if the user has the permission, false otherwise
     */
    @Override
    public boolean hasPermission(UserAccount userAccount, Permissions permissionType, Object resourceObject) {
        // Null checks
        if (userAccount == null || permissionType == null) {
            return false;
        }

        // Admin users have all permissions
        if (userAccount.getRole() == Role.ADMIN) {
            return true;
        }

        // If a resource object is provided, check resource-specific permissions
        if (resourceObject != null) {
            return checkResourceSpecificPermission(userAccount, permissionType, resourceObject);
        }

        // Check role-based permissions
        if (hasRolePermission(userAccount, permissionType)) {
            return true;
        }

        // Check custom permissions
        return hasCustomPermission(userAccount, permissionType);
    }

    /**
     * Checks if the user has the permission through their role.
     *
     * @param userAccount The user account
     * @param permissionType The permission to check
     * @return true if the role grants this permission
     */
    private boolean hasRolePermission(UserAccount userAccount, Permissions permissionType) {
        Role userRole = userAccount.getRole();
        if (userRole == null) {
            return false;
        }

        Set<Permissions> rolePermissions = rolePermissionService.getPermissionsByRole(userRole);
        return rolePermissions.contains(permissionType);
    }

    /**
     * Checks if the user has the permission through custom assignment.
     *
     * @param userAccount The user account
     * @param permissionType The permission to check
     * @return true if the user has this custom permission
     */
    private boolean hasCustomPermission(UserAccount userAccount, Permissions permissionType) {
        if (userAccount.getPermissions() == null) {
            return false;
        }

        return userAccount.getPermissions().stream()
                .anyMatch(permission -> permission.getPermissionType() == permissionType);
    }

    /**
     * Checks resource-specific permissions.
     * This method can be extended to implement complex resource-based authorization.
     *
     * Current implementation returns false for all non-admin users when a resource
     * is specified, effectively requiring explicit implementation for each resource type.
     *
     * @param userAccount The user account
     * @param permissionType The permission to check
     * @param resourceObject The resource to check against
     * @return true if the user has permission for this specific resource
     */
    private boolean checkResourceSpecificPermission(UserAccount userAccount,
                                                   Permissions permissionType,
                                                   Object resourceObject) {
        // TODO: implement resource-specific permission checks

        // For now, return false for all resource-specific checks
        // This ensures secure-by-default behavior
        return false;
    }

    /**
     * Checks if a user is authorized to perform an action on their own account.
     *
     * @param userAccount The user performing the action
     * @param targetAccount The account being acted upon
     * @return true if the user is acting on their own account
     */
    protected boolean isOwnAccount(UserAccount userAccount, UserAccount targetAccount) {
        if (userAccount == null || targetAccount == null) {
            return false;
        }
        return userAccount.getId() != null && userAccount.getId().equals(targetAccount.getId());
    }

    /**
     * Gets all effective permissions for a user (role-based + custom).
     *
     * @param userAccount The user account
     * @return Set of all permissions the user has
     */
    public Set<Permissions> getAllUserPermissions(UserAccount userAccount) {
        if (userAccount == null) {
            return Set.of();
        }

        // Admin has all permissions
        if (userAccount.getRole() == Role.ADMIN) {
            return Permissions.getAllPermissions();
        }

        // Combine role and custom permissions
        Set<Permissions> allPermissions = new java.util.HashSet<>();

        // Add role permissions
        if (userAccount.getRole() != null) {
            allPermissions.addAll(rolePermissionService.getPermissionsByRole(userAccount.getRole()));
        }

        // Add custom permissions
        if (userAccount.getPermissions() != null) {
            userAccount.getPermissions().forEach(permission ->
                allPermissions.add(permission.getPermissionType())
            );
        }

        return allPermissions;
    }
}