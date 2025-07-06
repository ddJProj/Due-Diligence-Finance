package com.ddfinance.backend.service.auth;

import com.ddfinance.core.domain.UserAccount;

import java.util.Date;

/**
 * Service interface for JWT token operations.
 * Handles token generation, validation, and data extraction.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface JwtService {

    /**
     * Generates JWT token for user.
     *
     * @param userAccount User account
     * @return JWT token
     */
    String generateToken(UserAccount userAccount);

    /**
     * Validates JWT token.
     *
     * @param token JWT token
     * @return true if valid, false otherwise
     */
    boolean validateToken(String token);

    /**
     * Extracts email from token.
     *
     * @param token JWT token
     * @return User email
     */
    String extractEmail(String token);

    /**
     * Extracts role from token.
     *
     * @param token JWT token
     * @return User role
     */
    String extractRole(String token);

    /**
     * Extracts expiration date from token.
     *
     * @param token JWT token
     * @return Expiration date
     */
    Date extractExpiration(String token);

    /**
     * Checks if token is expired.
     *
     * @param token JWT token
     * @return true if expired, false otherwise
     */
    boolean isTokenExpired(String token);

    /**
     * Gets token expiration time in milliseconds.
     *
     * @return Expiration time
     */
    long getExpirationTime();
}
