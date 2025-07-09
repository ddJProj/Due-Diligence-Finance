package com.ddfinance.backend.service.auth;

import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for JwtServiceImpl.
 * Tests JWT token generation, validation, and claims extraction.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class JwtServiceImplTest {

    private JwtServiceImpl jwtService;
    private UserAccount testUser;

    private static final String TEST_SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long TEST_EXPIRATION = 3600000; // 1 hour in milliseconds

    @BeforeEach
    void setUp() {
        jwtService = new JwtServiceImpl();

        // Use reflection to set private fields
        ReflectionTestUtils.setField(jwtService, "jwtSecret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", TEST_EXPIRATION);
        ReflectionTestUtils.setField(jwtService, "jwtRefreshExpiration", TEST_EXPIRATION * 24 * 7); // 7 days

        // Initialize after setting fields
        jwtService.init();

        // Create test user
        testUser = new UserAccount();
        testUser.setId(1L);
        testUser.setEmail("john.doe@example.com");
        testUser.setRole(Role.CLIENT);
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
    }

    @Nested
    @DisplayName("Token Generation Tests")
    class TokenGenerationTests {

        @Test
        @DisplayName("Should generate token for user")
        void shouldGenerateTokenForUser() {
            // When
            String token = jwtService.generateToken(testUser);

            // Then
            assertThat(token).isNotNull();
            assertThat(token).isNotEmpty();
            assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
        }

        @Test
        @DisplayName("Should generate token with extra claims")
        void shouldGenerateTokenWithExtraClaims() {
            // Given
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("department", "Finance");
            extraClaims.put("permissions", "READ,WRITE");

            // When
            String token = jwtService.generateToken(extraClaims, testUser);

            // Then
            assertThat(token).isNotNull();
            Claims claims = jwtService.extractAllClaims(token);
            assertThat(claims.get("department")).isEqualTo("Finance");
            assertThat(claims.get("permissions")).isEqualTo("READ,WRITE");
        }

        @Test
        @DisplayName("Should generate refresh token")
        void shouldGenerateRefreshToken() {
            // When
            String refreshToken = jwtService.generateRefreshToken(testUser);

            // Then
            assertThat(refreshToken).isNotNull();
            assertThat(refreshToken).isNotEmpty();

            // Refresh token should have longer expiration
            Date expiration = jwtService.extractExpiration(refreshToken);
            assertThat(expiration).isAfter(new Date(System.currentTimeMillis() + TEST_EXPIRATION));
        }

        @Test
        @DisplayName("Should include user details in token")
        void shouldIncludeUserDetailsInToken() {
            // When
            String token = jwtService.generateToken(testUser);

            // Then
            assertThat(jwtService.extractEmail(token)).isEqualTo("john.doe@example.com");
            assertThat(jwtService.extractRole(token)).isEqualTo("CLIENT");
            assertThat(jwtService.extractUserId(token)).isEqualTo(1L);
            assertThat(jwtService.extractFullName(token)).isEqualTo("John Doe");
        }

        @Test
        @DisplayName("Should handle null user gracefully")
        void shouldHandleNullUserGracefully() {
            // When & Then
            assertThatThrownBy(() -> jwtService.generateToken(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("User cannot be null");
        }
    }

    @Nested
    @DisplayName("Token Validation Tests")
    class TokenValidationTests {

        @Test
        @DisplayName("Should validate valid token")
        void shouldValidateValidToken() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            boolean isValid = jwtService.validateToken(token);

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should invalidate expired token")
        void shouldInvalidateExpiredToken() throws InterruptedException {
            // Given - Create service with very short expiration
            JwtServiceImpl shortExpiryService = new JwtServiceImpl();
            ReflectionTestUtils.setField(shortExpiryService, "jwtSecret", TEST_SECRET);
            ReflectionTestUtils.setField(shortExpiryService, "jwtExpiration", 1L); // 1ms
            shortExpiryService.init();

            String token = shortExpiryService.generateToken(testUser);
            Thread.sleep(10); // Wait for token to expire

            // When
            boolean isValid = shortExpiryService.validateToken(token);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should invalidate token with wrong signature")
        void shouldInvalidateTokenWithWrongSignature() {
            // Given
            String token = jwtService.generateToken(testUser);
            String tamperedToken = token.substring(0, token.lastIndexOf('.')) + ".invalidsignature";

            // When
            boolean isValid = jwtService.validateToken(tamperedToken);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should invalidate malformed token")
        void shouldInvalidateMalformedToken() {
            // Given
            String malformedToken = "this.is.not.a.valid.jwt.token";

            // When
            boolean isValid = jwtService.validateToken(malformedToken);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should validate token with username")
        void shouldValidateTokenWithUsername() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            boolean isValid = jwtService.isTokenValid(token, "john.doe@example.com");

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should invalidate token with wrong username")
        void shouldInvalidateTokenWithWrongUsername() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            boolean isValid = jwtService.isTokenValid(token, "wrong@example.com");

            // Then
            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("Claims Extraction Tests")
    class ClaimsExtractionTests {

        @Test
        @DisplayName("Should extract email from token")
        void shouldExtractEmailFromToken() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            String email = jwtService.extractEmail(token);

            // Then
            assertThat(email).isEqualTo("john.doe@example.com");
        }

        @Test
        @DisplayName("Should extract role from token")
        void shouldExtractRoleFromToken() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            String role = jwtService.extractRole(token);

            // Then
            assertThat(role).isEqualTo("CLIENT");
        }

        @Test
        @DisplayName("Should extract user ID from token")
        void shouldExtractUserIdFromToken() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            Long userId = jwtService.extractUserId(token);

            // Then
            assertThat(userId).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should extract expiration from token")
        void shouldExtractExpirationFromToken() {
            // Given
            String token = jwtService.generateToken(testUser);
            Date beforeExpiration = new Date(System.currentTimeMillis() + TEST_EXPIRATION - 60000); // 1 min before
            Date afterExpiration = new Date(System.currentTimeMillis() + TEST_EXPIRATION + 60000); // 1 min after

            // When
            Date expiration = jwtService.extractExpiration(token);

            // Then
            assertThat(expiration).isAfter(beforeExpiration);
            assertThat(expiration).isBefore(afterExpiration);
        }

        @Test
        @DisplayName("Should extract all claims from token")
        void shouldExtractAllClaimsFromToken() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            Claims claims = jwtService.extractAllClaims(token);

            // Then
            assertThat(claims).isNotNull();
            assertThat(claims.getSubject()).isEqualTo("john.doe@example.com");
            assertThat(claims.get("role")).isEqualTo("CLIENT");
            assertThat(claims.get("userId")).isEqualTo(1);
        }

        @Test
        @DisplayName("Should check if token is expired")
        void shouldCheckIfTokenIsExpired() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            boolean isExpired = jwtService.isTokenExpired(token);

            // Then
            assertThat(isExpired).isFalse();
        }
    }

    @Nested
    @DisplayName("Error Handling Tests")
    class ErrorHandlingTests {

        @Test
        @DisplayName("Should handle null token validation")
        void shouldHandleNullTokenValidation() {
            // When
            boolean isValid = jwtService.validateToken(null);

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should handle empty token validation")
        void shouldHandleEmptyTokenValidation() {
            // When
            boolean isValid = jwtService.validateToken("");

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should throw exception for expired token claims extraction")
        void shouldThrowExceptionForExpiredTokenClaimsExtraction() throws InterruptedException {
            // Given - Create service with very short expiration
            JwtServiceImpl shortExpiryService = new JwtServiceImpl();
            ReflectionTestUtils.setField(shortExpiryService, "jwtSecret", TEST_SECRET);
            ReflectionTestUtils.setField(shortExpiryService, "jwtExpiration", 1L); // 1ms
            shortExpiryService.init();

            String token = shortExpiryService.generateToken(testUser);
            Thread.sleep(10); // Wait for token to expire

            // When & Then
            assertThatThrownBy(() -> shortExpiryService.extractEmail(token))
                    .isInstanceOf(ExpiredJwtException.class);
        }

        @Test
        @DisplayName("Should throw exception for malformed token claims extraction")
        void shouldThrowExceptionForMalformedTokenClaimsExtraction() {
            // Given
            String malformedToken = "malformed.jwt.token";

            // When & Then
            assertThatThrownBy(() -> jwtService.extractEmail(malformedToken))
                    .isInstanceOf(MalformedJwtException.class);
        }
    }

    @Nested
    @DisplayName("Token Type Tests")
    class TokenTypeTests {

        @Test
        @DisplayName("Should identify access token type")
        void shouldIdentifyAccessTokenType() {
            // Given
            String token = jwtService.generateToken(testUser);

            // When
            String tokenType = jwtService.getTokenType(token);

            // Then
            assertThat(tokenType).isEqualTo("ACCESS");
        }

        @Test
        @DisplayName("Should identify refresh token type")
        void shouldIdentifyRefreshTokenType() {
            // Given
            String token = jwtService.generateRefreshToken(testUser);

            // When
            String tokenType = jwtService.getTokenType(token);

            // Then
            assertThat(tokenType).isEqualTo("REFRESH");
        }

        @Test
        @DisplayName("Should generate token with custom expiration")
        void shouldGenerateTokenWithCustomExpiration() {
            // Given
            long customExpiration = 7200000L; // 2 hours

            // When
            String token = jwtService.generateTokenWithExpiration(testUser, customExpiration);
            Date expiration = jwtService.extractExpiration(token);

            // Then
            Date expectedExpiration = new Date(System.currentTimeMillis() + customExpiration);
            assertThat(expiration.getTime()).isCloseTo(expectedExpiration.getTime(), within(5000L)); // 5 sec tolerance
        }
    }
}
