package com.ddfinance.core.exception;

/**
 * Exception thrown when security-related issues occur.
 * This includes authentication failures, authorization issues, and access control violations.
 * This is a runtime exception to allow for cleaner controller code.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public class SecurityException extends RuntimeException {

    /**
     * Constructs a new SecurityException with the specified message.
     *
     * @param message the detail message
     */
    public SecurityException(String message) {
        super(message);
    }

    /**
     * Constructs a new SecurityException with the specified message and cause.
     *
     * @param message the detail message
     * @param cause the cause of the exception
     */
    public SecurityException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Thrown when a user is not authenticated (401 Unauthorized).
     */
    public static class UnauthorizedException extends SecurityException {
        public UnauthorizedException(String message) {
            super(message);
        }
    }

    /**
     * Thrown when a user lacks required permissions (403 Forbidden).
     */
    public static class ForbiddenException extends SecurityException {
        public ForbiddenException(String message) {
            super(message);
        }
    }

    /**
     * Thrown when authentication fails (invalid credentials).
     */
    public static class AuthenticationException extends SecurityException {
        public AuthenticationException(String message) {
            super(message);
        }

        public AuthenticationException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * Thrown when there are issues with security tokens (JWT).
     */
    public static class TokenException extends SecurityException {
        public TokenException(String message) {
            super(message);
        }

        public TokenException(String message, Throwable cause) {
            super(message, cause);
        }
    }

    /**
     * Thrown when a specific permission is denied for a resource.
     */
    public static class PermissionDeniedException extends SecurityException {
        private final String resource;
        private final String action;

        public PermissionDeniedException(String resource, String action) {
            super(String.format("Permission denied: Cannot %s %s", action, resource));
            this.resource = resource;
            this.action = action;
        }

        public String getResource() {
            return resource;
        }

        public String getAction() {
            return action;
        }
    }

    /**
     * Thrown when an account is locked due to too many failed attempts.
     */
    public static class AccountLockedException extends SecurityException {
        private final String username;
        private final int attemptCount;

        public AccountLockedException(String username, int attemptCount) {
            super(String.format("Account locked for %s after %d failed attempts", username, attemptCount));
            this.username = username;
            this.attemptCount = attemptCount;
        }

        public String getUsername() {
            return username;
        }

        public int getAttemptCount() {
            return attemptCount;
        }
    }
}