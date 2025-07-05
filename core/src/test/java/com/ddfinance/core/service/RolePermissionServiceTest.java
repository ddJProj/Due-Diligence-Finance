package com.ddfinance.core.service;

import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for RolePermissionService.
 * Tests that each role receives the correct set of default permissions.
 */
class RolePermissionServiceTest {

    private RolePermissionService rolePermissionService;
    private Set<Permissions> permissions;

    @BeforeEach
    void setUp() {
        rolePermissionService = new RolePermissionService();
    }

    /*
     * Guest specific role permission tests
     */
    @Test
    void testGuestRoleHasGuestPermissions() {
        // Given a guest role
        // When getting permissions for guest
        permissions = rolePermissionService.getPermissionsByRole(Role.GUEST);

        // Then guest should have basic permissions plus guest-specific permissions
        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));
        assertTrue(permissions.contains(Permissions.REQUEST_CLIENT_ACCOUNT));

        assertEquals(5, permissions.size());
    }

    @Test
    void testGuestRoleDoesNotHaveUnauthorizedPermissions() {
        // Given a guest role
        permissions = rolePermissionService.getPermissionsByRole(Role.GUEST);

        // Then guest should NOT have client, employee, or admin permissions
        assertFalse(permissions.contains(Permissions.VIEW_INVESTMENT));
        assertFalse(permissions.contains(Permissions.MESSAGE_PARTNER));
        assertFalse(permissions.contains(Permissions.CREATE_CLIENT));
        assertFalse(permissions.contains(Permissions.EDIT_EMPLOYEE));
        assertFalse(permissions.contains(Permissions.DELETE_USER));
    }

    /*
     * Client specific role permission tests
     */
    @Test
    void testClientRoleHasClientPermissions() {
        // Given a client role
        permissions = rolePermissionService.getPermissionsByRole(Role.CLIENT);

        // Then client should have basic permissions plus client-specific permissions
        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));
        assertTrue(permissions.contains(Permissions.VIEW_INVESTMENT));
        assertTrue(permissions.contains(Permissions.MESSAGE_PARTNER));

        assertEquals(6, permissions.size());
    }

    @Test
    void testClientRoleDoesNotHaveUnauthorizedPermissions() {
        // Given a client role
        permissions = rolePermissionService.getPermissionsByRole(Role.CLIENT);

        // Then client should NOT have employee or admin permissions
        assertFalse(permissions.contains(Permissions.CREATE_CLIENT));
        assertFalse(permissions.contains(Permissions.EDIT_CLIENT));
        assertFalse(permissions.contains(Permissions.CREATE_INVESTMENT));
        assertFalse(permissions.contains(Permissions.DELETE_USER));
        assertFalse(permissions.contains(Permissions.VIEW_EMPLOYEES));
    }

    /*
     * Employee specific role permission tests
     */
    @Test
    void testEmployeeRoleHasEmployeePermissions() {
        // Given an employee role
        permissions = rolePermissionService.getPermissionsByRole(Role.EMPLOYEE);

        // Then employee should have basic permissions
        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));

        // And employee-specific permissions
        assertTrue(permissions.contains(Permissions.CREATE_INVESTMENT));
        assertTrue(permissions.contains(Permissions.EDIT_INVESTMENT));
        assertTrue(permissions.contains(Permissions.CREATE_CLIENT));
        assertTrue(permissions.contains(Permissions.EDIT_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENTS));
        assertTrue(permissions.contains(Permissions.ASSIGN_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEES));

        assertEquals(13, permissions.size());
    }

    @Test
    void testEmployeeRoleDoesNotHaveAdminPermissions() {
        // Given an employee role
        permissions = rolePermissionService.getPermissionsByRole(Role.EMPLOYEE);

        // Then employee should NOT have admin-only permissions
        assertFalse(permissions.contains(Permissions.EDIT_USER));
        assertFalse(permissions.contains(Permissions.DELETE_USER));
        assertFalse(permissions.contains(Permissions.EDIT_EMPLOYEE));
        assertFalse(permissions.contains(Permissions.CREATE_EMPLOYEE));
        assertFalse(permissions.contains(Permissions.UPDATE_OTHER_PASSWORD));
        assertFalse(permissions.contains(Permissions.VIEW_ACCOUNTS));
    }

    /*
     * Admin specific role permission tests
     */
    @Test
    void testAdminRoleHasAllPermissions() {
        // Given an admin role
        permissions = rolePermissionService.getPermissionsByRole(Role.ADMIN);

        // Then admin should have ALL permissions
        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));
        assertTrue(permissions.contains(Permissions.REQUEST_CLIENT_ACCOUNT));
        assertTrue(permissions.contains(Permissions.VIEW_INVESTMENT));
        assertTrue(permissions.contains(Permissions.MESSAGE_PARTNER));
        assertTrue(permissions.contains(Permissions.CREATE_CLIENT));
        assertTrue(permissions.contains(Permissions.EDIT_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENTS));
        assertTrue(permissions.contains(Permissions.ASSIGN_CLIENT));
        assertTrue(permissions.contains(Permissions.CREATE_INVESTMENT));
        assertTrue(permissions.contains(Permissions.EDIT_INVESTMENT));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEES));
        assertTrue(permissions.contains(Permissions.EDIT_USER));
        assertTrue(permissions.contains(Permissions.DELETE_USER));
        assertTrue(permissions.contains(Permissions.EDIT_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.CREATE_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.UPDATE_OTHER_PASSWORD));
        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNTS));

        // Admin should have exactly all 23 permissions
        assertEquals(23, permissions.size());
        assertEquals(Permissions.getAllPermissions().size(), permissions.size());
    }

    @Test
    void testNullRoleReturnsEmptySet() {
        // Given a null role
        // When getting permissions
        permissions = rolePermissionService.getPermissionsByRole(null);

        // Then should return empty set, not null
        assertNotNull(permissions);
        assertTrue(permissions.isEmpty());
    }

    @Test
    void testPermissionsReturnedAreImmutable() {
        // Given permissions for a role
        Set<Permissions> guestPermissions = rolePermissionService.getPermissionsByRole(Role.GUEST);
        int originalSize = guestPermissions.size();

        // When trying to modify the returned set
        try {
            guestPermissions.add(Permissions.DELETE_USER);
            // If we get here, the set is mutable - check it didn't actually add
            assertNotEquals(originalSize + 1, guestPermissions.size());
        } catch (UnsupportedOperationException e) {
            // This is expected - the set should be immutable
            assertTrue(true);
        }
    }
}