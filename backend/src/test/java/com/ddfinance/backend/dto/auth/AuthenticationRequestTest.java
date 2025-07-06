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
 * Test class for AuthenticationRequest DTO validation.
 */
class AuthenticationRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidAuthenticationRequest() {
        // Given
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<AuthenticationRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
    }

    @Test
    void testBlankEmail() {
        // Given
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<AuthenticationRequest>> violations = validator.validate(request);

        // Then
        assertEquals(2, violations.size()); // Both @NotBlank and @Email will fail
    }

    @Test
    void testNullEmail() {
        // Given
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email(null)
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<AuthenticationRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email is required")));
    }

    @Test
    void testInvalidEmailFormat() {
        // Given
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("not-an-email")
                .password("SecurePass123!")
                .build();

        // When
        Set<ConstraintViolation<AuthenticationRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Email must be valid")));
    }

    @Test
    void testBlankPassword() {
        // Given
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("john.doe@example.com")
                .password("")
                .build();

        // When
        Set<ConstraintViolation<AuthenticationRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password is required")));
    }

    @Test
    void testNullPassword() {
        // Given
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("john.doe@example.com")
                .password(null)
                .build();

        // When
        Set<ConstraintViolation<AuthenticationRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password is required")));
    }

    @Test
    void testAllFieldsNull() {
        // Given
        AuthenticationRequest request = new AuthenticationRequest();

        // When
        Set<ConstraintViolation<AuthenticationRequest>> violations = validator.validate(request);

        // Then
        assertEquals(2, violations.size()); // Both email and password are required
    }

    @Test
    void testGettersAndSetters() {
        // Given
        AuthenticationRequest request = new AuthenticationRequest();

        // When
        request.setEmail("test@example.com");
        request.setPassword("testPassword");

        // Then
        assertEquals("test@example.com", request.getEmail());
        assertEquals("testPassword", request.getPassword());
    }

    @Test
    void testBuilderPattern() {
        // Given
        AuthenticationRequest request = AuthenticationRequest.builder()
                .email("builder@example.com")
                .password("builderPassword")
                .build();

        // Then
        assertEquals("builder@example.com", request.getEmail());
        assertEquals("builderPassword", request.getPassword());
    }
}
