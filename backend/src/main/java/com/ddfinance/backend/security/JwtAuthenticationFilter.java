package com.ddfinance.backend.security;

import com.ddfinance.backend.service.auth.JwtService;
import com.ddfinance.backend.service.auth.TokenBlacklistService;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.repository.UserAccountRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

/**
 * JWT authentication filter that validates JWT tokens on each request.
 * Extends OncePerRequestFilter to ensure single execution per request.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserAccountRepository userAccountRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        try {
            // Extract JWT token from request
            final String jwt = extractJwtFromRequest(request);

            if (jwt == null) {
                filterChain.doFilter(request, response);
                return;
            }

            // Check if token is blacklisted
            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                log.debug("Token is blacklisted");
                filterChain.doFilter(request, response);
                return;
            }

            // Extract username from token
            final String userEmail = jwtService.extractEmail(jwt);

            // Check if user email was extracted and no authentication exists
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Check if user's all tokens are blacklisted
                // Note: This method is in the implementation but not in the interface
                // We'll check this differently using the userAccountRepository
                Optional<UserAccount> userAccountOpt = userAccountRepository.findByEmail(userEmail);
                if (userAccountOpt.isEmpty()) {
                    log.debug("User not found: {}", userEmail);
                    filterChain.doFilter(request, response);
                    return;
                }

                // Check if token is expired
                if (jwtService.isTokenExpired(jwt)) {
                    log.debug("Token is expired for user: {}", userEmail);
                    filterChain.doFilter(request, response);
                    return;
                }

                // Load user details
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // Validate token - check if email matches and token is not expired
                boolean isValid = false;
                try {
                    String tokenEmail = jwtService.extractEmail(jwt);
                    isValid = tokenEmail.equals(userDetails.getUsername()) && !jwtService.isTokenExpired(jwt);
                } catch (Exception e) {
                    log.debug("Token validation failed: {}", e.getMessage());
                }

                if (isValid) {

                    // Check if account is enabled
                    if (!userDetails.isEnabled()) {
                        log.debug("User account is disabled: {}", userEmail);
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Check if account exists and is active
                    UserAccount userAccount = userAccountOpt.get();
                    if (!userAccount.isActive()) {
                        log.debug("User account is inactive: {}", userEmail);
                        filterChain.doFilter(request, response);
                        return;
                    }

                    // Create authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // Set authentication in security context
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    log.debug("User {} authenticated successfully", userEmail);
                }
            }
        } catch (Exception e) {
            log.error("Cannot set user authentication: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extracts JWT token from Authorization header.
     *
     * @param request HTTP request
     * @return JWT token or null if not present
     */
    private String extractJwtFromRequest(HttpServletRequest request) {
        final String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        // Extract token (remove "Bearer " prefix)
        String token = authorizationHeader.substring(7).trim();

        // Check if token is empty
        if (token.isEmpty()) {
            return null;
        }

        return token;
    }

    /**
     * Determines if the filter should not be applied to a specific request.
     * Can be overridden to exclude certain paths.
     *
     * @param request HTTP request
     * @return true if filter should be skipped
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // Skip filter for public endpoints
        return path.startsWith("/api/auth/login") ||
               path.startsWith("/api/auth/register") ||
               path.startsWith("/api/public/") ||
               path.startsWith("/h2-console/") ||
               path.startsWith("/actuator/health") ||
               path.equals("/");
    }
}