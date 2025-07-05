package com.ddfinance.core.domain.enums;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

/**
 * Test class for InvestmentStatus enum
 * Tests all functionality for tracking investment lifecycle status
 */
public class InvestmentStatusTest {

    @Test
    void testAllInvestmentStatusValues() {
        // Core investment lifecycle statuses
        assertNotNull(InvestmentStatus.PENDING);
        assertNotNull(InvestmentStatus.ACTIVE);
        assertNotNull(InvestmentStatus.COMPLETED);
        assertNotNull(InvestmentStatus.CANCELLED);

        // Investment management statuses
        assertNotNull(InvestmentStatus.UNDER_REVIEW);
        assertNotNull(InvestmentStatus.APPROVED);
        assertNotNull(InvestmentStatus.REJECTED);

        // Market-related statuses
        assertNotNull(InvestmentStatus.SUSPENDED);
        assertNotNull(InvestmentStatus.LIQUIDATED);
        assertNotNull(InvestmentStatus.MATURED);

        // Verify total count
        assertEquals(10, InvestmentStatus.values().length);
    }

    @Test
    void testEnumValueOf() {
        // Test valueOf method for all statuses
        assertEquals(InvestmentStatus.PENDING, InvestmentStatus.valueOf("PENDING"));
        assertEquals(InvestmentStatus.ACTIVE, InvestmentStatus.valueOf("ACTIVE"));
        assertEquals(InvestmentStatus.COMPLETED, InvestmentStatus.valueOf("COMPLETED"));
        assertEquals(InvestmentStatus.CANCELLED, InvestmentStatus.valueOf("CANCELLED"));
        assertEquals(InvestmentStatus.UNDER_REVIEW, InvestmentStatus.valueOf("UNDER_REVIEW"));
        assertEquals(InvestmentStatus.APPROVED, InvestmentStatus.valueOf("APPROVED"));
        assertEquals(InvestmentStatus.REJECTED, InvestmentStatus.valueOf("REJECTED"));
        assertEquals(InvestmentStatus.SUSPENDED, InvestmentStatus.valueOf("SUSPENDED"));
        assertEquals(InvestmentStatus.LIQUIDATED, InvestmentStatus.valueOf("LIQUIDATED"));
        assertEquals(InvestmentStatus.MATURED, InvestmentStatus.valueOf("MATURED"));
    }

    @Test
    void testEnumToString() {
        // Test toString method returns the enum name
        assertEquals("PENDING", InvestmentStatus.PENDING.toString());
        assertEquals("ACTIVE", InvestmentStatus.ACTIVE.toString());
        assertEquals("COMPLETED", InvestmentStatus.COMPLETED.toString());
        assertEquals("CANCELLED", InvestmentStatus.CANCELLED.toString());
        assertEquals("UNDER_REVIEW", InvestmentStatus.UNDER_REVIEW.toString());
        assertEquals("APPROVED", InvestmentStatus.APPROVED.toString());
        assertEquals("REJECTED", InvestmentStatus.REJECTED.toString());
        assertEquals("SUSPENDED", InvestmentStatus.SUSPENDED.toString());
        assertEquals("LIQUIDATED", InvestmentStatus.LIQUIDATED.toString());
        assertEquals("MATURED", InvestmentStatus.MATURED.toString());
    }

    @Test
    void testEnumDescription() {
        // Test that enum has description method
        assertNotNull(InvestmentStatus.PENDING.getDescription());
        assertNotNull(InvestmentStatus.ACTIVE.getDescription());
        assertNotNull(InvestmentStatus.COMPLETED.getDescription());
        assertNotNull(InvestmentStatus.CANCELLED.getDescription());
        assertNotNull(InvestmentStatus.UNDER_REVIEW.getDescription());
        assertNotNull(InvestmentStatus.APPROVED.getDescription());
        assertNotNull(InvestmentStatus.REJECTED.getDescription());
        assertNotNull(InvestmentStatus.SUSPENDED.getDescription());
        assertNotNull(InvestmentStatus.LIQUIDATED.getDescription());
        assertNotNull(InvestmentStatus.MATURED.getDescription());

        // Test specific descriptions
        assertTrue(InvestmentStatus.PENDING.getDescription().contains("awaiting"));
        assertTrue(InvestmentStatus.ACTIVE.getDescription().contains("currently"));
        assertTrue(InvestmentStatus.COMPLETED.getDescription().contains("successfully"));
        assertTrue(InvestmentStatus.CANCELLED.getDescription().contains("cancelled"));
        assertTrue(InvestmentStatus.UNDER_REVIEW.getDescription().contains("review"));
        assertTrue(InvestmentStatus.APPROVED.getDescription().contains("approved"));
        assertTrue(InvestmentStatus.REJECTED.getDescription().contains("rejected"));
        assertTrue(InvestmentStatus.SUSPENDED.getDescription().contains("suspended"));
        assertTrue(InvestmentStatus.LIQUIDATED.getDescription().contains("liquidated"));
        assertTrue(InvestmentStatus.MATURED.getDescription().contains("matured"));
    }

