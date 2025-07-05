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
        // Test that the role can be set to and is client enum value
        Role client = Role.CLIENT;
        userAccount.setRole(client);
        assertEquals(client, userAccount.getRole());
    }
    @Test
    void testGuestUserAccountRole() {
        // Test that the role can be set to and is guest enum value
        Role guest = Role.GUEST;
        userAccount.setRole(guest);
        assertEquals(guest, userAccount.getRole());
    }
    @Test
    void testAdminUserAccountRole() {
        // Test that the role can be set to and is admin enum value
        Role admin = Role.ADMIN;
        userAccount.setRole(admin);
        assertEquals(admin, userAccount.getRole());
    }
    @Test
    void testEmployeeUserAccountRole() {
        // Test that the role can be set to and is employee enum value
        Role employee = Role.EMPLOYEE;
        userAccount.setRole(employee);
        assertEquals(employee, userAccount.getRole());
    }

    @Test
    void testRoleEnumValues() {
        // Test that all required role values exist
        assertNotNull(Role.GUEST);
        assertNotNull(Role.CLIENT);
        assertNotNull(Role.EMPLOYEE);
        assertNotNull(Role.ADMIN);
    }

    @Test
    void testRoleEnumCount() {
        // Test that we have exactly 4 roles
        assertEquals(4, Role.values().length);
    }

    @Test
    void testRoleHierarchy() {
        // Test role hierarchy - higher ordinal = higher privilege level
        assertTrue(Role.GUEST.ordinal() < Role.CLIENT.ordinal());
        assertTrue(Role.CLIENT.ordinal() < Role.EMPLOYEE.ordinal());
        assertTrue(Role.EMPLOYEE.ordinal() < Role.ADMIN.ordinal());
    }

    @Test
    void testRoleToString() {
        // Test string representation
        assertEquals("GUEST", Role.GUEST.toString());
        assertEquals("CLIENT", Role.CLIENT.toString());
        assertEquals("EMPLOYEE", Role.EMPLOYEE.toString());
        assertEquals("ADMIN", Role.ADMIN.toString());
    }

    @Test
    void testRoleValueOf() {
        // Test that we can create roles from strings
        assertEquals(Role.GUEST, Role.valueOf("GUEST"));
        assertEquals(Role.CLIENT, Role.valueOf("CLIENT"));
        assertEquals(Role.EMPLOYEE, Role.valueOf("EMPLOYEE"));
        assertEquals(Role.ADMIN, Role.valueOf("ADMIN"));
    }

    @Test
    void testRoleValueOfInvalid() {
        // Test that invalid role names throw exception
        assertThrows(IllegalArgumentException.class, () -> {
            Role.valueOf("INVALID_ROLE");
        });
    }

    @Test
    void testDefaultUserRole() {
        // Test that GUEST is the lowest privilege role (first in enum)
        assertEquals(0, Role.GUEST.ordinal());
    }

    @Test
    void testAdminIsHighestRole() {
        // Test that ADMIN is the highest privilege role (last in enum)
        assertEquals(3, Role.ADMIN.ordinal());
        assertEquals(Role.values().length - 1, Role.ADMIN.ordinal());
    }

    @Test
    void testRoleComparison() {
        // Test comparing roles
        assertTrue(Role.GUEST.compareTo(Role.ADMIN) < 0);
        assertTrue(Role.ADMIN.compareTo(Role.GUEST) > 0);
        assertEquals(0, Role.CLIENT.compareTo(Role.CLIENT));
    }

    @Test
    void testRoleDescription() {
        // Test that each role has a description
        assertNotNull(Role.GUEST.getDescription());
        assertNotNull(Role.CLIENT.getDescription());
        assertNotNull(Role.EMPLOYEE.getDescription());
        assertNotNull(Role.ADMIN.getDescription());

        // Test specific descriptions
        assertTrue(Role.GUEST.getDescription().contains("limited"));
        assertTrue(Role.CLIENT.getDescription().contains("client"));
        assertTrue(Role.EMPLOYEE.getDescription().contains("employee"));
        assertTrue(Role.ADMIN.getDescription().contains("admin"));
    }

    @Test
    void testIsHigherThanOrEqualTo() {
        // Test privilege level comparison
        assertTrue(Role.ADMIN.isHigherThanOrEqualTo(Role.EMPLOYEE));
        assertTrue(Role.EMPLOYEE.isHigherThanOrEqualTo(Role.CLIENT));
        assertTrue(Role.CLIENT.isHigherThanOrEqualTo(Role.GUEST));
        assertTrue(Role.GUEST.isHigherThanOrEqualTo(Role.GUEST));

        assertFalse(Role.GUEST.isHigherThanOrEqualTo(Role.CLIENT));
        assertFalse(Role.CLIENT.isHigherThanOrEqualTo(Role.EMPLOYEE));
        assertFalse(Role.EMPLOYEE.isHigherThanOrEqualTo(Role.ADMIN));
    }

    @Test
    void testCanUpgradeTo() {
        // Test role upgrade logic
        assertTrue(Role.GUEST.canUpgradeTo(Role.CLIENT));
        assertTrue(Role.CLIENT.canUpgradeTo(Role.EMPLOYEE));
        assertTrue(Role.EMPLOYEE.canUpgradeTo(Role.ADMIN));

        // Can't downgrade
        assertFalse(Role.ADMIN.canUpgradeTo(Role.EMPLOYEE));
        assertFalse(Role.CLIENT.canUpgradeTo(Role.GUEST));

        // Can't upgrade to same level
        assertFalse(Role.CLIENT.canUpgradeTo(Role.CLIENT));
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