package com.ddfinance.backend.service.auth;

import com.ddfinance.backend.dto.auth.AuthenticationRequest;
import com.ddfinance.backend.dto.auth.AuthenticationResponse;
import com.ddfinance.backend.dto.auth.RegisterAuthRequest;

import java.util.Map;

/**
 * Service interface for authentication operations.
 * Defines methods for user registration, authentication, and token management.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface AuthenticationService {

    /**
     * Registers a new user account.
     * Creates a guest account with the provided details and returns authentication token.
     *
     * @param request Registration details
     * @return Authentication response with JWT token
     * @throws com.ddfinance.core.exception.ValidationException if validation fails
     */
    AuthenticationResponse register(RegisterAuthRequest request);

    /**
     * Authenticates a user with email and password.
     *
     * @param request Authentication credentials
     * @return Authentication response with JWT token
     * @throws com.ddfinance.core.exception.SecurityException.AuthenticationException if authentication fails
     * @throws com.ddfinance.core.exception.SecurityException.AccountLockedException if account is locked
     */
    AuthenticationResponse authenticate(AuthenticationRequest request);

    /**
     * Refreshes an existing JWT token.
     *
     * @param token Current JWT token
     * @return Authentication response with new JWT token
     * @throws com.ddfinance.core.exception.SecurityException.TokenException if token is invalid or expired
     */
    AuthenticationResponse refreshToken(String token);

    /**
     * Validates a JWT token and returns token information.
     *
     * @param token JWT token to validate
     * @return Map containing validation result and token information
     */
    Map<String, Object> validateToken(String token);

    /**
     * Changes user password.
     *
     * @param email User email
     * @param currentPassword Current password for verification
     * @param newPassword New password
     * @throws com.ddfinance.core.exception.SecurityException.AuthenticationException if current password is wrong
     * @throws com.ddfinance.core.exception.ValidationException if new password doesn't meet requirements
     */
    void changePassword(String email, String currentPassword, String newPassword);

    /**
     * Initiates password reset process.
     *
     * @param email User email
     * @return Password reset token (for email)
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     */
    String initiatePasswordReset(String email);

    /**
     * Completes password reset with token.
     *
     * @param token Password reset token
     * @param newPassword New password
     * @throws com.ddfinance.core.exception.SecurityException.TokenException if token is invalid
     * @throws com.ddfinance.core.exception.ValidationException if password doesn't meet requirements
     */
    void resetPassword(String token, String newPassword);
}
