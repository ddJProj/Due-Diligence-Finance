package com.ddfinance.core.domain.enums;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for UpgradeRequestStatus enum.
 * Tests all enum values and their properties.
 */
class UpgradeRequestStatusTest {

    // Helper methods for logic testing
    private boolean isPendingStatus(UpgradeRequestStatus status) {
        return status == UpgradeRequestStatus.PENDING;
    }

    private boolean isProcessedStatus(UpgradeRequestStatus status) {
        return status == UpgradeRequestStatus.APPROVED || status == UpgradeRequestStatus.REJECTED;
    }


    @Test
    void testEnumValues() {
        // Test that all expected values exist
        UpgradeRequestStatus[] values = UpgradeRequestStatus.values();
        assertEquals(3, values.length, "Should have exactly 3 upgrade request status values");

        // Test specific values exist
        assertNotNull(UpgradeRequestStatus.PENDING, "PENDING status should exist");
        assertNotNull(UpgradeRequestStatus.APPROVED, "APPROVED status should exist");
        assertNotNull(UpgradeRequestStatus.REJECTED, "REJECTED status should exist");
    }

    @Test
    void testValueOf() {
        // Test that valueOf works correctly for all values
        assertEquals(UpgradeRequestStatus.PENDING, UpgradeRequestStatus.valueOf("PENDING"));
        assertEquals(UpgradeRequestStatus.APPROVED, UpgradeRequestStatus.valueOf("APPROVED"));
        assertEquals(UpgradeRequestStatus.REJECTED, UpgradeRequestStatus.valueOf("REJECTED"));
    }

    @Test
    void testValueOfInvalid() {
        // Test that valueOf throws exception for invalid values
        assertThrows(IllegalArgumentException.class,
                () -> UpgradeRequestStatus.valueOf("INVALID"));
        assertThrows(IllegalArgumentException.class,
                () -> UpgradeRequestStatus.valueOf("pending"));
        assertThrows(IllegalArgumentException.class,
                () -> UpgradeRequestStatus.valueOf(""));
    }

    @Test
    void testValueOfNull() {
        // Test that valueOf throws exception for null
        assertThrows(NullPointerException.class,
                () -> UpgradeRequestStatus.valueOf(null));
    }

    @Test
    void testEnumOrder() {
        // Test that the enum values are in the expected order
        UpgradeRequestStatus[] values = UpgradeRequestStatus.values();
        assertEquals(UpgradeRequestStatus.PENDING, values[0], "PENDING should be first");
        assertEquals(UpgradeRequestStatus.APPROVED, values[1], "APPROVED should be second");
        assertEquals(UpgradeRequestStatus.REJECTED, values[2], "REJECTED should be third");
    }

    @Test
    void testEnumName() {
        // Test that name() returns correct string values
        assertEquals("PENDING", UpgradeRequestStatus.PENDING.name());
        assertEquals("APPROVED", UpgradeRequestStatus.APPROVED.name());
        assertEquals("REJECTED", UpgradeRequestStatus.REJECTED.name());
    }

    @Test
    void testEnumToString() {
        // Test that toString() works correctly (should be same as name() by default)
        assertEquals("PENDING", UpgradeRequestStatus.PENDING.toString());
        assertEquals("APPROVED", UpgradeRequestStatus.APPROVED.toString());
        assertEquals("REJECTED", UpgradeRequestStatus.REJECTED.toString());
    }

    @Test
    void testEnumEquality() {
        // Test that enum values are equal to themselves
        assertEquals(UpgradeRequestStatus.PENDING, UpgradeRequestStatus.PENDING);
        assertEquals(UpgradeRequestStatus.APPROVED, UpgradeRequestStatus.APPROVED);
        assertEquals(UpgradeRequestStatus.REJECTED, UpgradeRequestStatus.REJECTED);

        // Test that different enum values are not equal
        assertNotEquals(UpgradeRequestStatus.PENDING, UpgradeRequestStatus.APPROVED);
        assertNotEquals(UpgradeRequestStatus.PENDING, UpgradeRequestStatus.REJECTED);
        assertNotEquals(UpgradeRequestStatus.APPROVED, UpgradeRequestStatus.REJECTED);
    }

    @Test
    void testEnumOrdinal() {
        // Test that ordinal values are as expected
        assertEquals(0, UpgradeRequestStatus.PENDING.ordinal());
        assertEquals(1, UpgradeRequestStatus.APPROVED.ordinal());
        assertEquals(2, UpgradeRequestStatus.REJECTED.ordinal());
    }

