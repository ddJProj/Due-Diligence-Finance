package com.ddfinance.backend.service.auth;

import com.ddfinance.backend.dto.accounts.UserAccountDTO;
import com.ddfinance.backend.dto.auth.AuthenticationRequest;
import com.ddfinance.backend.dto.auth.AuthenticationResponse;
import com.ddfinance.backend.dto.auth.RegisterAuthRequest;
import com.ddfinance.backend.service.accounts.UserAccountService;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.SecurityException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Implementation of authentication service.
 * Handles user registration, login, and token management.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserAccountRepository userAccountRepository;
    private final UserAccountService userAccountService;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    // Password validation pattern
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$"
    );

    @Override
    @Transactional
    public AuthenticationResponse register(RegisterAuthRequest request) {
        log.info("Processing registration for email: {}", request.getEmail());

        // Check if email already exists
        if (userAccountRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email address is already registered");
        }

        // Validate password
        validatePassword(request.getPassword());

        // Create user account DTO
        UserAccountDTO userDTO = UserAccountDTO.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.GUEST) // New users start as guests
                .build();

        // TODO: Set password in UserAccountDTO when field is added

        // Create user account
        UserAccountDTO createdUser = userAccountService.createUserAccount(userDTO);

        // Load the created user entity
        UserAccount userAccount = userAccountRepository.findByEmail(createdUser.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Failed to load created user"));

        // Generate JWT token
        String token = jwtService.generateToken(userAccount);

        // Build response
        return buildAuthenticationResponse(userAccount, token);
    }

    @Override
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("Processing authentication for email: {}", request.getEmail());

        try {
            // Authenticate with Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (BadCredentialsException e) {
            throw new SecurityException.AuthenticationException("Invalid email or password");
        }

        // Load user
        UserAccount userAccount = userAccountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Generate token
        String token = jwtService.generateToken(userAccount);

        return buildAuthenticationResponse(userAccount, token);
    }

    @Override
    public AuthenticationResponse refreshToken(String token) {
        log.info("Processing token refresh");

        // Check if token is blacklisted
        if (tokenBlacklistService.isTokenBlacklisted(token)) {
            throw new SecurityException.TokenException("Token has been revoked");
        }

        // Validate token
        if (!jwtService.validateToken(token)) {
            throw new SecurityException.TokenException("Invalid token");
        }

        // Extract email from token
        String email = jwtService.extractEmail(token);

        // Load user
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Blacklist old token
        tokenBlacklistService.blacklistToken(token);

        // Generate new token
        String newToken = jwtService.generateToken(userAccount);

        return buildAuthenticationResponse(userAccount, newToken);
    }

    @Override
    public Map<String, Object> validateToken(String token) {
        Map<String, Object> result = new HashMap<>();

        // Check blacklist
        if (tokenBlacklistService.isTokenBlacklisted(token)) {
            result.put("valid", false);
            result.put("reason", "Token has been revoked");
            return result;
        }

        // Validate token
        boolean isValid = jwtService.validateToken(token);
        result.put("valid", isValid);

        if (isValid) {
            result.put("email", jwtService.extractEmail(token));
            result.put("role", jwtService.extractRole(token));
            result.put("expiresAt", jwtService.extractExpiration(token));
        } else {
            result.put("reason", "Token is invalid or expired");
        }

        return result;
    }

    @Override
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        log.info("Processing password change for: {}", email);

        // Load user
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, userAccount.getPassword())) {
            throw new SecurityException.AuthenticationException("Current password is incorrect");
        }

        // Validate new password
        validatePassword(newPassword);

        // Update password
        userAccount.setPassword(passwordEncoder.encode(newPassword));
        userAccountRepository.save(userAccount);

        // TODO: Blacklist all existing tokens for this user

        log.info("Password changed successfully for: {}", email);
    }

    @Override
    public String initiatePasswordReset(String email) {
        log.info("Initiating password reset for: {}", email);

        // Verify user exists
        UserAccount userAccount = userAccountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Generate reset token
        String resetToken = UUID.randomUUID().toString();

        // TODO: Store reset token with expiration
        // TODO: Send reset email

        return resetToken;
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        log.info("Processing password reset");

        // TODO: Validate reset token
        // TODO: Load user from token

        // Validate new password
        validatePassword(newPassword);

        // TODO: Update password
        // TODO: Invalidate reset token

        throw new UnsupportedOperationException("Password reset not yet implemented");
    }

    /**
     * Validates password meets requirements.
     */
    protected void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new ValidationException("Password must be at least 8 characters long");
        }

        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            throw new ValidationException(
                    "Password must contain at least one uppercase letter, " +
                            "one lowercase letter, one digit, and one special character"
            );
        }
    }

    /**
     * Builds authentication response from user account.
     */
    private AuthenticationResponse buildAuthenticationResponse(UserAccount userAccount, String token) {
        // Convert permissions to string set
        Set<String> permissions = userAccount.getPermissions().stream()
                .map(permission -> permission.getPermissionType().name())
                .collect(Collectors.toSet());

        return AuthenticationResponse.builder()
                .token(token)
                .id(userAccount.getId())
                .email(userAccount.getEmail())
                .firstName(userAccount.getFirstName())
                .lastName(userAccount.getLastName())
                .role(userAccount.getRole().name())
                .permissions(permissions)
                .build();
    }
}
