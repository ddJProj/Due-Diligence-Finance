package com.ddfinance.core.domain.enums;

import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.UserAccount;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PermissionsTest {
    private Permission permissionsList;

    private Role role;

    private UserAccount userAccount;

    @BeforeEach
    void setUp() {
        userAccount = new UserAccount();
    }

    @Test
    void testAllPermissionsEnumValues() {

        // User specific enum values
        assertNotNull(Permissions.VIEW_ACCOUNT);
        assertNotNull(Permissions.VIEW_ACCOUNTS);
        assertNotNull(Permissions.EDIT_MY_DETAILS);
        assertNotNull(Permissions.UPDATE_MY_PASSWORD);
        assertNotNull(Permissions.CREATE_USER);

        // Admin specific enum values
        assertNotNull(Permissions.EDIT_USER);
        assertNotNull(Permissions.DELETE_USER);
        assertNotNull(Permissions.EDIT_EMPLOYEE);
        assertNotNull(Permissions.CREATE_EMPLOYEE);
        assertNotNull(Permissions.UPDATE_OTHER_PASSWORD);

        // Employee specific enum values
        assertNotNull(Permissions.CREATE_CLIENT);
        assertNotNull(Permissions.EDIT_CLIENT);
        assertNotNull(Permissions.VIEW_CLIENT);
        assertNotNull(Permissions.VIEW_CLIENTS);
        assertNotNull(Permissions.ASSIGN_CLIENT);
        assertNotNull(Permissions.CREATE_INVESTMENT);
        assertNotNull(Permissions.EDIT_INVESTMENT);
        assertNotNull(Permissions.VIEW_EMPLOYEE);
        assertNotNull(Permissions.VIEW_EMPLOYEES);

        // Client specific enum values
        assertNotNull(Permissions.VIEW_INVESTMENT);

        // Guest specific enum values
        assertNotNull(Permissions.REQUEST_CLIENT_ACCOUNT);

        assertEquals(21, Permissions.values().length);


    }

    @AfterEach
    void tearDown() {
    }

    @Test
    void values() {
    }

    @Test
    void valueOf() {
    }
}