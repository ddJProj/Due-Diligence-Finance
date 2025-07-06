package com.ddfinance.backend.dto.accounts;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for UpdatePasswordRequest DTO validation.
 */
class UpdatePasswordRequestTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidPasswordUpdate() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword123!")
                .newPassword("newPassword123!")
                .confirmPassword("newPassword123!")
                .build();

        // When
        Set<ConstraintViolation<UpdatePasswordRequest>> violations = validator.validate(request);

        // Then
        assertTrue(violations.isEmpty());
        assertTrue(request.passwordsMatch());
    }

    @Test
    void testPasswordMismatch() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword123!")
                .newPassword("newPassword123!")
                .confirmPassword("differentPassword123!")
                .build();

        // When
        boolean match = request.passwordsMatch();

        // Then
        assertFalse(match);
    }

    @Test
    void testBlankCurrentPassword() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("")
                .newPassword("newPassword123!")
                .confirmPassword("newPassword123!")
                .build();

        // When
        Set<ConstraintViolation<UpdatePasswordRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Current password is required")));
    }

    @Test
    void testBlankNewPassword() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword123!")
                .newPassword("")
                .confirmPassword("newPassword123!")
                .build();

        // When
        Set<ConstraintViolation<UpdatePasswordRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("New password is required")));
    }

    @Test
    void testShortNewPassword() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword123!")
                .newPassword("short")
                .confirmPassword("short")
                .build();

        // When
        Set<ConstraintViolation<UpdatePasswordRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("New password must be at least 8 characters")));
    }

    @Test
    void testBlankConfirmPassword() {
        // Given
        UpdatePasswordRequest request = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword123!")
                .newPassword("newPassword123!")
                .confirmPassword("")
                .build();

        // When
        Set<ConstraintViolation<UpdatePasswordRequest>> violations = validator.validate(request);

        // Then
        assertEquals(1, violations.size());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password confirmation is required")));
    }

    @Test
    void testPasswordsMatchWithNulls() {
        // Given
        UpdatePasswordRequest request = new UpdatePasswordRequest();

        // When
        boolean match = request.passwordsMatch();

        // Then
        assertFalse(match); // null passwords don't match
    }

    @Test
    void testAllFieldsNull() {
        // Given
        UpdatePasswordRequest request = new UpdatePasswordRequest();

        // When
        Set<ConstraintViolation<UpdatePasswordRequest>> violations = validator.validate(request);

        // Then
        assertEquals(3, violations.size()); // All three fields are required
    }
}
