package com.ddfinance.core.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for EntityNotFoundException.
 * Tests entity not found exception handling.
 */
class EntityNotFoundExceptionTest {

    @Test
    void testEntityNotFoundWithMessage() {
        // Given
        String message = "User not found";

        // When
        EntityNotFoundException exception = new EntityNotFoundException(message);

        // Then
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testEntityNotFoundWithEntityTypeAndId() {
        // Given
        String entityType = "UserAccount";
        Long id = 123L;

        // When
        EntityNotFoundException exception = new EntityNotFoundException(entityType, id);

        // Then
        assertEquals("UserAccount not found with id: 123", exception.getMessage());
        assertEquals(entityType, exception.getEntityType());
        assertEquals(id, exception.getEntityId());
    }

    @Test
    void testEntityNotFoundWithEntityTypeAndStringId() {
        // Given
        String entityType = "Client";
        String identifier = "client@example.com";

        // When
        EntityNotFoundException exception = new EntityNotFoundException(entityType, identifier);

        // Then
        assertEquals("Client not found with identifier: client@example.com", exception.getMessage());
        assertEquals(entityType, exception.getEntityType());
        assertEquals(identifier, exception.getEntityIdentifier());
    }

    @Test
    void testEntityNotFoundWithCriteria() {
        // Given
        String entityType = "Investment";
        String criteria = "status=ACTIVE and clientId=456";

        // When
        EntityNotFoundException exception = EntityNotFoundException.withCriteria(entityType, criteria);

        // Then
        assertEquals("Investment not found with criteria: status=ACTIVE and clientId=456", exception.getMessage());
        assertEquals(entityType, exception.getEntityType());
    }

    @Test
    void testEntityNotFoundGetters() {
        // Given
        String entityType = "Employee";
        Long id = 789L;

        // When
        EntityNotFoundException exception = new EntityNotFoundException(entityType, id);

        // Then
        assertEquals("Employee", exception.getEntityType());
        assertEquals(789L, exception.getEntityId());
        assertNull(exception.getEntityIdentifier());
    }
}
