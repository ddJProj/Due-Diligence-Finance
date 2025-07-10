package com.ddfinance.backend.exception;

import com.ddfinance.backend.dto.response.ErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.TimeoutException;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for GlobalExceptionHandler.
 * Tests exception handling and error response generation.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/api/test");
        when(request.getMethod()).thenReturn("GET");
    }

    @Nested
    @DisplayName("Business Exception Tests")
    class BusinessExceptionTests {

        @Test
        @DisplayName("Should handle ResourceNotFoundException")
        void shouldHandleResourceNotFoundException() {
            // Given
            ResourceNotFoundException exception = new ResourceNotFoundException("User not found");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFoundException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("User not found");
            assertThat(response.getBody().getStatus()).isEqualTo(404);
            assertThat(response.getBody().getPath()).isEqualTo("/api/test");
            assertThat(response.getBody().getTimestamp()).isNotNull();
        }

        @Test
        @DisplayName("Should handle DuplicateResourceException")
        void shouldHandleDuplicateResourceException() {
            // Given
            DuplicateResourceException exception = new DuplicateResourceException("Email already exists");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleDuplicateResourceException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Email already exists");
            assertThat(response.getBody().getStatus()).isEqualTo(409);
        }

        @Test
        @DisplayName("Should handle BusinessLogicException")
        void shouldHandleBusinessLogicException() {
            // Given
            BusinessLogicException exception = new BusinessLogicException("Invalid operation");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleBusinessLogicException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Invalid operation");
            assertThat(response.getBody().getStatus()).isEqualTo(400);
        }

        @Test
        @DisplayName("Should handle InvalidRequestException")
        void shouldHandleInvalidRequestException() {
            // Given
            InvalidRequestException exception = new InvalidRequestException("Invalid input data");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleInvalidRequestException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getMessage()).isEqualTo("Invalid input data");
        }
    }

    @Nested
    @DisplayName("Security Exception Tests")
    class SecurityExceptionTests {

        @Test
        @DisplayName("Should handle AccessDeniedException")
        void shouldHandleAccessDeniedException() {
            // Given
            AccessDeniedException exception = new AccessDeniedException("Access denied");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleAccessDeniedException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Access denied");
            assertThat(response.getBody().getStatus()).isEqualTo(403);
        }

        @Test
        @DisplayName("Should handle AuthenticationException")
        void shouldHandleAuthenticationException() {
            // Given
            AuthenticationException exception = new BadCredentialsException("Invalid credentials");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleAuthenticationException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("Invalid credentials");
            assertThat(response.getBody().getStatus()).isEqualTo(401);
        }
    }

    @Nested
    @DisplayName("Database Exception Tests")
    class DatabaseExceptionTests {

        @Test
        @DisplayName("Should handle EntityNotFoundException")
        void shouldHandleEntityNotFoundException() {
            // Given
            EntityNotFoundException exception = new EntityNotFoundException("Entity not found");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleEntityNotFoundException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody().getMessage()).isEqualTo("Entity not found");
        }

        @Test
        @DisplayName("Should handle DataIntegrityViolationException")
        void shouldHandleDataIntegrityViolationException() {
            // Given
            DataIntegrityViolationException exception = new DataIntegrityViolationException("Constraint violation");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleDataIntegrityViolationException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
            assertThat(response.getBody().getMessage()).contains("Data integrity violation");
        }
    }

    @Nested
    @DisplayName("Web Exception Tests")
    class WebExceptionTests {

        @Test
        @DisplayName("Should handle HttpRequestMethodNotSupportedException")
        void shouldHandleHttpRequestMethodNotSupportedException() {
            // Given
            HttpRequestMethodNotSupportedException exception =
                    new HttpRequestMethodNotSupportedException("POST");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleHttpRequestMethodNotSupported(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.METHOD_NOT_ALLOWED);
            assertThat(response.getBody().getMessage()).contains("POST");
            assertThat(response.getBody().getMessage()).contains("not supported");
        }

        @Test
        @DisplayName("Should handle HttpMediaTypeNotSupportedException")
        void shouldHandleHttpMediaTypeNotSupportedException() {
            // Given
            HttpMediaTypeNotSupportedException exception = new HttpMediaTypeNotSupportedException("Unsupported media type");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleHttpMediaTypeNotSupported(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
            assertThat(response.getBody().getMessage()).contains("Media type not supported");
        }

        @Test
        @DisplayName("Should handle NoHandlerFoundException")
        void shouldHandleNoHandlerFoundException() {
            // Given
            NoHandlerFoundException exception = new NoHandlerFoundException("GET", "/api/unknown", null);

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleNoHandlerFoundException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody().getMessage()).contains("No handler found");
        }

        @Test
        @DisplayName("Should handle MissingServletRequestParameterException")
        void shouldHandleMissingServletRequestParameterException() {
            // Given
            MissingServletRequestParameterException exception =
                    new MissingServletRequestParameterException("userId", "Long");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleMissingServletRequestParameter(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getMessage()).contains("userId");
            assertThat(response.getBody().getMessage()).contains("Long");
        }

        @Test
        @DisplayName("Should handle MaxUploadSizeExceededException")
        void shouldHandleMaxUploadSizeExceededException() {
            // Given
            MaxUploadSizeExceededException exception = new MaxUploadSizeExceededException(10485760L);

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleMaxUploadSizeExceededException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
            assertThat(response.getBody().getMessage()).contains("File size exceeds maximum limit");
        }
    }

    @Nested
    @DisplayName("Timeout Exception Tests")
    class TimeoutExceptionTests {

        @Test
        @DisplayName("Should handle TimeoutException")
        void shouldHandleTimeoutException() {
            // Given
            TimeoutException exception = new TimeoutException("Request timeout");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleTimeoutException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.REQUEST_TIMEOUT);
            assertThat(response.getBody().getMessage()).contains("Request timeout");
        }
    }

    @Nested
    @DisplayName("Generic Exception Tests")
    class GenericExceptionTests {

        @Test
        @DisplayName("Should handle generic Exception")
        void shouldHandleGenericException() {
            // Given
            Exception exception = new Exception("Unexpected error");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getMessage()).isEqualTo("An unexpected error occurred");
            assertThat(response.getBody().getStatus()).isEqualTo(500);
        }

        @Test
        @DisplayName("Should handle RuntimeException")
        void shouldHandleRuntimeException() {
            // Given
            RuntimeException exception = new RuntimeException("Runtime error");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleRuntimeException(exception, request);

            // Then
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
            assertThat(response.getBody().getMessage()).isEqualTo("A system error occurred");
        }
    }

    @Nested
    @DisplayName("Error Response Tests")
    class ErrorResponseTests {

        @Test
        @DisplayName("Should include all required fields in error response")
        void shouldIncludeAllRequiredFieldsInErrorResponse() {
            // Given
            Exception exception = new Exception("Test error");

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(exception, request);

            // Then
            ErrorResponse errorResponse = response.getBody();
            assertThat(errorResponse).isNotNull();
            assertThat(errorResponse.getTimestamp()).isNotNull();
            assertThat(errorResponse.getTimestamp()).isBefore(LocalDateTime.now().plusSeconds(1));
            assertThat(errorResponse.getStatus()).isEqualTo(500);
            assertThat(errorResponse.getError()).isEqualTo("Internal Server Error");
            assertThat(errorResponse.getMessage()).isNotNull();
            assertThat(errorResponse.getPath()).isEqualTo("/api/test");
        }

        @Test
        @DisplayName("Should handle null message in exception")
        void shouldHandleNullMessageInException() {
            // Given
            Exception exception = new Exception((String) null);

            // When
            ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(exception, request);

            // Then
            assertThat(response.getBody().getMessage()).isNotNull();
            assertThat(response.getBody().getMessage()).isNotEmpty();
        }
    }
}