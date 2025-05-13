package com.ddfinance.core.domain.enums;

import com.ddfinance.core.domain.UserAccount;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;


class RolesTest {
    private UserAccount userAccount;

    @BeforeEach
    void setUp() {
        userAccount = new UserAccount();
    }

    @Test
    void testClientUserAccountRole() {
        Role client = Role.client;
        userAccount.setRole(client);
        assertEquals(client, userAccount.getRole());
    }
    @Test
    void testGuestUserAccountRole() {
        Role guest = Role.guest;
        userAccount.setRole(guest);
        assertEquals(, userAccount.getRole());
    }
    @Test
    void testAdminUserAccountRole() {
        Role admin = Role.admin;
        userAccount.setRole(admin);
        assertEquals(admin, userAccount.getRole());
    }
    @Test
    void testEmployeeUserAccountRole() {
        Role employee = Role.employee;
        userAccount.setRole(employee);
        assertEquals(employee, userAccount.getRole());
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

    @Test
    void testValues() {
    }

    @Test
    void testValueOf() {
    }
}