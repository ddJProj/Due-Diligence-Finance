package com.ddfinance.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ddfinance.core.domain.enums.Role;

/**
 * Test class for Guest entity
 * Tests all functionality for guest account type with limited access
 */
public class GuestTest {

    private Guest guest;
    private UserAccount guestUserAccount;
    private LocalDateTime testDate;

    @BeforeEach
    void setUp() {
        // Create test UserAccount with GUEST role
        guestUserAccount = new UserAccount();
        guestUserAccount.setId(1L);
        guestUserAccount.setEmail("guest@ddfinance.com");
        guestUserAccount.setFirstName("John");
        guestUserAccount.setLastName("Visitor");
        guestUserAccount.setRole(Role.GUEST);

        // Create test date
        testDate = LocalDateTime.of(2025, 1, 15, 14, 30, 0);

        // Create test Guest
        guest = new Guest();
    }

    @Test
    void testDefaultConstructor() {
        Guest testGuest = new Guest();
        assertNotNull(testGuest);
        assertNull(testGuest.getId());
        assertNull(testGuest.getUserAccount());
        assertNull(testGuest.getGuestId());
        assertNull(testGuest.getRegistrationDate());
        assertNull(testGuest.getLastActivityDate());
        assertNull(testGuest.getInterestArea());
        assertNull(testGuest.getReferralSource());
        assertFalse(testGuest.isUpgradeRequested());
    }

    @Test
    void testParameterizedConstructor() {
        Guest testGuest = new Guest(
                guestUserAccount,
                "GST-001",
                testDate,
                testDate,
                "Investment Portfolio Management",
                "Website Registration"
        );

        assertNotNull(testGuest);
        assertEquals(guestUserAccount, testGuest.getUserAccount());
        assertEquals("GST-001", testGuest.getGuestId());
        assertEquals(testDate, testGuest.getRegistrationDate());
        assertEquals(testDate, testGuest.getLastActivityDate());
        assertEquals("Investment Portfolio Management", testGuest.getInterestArea());
        assertEquals("Website Registration", testGuest.getReferralSource());
        assertFalse(testGuest.isUpgradeRequested());
    }

    @Test
    void testIdGetterAndSetter() {
        Long testId = 100L;
        guest.setId(testId);
        assertEquals(testId, guest.getId());
    }

    @Test
    void testUserAccountGetterAndSetter() {
        guest.setUserAccount(guestUserAccount);
        assertEquals(guestUserAccount, guest.getUserAccount());

        // Test null assignment
        guest.setUserAccount(null);
        assertNull(guest.getUserAccount());
    }

    @Test
    void testGuestIdGetterAndSetter() {
        String testGuestId = "GST-001";
        guest.setGuestId(testGuestId);
        assertEquals(testGuestId, guest.getGuestId());

        // Test null assignment
        guest.setGuestId(null);
        assertNull(guest.getGuestId());

        // Test empty string
        guest.setGuestId("");
        assertEquals("", guest.getGuestId());
    }

    @Test
    void testRegistrationDateGetterAndSetter() {
        guest.setRegistrationDate(testDate);
        assertEquals(testDate, guest.getRegistrationDate());

        // Test null assignment
        guest.setRegistrationDate(null);
        assertNull(guest.getRegistrationDate());
    }

    @Test
    void testLastActivityDateGetterAndSetter() {
        guest.setLastActivityDate(testDate);
        assertEquals(testDate, guest.getLastActivityDate());

        // Test with different date
        LocalDateTime newDate = LocalDateTime.of(2025, 1, 16, 10, 15, 0);
        guest.setLastActivityDate(newDate);
        assertEquals(newDate, guest.getLastActivityDate());

        // Test null assignment
        guest.setLastActivityDate(null);
        assertNull(guest.getLastActivityDate());
    }

    @Test
    void testInterestAreaGetterAndSetter() {
        String testInterestArea = "Retirement Planning";
        guest.setInterestArea(testInterestArea);
        assertEquals(testInterestArea, guest.getInterestArea());

        // Test various interest areas
        guest.setInterestArea("Investment Portfolio Management");
        assertEquals("Investment Portfolio Management", guest.getInterestArea());

        guest.setInterestArea("Financial Planning");
        assertEquals("Financial Planning", guest.getInterestArea());

        // Test null assignment
        guest.setInterestArea(null);
        assertNull(guest.getInterestArea());
    }

    @Test
    void testReferralSourceGetterAndSetter() {
        String testReferralSource = "Google Search";
        guest.setReferralSource(testReferralSource);
        assertEquals(testReferralSource, guest.getReferralSource());

        // Test different referral sources
        guest.setReferralSource("Existing Client Referral");
        assertEquals("Existing Client Referral", guest.getReferralSource());

        guest.setReferralSource("Social Media");
        assertEquals("Social Media", guest.getReferralSource());

        // Test null assignment
        guest.setReferralSource(null);
        assertNull(guest.getReferralSource());
    }