    @Test
    void testStatusCategories() {
        // Test categorization methods

        // Test active statuses (investments currently generating returns)
        assertTrue(InvestmentStatus.ACTIVE.isActiveStatus());
        assertFalse(InvestmentStatus.PENDING.isActiveStatus());
        assertFalse(InvestmentStatus.COMPLETED.isActiveStatus());
        assertFalse(InvestmentStatus.CANCELLED.isActiveStatus());

        // Test pending statuses (awaiting action)
        assertTrue(InvestmentStatus.PENDING.isPendingStatus());
        assertTrue(InvestmentStatus.UNDER_REVIEW.isPendingStatus());
        assertFalse(InvestmentStatus.ACTIVE.isPendingStatus());
        assertFalse(InvestmentStatus.COMPLETED.isPendingStatus());

        // Test completed statuses (final states)
        assertTrue(InvestmentStatus.COMPLETED.isCompletedStatus());
        assertTrue(InvestmentStatus.CANCELLED.isCompletedStatus());
        assertTrue(InvestmentStatus.LIQUIDATED.isCompletedStatus());
        assertTrue(InvestmentStatus.MATURED.isCompletedStatus());
        assertFalse(InvestmentStatus.ACTIVE.isCompletedStatus());
        assertFalse(InvestmentStatus.PENDING.isCompletedStatus());

        // Test terminal statuses (cannot be changed)
        assertTrue(InvestmentStatus.CANCELLED.isTerminalStatus());
        assertTrue(InvestmentStatus.REJECTED.isTerminalStatus());
        assertTrue(InvestmentStatus.LIQUIDATED.isTerminalStatus());
        assertTrue(InvestmentStatus.MATURED.isTerminalStatus());
        assertFalse(InvestmentStatus.PENDING.isTerminalStatus());
        assertFalse(InvestmentStatus.ACTIVE.isTerminalStatus());
    }

    @Test
    void testStatusTransitions() {
        // Test valid status transitions
        assertTrue(InvestmentStatus.PENDING.canTransitionTo(InvestmentStatus.UNDER_REVIEW));
        assertTrue(InvestmentStatus.UNDER_REVIEW.canTransitionTo(InvestmentStatus.APPROVED));
        assertTrue(InvestmentStatus.UNDER_REVIEW.canTransitionTo(InvestmentStatus.REJECTED));
        assertTrue(InvestmentStatus.APPROVED.canTransitionTo(InvestmentStatus.ACTIVE));
        assertTrue(InvestmentStatus.ACTIVE.canTransitionTo(InvestmentStatus.SUSPENDED));
        assertTrue(InvestmentStatus.ACTIVE.canTransitionTo(InvestmentStatus.LIQUIDATED));
        assertTrue(InvestmentStatus.ACTIVE.canTransitionTo(InvestmentStatus.MATURED));
        assertTrue(InvestmentStatus.SUSPENDED.canTransitionTo(InvestmentStatus.ACTIVE));

        // Test invalid transitions (terminal states)
        assertFalse(InvestmentStatus.CANCELLED.canTransitionTo(InvestmentStatus.ACTIVE));
        assertFalse(InvestmentStatus.REJECTED.canTransitionTo(InvestmentStatus.APPROVED));
        assertFalse(InvestmentStatus.LIQUIDATED.canTransitionTo(InvestmentStatus.ACTIVE));
        assertFalse(InvestmentStatus.MATURED.canTransitionTo(InvestmentStatus.ACTIVE));

        // Test backwards transitions (generally not allowed)
        assertFalse(InvestmentStatus.ACTIVE.canTransitionTo(InvestmentStatus.PENDING));
        assertFalse(InvestmentStatus.APPROVED.canTransitionTo(InvestmentStatus.UNDER_REVIEW));
    }

    @Test
    void testInvestmentLifecycleWorkflow() {
        // Test typical investment workflow
        InvestmentStatus[] typicalWorkflow = {
                InvestmentStatus.PENDING,
                InvestmentStatus.UNDER_REVIEW,
                InvestmentStatus.APPROVED,
                InvestmentStatus.ACTIVE,
                InvestmentStatus.COMPLETED
        };

        // Verify each step can transition to the next
        for (int i = 0; i < typicalWorkflow.length - 1; i++) {
            InvestmentStatus current = typicalWorkflow[i];
            InvestmentStatus next = typicalWorkflow[i + 1];
            assertTrue(current.canTransitionTo(next),
                    String.format("Should be able to transition from %s to %s", current, next));
        }
    }

