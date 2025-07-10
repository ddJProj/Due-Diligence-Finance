package com.ddfinance.backend.util.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.*;

class PasswordValidatorTest {

    private PasswordValidator passwordValidator;

    @BeforeEach
    void setUp() {
        passwordValidator = new PasswordValidator();
    }

    @Nested
    @DisplayName("Basic Validation Tests")
    class BasicValidationTests {

        @Test
        @DisplayName("Should accept valid password with all requirements")
        void shouldAcceptValidPassword() {
            // Password with uppercase, lowercase, digit, special char, and proper length
            String validPassword = "P@ssw0rd123";

            assertTrue(passwordValidator.isValid(validPassword));
            assertTrue(passwordValidator.validate(validPassword).isEmpty());
        }

        @Test
        @DisplayName("Should reject null password")
        void shouldRejectNullPassword() {
            assertFalse(passwordValidator.isValid(null));

            var errors = passwordValidator.validate(null);
            assertFalse(errors.isEmpty());
            assertTrue(errors.contains("Password cannot be null or empty"));
        }

        @Test
        @DisplayName("Should reject empty password")
        void shouldRejectEmptyPassword() {
            assertFalse(passwordValidator.isValid(""));

            var errors = passwordValidator.validate("");
            assertFalse(errors.isEmpty());
            assertTrue(errors.contains("Password cannot be null or empty"));
        }

        @Test
        @DisplayName("Should reject password with only spaces")
        void shouldRejectPasswordWithOnlySpaces() {
            assertFalse(passwordValidator.isValid("        "));

            var errors = passwordValidator.validate("        ");
            assertFalse(errors.isEmpty());
        }
    }

    @Nested
    @DisplayName("Length Validation Tests")
    class LengthValidationTests {

        @Test
        @DisplayName("Should reject password shorter than minimum length")
        void shouldRejectShortPassword() {
            String shortPassword = "P@ss1";

            assertFalse(passwordValidator.isValid(shortPassword));

            var errors = passwordValidator.validate(shortPassword);
            assertTrue(errors.contains("Password must be at least 8 characters long"));
        }

        @Test
        @DisplayName("Should reject password longer than maximum length")
        void shouldRejectLongPassword() {
            String longPassword = "P@ssw0rd" + "x".repeat(120); // Over 128 chars

            assertFalse(passwordValidator.isValid(longPassword));

            var errors = passwordValidator.validate(longPassword);
            assertTrue(errors.contains("Password must not exceed 128 characters"));
        }

        @Test
        @DisplayName("Should accept password at minimum length")
        void shouldAcceptPasswordAtMinimumLength() {
            String password = "P@ssw0r1"; // Exactly 8 characters

            assertTrue(passwordValidator.isValid(password));
        }

        @Test
        @DisplayName("Should accept password at maximum length")
        void shouldAcceptPasswordAtMaximumLength() {
            // Create a 128-character password with all requirements
            String password = "P@ssw0rd" + "Aa1!".repeat(30); // Exactly 128 chars

            assertTrue(passwordValidator.isValid(password));
        }
    }

    @Nested
    @DisplayName("Character Requirements Tests")
    class CharacterRequirementsTests {

        @Test
        @DisplayName("Should reject password without uppercase letter")
        void shouldRejectPasswordWithoutUppercase() {
            String password = "p@ssw0rd123";

            assertFalse(passwordValidator.isValid(password));

            var errors = passwordValidator.validate(password);
            assertTrue(errors.contains("Password must contain at least one uppercase letter"));
        }

        @Test
        @DisplayName("Should reject password without lowercase letter")
        void shouldRejectPasswordWithoutLowercase() {
            String password = "P@SSW0RD123";

            assertFalse(passwordValidator.isValid(password));

            var errors = passwordValidator.validate(password);
            assertTrue(errors.contains("Password must contain at least one lowercase letter"));
        }

        @Test
        @DisplayName("Should reject password without digit")
        void shouldRejectPasswordWithoutDigit() {
            String password = "P@ssword";

            assertFalse(passwordValidator.isValid(password));

            var errors = passwordValidator.validate(password);
            assertTrue(errors.contains("Password must contain at least one digit"));
        }

        @Test
        @DisplayName("Should reject password without special character")
        void shouldRejectPasswordWithoutSpecialChar() {
            String password = "Passw0rd123";

            assertFalse(passwordValidator.isValid(password));

            var errors = passwordValidator.validate(password);
            assertTrue(errors.contains("Password must contain at least one special character"));
        }
    }

