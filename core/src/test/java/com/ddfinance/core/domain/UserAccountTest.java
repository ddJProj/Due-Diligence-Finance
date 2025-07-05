package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.domain.enums.Permissions;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserAccountTest {
    private UserAccount userAccount;


    @BeforeEach
    void setUp() {

//        userAccount = new UserAccount("email@test.com", "hashed-password", "firstName", "lastName", );
        userAccount = new UserAccount();
    }

    /*
       FOR INTEGRATION TESTS:
       ADD TRANSACTIONAL TAG to roll back transactions after tests

    */


    // ========== Constructor Tests ==========
    @Test
    void testDefaultConstructor() {
        assertNotNull(userAccount);
        assertNull(userAccount.getId());
        assertEquals("", userAccount.getEmail());
        assertEquals("", userAccount.getPassword());
        assertEquals("", userAccount.getFirstName());
        assertEquals("", userAccount.getLastName());
        assertEquals(Role.GUEST, userAccount.getRole()); // Should default to GUEST
        assertNotNull(userAccount.getPermissions());
        assertTrue(userAccount.getPermissions().isEmpty());
    }

    @Test
    void testParameterizedConstructor() {
        String email = "email@test.com";
        String password = "hashedPassword";
        String firstName = "firstName";
        String lastName = "lastName";

        userAccount = new UserAccount(email, password, firstName, lastName);

        assertEquals(email, userAccount.getEmail());
        assertEquals(password, userAccount.getPassword());
        assertEquals(firstName, userAccount.getFirstName());
        assertEquals(lastName, userAccount.getLastName());
        assertEquals(Role.GUEST, userAccount.getRole()); // Should default to GUEST
        assertNotNull(userAccount.getPermissions());


    }


    @Test
    void testParameterizedConstructorWithRole() {
        String email = "admin@example.com";
        String password = "hashedPassword123";
        String firstName = "Admin";
        String lastName = "User";
        Role role = Role.ADMIN;

        userAccount = new UserAccount(email, password, firstName, lastName, role);

        assertEquals(email, userAccount.getEmail());
        assertEquals(password, userAccount.getPassword());
        assertEquals(firstName, userAccount.getFirstName());
        assertEquals(lastName, userAccount.getLastName());
        assertEquals(role, userAccount.getRole());
    }



    // ========== Basic Field Tests ==========
    @Test
    void testSetGetId() {
        Long id = 123L;
        userAccount.setId(id);
        assertEquals(id, userAccount.getId());
    }

    @Test
    void testSetGetEmail() {
        String email = "test@example.com";
        userAccount.setEmail(email);
        assertEquals(email, userAccount.getEmail());
    }

    @Test
    void testSetGetPassword() {
        String password = "hashedPassword123";
        userAccount.setPassword(password);
        assertEquals(password, userAccount.getPassword());
    }

    @Test
    void testSetGetFirstName() {
        String firstName = "John";
        userAccount.setFirstName(firstName);
        assertEquals(firstName, userAccount.getFirstName());
    }

    @Test
    void testSetGetLastName() {
        String lastName = "Doe";
        userAccount.setLastName(lastName);
        assertEquals(lastName, userAccount.getLastName());
    }

    @Test
    void testSetGetRole() {
        Role role = Role.EMPLOYEE;
        userAccount.setRole(role);
        assertEquals(role, userAccount.getRole());
    }

    // ========== Permission Management Tests ==========
    @Test
    void testSetGetPermissions() {
        Permission permission1 = new Permission(Permissions.VIEW_ACCOUNT, "View account");
        Permission permission2 = new Permission(Permissions.EDIT_MY_DETAILS, "Edit details");

        userAccount.addPermission(permission1);
        userAccount.addPermission(permission2);

        assertEquals(2, userAccount.getPermissions().size());
        assertTrue(userAccount.getPermissions().contains(permission1));
        assertTrue(userAccount.getPermissions().contains(permission2));
    }

    @Test
    void testAddPermission() {
        Permission permission = new Permission(Permissions.VIEW_ACCOUNT, "View account");

        assertTrue(userAccount.getPermissions().isEmpty());
        userAccount.addPermission(permission);

        assertEquals(1, userAccount.getPermissions().size());
        assertTrue(userAccount.getPermissions().contains(permission));
    }

    @Test
    void testRemovePermission() {
        Permission permission = new Permission(Permissions.VIEW_ACCOUNT, "View account");

        userAccount.addPermission(permission);
        assertEquals(1, userAccount.getPermissions().size());

        userAccount.removePermission(permission);
        assertTrue(userAccount.getPermissions().isEmpty());
    }

    @Test
    void testHasPermission() {
        Permission permission = new Permission(Permissions.VIEW_ACCOUNT, "View account");

        assertFalse(userAccount.hasPermission(Permissions.VIEW_ACCOUNT));

        userAccount.addPermission(permission);
        assertTrue(userAccount.hasPermission(Permissions.VIEW_ACCOUNT));
        assertFalse(userAccount.hasPermission(Permissions.CREATE_USER));
    }

    @Test
    void testClearPermissions() {
        Permission permission1 = new Permission(Permissions.VIEW_ACCOUNT, "View account");
        Permission permission2 = new Permission(Permissions.EDIT_MY_DETAILS, "Edit details");

        userAccount.addPermission(permission1);
        userAccount.addPermission(permission2);
        assertEquals(2, userAccount.getPermissions().size());

        userAccount.clearPermissions();
        assertTrue(userAccount.getPermissions().isEmpty());
    }

    // ========== Business Logic Tests ==========
    @Test
    void testGetFullName() {
        userAccount.setFirstName("John");
        userAccount.setLastName("Doe");

        assertEquals("John Doe", userAccount.getFullName());
    }

    @Test
    void testGetFullNameWithEmptyNames() {
        userAccount.setFirstName("");
        userAccount.setLastName("");

        assertEquals(" ", userAccount.getFullName());
    }

    @Test
    void testIsAdmin() {
        userAccount.setRole(Role.GUEST);
        assertFalse(userAccount.isAdmin());

        userAccount.setRole(Role.ADMIN);
        assertTrue(userAccount.isAdmin());
    }

    @Test
    void testIsEmployee() {
        userAccount.setRole(Role.CLIENT);
        assertFalse(userAccount.isEmployee());

        userAccount.setRole(Role.EMPLOYEE);
        assertTrue(userAccount.isEmployee());
    }

    @Test
    void testIsClient() {
        userAccount.setRole(Role.GUEST);
        assertFalse(userAccount.isClient());

        userAccount.setRole(Role.CLIENT);
        assertTrue(userAccount.isClient());
    }

    @Test
    void testIsGuest() {
        userAccount.setRole(Role.CLIENT);
        assertFalse(userAccount.isGuest());

        userAccount.setRole(Role.GUEST);
        assertTrue(userAccount.isGuest());
    }

    @Test
    void testCanUpgradeRole() {
        userAccount.setRole(Role.GUEST);
        assertTrue(userAccount.canUpgradeRole(Role.CLIENT));
        assertTrue(userAccount.canUpgradeRole(Role.EMPLOYEE));
        assertTrue(userAccount.canUpgradeRole(Role.ADMIN));
        assertFalse(userAccount.canUpgradeRole(Role.GUEST));

        userAccount.setRole(Role.ADMIN);
        assertFalse(userAccount.canUpgradeRole(Role.EMPLOYEE));
        assertFalse(userAccount.canUpgradeRole(Role.CLIENT));
        assertFalse(userAccount.canUpgradeRole(Role.GUEST));
    }

    @Test
    void testUpgradeRole() {
        userAccount.setRole(Role.GUEST);

        assertTrue(userAccount.upgradeRole(Role.CLIENT));
        assertEquals(Role.CLIENT, userAccount.getRole());

        // Can't downgrade
        assertFalse(userAccount.upgradeRole(Role.GUEST));
        assertEquals(Role.CLIENT, userAccount.getRole());

        // Can't upgrade to same level
        assertFalse(userAccount.upgradeRole(Role.CLIENT));
    }

    // ========== Validation Tests ==========
    @Test
    void testIsValidEmail() {
        userAccount.setEmail("test@example.com");
        assertTrue(userAccount.isValidEmail());

        userAccount.setEmail("invalid-email");
        assertFalse(userAccount.isValidEmail());

        userAccount.setEmail("");
        assertFalse(userAccount.isValidEmail());

        userAccount.setEmail(null);
        assertFalse(userAccount.isValidEmail());
    }

    @Test
    void testIsComplete() {
        // Empty account should not be complete
        assertFalse(userAccount.isComplete());

        // Set all required fields
        userAccount.setEmail("test@example.com");
        userAccount.setPassword("password123");
        userAccount.setFirstName("John");
        userAccount.setLastName("Doe");
        userAccount.setRole(Role.CLIENT);

        assertTrue(userAccount.isComplete());
    }

    @Test
    void testIsIncompleteWithMissingFields() {
        userAccount.setEmail("test@example.com");
        userAccount.setPassword("password123");
        userAccount.setFirstName("John");
        // Missing lastName
        userAccount.setRole(Role.CLIENT);

        assertFalse(userAccount.isComplete());
    }

    // ========== ToString and Equality Tests ==========
    @Test
    void testToString() {
        userAccount.setId(1L);
        userAccount.setEmail("test@example.com");
        userAccount.setFirstName("John");
        userAccount.setLastName("Doe");
        userAccount.setRole(Role.CLIENT);

        String result = userAccount.toString();
        assertTrue(result.contains("UserAccount"));
        assertTrue(result.contains("id=1"));
        assertTrue(result.contains("email=test@example.com"));
        assertTrue(result.contains("role=CLIENT"));
    }

    @Test
    void testEqualsAndHashCode() {
        UserAccount account1 = new UserAccount("test@example.com", "password", "John", "Doe");
        UserAccount account2 = new UserAccount("test@example.com", "password", "John", "Doe");

        account1.setId(1L);
        account2.setId(1L);

        assertEquals(account1, account2);
        assertEquals(account1.hashCode(), account2.hashCode());

        // Different IDs should not be equal
        account2.setId(2L);
        assertNotEquals(account1, account2);
    }

    @AfterEach
    void tearDown() {
        userAccount = null;
    }

}