    @Test
    void testAlternativeWorkflows() {
        // Test rejection workflow
        assertTrue(InvestmentStatus.PENDING.canTransitionTo(InvestmentStatus.UNDER_REVIEW));
        assertTrue(InvestmentStatus.UNDER_REVIEW.canTransitionTo(InvestmentStatus.REJECTED));
        assertTrue(InvestmentStatus.REJECTED.isTerminalStatus());

        // Test cancellation workflow
        assertTrue(InvestmentStatus.PENDING.canTransitionTo(InvestmentStatus.CANCELLED));
        assertTrue(InvestmentStatus.UNDER_REVIEW.canTransitionTo(InvestmentStatus.CANCELLED));
        assertTrue(InvestmentStatus.APPROVED.canTransitionTo(InvestmentStatus.CANCELLED));
        assertTrue(InvestmentStatus.CANCELLED.isTerminalStatus());

        // Test suspension and resumption
        assertTrue(InvestmentStatus.ACTIVE.canTransitionTo(InvestmentStatus.SUSPENDED));
        assertTrue(InvestmentStatus.SUSPENDED.canTransitionTo(InvestmentStatus.ACTIVE));
        assertFalse(InvestmentStatus.SUSPENDED.isTerminalStatus());
    }

    @Test
    void testDisplayName() {
        // Test display names for UI
        assertEquals("Pending Review", InvestmentStatus.PENDING.getDisplayName());
        assertEquals("Active Investment", InvestmentStatus.ACTIVE.getDisplayName());
        assertEquals("Completed", InvestmentStatus.COMPLETED.getDisplayName());
        assertEquals("Cancelled", InvestmentStatus.CANCELLED.getDisplayName());
        assertEquals("Under Review", InvestmentStatus.UNDER_REVIEW.getDisplayName());
        assertEquals("Approved", InvestmentStatus.APPROVED.getDisplayName());
        assertEquals("Rejected", InvestmentStatus.REJECTED.getDisplayName());
        assertEquals("Suspended", InvestmentStatus.SUSPENDED.getDisplayName());
        assertEquals("Liquidated", InvestmentStatus.LIQUIDATED.getDisplayName());
        assertEquals("Matured", InvestmentStatus.MATURED.getDisplayName());
    }

    @Test
    void testStatusColor() {
        // Test status colors for UI representation
        assertEquals("warning", InvestmentStatus.PENDING.getStatusColor());
        assertEquals("success", InvestmentStatus.ACTIVE.getStatusColor());
        assertEquals("success", InvestmentStatus.COMPLETED.getStatusColor());
        assertEquals("danger", InvestmentStatus.CANCELLED.getStatusColor());
        assertEquals("info", InvestmentStatus.UNDER_REVIEW.getStatusColor());
        assertEquals("success", InvestmentStatus.APPROVED.getStatusColor());
        assertEquals("danger", InvestmentStatus.REJECTED.getStatusColor());
        assertEquals("warning", InvestmentStatus.SUSPENDED.getStatusColor());
        assertEquals("secondary", InvestmentStatus.LIQUIDATED.getStatusColor());
        assertEquals("primary", InvestmentStatus.MATURED.getStatusColor());
    }

    @Test
    void testFromString() {
        // Test creating enum from string (case insensitive)
        assertEquals(InvestmentStatus.PENDING, InvestmentStatus.fromString("pending"));
        assertEquals(InvestmentStatus.ACTIVE, InvestmentStatus.fromString("ACTIVE"));
        assertEquals(InvestmentStatus.UNDER_REVIEW, InvestmentStatus.fromString("Under_Review"));
        assertEquals(InvestmentStatus.LIQUIDATED, InvestmentStatus.fromString("liquidated"));

        // Test invalid string
        assertNull(InvestmentStatus.fromString("INVALID_STATUS"));
        assertNull(InvestmentStatus.fromString(null));
        assertNull(InvestmentStatus.fromString(""));
    }

    @Test
    void testInvestmentStatusEquality() {
        // Test enum equality
        assertEquals(InvestmentStatus.PENDING, InvestmentStatus.PENDING);
        assertNotEquals(InvestmentStatus.PENDING, InvestmentStatus.ACTIVE);

        // Test with valueOf
        assertEquals(InvestmentStatus.ACTIVE, InvestmentStatus.valueOf("ACTIVE"));
        assertNotEquals(InvestmentStatus.ACTIVE, InvestmentStatus.valueOf("PENDING"));
    }

    @Test
    void testRequiresApproval() {
        // Test which statuses require approval workflow
        assertTrue(InvestmentStatus.PENDING.requiresApproval());
        assertTrue(InvestmentStatus.UNDER_REVIEW.requiresApproval());
        assertFalse(InvestmentStatus.APPROVED.requiresApproval());
        assertFalse(InvestmentStatus.ACTIVE.requiresApproval());
        assertFalse(InvestmentStatus.REJECTED.requiresApproval());
    }
}
