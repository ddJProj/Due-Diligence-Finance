package com.ddfinance.core.domain;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.domain.enums.UpgradeRequestStatus;

/**
 * Test class for GuestUpgradeRequest entity
 * Tests all functionality for tracking guest-to-client upgrade requests
 */
public class GuestUpgradeRequestTest {

    private GuestUpgradeRequest upgradeRequest;
    private UserAccount guestAccount;
    private LocalDateTime testDate;

    @BeforeEach
    void setUp() {
        // Create test UserAccount with GUEST role
        guestAccount = new UserAccount();
        guestAccount.setId(1L);
        guestAccount.setEmail("guest@test.com");
        guestAccount.setRole(Role.GUEST);

        // Create test date
        testDate = LocalDateTime.of(2025, 1, 15, 10, 30, 0);

        // Create test GuestUpgradeRequest
        upgradeRequest = new GuestUpgradeRequest();
    }

    @Test
    void testDefaultConstructor() {
        GuestUpgradeRequest request = new GuestUpgradeRequest();
        assertNotNull(request);
        assertNull(request.getId());
        assertNull(request.getUserAccount());
        assertNull(request.getRequestDate());
        assertNull(request.getStatus());
        assertNull(request.getDetails());
    }

    @Test
    void testParameterizedConstructor() {
        GuestUpgradeRequest request = new GuestUpgradeRequest(
                guestAccount,
                testDate,
                UpgradeRequestStatus.PENDING,
                "Please upgrade my account to client status"
        );

        assertNotNull(request);
        assertEquals(guestAccount, request.getUserAccount());
        assertEquals(testDate, request.getRequestDate());
        assertEquals(UpgradeRequestStatus.PENDING, request.getStatus());
        assertEquals("Please upgrade my account to client status", request.getDetails());
    }

    @Test
    void testIdGetterAndSetter() {
        Long testId = 100L;
        upgradeRequest.setId(testId);
        assertEquals(testId, upgradeRequest.getId());
    }

    @Test
    void testUserAccountGetterAndSetter() {
        upgradeRequest.setUserAccount(guestAccount);
        assertEquals(guestAccount, upgradeRequest.getUserAccount());

        // Test null assignment
        upgradeRequest.setUserAccount(null);
        assertNull(upgradeRequest.getUserAccount());
    }

    @Test
    void testRequestDateGetterAndSetter() {
        upgradeRequest.setRequestDate(testDate);
        assertEquals(testDate, upgradeRequest.getRequestDate());

        // Test null assignment
        upgradeRequest.setRequestDate(null);
        assertNull(upgradeRequest.getRequestDate());
    }

    @Test
    void testStatusGetterAndSetter() {
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        assertEquals(UpgradeRequestStatus.PENDING, upgradeRequest.getStatus());

        upgradeRequest.setStatus(UpgradeRequestStatus.APPROVED);
        assertEquals(UpgradeRequestStatus.APPROVED, upgradeRequest.getStatus());

        upgradeRequest.setStatus(UpgradeRequestStatus.REJECTED);
        assertEquals(UpgradeRequestStatus.REJECTED, upgradeRequest.getStatus());

        // Test null assignment
        upgradeRequest.setStatus(null);
        assertNull(upgradeRequest.getStatus());
    }

    @Test
    void testDetailsGetterAndSetter() {
        String testDetails = "I need client access to view my investment portfolio";
        upgradeRequest.setDetails(testDetails);
        assertEquals(testDetails, upgradeRequest.getDetails());

        // Test null assignment
        upgradeRequest.setDetails(null);
        assertNull(upgradeRequest.getDetails());

        // Test empty string
        upgradeRequest.setDetails("");
        assertEquals("", upgradeRequest.getDetails());
    }

    @Test
    void testDetailsLengthConstraint() {
        // Test maximum length (1000 characters)
        StringBuilder longDetails = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            longDetails.append("a");
        }

