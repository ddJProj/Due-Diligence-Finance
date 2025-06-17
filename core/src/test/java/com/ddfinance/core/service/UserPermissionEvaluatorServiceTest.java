package com.ddfinance.core.service;
import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class UserPermissionEvaluatorServiceTest {

    private UserPermissionEvaluatorService userPermissionEvaluatorService;
    private UserAccount userAccount;
    private Set<Permission> userPermissions;



    @BeforeEach
    void setUp() {
        userPermissionEvaluatorService = new UserPermissionEvaluatorService();
        userAccount = new UserAccount();
        userPermissions = new HashSet<>();
    }

    @Test
    void testAdminUserAccountHasAllPermissions() {
        userAccount.setRole(Role.ADMIN);

        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.DELETE_USER, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_MY_DETAILS, null));

        // useraccount permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_MY_DETAILS, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.UPDATE_MY_PASSWORD, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_USER, null));

        // guest permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.REQUEST_CLIENT_ACCOUNT, null));

        // client permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_INVESTMENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.MESSAGE_PARTNER, null));

        // employee permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_CLIENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_CLIENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_CLIENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_CLIENTS, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.ASSIGN_CLIENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_INVESTMENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_INVESTMENT, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_EMPLOYEES, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_EMPLOYEE, null));

        // admin permissions
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_USER, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.DELETE_USER, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.EDIT_EMPLOYEE, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.CREATE_EMPLOYEE, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.UPDATE_OTHER_PASSWORD, null));
        assertTrue(userPermissionEvaluatorService.hasPermission(userAccount, Permissions.VIEW_ACCOUNTS, null));



    }

    @AfterEach
    void tearDown() {
    }
}