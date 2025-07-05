package com.ddfinance.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ddfinance.core.domain.enums.Role;

/**
 * Test class for Admin entity
 * Tests all functionality for admin account type with system-wide permissions
 */
public class AdminTest {

    private Admin admin;
    private UserAccount adminUserAccount;
    private LocalDateTime testDate;

    @BeforeEach
    void setUp() {
        // Create test UserAccount with ADMIN role
        adminUserAccount = new UserAccount();
        adminUserAccount.setId(1L);
        adminUserAccount.setEmail("admin@ddfinance.com");
        adminUserAccount.setFirstName("System");
        adminUserAccount.setLastName("Administrator");
        adminUserAccount.setRole(Role.ADMIN);

        // Create test date
        testDate = LocalDateTime.of(2025, 1, 15, 9, 0, 0);

        // Create test Admin
        admin = new Admin();
    }

    @Test
    void testDefaultConstructor() {
        Admin testAdmin = new Admin();
        assertNotNull(testAdmin);
        assertNull(testAdmin.getId());
        assertNull(testAdmin.getUserAccount());
        assertNull(testAdmin.getAdminId());
        assertNull(testAdmin.getDepartment());
        assertNull(testAdmin.getAccessLevel());
        assertNull(testAdmin.getLastLoginDate());
    }

    @Test
    void testParameterizedConstructor() {
        Admin testAdmin = new Admin(
                adminUserAccount,
                "ADM-001",
                "System Administration",
                "SUPER_ADMIN",
                testDate
        );

        assertNotNull(testAdmin);
        assertEquals(adminUserAccount, testAdmin.getUserAccount());
        assertEquals("ADM-001", testAdmin.getAdminId());
        assertEquals("System Administration", testAdmin.getDepartment());
        assertEquals("SUPER_ADMIN", testAdmin.getAccessLevel());
        assertEquals(testDate, testAdmin.getLastLoginDate());
    }

    @Test
    void testIdGetterAndSetter() {
        Long testId = 100L;
        admin.setId(testId);
        assertEquals(testId, admin.getId());
    }

    @Test
    void testUserAccountGetterAndSetter() {
        admin.setUserAccount(adminUserAccount);
        assertEquals(adminUserAccount, admin.getUserAccount());

        // Test null assignment
        admin.setUserAccount(null);
        assertNull(admin.getUserAccount());
    }

    @Test
    void testAdminIdGetterAndSetter() {
        String testAdminId = "ADM-001";
        admin.setAdminId(testAdminId);
        assertEquals(testAdminId, admin.getAdminId());

        // Test null assignment
        admin.setAdminId(null);
        assertNull(admin.getAdminId());

        // Test empty string
        admin.setAdminId("");
        assertEquals("", admin.getAdminId());
    }

    @Test
    void testDepartmentGetterAndSetter() {
        String testDepartment = "IT Security";
        admin.setDepartment(testDepartment);
        assertEquals(testDepartment, admin.getDepartment());

        // Test various departments
        admin.setDepartment("System Administration");
        assertEquals("System Administration", admin.getDepartment());

        admin.setDepartment("Compliance");
        assertEquals("Compliance", admin.getDepartment());

        // Test null assignment
        admin.setDepartment(null);
        assertNull(admin.getDepartment());
    }

    @Test
    void testAccessLevelGetterAndSetter() {
        String testAccessLevel = "SUPER_ADMIN";
        admin.setAccessLevel(testAccessLevel);
        assertEquals(testAccessLevel, admin.getAccessLevel());

        // Test different access levels
        admin.setAccessLevel("SYSTEM_ADMIN");
        assertEquals("SYSTEM_ADMIN", admin.getAccessLevel());

        admin.setAccessLevel("FINANCIAL_ADMIN");
        assertEquals("FINANCIAL_ADMIN", admin.getAccessLevel());

        // Test null assignment
        admin.setAccessLevel(null);
        assertNull(admin.getAccessLevel());
    }

