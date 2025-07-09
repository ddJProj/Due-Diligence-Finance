package com.ddfinance.backend.security;

import com.ddfinance.backend.service.auth.JwtService;
import com.ddfinance.backend.service.auth.TokenBlacklistService;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.repository.UserAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.io.IOException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for JwtAuthenticationFilter.
 * Tests JWT token validation and authentication in the filter chain.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @Mock
    private UserDetails userDetails;

    private JwtAuthenticationFilter jwtAuthenticationFilter;
    private UserAccount testUser;

    @BeforeEach
    void setUp() {
        jwtAuthenticationFilter = new JwtAuthenticationFilter(
            jwtService,
            userDetailsService,
            tokenBlacklistService,
            userAccountRepository
        );

        // Clear security context
        SecurityContextHolder.clearContext();

        // Setup test user
        testUser = new UserAccount();
        testUser.setId(1L);
        testUser.setEmail("john.doe@example.com");
        testUser.setRole(Role.CLIENT);
    }

    @Nested
    @DisplayName("Valid Token Tests")
    class ValidTokenTests {

        @Test
        @DisplayName("Should authenticate user with valid token")
        void shouldAuthenticateUserWithValidToken() throws ServletException, IOException {
            // Given
            String token = "valid.jwt.token";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
            when(jwtService.extractEmail(token)).thenReturn("john.doe@example.com");
            when(jwtService.isTokenExpired(token)).thenReturn(false);
            when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername("john.doe@example.com")).thenReturn(userDetails);
            when(userDetails.getUsername()).thenReturn("john.doe@example.com");
            when(userDetails.isEnabled()).thenReturn(true);

            testUser.setActive(true);

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(filterChain).doFilter(request, response);
            SecurityContext context = SecurityContextHolder.getContext();
            assertThat(context.getAuthentication()).isNotNull();
        }

        @Test
        @DisplayName("Should skip authentication for already authenticated requests")
        void shouldSkipAuthenticationForAlreadyAuthenticatedRequests() throws ServletException, IOException {
            // Given
            String authHeader = "Bearer valid.token";
            when(request.getHeader("Authorization")).thenReturn(authHeader);

            // Set existing authentication
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            Authentication existingAuth = mock(Authentication.class);
            context.setAuthentication(existingAuth);
            SecurityContextHolder.setContext(context);

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(jwtService, never()).extractEmail(anyString());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should check user token blacklist")
        void shouldCheckUserTokenBlacklist() throws ServletException, IOException {
            // Given
            String token = "valid.jwt.token";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
            when(jwtService.extractEmail(token)).thenReturn("john.doe@example.com");
            when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }

    @Nested
    @DisplayName("Invalid Token Tests")
    class InvalidTokenTests {

        @Test
        @DisplayName("Should skip filter for missing Authorization header")
        void shouldSkipFilterForMissingAuthorizationHeader() throws ServletException, IOException {
            // Given
            when(request.getHeader("Authorization")).thenReturn(null);

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(jwtService, never()).extractEmail(anyString());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should skip filter for non-Bearer token")
        void shouldSkipFilterForNonBearerToken() throws ServletException, IOException {
            // Given
            when(request.getHeader("Authorization")).thenReturn("Basic dXNlcjpwYXNz");

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(jwtService, never()).extractEmail(anyString());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should skip authentication for blacklisted token")
        void shouldSkipAuthenticationForBlacklistedToken() throws ServletException, IOException {
            // Given
            String token = "blacklisted.token";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(true);

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(jwtService, never()).extractEmail(token);
            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("Should handle expired token gracefully")
        void shouldHandleExpiredTokenGracefully() throws ServletException, IOException {
            // Given
            String token = "expired.token";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
            when(jwtService.extractEmail(token)).thenReturn("john.doe@example.com");
            when(jwtService.isTokenExpired(token)).thenReturn(true);

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(userDetailsService, never()).loadUserByUsername(anyString());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should handle invalid token format")
        void shouldHandleInvalidTokenFormat() throws ServletException, IOException {
            // Given
            String token = "invalid.token.format";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
            when(jwtService.extractEmail(token)).thenThrow(new IllegalArgumentException("Invalid token"));

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }

    @Nested
    @DisplayName("User Account Tests")
    class UserAccountTests {

        @Test
        @DisplayName("Should handle user not found")
        void shouldHandleUserNotFound() throws ServletException, IOException {
            // Given
            String token = "valid.token";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
            when(jwtService.extractEmail(token)).thenReturn("unknown@example.com");
            when(jwtService.isTokenExpired(token)).thenReturn(false);
            when(userDetailsService.loadUserByUsername("unknown@example.com"))
                .thenThrow(new UsernameNotFoundException("User not found"));

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("Should check if account is active")
        void shouldCheckIfAccountIsActive() throws ServletException, IOException {
            // Given
            String token = "valid.token";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
            when(jwtService.extractEmail(token)).thenReturn("john.doe@example.com");
            when(jwtService.isTokenExpired(token)).thenReturn(false);

            // Set user as inactive
            testUser.setActive(false);
            when(userAccountRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(testUser));
            when(userDetailsService.loadUserByUsername("john.doe@example.com")).thenReturn(userDetails);
            when(userDetails.getUsername()).thenReturn("john.doe@example.com");
            when(userDetails.isEnabled()).thenReturn(true);

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }
    }

    @Nested
    @DisplayName("Edge Cases Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle empty bearer token")
        void shouldHandleEmptyBearerToken() throws ServletException, IOException {
            // Given
            when(request.getHeader("Authorization")).thenReturn("Bearer ");

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(jwtService, never()).extractEmail(anyString());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should handle whitespace in bearer token")
        void shouldHandleWhitespaceInBearerToken() throws ServletException, IOException {
            // Given
            when(request.getHeader("Authorization")).thenReturn("Bearer   ");

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(jwtService, never()).extractEmail(anyString());
            verify(filterChain).doFilter(request, response);
        }

        @Test
        @DisplayName("Should continue filter chain on exception")
        void shouldContinueFilterChainOnException() throws ServletException, IOException {
            // Given
            String token = "valid.token";
            String authHeader = "Bearer " + token;

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token))
                .thenThrow(new RuntimeException("Database error"));

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(filterChain).doFilter(request, response);
            assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        }

        @Test
        @DisplayName("Should extract token correctly with extra spaces")
        void shouldExtractTokenCorrectlyWithExtraSpaces() throws ServletException, IOException {
            // Given
            String token = "valid.jwt.token";
            String authHeader = "Bearer  " + token; // Extra space

            when(request.getHeader("Authorization")).thenReturn(authHeader);
            when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
            when(jwtService.extractEmail(token)).thenReturn("john.doe@example.com");

            // When
            jwtAuthenticationFilter.doFilterInternal(request, response, filterChain);

            // Then
            verify(jwtService).extractEmail(token);
            verify(filterChain).doFilter(request, response);
        }
    }
}