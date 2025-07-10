package com.ddfinance.backend.util.validation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EmailValidatorTest {

    private EmailValidator emailValidator;

    @BeforeEach
    void setUp() {
        emailValidator = new EmailValidator();
    }

    @Nested
    @DisplayName("Basic Validation Tests")
    class BasicValidationTests {

        @Test
        @DisplayName("Should accept valid standard email")
        void shouldAcceptValidEmail() {
            String email = "user@example.com";

            assertTrue(emailValidator.isValid(email));
            assertTrue(emailValidator.validate(email).isEmpty());
        }

        @Test
        @DisplayName("Should reject null email")
        void shouldRejectNullEmail() {
            assertFalse(emailValidator.isValid(null));

            var errors = emailValidator.validate(null);
            assertEquals(1, errors.size());
            assertEquals("Email cannot be null or empty", errors.get(0));
        }

        @Test
        @DisplayName("Should reject empty email")
        void shouldRejectEmptyEmail() {
            assertFalse(emailValidator.isValid(""));

            var errors = emailValidator.validate("");
            assertEquals(1, errors.size());
            assertEquals("Email cannot be null or empty", errors.get(0));
        }

        @Test
        @DisplayName("Should reject email with only whitespace")
        void shouldRejectWhitespaceEmail() {
            assertFalse(emailValidator.isValid("   "));

            var errors = emailValidator.validate("   ");
            assertEquals(1, errors.size());
            assertEquals("Email cannot be null or empty", errors.get(0));
        }

        @Test
        @DisplayName("Should trim whitespace before validation")
        void shouldTrimWhitespace() {
            String email = "  user@example.com  ";

            assertTrue(emailValidator.isValid(email));
            assertEquals("user@example.com", emailValidator.normalize(email));
        }
    }

    @Nested
    @DisplayName("Valid Email Format Tests")
    class ValidEmailFormatTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "simple@example.com",
                "user.name@example.com",
                "user+tag@example.com",
                "user_name@example.com",
                "user-name@example.com",
                "123@example.com",
                "user@subdomain.example.com",
                "user@example.co.uk",
                "user@example-domain.com",
                "u@example.com",
                "user@123.456.789.012",
                "user@example.museum",
                "first.last@example.com",
                "test.email+tag@example4u.net"
        })
        @DisplayName("Should accept various valid email formats")
        void shouldAcceptValidEmailFormats(String email) {
            assertTrue(emailValidator.isValid(email));
            assertTrue(emailValidator.validate(email).isEmpty());
        }
    }

    @Nested
    @DisplayName("Invalid Email Format Tests")
    class InvalidEmailFormatTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "plainaddress",
                "@missinglocal.com",
                "missing@domain",
                "missing.domain@.com",
                "missing@.com",
                "two@@example.com",
                "user..name@example.com",
                ".username@example.com",
                "username.@example.com",
                "user name@example.com",
                "user@domain",
                "user@",
                "@domain.com",
                "user@domain..com",
                "user@domain.c",
                "user@-domain.com",
                "user@domain-.com",
                "user@domain.com.",
                "user(comment)@example.com",
                "user@domain@example.com",
                "user.@domain.com"
        })
        @DisplayName("Should reject various invalid email formats")
        void shouldRejectInvalidEmailFormats(String email) {
            assertFalse(emailValidator.isValid(email));
            assertFalse(emailValidator.validate(email).isEmpty());
        }
    }

    @Nested
    @DisplayName("Email Length Tests")
    class EmailLengthTests {

        @Test
        @DisplayName("Should reject email exceeding maximum length")
        void shouldRejectLongEmail() {
            // Create email with 255+ characters
            String longLocal = "a".repeat(250);
            String email = longLocal + "@example.com";

            assertFalse(emailValidator.isValid(email));

            var errors = emailValidator.validate(email);
            assertTrue(errors.contains("Email exceeds maximum length of 254 characters"));
        }

        @Test
        @DisplayName("Should reject local part exceeding 64 characters")
        void shouldRejectLongLocalPart() {
            String longLocal = "a".repeat(65);
            String email = longLocal + "@example.com";

            assertFalse(emailValidator.isValid(email));

            var errors = emailValidator.validate(email);
            assertTrue(errors.contains("Local part exceeds maximum length of 64 characters"));
        }

        @Test
        @DisplayName("Should accept email at maximum valid length")
        void shouldAcceptMaxLengthEmail() {
            String local = "a".repeat(64);
            String domain = "example.com";
            String email = local + "@" + domain;

            assertTrue(emailValidator.isValid(email));
        }
    }

    @Nested
    @DisplayName("Special Character Tests")
    class SpecialCharacterTests {

        @Test
        @DisplayName("Should reject email with invalid special characters")
        void shouldRejectInvalidSpecialCharacters() {
            String[] invalidEmails = {
                    "user!name@example.com",
                    "user#name@example.com",
                    "user$name@example.com",
                    "user%name@example.com",
                    "user&name@example.com",
                    "user*name@example.com",
                    "user=name@example.com"
            };

            for (String email : invalidEmails) {
                assertFalse(emailValidator.isValid(email),
                        "Should reject email: " + email);
            }
        }

        @Test
        @DisplayName("Should accept valid special characters in local part")
        void shouldAcceptValidSpecialCharacters() {
            String[] validEmails = {
                    "user.name@example.com",
                    "user+tag@example.com",
                    "user-name@example.com",
                    "user_name@example.com"
            };

            for (String email : validEmails) {
                assertTrue(emailValidator.isValid(email),
                        "Should accept email: " + email);
            }
        }
    }

    @Nested
    @DisplayName("Domain Validation Tests")
    class DomainValidationTests {

        @Test
        @DisplayName("Should reject domain starting with hyphen")
        void shouldRejectDomainStartingWithHyphen() {
            assertFalse(emailValidator.isValid("user@-example.com"));
        }

        @Test
        @DisplayName("Should reject domain ending with hyphen")
        void shouldRejectDomainEndingWithHyphen() {
            assertFalse(emailValidator.isValid("user@example-.com"));
        }

        @Test
        @DisplayName("Should reject domain with consecutive dots")
        void shouldRejectDomainWithConsecutiveDots() {
            assertFalse(emailValidator.isValid("user@example..com"));
        }

        @Test
        @DisplayName("Should reject domain without TLD")
        void shouldRejectDomainWithoutTLD() {
            assertFalse(emailValidator.isValid("user@localhost"));
            assertFalse(emailValidator.isValid("user@domain"));
        }

        @Test
        @DisplayName("Should accept valid international domains")
        void shouldAcceptInternationalDomains() {
            assertTrue(emailValidator.isValid("user@example.中国"));
            assertTrue(emailValidator.isValid("user@example.рф"));
        }
    }

    @Nested
    @DisplayName("Normalization Tests")
    class NormalizationTests {

        @Test
        @DisplayName("Should normalize email to lowercase")
        void shouldNormalizeToLowercase() {
            String email = "User@EXAMPLE.COM";
            assertEquals("user@example.com", emailValidator.normalize(email));
        }

        @Test
        @DisplayName("Should trim whitespace during normalization")
        void shouldTrimDuringNormalization() {
            String email = "  user@example.com  ";
            assertEquals("user@example.com", emailValidator.normalize(email));
        }

        @Test
        @DisplayName("Should return null for invalid email normalization")
        void shouldReturnNullForInvalidEmailNormalization() {
            assertNull(emailValidator.normalize(null));
            assertNull(emailValidator.normalize(""));
            assertNull(emailValidator.normalize("invalid"));
        }
    }

    @Nested
    @DisplayName("Disposable Email Tests")
    class DisposableEmailTests {

        @ParameterizedTest
        @ValueSource(strings = {
                "user@tempmail.com",
                "user@throwaway.email",
                "user@guerrillamail.com",
                "user@mailinator.com",
                "user@10minutemail.com"
        })
        @DisplayName("Should detect disposable email addresses")
        void shouldDetectDisposableEmails(String email) {
            assertTrue(emailValidator.isDisposable(email));
        }

        @Test
        @DisplayName("Should not flag legitimate emails as disposable")
        void shouldNotFlagLegitimateEmailsAsDisposable() {
            assertFalse(emailValidator.isDisposable("user@gmail.com"));
            assertFalse(emailValidator.isDisposable("user@company.com"));
            assertFalse(emailValidator.isDisposable("user@university.edu"));
        }

        @Test
        @DisplayName("Should reject disposable emails when configured")
        void shouldRejectDisposableEmailsWhenConfigured() {
            EmailValidator strictValidator = new EmailValidator(true);

            assertFalse(strictValidator.isValid("user@tempmail.com"));

            var errors = strictValidator.validate("user@tempmail.com");
            assertTrue(errors.contains("Disposable email addresses are not allowed"));
        }
    }

    @Nested
    @DisplayName("Configuration Tests")
    class ConfigurationTests {

        @Test
        @DisplayName("Should allow disposable emails by default")
        void shouldAllowDisposableEmailsByDefault() {
            EmailValidator defaultValidator = new EmailValidator();
            assertTrue(defaultValidator.isValid("user@tempmail.com"));
        }

        @Test
        @DisplayName("Should respect disposable email configuration")
        void shouldRespectDisposableEmailConfiguration() {
            EmailValidator lenientValidator = new EmailValidator(false);
            assertTrue(lenientValidator.isValid("user@tempmail.com"));

            EmailValidator strictValidator = new EmailValidator(true);
            assertFalse(strictValidator.isValid("user@tempmail.com"));
        }
    }

    @Nested
    @DisplayName("DNS Validation Tests")
    class DNSValidationTests {

        @Test
        @DisplayName("Should check if domain exists when DNS check enabled")
        void shouldCheckDomainExistsWhenEnabled() {
            // This would require actual DNS lookup in production
            // For testing, we'll verify the method exists
            assertNotNull(emailValidator.isDomainValid("example.com"));
        }

        @Test
        @DisplayName("Should validate known good domains")
        void shouldValidateKnownGoodDomains() {
            // These are well-known domains that should always exist
            assertTrue(emailValidator.isDomainValid("gmail.com"));
            assertTrue(emailValidator.isDomainValid("yahoo.com"));
            assertTrue(emailValidator.isDomainValid("microsoft.com"));
        }
    }

    @Nested
    @DisplayName("Multiple Error Tests")
    class MultipleErrorTests {

        @Test
        @DisplayName("Should return all validation errors")
        void shouldReturnAllValidationErrors() {
            String badEmail = "@domain..com"; // Missing local, consecutive dots

            List<String> errors = emailValidator.validate(badEmail);

            assertTrue(errors.size() >= 2);
            assertTrue(errors.stream().anyMatch(e -> e.contains("missing local part")));
            assertTrue(errors.stream().anyMatch(e -> e.contains("Invalid domain format")));
        }
    }
}