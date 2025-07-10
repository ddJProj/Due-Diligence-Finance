package com.ddfinance.backend.exception;

import com.ddfinance.backend.dto.response.ValidationErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Validation-specific exception handler for the application.
 * Handles validation errors with detailed field-level information.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
@Slf4j
public class ValidationExceptionHandler {

    @Value("${app.validation.detailed-errors:true}")
    private boolean detailedErrors;

    @Value("${app.validation.max-errors:50}")
    private int maxErrors;

    /**
     * Handles validation errors from @Valid and @Validated annotations.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        log.error("Validation failed for {}: {} errors found",
                ex.getObjectName(), ex.getBindingResult().getErrorCount());

        Map<String, String> errors = new LinkedHashMap<>();

        // Process field errors
        ex.getBindingResult().getFieldErrors().stream()
                .limit(maxErrors)
                .forEach(fieldError -> {
                    String fieldName = formatFieldName(fieldError.getField());
                    String errorMessage = formatErrorMessage(fieldError);

                    errors.merge(fieldName, errorMessage, (existing, newMsg) -> existing + "; " + newMsg);
                });

        // Process global errors
        ex.getBindingResult().getGlobalErrors().stream()
                .limit(Math.max(0, maxErrors - errors.size()))
                .forEach(globalError -> {
                    String objectName = globalError.getObjectName();
                    String errorMessage = globalError.getDefaultMessage();

                    errors.merge(objectName, errorMessage, (existing, newMsg) -> existing + "; " + newMsg);
                });

        // Add truncation notice if needed
        if (ex.getBindingResult().getErrorCount() > maxErrors) {
            errors.put("_notice", String.format("Showing first %d of %d total errors",
                    maxErrors, ex.getBindingResult().getErrorCount()));
        }

        String message = String.format("Validation failed for %d field(s)",
                Math.min(ex.getBindingResult().getErrorCount(), maxErrors));

        ValidationErrorResponse response = ValidationErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request.getRequestURI(),
                errors
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles constraint violation exceptions from Bean Validation.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ValidationErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        log.error("Constraint violations: {} violations found", ex.getConstraintViolations().size());

        Map<String, String> errors = ex.getConstraintViolations().stream()
                .limit(maxErrors)
                .collect(Collectors.toMap(
                        this::getPropertyPath,
                        this::getConstraintMessage,
                        (existing, replacement) -> existing + "; " + replacement,
                        LinkedHashMap::new
                ));

        // Add truncation notice if needed
        if (ex.getConstraintViolations().size() > maxErrors) {
            errors.put("_notice", String.format("Showing first %d of %d total violations",
                    maxErrors, ex.getConstraintViolations().size()));
        }

        String message = String.format("Constraint validation failed for %d field(s)",
                Math.min(ex.getConstraintViolations().size(), maxErrors));

        ValidationErrorResponse response = ValidationErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request.getRequestURI(),
                errors
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles method argument type mismatch exceptions.
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ValidationErrorResponse> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        log.error("Type mismatch for parameter '{}': cannot convert '{}' to {}",
                ex.getName(), ex.getValue(), ex.getRequiredType());

        String paramName = ex.getName();
        String value = ex.getValue() != null ? ex.getValue().toString() : "null";
        Class<?> requiredType = ex.getRequiredType();

        String errorMessage;
        if (requiredType != null) {
            if (requiredType.isEnum()) {
                String validValues = Arrays.stream(requiredType.getEnumConstants())
                        .map(Object::toString)
                        .collect(Collectors.joining(", "));
                errorMessage = String.format("Invalid value '%s'. Valid values are: [%s]",
                        value, validValues);
            } else if (Number.class.isAssignableFrom(requiredType) ||
                    requiredType == int.class || requiredType == long.class ||
                    requiredType == double.class || requiredType == float.class) {
                errorMessage = String.format("Invalid number format: '%s'", value);
            } else if (requiredType == boolean.class || requiredType == Boolean.class) {
                errorMessage = String.format("Invalid boolean value: '%s'. Use 'true' or 'false'", value);
            } else {
                errorMessage = String.format("Cannot convert '%s' to %s",
                        value, requiredType.getSimpleName());
            }
        } else {
            errorMessage = String.format("Invalid value: '%s'", value);
        }

        Map<String, String> errors = Map.of(paramName, errorMessage);

        ValidationErrorResponse response = ValidationErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Invalid request parameter",
                request.getRequestURI(),
                errors
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles missing path variable exceptions.
     */
    @ExceptionHandler(MissingPathVariableException.class)
    public ResponseEntity<ValidationErrorResponse> handleMissingPathVariable(
            MissingPathVariableException ex, HttpServletRequest request) {
        log.error("Missing required path variable: {}", ex.getVariableName());

        Map<String, String> errors = Map.of(
                ex.getVariableName(),
                "Required path variable is missing from the URL"
        );

        ValidationErrorResponse response = ValidationErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "Missing path variable: " + ex.getVariableName(),
                request.getRequestURI(),
                errors
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Handles generic validation exceptions.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ValidationErrorResponse> handleGenericValidationException(
            ValidationException ex, HttpServletRequest request) {
        log.error("Validation error: {}", ex.getMessage());

        String message = ex.getMessage() != null ? ex.getMessage() : "Validation failed";

        ValidationErrorResponse response = ValidationErrorResponse.of(
                HttpStatus.BAD_REQUEST.value(),
                HttpStatus.BAD_REQUEST.getReasonPhrase(),
                message,
                request.getRequestURI(),
                new HashMap<>()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    /**
     * Formats field name for better readability.
     */
    private String formatFieldName(String fieldName) {
        if (!detailedErrors) {
            return fieldName;
        }

        // Convert camelCase to human-readable format
        return fieldName.replaceAll("([a-z])([A-Z])", "$1 $2")
                .toLowerCase()
                .replace('_', ' ');
    }

    /**
     * Formats error message with additional context if available.
     */
    private String formatErrorMessage(FieldError fieldError) {
        String baseMessage = fieldError.getDefaultMessage();

        if (!detailedErrors) {
            return baseMessage;
        }

        // Add rejected value information for certain validation types
        Object rejectedValue = fieldError.getRejectedValue();
        if (rejectedValue != null && !baseMessage.contains(rejectedValue.toString())) {
            String code = fieldError.getCode();
            if (code != null) {
                switch (code) {
                    case "Size":
                    case "Length":
                        return String.format("%s (current length: %d)",
                                baseMessage, rejectedValue.toString().length());
                    case "Min":
                    case "Max":
                    case "DecimalMin":
                    case "DecimalMax":
                        return String.format("%s (provided: %s)", baseMessage, rejectedValue);
                    case "Pattern":
                        return String.format("%s (provided: '%s')", baseMessage, rejectedValue);
                    default:
                        return baseMessage;
                }
            }
        }

        return baseMessage;
    }

    /**
     * Extracts property path from constraint violation.
     */
    private String getPropertyPath(ConstraintViolation<?> violation) {
        String propertyPath = violation.getPropertyPath().toString();

        // Handle method parameter violations (e.g., "findById.id" -> "id")
        if (propertyPath.contains(".")) {
            String[] parts = propertyPath.split("\\.");
            if (parts.length > 1 && parts[0].matches("^[a-z][a-zA-Z0-9]*$")) {
                // Looks like a method name, use the parameter name
                return formatFieldName(parts[parts.length - 1]);
            }
        }

        return formatFieldName(propertyPath);
    }

    /**
     * Gets formatted constraint violation message.
     */
    private String getConstraintMessage(ConstraintViolation<?> violation) {
        String message = violation.getMessage();

        if (!detailedErrors) {
            return message;
        }

        // Add invalid value information if not already in message
        Object invalidValue = violation.getInvalidValue();
        if (invalidValue != null && !message.contains(invalidValue.toString())) {
            return String.format("%s (provided: '%s')", message, invalidValue);
        }

        return message;
    }
}