        upgradeRequest.setDetails(longDetails.toString());
        assertEquals(1000, upgradeRequest.getDetails().length());
        assertEquals(longDetails.toString(), upgradeRequest.getDetails());
    }

    @Test
    void testCompleteUpgradeRequestWorkflow() {
        // Test complete workflow from creation to approval
        upgradeRequest.setUserAccount(guestAccount);
        upgradeRequest.setRequestDate(testDate);
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setDetails("Initial request for client upgrade");

        // Verify initial state
        assertEquals(guestAccount, upgradeRequest.getUserAccount());
        assertEquals(testDate, upgradeRequest.getRequestDate());
        assertEquals(UpgradeRequestStatus.PENDING, upgradeRequest.getStatus());
        assertEquals("Initial request for client upgrade", upgradeRequest.getDetails());

        // Simulate approval
        upgradeRequest.setStatus(UpgradeRequestStatus.APPROVED);
        assertEquals(UpgradeRequestStatus.APPROVED, upgradeRequest.getStatus());

        // Verify other fields remain unchanged
        assertEquals(guestAccount, upgradeRequest.getUserAccount());
        assertEquals(testDate, upgradeRequest.getRequestDate());
        assertEquals("Initial request for client upgrade", upgradeRequest.getDetails());
    }

    @Test
    void testCompleteUpgradeRequestWorkflowWithRejection() {
        // Test complete workflow from creation to rejection
        upgradeRequest.setUserAccount(guestAccount);
        upgradeRequest.setRequestDate(testDate);
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setDetails("Request for client upgrade");

        // Simulate rejection with reason
        upgradeRequest.setStatus(UpgradeRequestStatus.REJECTED);
        upgradeRequest.setDetails("Reason for Rejection: Insufficient documentation provided");

        assertEquals(UpgradeRequestStatus.REJECTED, upgradeRequest.getStatus());
        assertEquals("Reason for Rejection: Insufficient documentation provided", upgradeRequest.getDetails());

        // Verify other fields remain unchanged
        assertEquals(guestAccount, upgradeRequest.getUserAccount());
        assertEquals(testDate, upgradeRequest.getRequestDate());
    }

    @Test
    void testEqualsAndHashCode() {
        // Create two identical requests
        GuestUpgradeRequest request1 = new GuestUpgradeRequest();
        request1.setId(1L);
        request1.setUserAccount(guestAccount);
        request1.setRequestDate(testDate);
        request1.setStatus(UpgradeRequestStatus.PENDING);
        request1.setDetails("Test request");

        GuestUpgradeRequest request2 = new GuestUpgradeRequest();
        request2.setId(1L);
        request2.setUserAccount(guestAccount);
        request2.setRequestDate(testDate);
        request2.setStatus(UpgradeRequestStatus.PENDING);
        request2.setDetails("Test request");

        // Test equality
        assertEquals(request1, request2);
        assertEquals(request1.hashCode(), request2.hashCode());

        // Test inequality when ID is different
        request2.setId(2L);
        assertNotEquals(request1, request2);
        assertNotEquals(request1.hashCode(), request2.hashCode());
    }

    @Test
    void testToString() {
        upgradeRequest.setId(1L);
        upgradeRequest.setUserAccount(guestAccount);
        upgradeRequest.setRequestDate(testDate);
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setDetails("Test upgrade request");

        String toString = upgradeRequest.toString();

        assertNotNull(toString);
        assertTrue(toString.contains("GuestUpgradeRequest"));
        assertTrue(toString.contains("id=1"));
        assertTrue(toString.contains("guest@test.com"));
        assertTrue(toString.contains("PENDING"));
        assertTrue(toString.contains("Test upgrade request"));
        assertTrue(toString.contains("2025-01-15T10:30"));
    }

    @Test
    void testNullSafetyInMethods() {
        GuestUpgradeRequest request = new GuestUpgradeRequest();

        // Test that methods handle null values gracefully
        assertDoesNotThrow(() -> request.setUserAccount(null));
        assertDoesNotThrow(() -> request.setRequestDate(null));
        assertDoesNotThrow(() -> request.setStatus(null));
        assertDoesNotThrow(() -> request.setDetails(null));

        // Test toString with null values
        assertDoesNotThrow(() -> request.toString());
    }

    @Test
    void testJPAAnnotations() {
        // This test verifies that JPA annotations are properly configured
        // In a real test environment, this would be tested with actual persistence

        // Test that entity can be created (annotations don't cause runtime errors)
        assertDoesNotThrow(() -> new GuestUpgradeRequest());

        // Test that all required fields can be set
        assertDoesNotThrow(() -> {
            GuestUpgradeRequest request = new GuestUpgradeRequest();
            request.setUserAccount(guestAccount);
            request.setRequestDate(testDate);
            request.setStatus(UpgradeRequestStatus.PENDING);
            request.setDetails("JPA test");
        });
    }

    @Test
    void testBuilderPattern() {
        // Test fluent interface style usage
        GuestUpgradeRequest request = new GuestUpgradeRequest()
                .setUserAccount(guestAccount)
                .setRequestDate(testDate)
                .setStatus(UpgradeRequestStatus.PENDING)
                .setDetails("Fluent interface test");

        assertEquals(guestAccount, request.getUserAccount());
        assertEquals(testDate, request.getRequestDate());
        assertEquals(UpgradeRequestStatus.PENDING, request.getStatus());
        assertEquals("Fluent interface test", request.getDetails());
    }
}
