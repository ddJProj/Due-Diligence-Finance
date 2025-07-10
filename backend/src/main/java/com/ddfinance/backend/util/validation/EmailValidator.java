package com.ddfinance.backend.util.validation;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Utility class for validating email addresses.
 * Provides comprehensive email validation including format checking,
 * length validation, and optional disposable email detection.
 */
public class EmailValidator {

    // Email regex pattern based on RFC 5322
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@" +
                    "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}$"
    );

    // Maximum lengths according to RFC 5321
    private static final int MAX_EMAIL_LENGTH = 254;
    private static final int MAX_LOCAL_PART_LENGTH = 64;

    // Pattern for validating domain format
    private static final Pattern DOMAIN_PATTERN = Pattern.compile(
            "^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\\.)+[a-zA-Z]{2,}$"
    );

    // Common disposable email domains
    private static final Set<String> DISPOSABLE_DOMAINS = new HashSet<>();
    static {
        DISPOSABLE_DOMAINS.add("tempmail.com");
        DISPOSABLE_DOMAINS.add("throwaway.email");
        DISPOSABLE_DOMAINS.add("guerrillamail.com");
        DISPOSABLE_DOMAINS.add("mailinator.com");
        DISPOSABLE_DOMAINS.add("10minutemail.com");
        DISPOSABLE_DOMAINS.add("trashmail.com");
        DISPOSABLE_DOMAINS.add("yopmail.com");
        DISPOSABLE_DOMAINS.add("temp-mail.org");
        DISPOSABLE_DOMAINS.add("maildrop.cc");
        DISPOSABLE_DOMAINS.add("mintemail.com");
        // TODO: Load comprehensive list from external source
    }

    // Known valid domains for DNS check optimization
    private static final Set<String> KNOWN_VALID_DOMAINS = new HashSet<>();
    static {
        KNOWN_VALID_DOMAINS.add("gmail.com");
        KNOWN_VALID_DOMAINS.add("yahoo.com");
        KNOWN_VALID_DOMAINS.add("microsoft.com");
        KNOWN_VALID_DOMAINS.add("outlook.com");
        KNOWN_VALID_DOMAINS.add("hotmail.com");
        KNOWN_VALID_DOMAINS.add("aol.com");
        KNOWN_VALID_DOMAINS.add("icloud.com");
    }

    private final boolean rejectDisposableEmails;

    /**
     * Default constructor - allows disposable emails
     */
    public EmailValidator() {
        this(false);
    }

    /**
     * Constructor with disposable email configuration
     *
     * @param rejectDisposableEmails Whether to reject disposable email addresses
     */
    public EmailValidator(boolean rejectDisposableEmails) {
        this.rejectDisposableEmails = rejectDisposableEmails;
    }

    /**
     * Validates an email address
     *
     * @param email The email address to validate
     * @return true if the email is valid, false otherwise
     */
    public boolean isValid(String email) {
        return validate(email).isEmpty();
    }

    /**
     * Validates an email address and returns a list of validation errors
     *
     * @param email The email address to validate
     * @return List of validation error messages (empty if email is valid)
     */
    public List<String> validate(String email) {
        List<String> errors = new ArrayList<>();

        // Check for null or empty
        if (email == null || email.trim().isEmpty()) {
            errors.add("Email cannot be null or empty");
            return errors;
        }

        String trimmedEmail = email.trim();

        // Check overall length
        if (trimmedEmail.length() > MAX_EMAIL_LENGTH) {
            errors.add("Email exceeds maximum length of " + MAX_EMAIL_LENGTH + " characters");
        }

        // Check basic format
        if (!EMAIL_PATTERN.matcher(trimmedEmail).matches()) {
            if (!trimmedEmail.contains("@")) {
                errors.add("Email must contain @ symbol");
            } else if (trimmedEmail.startsWith("@")) {
                errors.add("Email is missing local part before @");
            } else if (trimmedEmail.endsWith("@")) {
                errors.add("Email is missing domain after @");
            } else if (trimmedEmail.split("@").length > 2) {
                errors.add("Email contains multiple @ symbols");
            } else {
                errors.add("Invalid email format");
            }
        }

        // Split and validate parts if @ exists
        if (trimmedEmail.contains("@") && trimmedEmail.split("@").length == 2) {
            String[] parts = trimmedEmail.split("@", 2);
            String localPart = parts[0];
            String domain = parts[1];

            // Validate local part
            validateLocalPart(localPart, errors);

            // Validate domain
            validateDomain(domain, errors);

            // Check for disposable email if configured
            if (rejectDisposableEmails && isDisposable(trimmedEmail)) {
                errors.add("Disposable email addresses are not allowed");
            }
        }

        return errors;
    }

    /**
     * Validates the local part of an email address
     */
    private void validateLocalPart(String localPart, List<String> errors) {
        if (localPart.isEmpty()) {
            errors.add("Local part cannot be empty");
            return;
        }

        if (localPart.length() > MAX_LOCAL_PART_LENGTH) {
            errors.add("Local part exceeds maximum length of " + MAX_LOCAL_PART_LENGTH + " characters");
        }

        if (localPart.startsWith(".") || localPart.endsWith(".")) {
            errors.add("Local part cannot start or end with a dot");
        }

        if (localPart.contains("..")) {
            errors.add("Local part cannot contain consecutive dots");
        }

        // Check for invalid characters
        if (!localPart.matches("^[a-zA-Z0-9._+-]+$")) {
            errors.add("Local part contains invalid characters");
        }
    }

    /**
     * Validates the domain part of an email address
     */
    private void validateDomain(String domain, List<String> errors) {
        if (domain.isEmpty()) {
            errors.add("Domain cannot be empty");
            return;
        }

        // Check basic domain format
        if (!DOMAIN_PATTERN.matcher(domain).matches()) {
            if (domain.contains("..")) {
                errors.add("Invalid domain format: consecutive dots");
            } else if (domain.startsWith("-") || domain.endsWith("-")) {
                errors.add("Domain cannot start or end with hyphen");
            } else if (domain.startsWith(".") || domain.endsWith(".")) {
                errors.add("Domain cannot start or end with dot");
            } else if (!domain.contains(".")) {
                errors.add("Domain must contain at least one dot");
            } else if (domain.split("\\.").length > 0 &&
                    domain.substring(domain.lastIndexOf('.') + 1).length() < 2) {
                errors.add("Top-level domain must be at least 2 characters");
            } else {
                errors.add("Invalid domain format");
            }
        }
    }

    /**
     * Normalizes an email address to lowercase and trimmed format
     *
     * @param email The email address to normalize
     * @return Normalized email address, or null if invalid
     */
    public String normalize(String email) {
        if (email == null || email.trim().isEmpty() || !isValid(email)) {
            return null;
        }
        return email.trim().toLowerCase();
    }

    /**
     * Checks if an email address is from a disposable email service
     *
     * @param email The email address to check
     * @return true if the email is from a disposable service, false otherwise
     */
    public boolean isDisposable(String email) {
        if (email == null || !email.contains("@")) {
            return false;
        }

        String domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();
        return DISPOSABLE_DOMAINS.contains(domain);
    }

    /**
     * Checks if a domain exists (has valid DNS records)
     *
     * @param domain The domain to check
     * @return true if the domain exists, false otherwise
     */
    public boolean isDomainValid(String domain) {
        if (domain == null || domain.isEmpty()) {
            return false;
        }

        // Check known valid domains first (optimization)
        if (KNOWN_VALID_DOMAINS.contains(domain.toLowerCase())) {
            return true;
        }

        try {
            // Attempt DNS lookup
            InetAddress.getByName(domain);
            return true;
        } catch (UnknownHostException e) {
            // Domain doesn't exist or network error
            return false;
        }
    }

    /**
     * Performs a comprehensive validation including DNS check
     *
     * @param email The email address to validate
     * @return true if the email is valid and domain exists, false otherwise
     */
    public boolean isValidWithDNSCheck(String email) {
        if (!isValid(email)) {
            return false;
        }

        String domain = email.substring(email.lastIndexOf('@') + 1);
        return isDomainValid(domain);
    }
}
