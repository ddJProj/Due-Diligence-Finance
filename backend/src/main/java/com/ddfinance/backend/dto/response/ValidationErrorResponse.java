package com.ddfinance.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Validation error response DTO for API validation errors.
 * Extends standard error response with field-level validation details.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;

    private int status;

    private String error;

    private String message;

    private String path;

    @Builder.Default
    private Map<String, String> errors = new HashMap<>();

    private int errorCount;

    /**
     * Creates a validation error response with the given parameters.
     *
     * @param status HTTP status code
     * @param error Error type
     * @param message Error message
     * @param path Request path
     * @param errors Field-level errors
     * @return ValidationErrorResponse instance
     */
    public static ValidationErrorResponse of(int status, String error, String message,
                                             String path, Map<String, String> errors) {
        return ValidationErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .error(error)
                .message(message)
                .path(path)
                .errors(errors)
                .errorCount(errors.size())
                .build();
    }
}
