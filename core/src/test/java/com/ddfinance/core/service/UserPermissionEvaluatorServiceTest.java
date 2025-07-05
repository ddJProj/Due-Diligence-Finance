package com.ddfinance.core.service;

import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.Client;
import com.ddfinance.core.domain.Employee;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Test class for UserPermissionEvaluatorService.
 * Tests permission evaluation logic for users based on roles and custom permissions.
 */
class UserPermissionEvaluatorServiceTest {

    private UserPermissionEvaluatorService userPermissionEvaluatorService;

    @Mock
    private RolePermissionService rolePermissionService;

    private UserAccount userAccount;
    private Set<Permission> userPermissions;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        userPermissionEvaluatorService = new UserPermissionEvaluatorService(rolePermissionService);
        userAccount = new UserAccount("test@example.com", "password", "Test", "User");
        userPermissions = new HashSet<>();
    }

    @Test
    void testAdminUserAccountHasAllPermissions() {
        // Given an admin user
        userAccount.setRole(Role.ADMIN);

        // When checking any permission
        // Then admin should have all permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.DELETE_USER, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_MY_DETAILS, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_EMPLOYEE, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNTS, null));

        // Verify no interaction with rolePermissionService for admin
        verifyNoInteractions(rolePermissionService);
    }

    @Test
    void testNonAdminUserWithRoleBasedPermissions() {
        // Given a client user
        userAccount.setRole(Role.CLIENT);

        // Mock the role permission service
        Set<Permissions> clientPermissions = Set.of(
                Permissions.VIEW_ACCOUNT,
                Permissions.EDIT_MY_DETAILS,
                Permissions.UPDATE_MY_PASSWORD,
                Permissions.CREATE_USER,
                Permissions.VIEW_INVESTMENT,
                Permissions.MESSAGE_PARTNER
        );
        when(rolePermissionService.getPermissionsByRole(Role.CLIENT)).thenReturn(clientPermissions);

        // When checking permissions
        // Then should have role-based permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_INVESTMENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.MESSAGE_PARTNER, null));

        // And should NOT have permissions outside their role
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.DELETE_USER, null));
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_EMPLOYEE, null));
    }

    @Test
    void testUserWithCustomPermissions() {
        // Given a user with custom permissions beyond their role
        userAccount.setRole(Role.CLIENT);

        // Add custom permissions
        Permission customPermission = new Permission(Permissions.CREATE_INVESTMENT, "Permission to create investments");
        userPermissions.add(customPermission);
        userAccount.setPermissions(userPermissions);

        // Mock role permissions (without CREATE_INVESTMENT)
        Set<Permissions> clientPermissions = Set.of(
                Permissions.VIEW_ACCOUNT,
                Permissions.VIEW_INVESTMENT
        );
        when(rolePermissionService.getPermissionsByRole(Role.CLIENT)).thenReturn(clientPermissions);

        // When checking permissions
        // Then should have both role-based and custom permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_INVESTMENT, null));

        // But not permissions they don't have
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.DELETE_USER, null));
    }

    @Test
    void testUserWithOnlyCustomPermissions() {
        // Given a user with only custom permissions (no role permissions)
        userAccount.setRole(Role.GUEST);

        // Add specific custom permission
        Permission customPermission = new Permission(Permissions.VIEW_CLIENTS, "Permission to view client list");
        userPermissions.add(customPermission);
        userAccount.setPermissions(userPermissions);

        // Mock empty role permissions
        when(rolePermissionService.getPermissionsByRole(Role.GUEST)).thenReturn(Set.of());

        // When checking permissions
        // Then should have only the custom permission
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_CLIENTS, null));
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
    }

    @Test
    void testNullUserAccountReturnsFalse() {
        // Given null user account
        // When checking permission
        // Then should return false
        assertFalse(userPermissionEvaluatorService.hasPermission(null, Permissions.VIEW_ACCOUNT, null));
    }

    @Test
    void testNullPermissionTypeReturnsFalse() {
        // Given valid user but null permission
        userAccount.setRole(Role.CLIENT);

        // When checking null permission
        // Then should return false
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, null, null));
    }

    @Test
    void testUserWithNullRoleUsesOnlyCustomPermissions() {
        // Given user with null role but custom permissions
        userAccount.setRole(null);
        Permission customPermission = new Permission(Permissions.VIEW_ACCOUNT, "Permission to view account");
        userPermissions.add(customPermission);
        userAccount.setPermissions(userPermissions);

        // When checking permissions
        // Then should only check custom permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_MY_DETAILS, null));
    }

    @Test
    void testUserWithNullPermissionsUsesOnlyRolePermissions() {
        // Given user with null custom permissions
        userAccount.setRole(Role.EMPLOYEE);
        userAccount.setPermissions(null);

        // Mock role permissions
        Set<Permissions> employeePermissions = Set.of(
                Permissions.VIEW_ACCOUNT,
                Permissions.CREATE_CLIENT
        );
        when(rolePermissionService.getPermissionsByRole(Role.EMPLOYEE)).thenReturn(employeePermissions);

        // When checking permissions
        // Then should only use role permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_CLIENT, null));
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.DELETE_USER, null));
    }

    @Test
    void testResourceObjectPermissionCheckForNonAdmin() {
        // Given a non-admin user with a resource object
        userAccount.setRole(Role.EMPLOYEE);
        Object resourceObject = new Client(); // Some resource

        // When checking permission with resource object
        // Then should delegate to resource-specific logic (currently returns false)
        assertFalse(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_CLIENT, resourceObject));

        // Verify no role permission check when resource object is provided
        verifyNoInteractions(rolePermissionService);
    }

    @Test
    void testAdminBypassesResourceObjectCheck() {
        // Given an admin user with a resource object
        userAccount.setRole(Role.ADMIN);
        Object resourceObject = new Client();

        // When checking permission with resource object
        // Then admin should still have permission
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_CLIENT, resourceObject));
    }

    @Test
    void testPermissionCachingBehavior() {
        // Given a user with role
        userAccount.setRole(Role.CLIENT);

        // Mock role permissions
        Set<Permissions> clientPermissions = Set.of(Permissions.VIEW_ACCOUNT);
        when(rolePermissionService.getPermissionsByRole(Role.CLIENT)).thenReturn(clientPermissions);

        // When checking same permission multiple times
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));

        // Then role permission service should be called each time (no caching)
        verify(rolePermissionService, times(3)).getPermissionsByRole(Role.CLIENT);
    }

    @Test
    void testEmployeePermissionsScenario() {
        // Given a user account with employee role
        UserAccount employeeAccount = new UserAccount("employee@company.com", "password", "John", "Doe");
        employeeAccount.setRole(Role.EMPLOYEE);

        // Mock employee permissions
        Set<Permissions> employeePermissions = Set.of(
                Permissions.VIEW_ACCOUNT,
                Permissions.CREATE_CLIENT,
                Permissions.EDIT_CLIENT,
                Permissions.VIEW_CLIENTS,
                Permissions.CREATE_INVESTMENT
        );
        when(rolePermissionService.getPermissionsByRole(Role.EMPLOYEE)).thenReturn(employeePermissions);

        // When checking various permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(employeeAccount, Permissions.CREATE_CLIENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(employeeAccount, Permissions.CREATE_INVESTMENT, null));
        assertFalse(userPermissionEvaluatorService.hasPermission(employeeAccount, Permissions.DELETE_USER, null));
        assertFalse(userPermissionEvaluatorService.hasPermission(employeeAccount, Permissions.CREATE_EMPLOYEE, null));
    }
}