    @Nested
    @DisplayName("Common Password Tests")
    class CommonPasswordTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "Password123!",
                "Admin@123",
                "Welcome123!",
                "Qwerty123!",
                "Password@2024"
        })
        @DisplayName("Should reject common passwords")
        void shouldRejectCommonPasswords(String commonPassword) {
            assertFalse(passwordValidator.isValid(commonPassword));

            var errors = passwordValidator.validate(commonPassword);
            assertTrue(errors.contains("Password is too common and easily guessable"));
        }
    }

    @Nested
    @DisplayName("Password Strength Tests")
    class PasswordStrengthTests {

        @Test
        @DisplayName("Should calculate weak password strength")
        void shouldCalculateWeakPasswordStrength() {
            String weakPassword = "Pass123!"; // Minimum requirements

            assertEquals(PasswordValidator.PasswordStrength.WEAK,
                    passwordValidator.calculateStrength(weakPassword));
        }

        @Test
        @DisplayName("Should calculate medium password strength")
        void shouldCalculateMediumPasswordStrength() {
            String mediumPassword = "MyP@ssw0rd2024"; // Better but predictable

            assertEquals(PasswordValidator.PasswordStrength.MEDIUM,
                    passwordValidator.calculateStrength(mediumPassword));
        }

        @Test
        @DisplayName("Should calculate strong password strength")
        void shouldCalculateStrongPasswordStrength() {
            String strongPassword = "K9$mP2#xQr@nL5"; // Random and complex

            assertEquals(PasswordValidator.PasswordStrength.STRONG,
                    passwordValidator.calculateStrength(strongPassword));
        }

        @Test
        @DisplayName("Should return null strength for invalid password")
        void shouldReturnNullStrengthForInvalidPassword() {
            assertNull(passwordValidator.calculateStrength(null));
            assertNull(passwordValidator.calculateStrength(""));
            assertNull(passwordValidator.calculateStrength("weak"));
        }
    }

    @Nested
    @DisplayName("Custom Configuration Tests")
    class CustomConfigurationTests {

        @Test
        @DisplayName("Should validate with custom minimum length")
        void shouldValidateWithCustomMinLength() {
            PasswordValidator customValidator = new PasswordValidator(12, 128);

            assertFalse(customValidator.isValid("P@ssw0rd1")); // 9 chars
            assertTrue(customValidator.isValid("P@ssw0rd1234")); // 12 chars
        }

        @Test
        @DisplayName("Should validate with custom maximum length")
        void shouldValidateWithCustomMaxLength() {
            PasswordValidator customValidator = new PasswordValidator(8, 16);

            assertTrue(customValidator.isValid("P@ssw0rd123")); // Within limit
            assertFalse(customValidator.isValid("P@ssw0rd1234567890")); // Over 16
        }

        @Test
        @DisplayName("Should handle configuration with special character requirement disabled")
        void shouldHandleDisabledSpecialCharRequirement() {
            PasswordValidator customValidator = new PasswordValidator(8, 128, false);

            assertTrue(customValidator.isValid("Password123")); // No special char
        }
    }

    @Nested
    @DisplayName("Multiple Validation Errors Tests")
    class MultipleValidationErrorsTests {

        @Test
        @DisplayName("Should return all validation errors for completely invalid password")
        void shouldReturnAllValidationErrors() {
            String badPassword = "pass"; // Too short, no uppercase, no digit, no special

            var errors = passwordValidator.validate(badPassword);

            assertEquals(4, errors.size());
            assertTrue(errors.contains("Password must be at least 8 characters long"));
            assertTrue(errors.contains("Password must contain at least one uppercase letter"));
            assertTrue(errors.contains("Password must contain at least one digit"));
            assertTrue(errors.contains("Password must contain at least one special character"));
        }
    }

    @Nested
    @DisplayName("Special Character Set Tests")
    class SpecialCharacterSetTests {

        @ParameterizedTest
        @ValueSource(strings = {"!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "_", "+", "=", "[", "]", "{", "}", "|", "\\", ":", ";", "\"", "'", "<", ">", ",", ".", "?", "/"})
        @DisplayName("Should accept all defined special characters")
        void shouldAcceptAllSpecialCharacters(String specialChar) {
            String password = "Password1" + specialChar;

            assertTrue(passwordValidator.isValid(password));
        }

        @Test
        @DisplayName("Should not accept space as special character")
        void shouldNotAcceptSpaceAsSpecialCharacter() {
            String password = "Password 123"; // Space instead of special char

            assertFalse(passwordValidator.isValid(password));

            var errors = passwordValidator.validate(password);
            assertTrue(errors.contains("Password must contain at least one special character"));
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle unicode characters")
        void shouldHandleUnicodeCharacters() {
            String password = "P@ssw0rd🚀";

            // Unicode emoji should not count as special character
            assertFalse(passwordValidator.isValid(password));
        }

        @Test
        @DisplayName("Should trim whitespace before validation")
        void shouldTrimWhitespaceBeforeValidation() {
            String password = "  P@ssw0rd123  ";

            assertTrue(passwordValidator.isValid(password));
        }

        @Test
        @DisplayName("Should not modify original password")
        void shouldNotModifyOriginalPassword() {
            String originalPassword = "  P@ssw0rd123  ";
            String copyPassword = new String(originalPassword);

            passwordValidator.isValid(originalPassword);

            assertEquals(copyPassword, originalPassword);
        }
    }
}
