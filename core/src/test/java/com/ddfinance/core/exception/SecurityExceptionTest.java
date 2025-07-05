package com.ddfinance.core.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for SecurityException.
 * Tests security-related exception handling.
 */
class SecurityExceptionTest {

    @Test
    void testSecurityExceptionWithMessage() {
        // Given
        String message = "Access denied";

        // When
        SecurityException exception = new SecurityException(message);

        // Then
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testSecurityExceptionWithMessageAndCause() {
        // Given
        String message = "Authentication failed";
        Throwable cause = new IllegalStateException("Invalid token");

        // When
        SecurityException exception = new SecurityException(message, cause);

        // Then
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    void testUnauthorizedException() {
        // Given
        String message = "User not authenticated";

        // When
        SecurityException.UnauthorizedException exception =
                new SecurityException.UnauthorizedException(message);

        // Then
        assertEquals(message, exception.getMessage());
        assertTrue(exception instanceof SecurityException);
    }

    @Test
    void testForbiddenException() {
        // Given
        String message = "Insufficient permissions";

        // When
        SecurityException.ForbiddenException exception =
                new SecurityException.ForbiddenException(message);

        // Then
        assertEquals(message, exception.getMessage());
        assertTrue(exception instanceof SecurityException);
    }

    @Test
    void testAuthenticationException() {
        // Given
        String message = "Invalid credentials";

        // When
        SecurityException.AuthenticationException exception =
                new SecurityException.AuthenticationException(message);

        // Then
        assertEquals(message, exception.getMessage());
        assertTrue(exception instanceof SecurityException);
    }

    @Test
    void testTokenException() {
        // Given
        String message = "Token expired";

        // When
        SecurityException.TokenException exception =
                new SecurityException.TokenException(message);

        // Then
        assertEquals(message, exception.getMessage());
        assertTrue(exception instanceof SecurityException);
    }

    @Test
    void testPermissionDeniedException() {
        // Given
        String resource = "Client";
        String action = "DELETE";

        // When
        SecurityException.PermissionDeniedException exception =
                new SecurityException.PermissionDeniedException(resource, action);

        // Then
        assertTrue(exception.getMessage().contains(resource));
        assertTrue(exception.getMessage().contains(action));
        assertEquals(resource, exception.getResource());
        assertEquals(action, exception.getAction());
    }

    @Test
    void testAccountLockedException() {
        // Given
        String username = "user@example.com";
        int attemptCount = 5;

        // When
        SecurityException.AccountLockedException exception =
                new SecurityException.AccountLockedException(username, attemptCount);

        // Then
        assertTrue(exception.getMessage().contains(username));
        assertTrue(exception.getMessage().contains(String.valueOf(attemptCount)));
        assertEquals(username, exception.getUsername());
        assertEquals(attemptCount, exception.getAttemptCount());
    }
}