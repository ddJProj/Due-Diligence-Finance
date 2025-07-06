package com.ddfinance.backend.service.auth;

/**
 * Service interface for managing blacklisted JWT tokens.
 * Used to invalidate tokens on logout or security events.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface TokenBlacklistService {

    /**
     * Adds a token to the blacklist.
     *
     * @param token JWT token to blacklist
     */
    void blacklistToken(String token);

    /**
     * Checks if a token is blacklisted.
     *
     * @param token JWT token to check
     * @return true if token is blacklisted, false otherwise
     */
    boolean isTokenBlacklisted(String token);

    /**
     * Removes expired tokens from the blacklist.
     * Should be called periodically to prevent memory issues.
     */
    void cleanupExpiredTokens();

    /**
     * Blacklists all tokens for a specific user.
     * Used when user changes password or on security events.
     *
     * @param userEmail Email of the user whose tokens should be blacklisted
     */
    void blacklistAllUserTokens(String userEmail);

    /**
     * Gets the number of blacklisted tokens.
     *
     * @return count of blacklisted tokens
     */
    long getBlacklistSize();
}
