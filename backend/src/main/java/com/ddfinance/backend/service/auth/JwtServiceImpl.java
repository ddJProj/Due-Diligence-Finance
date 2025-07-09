package com.ddfinance.backend.service.auth;

import com.ddfinance.core.domain.UserAccount;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Implementation of JWT service for token management.
 * Handles JWT token generation, validation, and claims extraction.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Service
public class JwtServiceImpl implements JwtService {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600000}") // 1 hour default
    private long jwtExpiration;

    @Value("${jwt.refresh.expiration:604800000}") // 7 days default
    private long jwtRefreshExpiration;

    private Key signingKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public String generateToken(UserAccount userAccount) {
        if (userAccount == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userAccount.getId());
        claims.put("role", userAccount.getRole().name());
        claims.put("firstName", userAccount.getFirstName());
        claims.put("lastName", userAccount.getLastName());
        claims.put("tokenType", "ACCESS");

        return generateToken(claims, userAccount);
    }

    /**
     * Generates token with extra claims.
     *
     * @param extraClaims additional claims to include
     * @param userAccount user account
     * @return JWT token
     */
    public String generateToken(Map<String, Object> extraClaims, UserAccount userAccount) {
        if (userAccount == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("userId", userAccount.getId());
        claims.put("role", userAccount.getRole().name());
        claims.put("firstName", userAccount.getFirstName());
        claims.put("lastName", userAccount.getLastName());
        claims.putIfAbsent("tokenType", "ACCESS");

        return createToken(claims, userAccount.getEmail(), jwtExpiration);
    }

    /**
     * Generates refresh token for user.
     *
     * @param userAccount user account
     * @return refresh JWT token
     */
    public String generateRefreshToken(UserAccount userAccount) {
        if (userAccount == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userAccount.getId());
        claims.put("tokenType", "REFRESH");

        return createToken(claims, userAccount.getEmail(), jwtRefreshExpiration);
    }

    /**
     * Generates token with custom expiration.
     *
     * @param userAccount user account
     * @param expiration expiration time in milliseconds
     * @return JWT token
     */
    public String generateTokenWithExpiration(UserAccount userAccount, long expiration) {
        if (userAccount == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userAccount.getId());
        claims.put("role", userAccount.getRole().name());
        claims.put("firstName", userAccount.getFirstName());
        claims.put("lastName", userAccount.getLastName());
        claims.put("tokenType", "ACCESS");

        return createToken(claims, userAccount.getEmail(), expiration);
    }

    private String createToken(Map<String, Object> claims, String subject, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    @Override
    public boolean validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return false;
        }

        try {
            Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validates token against username.
     *
     * @param token JWT token
     * @param username expected username
     * @return true if valid for username
     */
    public boolean isTokenValid(String token, String username) {
        try {
            final String extractedEmail = extractEmail(token);
            return (extractedEmail.equals(username)) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @Override
    public String extractRole(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("role", String.class);
    }

    /**
     * Extracts user ID from token.
     *
     * @param token JWT token
     * @return user ID
     */
    public Long extractUserId(String token) {
        final Claims claims = extractAllClaims(token);
        Number userId = (Number) claims.get("userId");
        return userId != null ? userId.longValue() : null;
    }

    /**
     * Extracts full name from token.
     *
     * @param token JWT token
     * @return full name
     */
    public String extractFullName(String token) {
        final Claims claims = extractAllClaims(token);
        String firstName = claims.get("firstName", String.class);
        String lastName = claims.get("lastName", String.class);
        return firstName + " " + lastName;
    }

    @Override
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    @Override
    public boolean isTokenExpired(String token) {
        try {
            return extractExpiration(token).before(new Date());
        } catch (ExpiredJwtException e) {
            return true;
        }
    }

    /**
     * Gets token type (ACCESS or REFRESH).
     *
     * @param token JWT token
     * @return token type
     */
    public String getTokenType(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("tokenType", String.class);
    }

    /**
     * Extracts a specific claim from token.
     *
     * @param token JWT token
     * @param claimsResolver function to extract claim
     * @param <T> claim type
     * @return claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Extracts all claims from token.
     *
     * @param token JWT token
     * @return all claims
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    @Override
    public long getExpirationTime() {
        return jwtExpiration;
    }
}