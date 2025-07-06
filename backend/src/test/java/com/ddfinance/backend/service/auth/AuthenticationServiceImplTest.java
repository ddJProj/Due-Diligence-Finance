package com.ddfinance.backend.service.auth;

import com.ddfinance.backend.dto.accounts.UserAccountDTO;
import com.ddfinance.backend.dto.auth.AuthenticationRequest;
import com.ddfinance.backend.dto.auth.AuthenticationResponse;
import com.ddfinance.backend.dto.auth.RegisterAuthRequest;
import com.ddfinance.backend.service.accounts.UserAccountService;
import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.SecurityException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.UserAccountRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for AuthenticationServiceImpl.
 * Tests authentication service implementation.
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;

    @Mock
    private UserAccountService userAccountService;

    @Mock
    private JwtService jwtService;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private RegisterAuthRequest registerRequest;
    private AuthenticationRequest authRequest;
    private UserAccount userAccount;
    private UserAccountDTO userAccountDTO;

    @BeforeEach
    void setUp() {
        registerRequest = RegisterAuthRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        authRequest = AuthenticationRequest.builder()
                .email("john.doe@example.com")
                .password("SecurePass123!")
                .build();

        userAccount = new UserAccount(
                "john.doe@example.com",
                "$2a$10$hashedpassword",
                "John",
                "Doe"
        );
        userAccount.setId(1L);
        userAccount.setRole(Role.GUEST);

        userAccountDTO = UserAccountDTO.builder()
                .id(1L)
                .email("john.doe@example.com")
                .firstName("John")
                .lastName("Doe")
                .role(Role.GUEST)
                .build();
    }

    @Test
    void testRegisterSuccess() {
        // Given
        when(userAccountRepository.existsByEmail(anyString())).thenReturn(false);
        when(userAccountService.createUserAccount(any(UserAccountDTO.class))).thenReturn(userAccountDTO);
        when(jwtService.generateToken(any(UserAccount.class))).thenReturn("jwt-token");
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.of(userAccount));

        // When
        AuthenticationResponse response = authenticationService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("john.doe@example.com", response.getEmail());
        assertEquals("GUEST", response.getRole());

        verify(userAccountRepository).existsByEmail("john.doe@example.com");
        verify(userAccountService).createUserAccount(any(UserAccountDTO.class));
        verify(jwtService).generateToken(any(UserAccount.class));
    }

    @Test
    void testRegisterEmailAlreadyExists() {
        // Given
        when(userAccountRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThrows(ValidationException.class, () ->
                authenticationService.register(registerRequest)
        );

        verify(userAccountRepository).existsByEmail("john.doe@example.com");
        verify(userAccountService, never()).createUserAccount(any());
    }

    @Test
    void testRegisterInvalidPassword() {
        // Given
        registerRequest.setPassword("weak");
        when(userAccountRepository.existsByEmail(anyString())).thenReturn(false);

        // When & Then
        assertThrows(ValidationException.class, () ->
                authenticationService.register(registerRequest)
        );

        verify(userAccountService, never()).createUserAccount(any());
    }

    @Test
    void testAuthenticateSuccess() {
        // Given
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.of(userAccount));
        when(jwtService.generateToken(any(UserAccount.class))).thenReturn("jwt-token");

        // When
        AuthenticationResponse response = authenticationService.authenticate(authRequest);

        // Then
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals(1L, response.getId());
        assertEquals("john.doe@example.com", response.getEmail());

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(userAccount);
    }

    @Test
    void testAuthenticateInvalidCredentials() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // When & Then
        assertThrows(SecurityException.AuthenticationException.class, () ->
                authenticationService.authenticate(authRequest)
        );

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void testAuthenticateUserNotFound() {
        // Given
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(auth);
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(EntityNotFoundException.class, () ->
                authenticationService.authenticate(authRequest)
        );

        verify(jwtService, never()).generateToken(any());
    }

    @Test
    void testRefreshTokenSuccess() {
        // Given
        String oldToken = "old-jwt-token";
        when(tokenBlacklistService.isTokenBlacklisted(oldToken)).thenReturn(false);
        when(jwtService.validateToken(oldToken)).thenReturn(true);
        when(jwtService.extractEmail(oldToken)).thenReturn("john.doe@example.com");
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.of(userAccount));
        when(jwtService.generateToken(any(UserAccount.class))).thenReturn("new-jwt-token");

        // When
        AuthenticationResponse response = authenticationService.refreshToken(oldToken);

        // Then
        assertNotNull(response);
        assertEquals("new-jwt-token", response.getToken());

        verify(tokenBlacklistService).isTokenBlacklisted(oldToken);
        verify(tokenBlacklistService).blacklistToken(oldToken);
        verify(jwtService).generateToken(userAccount);
    }

    @Test
    void testRefreshTokenBlacklisted() {
        // Given
        String token = "blacklisted-token";
        when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(true);

        // When & Then
        assertThrows(SecurityException.TokenException.class, () ->
                authenticationService.refreshToken(token)
        );

        verify(tokenBlacklistService).isTokenBlacklisted(token);
        verify(jwtService, never()).validateToken(any());
    }

    @Test
    void testRefreshTokenInvalid() {
        // Given
        String token = "invalid-token";
        when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
        when(jwtService.validateToken(token)).thenReturn(false);

        // When & Then
        assertThrows(SecurityException.TokenException.class, () ->
                authenticationService.refreshToken(token)
        );

        verify(jwtService).validateToken(token);
        verify(jwtService, never()).extractEmail(any());
    }

    @Test
    void testValidateToken() {
        // Given
        String token = "valid-token";
        when(tokenBlacklistService.isTokenBlacklisted(token)).thenReturn(false);
        when(jwtService.validateToken(token)).thenReturn(true);
        when(jwtService.extractEmail(token)).thenReturn("john.doe@example.com");
        when(jwtService.extractRole(token)).thenReturn("CLIENT");

        // When
        Map<String, Object> result = authenticationService.validateToken(token);

        // Then
        assertTrue((Boolean) result.get("valid"));
        assertEquals("john.doe@example.com", result.get("email"));
        assertEquals("CLIENT", result.get("role"));
    }

    @Test
    void testChangePasswordSuccess() {
        // Given
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.of(userAccount));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(passwordEncoder.encode(anyString())).thenReturn("$2a$10$newhashed");

        // When
        authenticationService.changePassword("john.doe@example.com", "SecurePass123!", "NewPass123!");

        // Then
        verify(passwordEncoder).matches("SecurePass123!", userAccount.getPassword());
        verify(passwordEncoder).encode("NewPass123!");
        verify(userAccountRepository).save(userAccount);
    }

    @Test
    void testChangePasswordWrongCurrent() {
        // Given
        when(userAccountRepository.findByEmail(anyString())).thenReturn(Optional.of(userAccount));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        assertThrows(SecurityException.AuthenticationException.class, () ->
                authenticationService.changePassword("john.doe@example.com", "WrongPass", "NewPass123!")
        );

        verify(passwordEncoder, never()).encode(any());
        verify(userAccountRepository, never()).save(any());
    }

    @Test
    void testValidatePassword() {
        // Valid passwords
        assertDoesNotThrow(() -> authenticationService.validatePassword("ValidPass123!"));
        assertDoesNotThrow(() -> authenticationService.validatePassword("Str0ng@Pass"));

        // Invalid passwords
        assertThrows(ValidationException.class, () ->
                authenticationService.validatePassword("weak"));
        assertThrows(ValidationException.class, () ->
                authenticationService.validatePassword("NoDigits!"));
        assertThrows(ValidationException.class, () ->
                authenticationService.validatePassword("NoSpecial123"));
        assertThrows(ValidationException.class, () ->
                authenticationService.validatePassword("nouppercase123!"));
        assertThrows(ValidationException.class, () ->
                authenticationService.validatePassword("NOLOWERCASE123!"));
    }
}
