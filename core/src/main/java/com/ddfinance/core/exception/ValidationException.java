package com.ddfinance.core.exception;

import java.util.ArrayList;
import java.util.List;

/**
 * Exception thrown when validation of input data fails.
 * This is a runtime exception to avoid forcing try-catch blocks for validation errors.
 * Supports field-level validation errors for detailed error reporting.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public class ValidationException extends RuntimeException {

    private final List<FieldError> fieldErrors = new ArrayList<>();

    /**
     * Constructs a new ValidationException with the specified message.
     *
     * @param message the detail message
     */
    public ValidationException(String message) {
        super(message);
    }

    /**
     * Constructs a new ValidationException with the specified message and cause.
     *
     * @param message the detail message
     * @param cause the cause of the exception
     */
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Adds a field-specific validation error.
     *
     * @param field the field name that failed validation
     * @param message the validation error message
     */
    public void addFieldError(String field, String message) {
        this.fieldErrors.add(new FieldError(field, message));
    }

    /**
     * Adds a field error object.
     *
     * @param fieldError the field error to add
     */
    public void addFieldError(FieldError fieldError) {
        this.fieldErrors.add(fieldError);
    }

    /**
     * Gets all field validation errors.
     *
     * @return list of field errors
     */
    public List<FieldError> getFieldErrors() {
        return new ArrayList<>(fieldErrors);
    }

    /**
     * Checks if there are any field-specific errors.
     *
     * @return true if there are field errors, false otherwise
     */
    public boolean hasFieldErrors() {
        return !fieldErrors.isEmpty();
    }

    /**
     * Gets a summary of all field errors as a formatted string.
     *
     * @return formatted string of all field errors
     */
    public String getFieldErrorSummary() {
        if (fieldErrors.isEmpty()) {
            return "";
        }

        StringBuilder summary = new StringBuilder();
        for (FieldError error : fieldErrors) {
            if (summary.length() > 0) {
                summary.append("; ");
            }
            summary.append(error.getField()).append(": ").append(error.getMessage());
        }
        return summary.toString();
    }

    /**
     * Represents a field-specific validation error.
     */
    public static class FieldError {
        private final String field;
        private final String message;

        /**
         * Constructs a new FieldError.
         *
         * @param field the field name
         * @param message the error message
         */
        public FieldError(String field, String message) {
            this.field = field;
            this.message = message;
        }

        /**
         * Gets the field name.
         *
         * @return the field name
         */
        public String getField() {
            return field;
        }

        /**
         * Gets the error message.
         *
         * @return the error message
         */
        public String getMessage() {
            return message;
        }
    }
}
