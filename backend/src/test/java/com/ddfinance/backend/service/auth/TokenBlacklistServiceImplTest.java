package com.ddfinance.backend.service.auth;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for TokenBlacklistServiceImpl.
 * Tests token blacklisting functionality for logout support.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class TokenBlacklistServiceImplTest {

    private TokenBlacklistServiceImpl tokenBlacklistService;

    @BeforeEach
    void setUp() {
        tokenBlacklistService = new TokenBlacklistServiceImpl();
    }

    @Nested
    @DisplayName("Blacklist Token Tests")
    class BlacklistTokenTests {

        @Test
        @DisplayName("Should blacklist token")
        void shouldBlacklistToken() {
            // Given
            String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

            // When
            tokenBlacklistService.blacklistToken(token);

            // Then
            assertThat(tokenBlacklistService.isTokenBlacklisted(token)).isTrue();
        }

        @Test
        @DisplayName("Should handle null token gracefully")
        void shouldHandleNullTokenGracefully() {
            // When
            tokenBlacklistService.blacklistToken(null);

            // Then
            assertThat(tokenBlacklistService.isTokenBlacklisted(null)).isFalse();
        }

        @Test
        @DisplayName("Should handle empty token gracefully")
        void shouldHandleEmptyTokenGracefully() {
            // When
            tokenBlacklistService.blacklistToken("");

            // Then
            assertThat(tokenBlacklistService.isTokenBlacklisted("")).isFalse();
        }

        @Test
        @DisplayName("Should handle whitespace token gracefully")
        void shouldHandleWhitespaceTokenGracefully() {
            // When
            tokenBlacklistService.blacklistToken("   ");

            // Then
            assertThat(tokenBlacklistService.isTokenBlacklisted("   ")).isFalse();
        }
    }

    @Nested
    @DisplayName("Check Token Blacklist Tests")
    class CheckTokenBlacklistTests {

        @Test
        @DisplayName("Should return true for blacklisted token")
        void shouldReturnTrueForBlacklistedToken() {
            // Given
            String token = "blacklisted.token.here";
            tokenBlacklistService.blacklistToken(token);

            // When
            boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(token);

            // Then
            assertThat(isBlacklisted).isTrue();
        }

        @Test
        @DisplayName("Should return false for non-blacklisted token")
        void shouldReturnFalseForNonBlacklistedToken() {
            // Given
            String token = "valid.token.here";

            // When
            boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(token);

            // Then
            assertThat(isBlacklisted).isFalse();
        }

        @Test
        @DisplayName("Should handle null token check")
        void shouldHandleNullTokenCheck() {
            // When
            boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted(null);

            // Then
            assertThat(isBlacklisted).isFalse();
        }

        @Test
        @DisplayName("Should handle empty token check")
        void shouldHandleEmptyTokenCheck() {
            // When
            boolean isBlacklisted = tokenBlacklistService.isTokenBlacklisted("");

            // Then
            assertThat(isBlacklisted).isFalse();
        }
    }

    @Nested
    @DisplayName("User Token Management Tests")
    class UserTokenManagementTests {

        @Test
        @DisplayName("Should blacklist all tokens for user")
        void shouldBlacklistAllTokensForUser() {
            // Given
            String userEmail = "john.doe@example.com";

            // When
            tokenBlacklistService.blacklistAllUserTokens(userEmail);

            // Then
            assertThat(tokenBlacklistService.areUserTokensBlacklisted(userEmail)).isTrue();
        }

        @Test
        @DisplayName("Should handle null email for user blacklist")
        void shouldHandleNullEmailForUserBlacklist() {
            // When
            tokenBlacklistService.blacklistAllUserTokens(null);

            // Then
            assertThat(tokenBlacklistService.areUserTokensBlacklisted(null)).isFalse();
        }

        @Test
        @DisplayName("Should handle empty email for user blacklist")
        void shouldHandleEmptyEmailForUserBlacklist() {
            // When
            tokenBlacklistService.blacklistAllUserTokens("");

            // Then
            assertThat(tokenBlacklistService.areUserTokensBlacklisted("")).isFalse();
        }

        @Test
        @DisplayName("Should return false for non-blacklisted user")
        void shouldReturnFalseForNonBlacklistedUser() {
            // Given
            String userEmail = "jane.doe@example.com";

            // When
            boolean areBlacklisted = tokenBlacklistService.areUserTokensBlacklisted(userEmail);

            // Then
            assertThat(areBlacklisted).isFalse();
        }
    }

    @Nested
    @DisplayName("Cleanup Tests")
    class CleanupTests {

        @Test
        @DisplayName("Should cleanup expired tokens")
        void shouldCleanupExpiredTokens() {
            // Given
            // Add some tokens (they won't expire in this test timeframe)
            tokenBlacklistService.blacklistToken("token1");
            tokenBlacklistService.blacklistToken("token2");

            long sizeBefore = tokenBlacklistService.getBlacklistSize();

            // When
            tokenBlacklistService.cleanupExpiredTokens();

            // Then
            long sizeAfter = tokenBlacklistService.getBlacklistSize();
            assertThat(sizeAfter).isEqualTo(sizeBefore); // No tokens should expire immediately
        }

        @Test
        @DisplayName("Should return correct blacklist size")
        void shouldReturnCorrectBlacklistSize() {
            // Given
            tokenBlacklistService.blacklistToken("token1");
            tokenBlacklistService.blacklistToken("token2");
            tokenBlacklistService.blacklistAllUserTokens("user@example.com");

            // When
            long size = tokenBlacklistService.getBlacklistSize();

            // Then
            assertThat(size).isEqualTo(3L);
        }

        @Test
        @DisplayName("Should not count duplicate tokens in size")
        void shouldNotCountDuplicateTokensInSize() {
            // Given
            tokenBlacklistService.blacklistToken("token1");
            tokenBlacklistService.blacklistToken("token1"); // Same token again

            // When
            long size = tokenBlacklistService.getBlacklistSize();

            // Then
            assertThat(size).isEqualTo(1L);
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle very long tokens")
        void shouldHandleVeryLongTokens() {
            // Given
            String longToken = "a".repeat(1000);

            // When
            tokenBlacklistService.blacklistToken(longToken);

            // Then
            assertThat(tokenBlacklistService.isTokenBlacklisted(longToken)).isTrue();
        }

        @Test
        @DisplayName("Should handle multiple blacklisting of same token")
        void shouldHandleMultipleBlacklistingOfSameToken() {
            // Given
            String token = "duplicate.token";

            // When
            tokenBlacklistService.blacklistToken(token);
            tokenBlacklistService.blacklistToken(token);
            tokenBlacklistService.blacklistToken(token);

            // Then
            assertThat(tokenBlacklistService.isTokenBlacklisted(token)).isTrue();
            assertThat(tokenBlacklistService.getBlacklistSize()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should handle special characters in tokens")
        void shouldHandleSpecialCharactersInTokens() {
            // Given
            String specialToken = "token!@#$%^&*()_+-=[]{}|;':\",./<>?";

            // When
            tokenBlacklistService.blacklistToken(specialToken);

            // Then
            assertThat(tokenBlacklistService.isTokenBlacklisted(specialToken)).isTrue();
        }
    }
}