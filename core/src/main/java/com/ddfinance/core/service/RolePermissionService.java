package com.ddfinance.core.service;

import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * Service that defines the relationship between roles and their default permissions.
 * This service provides the base permissions that each role should have in the system.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
public class RolePermissionService {

    /**
     * Base permissions that all authenticated users should have
     */
    private static final Set<Permissions> BASE_PERMISSIONS = EnumSet.of(
            Permissions.VIEW_ACCOUNT,
            Permissions.EDIT_MY_DETAILS,
            Permissions.UPDATE_MY_PASSWORD,
            Permissions.CREATE_USER
    );

    /**
     * Guest-specific permissions
     */
    private static final Set<Permissions> GUEST_PERMISSIONS = EnumSet.of(
            Permissions.REQUEST_CLIENT_ACCOUNT
    );

    /**
     * Client-specific permissions
     */
    private static final Set<Permissions> CLIENT_PERMISSIONS = EnumSet.of(
            Permissions.VIEW_INVESTMENT,
            Permissions.MESSAGE_PARTNER
    );

    /**
     * Employee-specific permissions
     */
    private static final Set<Permissions> EMPLOYEE_PERMISSIONS = EnumSet.of(
            Permissions.CREATE_INVESTMENT,
            Permissions.EDIT_INVESTMENT,
            Permissions.CREATE_CLIENT,
            Permissions.EDIT_CLIENT,
            Permissions.VIEW_CLIENT,
            Permissions.VIEW_CLIENTS,
            Permissions.ASSIGN_CLIENT,
            Permissions.VIEW_EMPLOYEE,
            Permissions.VIEW_EMPLOYEES
    );

    /**
     * Gets the default permissions for a given role.
     *
     * @param role The role to get permissions for
     * @return An immutable set of permissions for the role, or empty set if role is null
     */
    public Set<Permissions> getPermissionsByRole(Role role) {
        if (role == null) {
            return Collections.emptySet();
        }

        Set<Permissions> permissions = EnumSet.noneOf(Permissions.class);

        // Add base permissions for all authenticated users
        permissions.addAll(BASE_PERMISSIONS);

        // Add role-specific permissions
        switch (role) {
            case GUEST:
                permissions.addAll(GUEST_PERMISSIONS);
                break;

            case CLIENT:
                permissions.addAll(CLIENT_PERMISSIONS);
                break;

            case EMPLOYEE:
                permissions.addAll(EMPLOYEE_PERMISSIONS);
                break;

            case ADMIN:
                // Admin gets all permissions
                return Collections.unmodifiableSet(Permissions.getAllPermissions());

            default:
                // This should never happen with enums, but just in case
                break;
        }

        // Return an immutable set to prevent external modification
        return Collections.unmodifiableSet(permissions);
    }

    /**
     * Checks if a role has a specific permission by default.
     *
     * @param role The role to check
     * @param permission The permission to check for
     * @return true if the role has the permission by default, false otherwise
     */
    public boolean roleHasPermission(Role role, Permissions permission) {
        if (role == null || permission == null) {
            return false;
        }

        return getPermissionsByRole(role).contains(permission);
    }

    /**
     * Gets the additional permissions a role has beyond the base permissions.
     *
     * @param role The role to get additional permissions for
     * @return An immutable set of role-specific permissions (excluding base permissions)
     */
    public Set<Permissions> getAdditionalPermissionsForRole(Role role) {
        if (role == null) {
            return Collections.emptySet();
        }

        Set<Permissions> additional = EnumSet.noneOf(Permissions.class);

        switch (role) {
            case GUEST:
                additional.addAll(GUEST_PERMISSIONS);
                break;

            case CLIENT:
                additional.addAll(CLIENT_PERMISSIONS);
                break;

            case EMPLOYEE:
                additional.addAll(EMPLOYEE_PERMISSIONS);
                break;

            case ADMIN:
                // Admin has all permissions as additional
                additional.addAll(Permissions.getAllPermissions());
                additional.removeAll(BASE_PERMISSIONS);
                break;

            default:
                break;
        }

        return Collections.unmodifiableSet(additional);
    }
}