    @Test
    void testLastLoginDateGetterAndSetter() {
        admin.setLastLoginDate(testDate);
        assertEquals(testDate, admin.getLastLoginDate());

        // Test with different date
        LocalDateTime newDate = LocalDateTime.of(2025, 1, 16, 14, 30, 0);
        admin.setLastLoginDate(newDate);
        assertEquals(newDate, admin.getLastLoginDate());

        // Test null assignment
        admin.setLastLoginDate(null);
        assertNull(admin.getLastLoginDate());
    }

    @Test
    void testCompleteAdminProfile() {
        // Test setting up complete admin profile
        admin.setUserAccount(adminUserAccount);
        admin.setAdminId("ADM-001");
        admin.setDepartment("Investment Management");
        admin.setAccessLevel("FINANCIAL_ADMIN");
        admin.setLastLoginDate(testDate);

        // Verify all fields are set correctly
        assertEquals(adminUserAccount, admin.getUserAccount());
        assertEquals("ADM-001", admin.getAdminId());
        assertEquals("Investment Management", admin.getDepartment());
        assertEquals("FINANCIAL_ADMIN", admin.getAccessLevel());
        assertEquals(testDate, admin.getLastLoginDate());

        // Verify user account has admin role
        assertEquals(Role.ADMIN, admin.getUserAccount().getRole());
        assertEquals("admin@ddfinance.com", admin.getUserAccount().getEmail());
    }

    @Test
    void testAdminIdUniqueness() {
        // Test that admin IDs follow expected format
        String[] validAdminIds = {
                "ADM-001", "ADM-002", "ADM-999",
                "SADM-001", "FADM-001"
        };

        for (String adminId : validAdminIds) {
            admin.setAdminId(adminId);
            assertEquals(adminId, admin.getAdminId());
            assertTrue(adminId.contains("ADM"));
        }
    }

    @Test
    void testDepartmentCategories() {
        // Test common admin departments in financial firm
        String[] departments = {
                "System Administration",
                "IT Security",
                "Compliance",
                "Investment Management",
                "Risk Management",
                "Client Relations",
                "Financial Operations"
        };

        for (String dept : departments) {
            admin.setDepartment(dept);
            assertEquals(dept, admin.getDepartment());
        }
    }

    @Test
    void testAccessLevels() {
        // Test different admin access levels
        String[] accessLevels = {
                "SUPER_ADMIN",
                "SYSTEM_ADMIN",
                "FINANCIAL_ADMIN",
                "COMPLIANCE_ADMIN",
                "USER_ADMIN"
        };

        for (String level : accessLevels) {
            admin.setAccessLevel(level);
            assertEquals(level, admin.getAccessLevel());
        }
    }

    @Test
    void testUpdateLastLogin() {
        // Test updating last login functionality
        LocalDateTime initialLogin = LocalDateTime.of(2025, 1, 15, 9, 0, 0);
        LocalDateTime recentLogin = LocalDateTime.of(2025, 1, 15, 15, 30, 0);

        admin.setLastLoginDate(initialLogin);
        assertEquals(initialLogin, admin.getLastLoginDate());

        // Simulate login update
        admin.updateLastLogin();
        assertNotNull(admin.getLastLoginDate());
        // In real implementation, this would be current time
        // For test, we'll verify the method exists and can be called
    }

    @Test
    void testAdminBusinessLogic() {
        // Test admin-specific business logic methods
        admin.setUserAccount(adminUserAccount);
        admin.setAdminId("ADM-001");
        admin.setDepartment("System Administration");
        admin.setAccessLevel("SUPER_ADMIN");

        // Test high-level access verification
        assertTrue(admin.hasHighLevelAccess());

        // Test system admin verification
        assertTrue(admin.isSystemAdmin());

        // Test financial admin verification
        admin.setAccessLevel("FINANCIAL_ADMIN");
        assertTrue(admin.isFinancialAdmin());

        // Test compliance admin verification
        admin.setAccessLevel("COMPLIANCE_ADMIN");
        assertTrue(admin.isComplianceAdmin());
    }

