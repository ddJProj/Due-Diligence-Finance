package com.ddfinance.backend.dto.auth;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for RegisterAuthRequest DTO validation.
 */
class RegisterAuthRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidRegisterRequest() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
    }

    @Test
    void testBlankFirstName() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("First name is required")));
    }

    @Test
    void testShortFirstName() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("J")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("First name must be between 2 and 50 characters")));
    }

    @Test
    void testBlankLastName() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("")
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Last name is required")));
    }

    @Test
    void testInvalidEmail() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("invalid-email")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email must be valid")));
    }

    @Test
    void testBlankEmail() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(2, violations.size()); // Both @NotBlank and @Email will fail
    }

    @Test
    void testBlankPassword() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password is required")));
    }

    @Test
    void testShortPassword() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("short")
                .build();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password must be at least 8 characters")));
    }

    @Test
    void testAllFieldsNull() {
        // Given
        RegisterAuthRequest request = new RegisterAuthRequest();

        // When
        Set<ConstraintViolation<RegisterAuthRequest>> violations = validator.validate(request);

        // Then
        assertEquals(4, violations.size()); // All fields are required
    }

    @Test
    void testBuilderPattern() {
        // Given
        RegisterAuthRequest request = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        // Then
        assertEquals("John", request.getFirstName());
        assertEquals("Doe", request.getLastName());
        assertEquals("john.doe@example.com", request.getEmail());
        assertEquals("SecurePass123!", request.getPassword());
    }
}