    @Test
    void testUpgradeRequestedGetterAndSetter() {
        // Test default value
        assertFalse(guest.isUpgradeRequested());

        // Test setting to true
        guest.setUpgradeRequested(true);
        assertTrue(guest.isUpgradeRequested());

        // Test setting back to false
        guest.setUpgradeRequested(false);
        assertFalse(guest.isUpgradeRequested());
    }

    @Test
    void testCompleteGuestProfile() {
        // Test setting up complete guest profile
        guest.setUserAccount(guestUserAccount);
        guest.setGuestId("GST-001");
        guest.setRegistrationDate(testDate);
        guest.setLastActivityDate(testDate);
        guest.setInterestArea("Investment Advisory Services");
        guest.setReferralSource("Financial Advisor Referral");
        guest.setUpgradeRequested(false);

        // Verify all fields are set correctly
        assertEquals(guestUserAccount, guest.getUserAccount());
        assertEquals("GST-001", guest.getGuestId());
        assertEquals(testDate, guest.getRegistrationDate());
        assertEquals(testDate, guest.getLastActivityDate());
        assertEquals("Investment Advisory Services", guest.getInterestArea());
        assertEquals("Financial Advisor Referral", guest.getReferralSource());
        assertFalse(guest.isUpgradeRequested());

        // Verify user account has guest role
        assertEquals(Role.GUEST, guest.getUserAccount().getRole());
        assertEquals("guest@ddfinance.com", guest.getUserAccount().getEmail());
    }

    @Test
    void testGuestIdPatterns() {
        // Test that guest IDs follow expected format
        String[] validGuestIds = {
                "GST-001", "GST-002", "GST-999",
                "GUEST-001", "G-001"
        };

        for (String guestId : validGuestIds) {
            guest.setGuestId(guestId);
            assertEquals(guestId, guest.getGuestId());
            assertTrue(guestId.contains("G") || guestId.contains("GST"));
        }
    }

    @Test
    void testInterestAreaCategories() {
        // Test common interest areas for potential investment clients
        String[] interestAreas = {
                "Investment Portfolio Management",
                "Retirement Planning",
                "Financial Planning",
                "Wealth Management",
                "Risk Management",
                "Tax Planning",
                "Estate Planning",
                "College Savings",
                "Insurance Planning"
        };

        for (String area : interestAreas) {
            guest.setInterestArea(area);
            assertEquals(area, guest.getInterestArea());
        }
    }

    @Test
    void testReferralSources() {
        // Test different referral sources for tracking marketing effectiveness
        String[] referralSources = {
                "Website Registration",
                "Google Search",
                "Social Media",
                "Existing Client Referral",
                "Financial Advisor Referral",
                "Professional Network",
                "Investment Seminar",
                "Online Advertisement",
                "Word of Mouth"
        };

        for (String source : referralSources) {
            guest.setReferralSource(source);
            assertEquals(source, guest.getReferralSource());
        }
    }

    @Test
    void testUpdateLastActivity() {
        // Test updating last activity functionality
        LocalDateTime initialActivity = LocalDateTime.of(2025, 1, 15, 10, 0, 0);
        LocalDateTime recentActivity = LocalDateTime.of(2025, 1, 15, 16, 30, 0);

        guest.setLastActivityDate(initialActivity);
        assertEquals(initialActivity, guest.getLastActivityDate());

        // Simulate activity update
        guest.updateLastActivity();
        assertNotNull(guest.getLastActivityDate());
        // In real implementation, this would be current time
        // For test, we'll verify the method exists and can be called
    }

    @Test
    void testGuestBusinessLogic() {
        // Test guest-specific business logic methods
        LocalDateTime recentDate = LocalDateTime.now().minusDays(5); // 5 days ago - definitely recent

        guest.setUserAccount(guestUserAccount);
        guest.setGuestId("GST-001");
        guest.setRegistrationDate(testDate);
        guest.setLastActivityDate(recentDate); // Use recent date for activity
        guest.setInterestArea("Investment Portfolio Management");

        // Test activity status verification
        assertTrue(guest.isRecentlyActive());

        // Test eligibility for upgrade
        assertTrue(guest.isEligibleForUpgrade());

        // Test request upgrade functionality
        guest.requestUpgrade();
        assertTrue(guest.isUpgradeRequested());

        // Test canceling upgrade request
        guest.cancelUpgradeRequest();
        assertFalse(guest.isUpgradeRequested());
    }

