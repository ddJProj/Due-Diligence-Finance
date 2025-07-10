package com.ddfinance.backend.exception;

import com.ddfinance.backend.dto.response.ValidationErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import org.hibernate.validator.internal.engine.path.PathImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingPathVariableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.validation.ValidationException;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ValidationExceptionHandler.
 * Tests validation-specific exception handling.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class ValidationExceptionHandlerTest {

    private ValidationExceptionHandler exceptionHandler;

    @Mock
    private HttpServletRequest request;

    @Mock
    private BindingResult bindingResult;

    @Mock
    private MethodParameter methodParameter;

    @BeforeEach
    void setUp() {
        exceptionHandler = new ValidationExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getMethod()).thenReturn("POST");
    }

    @Nested
    @DisplayName("Method Argument Validation Tests")
    class MethodArgumentValidationTests {

        @Test
        @DisplayName("Should handle single field error")
        void shouldHandleSingleFieldError() {
            // Given
            FieldError fieldError = new FieldError("user", "email", "must be a valid email");
            when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));
            when(bindingResult.getGlobalErrors()).thenReturn(List.of());

            MethodArgumentNotValidException exception =
                    new MethodArgumentNotValidException(methodParameter, bindingResult);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMethodArgumentNotValid(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Validation failed");
            assertThat(response.getBody().getErrors()).hasSize(1);
            assertThat(response.getBody().getErrors()).containsEntry("email", "must be a valid email");
        }

        @Test
        @DisplayName("Should handle multiple field errors")
        void shouldHandleMultipleFieldErrors() {
            // Given
            List<FieldError> fieldErrors = List.of(
                    new FieldError("user", "email", "must be a valid email"),
                    new FieldError("user", "password", "must be at least 8 characters"),
                    new FieldError("user", "age", "must be greater than 18")
            );
            when(bindingResult.getFieldErrors()).thenReturn(fieldErrors);
            when(bindingResult.getGlobalErrors()).thenReturn(List.of());

            MethodArgumentNotValidException exception =
                    new MethodArgumentNotValidException(methodParameter, bindingResult);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMethodArgumentNotValid(exception, request);

            // Then
            assertThat(response.getBody().getErrors()).hasSize(3);
            assertThat(response.getBody().getErrors()).containsEntry("email", "must be a valid email");
            assertThat(response.getBody().getErrors()).containsEntry("password", "must be at least 8 characters");
            assertThat(response.getBody().getErrors()).containsEntry("age", "must be greater than 18");
        }

        @Test
        @DisplayName("Should handle global errors")
        void shouldHandleGlobalErrors() {
            // Given
            ObjectError globalError = new ObjectError("user", "passwords do not match");
            when(bindingResult.getFieldErrors()).thenReturn(List.of());
            when(bindingResult.getGlobalErrors()).thenReturn(List.of(globalError));

            MethodArgumentNotValidException exception =
                    new MethodArgumentNotValidException(methodParameter, bindingResult);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMethodArgumentNotValid(exception, request);

            // Then
            assertThat(response.getBody().getErrors()).hasSize(1);
            assertThat(response.getBody().getErrors()).containsEntry("user", "passwords do not match");
        }

        @Test
        @DisplayName("Should handle duplicate field errors")
        void shouldHandleDuplicateFieldErrors() {
            // Given
            List<FieldError> fieldErrors = List.of(
                    new FieldError("user", "email", "must be a valid email"),
                    new FieldError("user", "email", "must not be empty")
            );
            when(bindingResult.getFieldErrors()).thenReturn(fieldErrors);
            when(bindingResult.getGlobalErrors()).thenReturn(List.of());

            MethodArgumentNotValidException exception =
                    new MethodArgumentNotValidException(methodParameter, bindingResult);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMethodArgumentNotValid(exception, request);

            // Then
            assertThat(response.getBody().getErrors()).hasSize(1);
            assertThat(response.getBody().getErrors().get("email"))
                    .isEqualTo("must be a valid email; must not be empty");
        }
    }

    @Nested
    @DisplayName("Constraint Violation Tests")
    class ConstraintViolationTests {

        @Test
        @DisplayName("Should handle single constraint violation")
        void shouldHandleSingleConstraintViolation() {
            // Given
            ConstraintViolation<?> violation = mock(ConstraintViolation.class);
            when(violation.getPropertyPath()).thenReturn(PathImpl.createPathFromString("email"));
            when(violation.getMessage()).thenReturn("must be a valid email");

            ConstraintViolationException exception =
                    new ConstraintViolationException(Set.of(violation));

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleConstraintViolation(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getErrors()).hasSize(1);
            assertThat(response.getBody().getErrors()).containsEntry("email", "must be a valid email");
        }

        @Test
        @DisplayName("Should handle nested property paths")
        void shouldHandleNestedPropertyPaths() {
            // Given
            ConstraintViolation<?> violation = mock(ConstraintViolation.class);
            when(violation.getPropertyPath()).thenReturn(PathImpl.createPathFromString("address.city"));
            when(violation.getMessage()).thenReturn("must not be empty");

            ConstraintViolationException exception =
                    new ConstraintViolationException(Set.of(violation));

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleConstraintViolation(exception, request);

            // Then
            assertThat(response.getBody().getErrors()).containsEntry("address.city", "must not be empty");
        }

        @Test
        @DisplayName("Should handle method parameter violations")
        void shouldHandleMethodParameterViolations() {
            // Given
            ConstraintViolation<?> violation = mock(ConstraintViolation.class);
            when(violation.getPropertyPath()).thenReturn(PathImpl.createPathFromString("findById.id"));
            when(violation.getMessage()).thenReturn("must be positive");

            ConstraintViolationException exception =
                    new ConstraintViolationException(Set.of(violation));

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleConstraintViolation(exception, request);

            // Then
            assertThat(response.getBody().getErrors()).containsEntry("id", "must be positive");
        }
    }

    @Nested
    @DisplayName("Type Mismatch Tests")
    class TypeMismatchTests {

        @Test
        @DisplayName("Should handle method argument type mismatch")
        void shouldHandleMethodArgumentTypeMismatch() {
            // Given
            MethodArgumentTypeMismatchException exception =
                    new MethodArgumentTypeMismatchException("abc", Long.class, "id", methodParameter, null);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMethodArgumentTypeMismatch(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getMessage()).contains("Type mismatch");
            assertThat(response.getBody().getErrors()).containsEntry("id",
                    "Failed to convert value 'abc' to type Long");
        }

        @Test
        @DisplayName("Should handle enum type mismatch")
        void shouldHandleEnumTypeMismatch() {
            // Given
            MethodArgumentTypeMismatchException exception =
                    new MethodArgumentTypeMismatchException("INVALID", TestEnum.class, "status", methodParameter, null);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMethodArgumentTypeMismatch(exception, request);

            // Then
            assertThat(response.getBody().getErrors()).containsKey("status");
            assertThat(response.getBody().getErrors().get("status"))
                    .contains("Valid values are: [ACTIVE, INACTIVE]");
        }
    }

    @Nested
    @DisplayName("Path Variable Tests")
    class PathVariableTests {

        @Test
        @DisplayName("Should handle missing path variable")
        void shouldHandleMissingPathVariable() {
            // Given
            MissingPathVariableException exception =
                    new MissingPathVariableException("userId", methodParameter);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMissingPathVariable(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getMessage()).contains("Missing path variable");
            assertThat(response.getBody().getErrors()).containsEntry("userId", "Path variable is required");
        }
    }

    @Nested
    @DisplayName("Generic Validation Tests")
    class GenericValidationTests {

        @Test
        @DisplayName("Should handle generic validation exception")
        void shouldHandleGenericValidationException() {
            // Given
            ValidationException exception = new ValidationException("Validation failed for some reason");

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleGenericValidationException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getMessage()).isEqualTo("Validation failed for some reason");
        }

        @Test
        @DisplayName("Should include validation details in response")
        void shouldIncludeValidationDetailsInResponse() {
            // Given
            FieldError fieldError = new FieldError("user", "email", "must be a valid email");
            when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));
            when(bindingResult.getGlobalErrors()).thenReturn(List.of());

            MethodArgumentNotValidException exception =
                    new MethodArgumentNotValidException(methodParameter, bindingResult);

            // When
            ResponseEntity<ValidationErrorResponse> response =
                    exceptionHandler.handleMethodArgumentNotValid(exception, request);

            // Then
            ValidationErrorResponse body = response.getBody();
            assertThat(body).isNotNull();
            assertThat(body.getTimestamp()).isNotNull();
            assertThat(body.getStatus()).isEqualTo(400);
            assertThat(body.getError()).isEqualTo("Bad Request");
            assertThat(body.getMessage()).isEqualTo("Validation failed");
            assertThat(body.getPath()).isEqualTo("/api/test");
            assertThat(body.getErrorCount()).isEqualTo(1);
        }
    }

    // Test enum for type mismatch tests
    enum TestEnum {
        ACTIVE, INACTIVE
    }
}