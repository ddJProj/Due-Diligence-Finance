package com.ddfinance.backend.util.validation;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Utility class for validating password strength and security requirements.
 * Provides configurable validation rules and strength calculation.
 */
public class PasswordValidator {

    // Default configuration values
    private static final int DEFAULT_MIN_LENGTH = 8;
    private static final int DEFAULT_MAX_LENGTH = 128;
    private static final boolean DEFAULT_REQUIRE_SPECIAL_CHAR = true;

    // Regex patterns for validation
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()\\-_+=\\[\\]{}|\\\\:;\"'<>,.?/]");

    // Common passwords that should be rejected
    private static final Set<String> COMMON_PASSWORDS = new HashSet<>();
    static {
        COMMON_PASSWORDS.add("Password123!");
        COMMON_PASSWORDS.add("Admin@123");
        COMMON_PASSWORDS.add("Welcome123!");
        COMMON_PASSWORDS.add("Qwerty123!");
        COMMON_PASSWORDS.add("Password@2024");
        // TODO: Load from external file for production use
    }

    // Configuration fields
    private final int minLength;
    private final int maxLength;
    private final boolean requireSpecialChar;

    /**
     * Enum representing password strength levels
     */
    public enum PasswordStrength {
        WEAK,
        MEDIUM,
        STRONG
    }

    /**
     * Default constructor with standard security requirements
     */
    public PasswordValidator() {
        this(DEFAULT_MIN_LENGTH, DEFAULT_MAX_LENGTH, DEFAULT_REQUIRE_SPECIAL_CHAR);
    }

    /**
     * Constructor with custom length requirements
     *
     * @param minLength Minimum password length
     * @param maxLength Maximum password length
     */
    public PasswordValidator(int minLength, int maxLength) {
        this(minLength, maxLength, DEFAULT_REQUIRE_SPECIAL_CHAR);
    }

    /**
     * Constructor with full custom configuration
     *
     * @param minLength Minimum password length
     * @param maxLength Maximum password length
     * @param requireSpecialChar Whether special characters are required
     */
    public PasswordValidator(int minLength, int maxLength, boolean requireSpecialChar) {
        if (minLength < 1 || maxLength < minLength) {
            throw new IllegalArgumentException("Invalid length configuration");
        }
        this.minLength = minLength;
        this.maxLength = maxLength;
        this.requireSpecialChar = requireSpecialChar;
    }

    /**
     * Validates a password against all configured requirements
     *
     * @param password The password to validate
     * @return true if the password meets all requirements, false otherwise
     */
    public boolean isValid(String password) {
        return validate(password).isEmpty();
    }

    /**
     * Validates a password and returns a list of validation errors
     *
     * @param password The password to validate
     * @return List of validation error messages (empty if password is valid)
     */
    public List<String> validate(String password) {
        List<String> errors = new ArrayList<>();

        // Check for null or empty
        if (password == null || password.isEmpty()) {
            errors.add("Password cannot be null or empty");
            return errors;
        }

        // Trim whitespace for validation
        String trimmedPassword = password.trim();

        // Check if only whitespace
        if (trimmedPassword.isEmpty()) {
            errors.add("Password cannot be null or empty");
            return errors;
        }

        // Check length
        if (trimmedPassword.length() < minLength) {
            errors.add("Password must be at least " + minLength + " characters long");
        }
        if (trimmedPassword.length() > maxLength) {
            errors.add("Password must not exceed " + maxLength + " characters");
        }

        // Check character requirements
        if (!UPPERCASE_PATTERN.matcher(trimmedPassword).find()) {
            errors.add("Password must contain at least one uppercase letter");
        }
        if (!LOWERCASE_PATTERN.matcher(trimmedPassword).find()) {
            errors.add("Password must contain at least one lowercase letter");
        }
        if (!DIGIT_PATTERN.matcher(trimmedPassword).find()) {
            errors.add("Password must contain at least one digit");
        }
        if (requireSpecialChar && !SPECIAL_CHAR_PATTERN.matcher(trimmedPassword).find()) {
            errors.add("Password must contain at least one special character");
        }

        // Check against common passwords
        if (COMMON_PASSWORDS.contains(trimmedPassword)) {
            errors.add("Password is too common and easily guessable");
        }

        return errors;
    }

    /**
     * Calculates the strength of a password
     *
     * @param password The password to analyze
     * @return PasswordStrength enum value, or null if password is invalid
     */
    public PasswordStrength calculateStrength(String password) {
        // Return null for invalid passwords
        if (password == null || password.isEmpty() || !isValid(password)) {
            return null;
        }

        String trimmedPassword = password.trim();
        int score = 0;

        // Length scoring
        if (trimmedPassword.length() >= 12) {
            score += 2;
        } else if (trimmedPassword.length() >= 10) {
            score += 1;
        }

        // Complexity scoring
        if (UPPERCASE_PATTERN.matcher(trimmedPassword).find()) score++;
        if (LOWERCASE_PATTERN.matcher(trimmedPassword).find()) score++;
        if (DIGIT_PATTERN.matcher(trimmedPassword).find()) score++;
        if (SPECIAL_CHAR_PATTERN.matcher(trimmedPassword).find()) score++;

        // Additional complexity checks
        if (containsMultipleSpecialChars(trimmedPassword)) score++;
        if (containsMultipleDigits(trimmedPassword)) score++;
        if (!containsCommonPatterns(trimmedPassword)) score++;

        // Determine strength based on score
        if (score >= 8) {
            return PasswordStrength.STRONG;
        } else if (score >= 5) {
            return PasswordStrength.MEDIUM;
        } else {
            return PasswordStrength.WEAK;
        }
    }

    /**
     * Checks if password contains multiple special characters
     */
    private boolean containsMultipleSpecialChars(String password) {
        int count = 0;
        for (char c : password.toCharArray()) {
            if (SPECIAL_CHAR_PATTERN.matcher(String.valueOf(c)).matches()) {
                count++;
                if (count > 1) return true;
            }
        }
        return false;
    }

    /**
     * Checks if password contains multiple digits
     */
    private boolean containsMultipleDigits(String password) {
        int count = 0;
        for (char c : password.toCharArray()) {
            if (Character.isDigit(c)) {
                count++;
                if (count > 2) return true;
            }
        }
        return false;
    }

    /**
     * Checks if password contains common patterns
     */
    private boolean containsCommonPatterns(String password) {
        String lowerPassword = password.toLowerCase();

        // Check for common patterns
        String[] patterns = {
                "password", "admin", "user", "123", "qwerty",
                "abc", "111", "000", "welcome", "test"
        };

        for (String pattern : patterns) {
            if (lowerPassword.contains(pattern)) {
                return true;
            }
        }

        // Check for keyboard patterns
        String[] keyboardPatterns = {"qwer", "asdf", "zxcv", "1234", "4321"};
        for (String pattern : keyboardPatterns) {
            if (lowerPassword.contains(pattern)) {
                return true;
            }
        }

        return false;
    }
}