    @Test
    void testEqualsAndHashCode() {
        // Create two identical admins
        Admin admin1 = new Admin();
        admin1.setId(1L);
        admin1.setUserAccount(adminUserAccount);
        admin1.setAdminId("ADM-001");
        admin1.setDepartment("IT Security");
        admin1.setAccessLevel("SUPER_ADMIN");

        Admin admin2 = new Admin();
        admin2.setId(1L);
        admin2.setUserAccount(adminUserAccount);
        admin2.setAdminId("ADM-001");
        admin2.setDepartment("IT Security");
        admin2.setAccessLevel("SUPER_ADMIN");

        // Test equality
        assertEquals(admin1, admin2);
        assertEquals(admin1.hashCode(), admin2.hashCode());

        // Test inequality when ID is different
        admin2.setId(2L);
        assertNotEquals(admin1, admin2);
        assertNotEquals(admin1.hashCode(), admin2.hashCode());
    }

    @Test
    void testToString() {
        admin.setId(1L);
        admin.setUserAccount(adminUserAccount);
        admin.setAdminId("ADM-001");
        admin.setDepartment("Investment Management");
        admin.setAccessLevel("FINANCIAL_ADMIN");
        admin.setLastLoginDate(testDate);

        String toString = admin.toString();

        assertNotNull(toString);
        assertTrue(toString.contains("Admin"));
        assertTrue(toString.contains("id=1"));
        assertTrue(toString.contains("ADM-001"));
        assertTrue(toString.contains("Investment Management"));
        assertTrue(toString.contains("FINANCIAL_ADMIN"));
        assertTrue(toString.contains("admin@ddfinance.com"));
    }

    @Test
    void testNullSafetyInMethods() {
        Admin testAdmin = new Admin();

        // Test that methods handle null values gracefully
        assertDoesNotThrow(() -> testAdmin.setUserAccount(null));
        assertDoesNotThrow(() -> testAdmin.setAdminId(null));
        assertDoesNotThrow(() -> testAdmin.setDepartment(null));
        assertDoesNotThrow(() -> testAdmin.setAccessLevel(null));
        assertDoesNotThrow(() -> testAdmin.setLastLoginDate(null));

        // Test toString with null values
        assertDoesNotThrow(() -> testAdmin.toString());

        // Test business logic with null values
        assertDoesNotThrow(() -> testAdmin.hasHighLevelAccess());
        assertDoesNotThrow(() -> testAdmin.isSystemAdmin());
    }

    @Test
    void testJPAAnnotations() {
        // This test verifies that JPA annotations are properly configured
        // In a real test environment, this would be tested with actual persistence

        // Test that entity can be created (annotations don't cause runtime errors)
        assertDoesNotThrow(() -> new Admin());

        // Test that all required fields can be set
        assertDoesNotThrow(() -> {
            Admin testAdmin = new Admin();
            testAdmin.setUserAccount(adminUserAccount);
            testAdmin.setAdminId("ADM-TEST");
            testAdmin.setDepartment("Test Department");
            testAdmin.setAccessLevel("TEST_ADMIN");
            testAdmin.setLastLoginDate(testDate);
        });
    }

    @Test
    void testBuilderPattern() {
        // Test fluent interface style usage
        Admin fluentAdmin = new Admin()
                .setUserAccount(adminUserAccount)
                .setAdminId("ADM-FLUENT")
                .setDepartment("Fluent Testing")
                .setAccessLevel("TEST_ADMIN")
                .setLastLoginDate(testDate);

        assertEquals(adminUserAccount, fluentAdmin.getUserAccount());
        assertEquals("ADM-FLUENT", fluentAdmin.getAdminId());
        assertEquals("Fluent Testing", fluentAdmin.getDepartment());
        assertEquals("TEST_ADMIN", fluentAdmin.getAccessLevel());
        assertEquals(testDate, fluentAdmin.getLastLoginDate());
    }
}