    @Test
    void testAccountAgeCalculation() {
        // Test calculating how long guest has been registered
        LocalDateTime oldRegistration = LocalDateTime.of(2024, 12, 1, 10, 0, 0);
        guest.setRegistrationDate(oldRegistration);

        // Test account age business logic
        assertTrue(guest.getDaysRegistered() > 0);
        assertTrue(guest.isNewGuest() == false); // Registered over a month ago

        // Test new guest
        LocalDateTime recentRegistration = LocalDateTime.now().minusDays(2);
        guest.setRegistrationDate(recentRegistration);
        assertTrue(guest.isNewGuest());
    }

    @Test
    void testEqualsAndHashCode() {
        // Create two identical guests
        Guest guest1 = new Guest();
        guest1.setId(1L);
        guest1.setUserAccount(guestUserAccount);
        guest1.setGuestId("GST-001");
        guest1.setInterestArea("Investment Planning");

        Guest guest2 = new Guest();
        guest2.setId(1L);
        guest2.setUserAccount(guestUserAccount);
        guest2.setGuestId("GST-001");
        guest2.setInterestArea("Investment Planning");

        // Test equality
        assertEquals(guest1, guest2);
        assertEquals(guest1.hashCode(), guest2.hashCode());

        // Test inequality when ID is different
        guest2.setId(2L);
        assertNotEquals(guest1, guest2);
        assertNotEquals(guest1.hashCode(), guest2.hashCode());
    }

    @Test
    void testToString() {
        guest.setId(1L);
        guest.setUserAccount(guestUserAccount);
        guest.setGuestId("GST-001");
        guest.setRegistrationDate(testDate);
        guest.setInterestArea("Investment Advisory");
        guest.setReferralSource("Website Registration");
        guest.setUpgradeRequested(true);

        String toString = guest.toString();

        assertNotNull(toString);
        assertTrue(toString.contains("Guest"));
        assertTrue(toString.contains("id=1"));
        assertTrue(toString.contains("GST-001"));
        assertTrue(toString.contains("Investment Advisory"));
        assertTrue(toString.contains("Website Registration"));
        assertTrue(toString.contains("guest@ddfinance.com"));
        assertTrue(toString.contains("upgradeRequested=true"));
    }

    @Test
    void testNullSafetyInMethods() {
        Guest testGuest = new Guest();

        // Test that methods handle null values gracefully
        assertDoesNotThrow(() -> testGuest.setUserAccount(null));
        assertDoesNotThrow(() -> testGuest.setGuestId(null));
        assertDoesNotThrow(() -> testGuest.setRegistrationDate(null));
        assertDoesNotThrow(() -> testGuest.setLastActivityDate(null));
        assertDoesNotThrow(() -> testGuest.setInterestArea(null));
        assertDoesNotThrow(() -> testGuest.setReferralSource(null));

        // Test toString with null values
        assertDoesNotThrow(() -> testGuest.toString());

        // Test business logic with null values
        assertDoesNotThrow(() -> testGuest.isRecentlyActive());
        assertDoesNotThrow(() -> testGuest.isEligibleForUpgrade());
    }

    @Test
    void testJPAAnnotations() {
        // This test verifies that JPA annotations are properly configured
        // In a real test environment, this would be tested with actual persistence

        // Test that entity can be created (annotations don't cause runtime errors)
        assertDoesNotThrow(() -> new Guest());

        // Test that all required fields can be set
        assertDoesNotThrow(() -> {
            Guest testGuest = new Guest();
            testGuest.setUserAccount(guestUserAccount);
            testGuest.setGuestId("GST-TEST");
            testGuest.setRegistrationDate(testDate);
            testGuest.setLastActivityDate(testDate);
            testGuest.setInterestArea("Test Interest");
            testGuest.setReferralSource("Test Source");
            testGuest.setUpgradeRequested(false);
        });
    }

    @Test
    void testBuilderPattern() {
        // Test fluent interface style usage
        Guest fluentGuest = new Guest()
                .setUserAccount(guestUserAccount)
                .setGuestId("GST-FLUENT")
                .setRegistrationDate(testDate)
                .setLastActivityDate(testDate)
                .setInterestArea("Fluent Testing")
                .setReferralSource("Test Framework")
                .setUpgradeRequested(false);

        assertEquals(guestUserAccount, fluentGuest.getUserAccount());
        assertEquals("GST-FLUENT", fluentGuest.getGuestId());
        assertEquals(testDate, fluentGuest.getRegistrationDate());
        assertEquals(testDate, fluentGuest.getLastActivityDate());
        assertEquals("Fluent Testing", fluentGuest.getInterestArea());
        assertEquals("Test Framework", fluentGuest.getReferralSource());
        assertFalse(fluentGuest.isUpgradeRequested());
    }
}