    @Test
    void testEnumComparison() {
        // Test that enum values can be compared using ordinal order
        assertTrue(UpgradeRequestStatus.PENDING.ordinal() < UpgradeRequestStatus.APPROVED.ordinal());
        assertTrue(UpgradeRequestStatus.APPROVED.ordinal() < UpgradeRequestStatus.REJECTED.ordinal());
        assertTrue(UpgradeRequestStatus.PENDING.ordinal() < UpgradeRequestStatus.REJECTED.ordinal());
    }

    @Test
    void testEnumInSwitch() {
        // Test that enum values work properly in switch statements
        for (UpgradeRequestStatus status : UpgradeRequestStatus.values()) {
            String result = switch (status) {
                case PENDING -> "Request is pending approval";
                case APPROVED -> "Request has been approved";
                case REJECTED -> "Request has been rejected";
            };
            assertNotNull(result, "Switch statement should handle all enum values");
            assertFalse(result.isEmpty(), "Switch statement should return non-empty string");
        }
    }

    @Test
    void testBusinessLogicMethods() {
        // Test isPending() method
        assertTrue(UpgradeRequestStatus.PENDING.isPending());
        assertFalse(UpgradeRequestStatus.APPROVED.isPending());
        assertFalse(UpgradeRequestStatus.REJECTED.isPending());

        // Test isProcessed() method
        assertTrue(UpgradeRequestStatus.APPROVED.isProcessed());
        assertTrue(UpgradeRequestStatus.REJECTED.isProcessed());
        assertFalse(UpgradeRequestStatus.PENDING.isProcessed());

        // Test isApproved() method
        assertTrue(UpgradeRequestStatus.APPROVED.isApproved());
        assertFalse(UpgradeRequestStatus.PENDING.isApproved());
        assertFalse(UpgradeRequestStatus.REJECTED.isApproved());

        // Test isRejected() method
        assertTrue(UpgradeRequestStatus.REJECTED.isRejected());
        assertFalse(UpgradeRequestStatus.PENDING.isRejected());
        assertFalse(UpgradeRequestStatus.APPROVED.isRejected());
    }

    @Test
    void testGetDescription() {
        // Test that getDescription() returns appropriate descriptions
        assertEquals("Request is pending approval", UpgradeRequestStatus.PENDING.getDescription());
        assertEquals("Request has been approved", UpgradeRequestStatus.APPROVED.getDescription());
        assertEquals("Request has been rejected", UpgradeRequestStatus.REJECTED.getDescription());
    }

    @Test
    void testFromString() {
        // Test normal case
        assertEquals(UpgradeRequestStatus.PENDING, UpgradeRequestStatus.fromString("PENDING"));
        assertEquals(UpgradeRequestStatus.APPROVED, UpgradeRequestStatus.fromString("APPROVED"));
        assertEquals(UpgradeRequestStatus.REJECTED, UpgradeRequestStatus.fromString("REJECTED"));

        // Test case insensitive
        assertEquals(UpgradeRequestStatus.PENDING, UpgradeRequestStatus.fromString("pending"));
        assertEquals(UpgradeRequestStatus.APPROVED, UpgradeRequestStatus.fromString("approved"));
        assertEquals(UpgradeRequestStatus.REJECTED, UpgradeRequestStatus.fromString("rejected"));

        // Test with whitespace
        assertEquals(UpgradeRequestStatus.PENDING, UpgradeRequestStatus.fromString(" PENDING "));
        assertEquals(UpgradeRequestStatus.APPROVED, UpgradeRequestStatus.fromString(" APPROVED "));
        assertEquals(UpgradeRequestStatus.REJECTED, UpgradeRequestStatus.fromString(" REJECTED "));
    }

    @Test
    void testFromStringInvalid() {
        // Test invalid values
        assertThrows(IllegalArgumentException.class, () -> UpgradeRequestStatus.fromString("INVALID"));
        assertThrows(IllegalArgumentException.class, () -> UpgradeRequestStatus.fromString(""));
        assertThrows(IllegalArgumentException.class, () -> UpgradeRequestStatus.fromString("PROCESSING"));
    }

    @Test
    void testFromStringNull() {
        // Test null value
        assertThrows(IllegalArgumentException.class, () -> UpgradeRequestStatus.fromString(null));
    }



}
