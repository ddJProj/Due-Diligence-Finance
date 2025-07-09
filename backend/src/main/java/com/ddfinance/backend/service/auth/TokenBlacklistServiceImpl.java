package com.ddfinance.backend.service.auth;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implementation of TokenBlacklistService for managing blacklisted JWT tokens.
 * Uses in-memory storage with automatic expiration handling.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Service
public class TokenBlacklistServiceImpl implements TokenBlacklistService {

    // In-memory storage for blacklisted tokens
    private final Map<String, BlacklistEntry> tokenBlacklist = new ConcurrentHashMap<>();
    private final Map<String, Long> userTokensBlacklist = new ConcurrentHashMap<>();

    // Default expiry time in seconds (24 hours)
    private static final long DEFAULT_EXPIRY_SECONDS = 86400L;

    @Override
    public void blacklistToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            log.warn("Attempted to blacklist null or empty token");
            return;
        }

        long expiryTime = Instant.now().plusSeconds(DEFAULT_EXPIRY_SECONDS).toEpochMilli();
        tokenBlacklist.put(token, new BlacklistEntry(expiryTime));
        log.debug("Token blacklisted: {}", token.substring(0, Math.min(token.length(), 10)) + "...");

        // Periodic cleanup
        if (tokenBlacklist.size() % 100 == 0) {
            cleanupExpiredTokens();
        }
    }

    @Override
    public boolean isTokenBlacklisted(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        BlacklistEntry entry = tokenBlacklist.get(token);
        if (entry == null) {
            return false;
        }

        if (entry.isExpired()) {
            tokenBlacklist.remove(token);
            return false;
        }

        return true;
    }

    @Override
    public void cleanupExpiredTokens() {
        log.info("Starting cleanup of expired tokens");
        int removedCount = 0;

        // Clean up expired token entries
        removedCount += tokenBlacklist.entrySet().removeIf(entry -> entry.getValue().isExpired()) ? 1 : 0;

        // Clean up expired user token entries
        long currentTime = System.currentTimeMillis();
        removedCount += userTokensBlacklist.entrySet().removeIf(entry -> entry.getValue() < currentTime) ? 1 : 0;

        log.info("Cleanup completed. Removed {} expired entries", removedCount);
    }

    @Override
    public void blacklistAllUserTokens(String userEmail) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            log.warn("Attempted to blacklist tokens for null or empty email");
            return;
        }

        long expiryTime = Instant.now().plusSeconds(DEFAULT_EXPIRY_SECONDS).toEpochMilli();
        userTokensBlacklist.put(userEmail, expiryTime);
        log.info("All tokens blacklisted for user: {}", userEmail);
    }

    @Override
    public long getBlacklistSize() {
        cleanupExpiredTokens(); // Clean up before returning size
        return tokenBlacklist.size() + userTokensBlacklist.size();
    }

    /**
     * Checks if all tokens for a user are blacklisted.
     *
     * @param userEmail the user's email
     * @return true if user's tokens are blacklisted
     */
    public boolean areUserTokensBlacklisted(String userEmail) {
        if (userEmail == null || userEmail.trim().isEmpty()) {
            return false;
        }

        Long expiryTime = userTokensBlacklist.get(userEmail);
        if (expiryTime == null) {
            return false;
        }

        if (expiryTime < System.currentTimeMillis()) {
            userTokensBlacklist.remove(userEmail);
            return false;
        }

        return true;
    }

    /**
     * Internal class to store blacklist entries with expiry time.
     */
    private static class BlacklistEntry {
        final long expiryTime;

        BlacklistEntry(long expiryTime) {
            this.expiryTime = expiryTime;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiryTime;
        }
    }
}