package com.ddfinance.backend.controller;

import com.ddfinance.backend.dto.auth.AuthenticationRequest;
import com.ddfinance.backend.dto.auth.AuthenticationResponse;
import com.ddfinance.backend.dto.auth.RegisterAuthRequest;
import com.ddfinance.backend.service.auth.AuthenticationService;
import com.ddfinance.backend.service.auth.TokenBlacklistService;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.exception.SecurityException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST controller for authentication endpoints.
 * Handles user registration, login, logout, and token refresh operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class AuthController {

    private final AuthenticationService authenticationService;
    private final TokenBlacklistService tokenBlacklistService;

    /**
     * Registers a new user account.
     * Creates a new guest account and returns authentication token.
     *
     * @param request Registration details including name, email, and password
     * @return AuthenticationResponse with JWT token and user details
     */
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterAuthRequest request) {
        try {
            AuthenticationResponse response = authenticationService.register(request);
            return ResponseEntity.ok(response);
        } catch (ValidationException e) {
            throw e; // Let exception handler deal with it
        }
    }

    /**
     * Authenticates a user and returns a JWT token.
     *
     * @param request Login credentials (email and password)
     * @return AuthenticationResponse with JWT token and user details
     */
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@Valid @RequestBody AuthenticationRequest request) {
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (SecurityException.AuthenticationException | SecurityException.AccountLockedException e) {
            throw e; // Let exception handler deal with it
        }
    }

    /**
     * Logs out the current user by blacklisting their token.
     *
     * @param authHeader Authorization header containing the JWT token
     * @return Success message
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            tokenBlacklistService.blacklistToken(token);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Successfully logged out");
        return ResponseEntity.ok(response);
    }

    /**
     * Refreshes an existing JWT token.
     *
     * @param authHeader Authorization header containing the current JWT token
     * @return AuthenticationResponse with new JWT token
     */
    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException.TokenException("Invalid authorization header");
        }

        try {
            String token = authHeader.substring(7);
            AuthenticationResponse response = authenticationService.refreshToken(token);
            return ResponseEntity.ok(response);
        } catch (SecurityException.TokenException e) {
            throw e; // Let exception handler deal with it
        }
    }

    /**
     * Validates a JWT token and returns token information.
     *
     * @param authHeader Authorization header containing the JWT token
     * @return Token validation result with user information
     */
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("error", "Invalid authorization header");
            return ResponseEntity.ok(errorResponse);
        }

        String token = authHeader.substring(7);
        Map<String, Object> tokenInfo = authenticationService.validateToken(token);
        return ResponseEntity.ok(tokenInfo);
    }

    /**
     * Exception handler for validation errors.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(ValidationException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());

        if (e.hasFieldErrors()) {
            error.put("details", e.getFieldErrorSummary());
        }

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Exception handler for authentication errors.
     */
    @ExceptionHandler({
            SecurityException.AuthenticationException.class,
            SecurityException.AccountLockedException.class,
            SecurityException.TokenException.class
    })
    public ResponseEntity<Map<String, String>> handleSecurityException(SecurityException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
