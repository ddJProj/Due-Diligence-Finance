package com.ddfinance.core.exception;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for ValidationException.
 * Tests validation-related exception handling.
 */
class ValidationExceptionTest {

    @Test
    void testValidationExceptionWithMessage() {
        // Given
        String message = "Email format is invalid";

        // When
        ValidationException exception = new ValidationException(message);

        // Then
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testValidationExceptionWithMessageAndCause() {
        // Given
        String message = "Validation failed";
        Throwable cause = new IllegalArgumentException("Invalid argument");

        // When
        ValidationException exception = new ValidationException(message, cause);

        // Then
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    void testFieldValidationError() {
        // Given
        String fieldName = "email";
        String errorMessage = "Email is required";

        // When
        ValidationException.FieldError fieldError = new ValidationException.FieldError(fieldName, errorMessage);
        ValidationException exception = new ValidationException("Validation failed");
        exception.addFieldError(fieldError);

        // Then
        assertEquals(1, exception.getFieldErrors().size());
        assertEquals(fieldName, fieldError.getField());
        assertEquals(errorMessage, fieldError.getMessage());
    }

    @Test
    void testMultipleFieldErrors() {
        // Given
        ValidationException exception = new ValidationException("Multiple validation errors");

        // When
        exception.addFieldError("firstName", "First name is required");
        exception.addFieldError("email", "Email format is invalid");
        exception.addFieldError("password", "Password must be at least 8 characters");

        // Then
        assertEquals(3, exception.getFieldErrors().size());
        assertTrue(exception.hasFieldErrors());
    }

    @Test
    void testNoFieldErrors() {
        // Given
        ValidationException exception = new ValidationException("General validation error");

        // Then
        assertTrue(exception.getFieldErrors().isEmpty());
        assertFalse(exception.hasFieldErrors());
    }

    @Test
    void testGetFieldErrorMessages() {
        // Given
        ValidationException exception = new ValidationException("Validation errors occurred");
        exception.addFieldError("username", "Username already exists");
        exception.addFieldError("email", "Email already registered");

        // When
        String errorSummary = exception.getFieldErrorSummary();

        // Then
        assertTrue(errorSummary.contains("username"));
        assertTrue(errorSummary.contains("Username already exists"));
        assertTrue(errorSummary.contains("email"));
        assertTrue(errorSummary.contains("Email already registered"));
    }
}
