package com.ddfinance.backend.controller;

import com.ddfinance.backend.dto.auth.AuthenticationRequest;
import com.ddfinance.backend.dto.auth.AuthenticationResponse;
import com.ddfinance.backend.dto.auth.RegisterAuthRequest;
import com.ddfinance.backend.service.auth.AuthenticationService;
import com.ddfinance.backend.service.auth.TokenBlacklistService;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.exception.SecurityException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for AuthController.
 * Tests authentication endpoints including login, register, logout, and refresh.
 */
@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthenticationService authenticationService;

    @MockitoBean
    private TokenBlacklistService tokenBlacklistService;

    private RegisterAuthRequest registerRequest;
    private AuthenticationRequest authRequest;
    private AuthenticationResponse authResponse;

    @BeforeEach
    void setUp() {
        // Setup test data
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

        authResponse = AuthenticationResponse.builder()
                .token("test-jwt-token")
                .email("john.doe@example.com")
                .firstName("John")
                .lastName("Doe")
                .role("GUEST")
                .permissions(Set.of("VIEW_ACCOUNT", "EDIT_MY_DETAILS"))
                .build();
    }

    @Test
    void testRegisterSuccess() throws Exception {
        // Given
        when(authenticationService.register(any(RegisterAuthRequest.class)))
                .thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-jwt-token"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"))
                .andExpect(jsonPath("$.role").value("GUEST"));

        verify(authenticationService, times(1)).register(any(RegisterAuthRequest.class));
    }

    @Test
    void testRegisterWithInvalidEmail() throws Exception {
        // Given
        registerRequest.setEmail("invalid-email");
        when(authenticationService.register(any(RegisterAuthRequest.class)))
                .thenThrow(new ValidationException("Invalid email format"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid email format"));
    }

    @Test
    void testRegisterWithWeakPassword() throws Exception {
        // Given
        registerRequest.setPassword("weak");
        when(authenticationService.register(any(RegisterAuthRequest.class)))
                .thenThrow(new ValidationException("Password does not meet requirements"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Password does not meet requirements"));
    }

    @Test
    void testRegisterWithExistingEmail() throws Exception {
        // Given
        when(authenticationService.register(any(RegisterAuthRequest.class)))
                .thenThrow(new ValidationException("Email already exists"));

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already exists"));
    }

    @Test
    void testLoginSuccess() throws Exception {
        // Given
        when(authenticationService.authenticate(any(AuthenticationRequest.class)))
                .thenReturn(authResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("test-jwt-token"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));

        verify(authenticationService, times(1)).authenticate(any(AuthenticationRequest.class));
    }

    @Test
    void testLoginWithInvalidCredentials() throws Exception {
        // Given
        when(authenticationService.authenticate(any(AuthenticationRequest.class)))
                .thenThrow(new SecurityException.AuthenticationException("Invalid credentials"));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
    }

    @Test
    void testLoginWithLockedAccount() throws Exception {
        // Given
        when(authenticationService.authenticate(any(AuthenticationRequest.class)))
                .thenThrow(new SecurityException.AccountLockedException("john.doe@example.com", 5));

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(authRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @WithMockUser
    void testLogoutSuccess() throws Exception {
        // Given
        String token = "Bearer test-jwt-token";
        doNothing().when(tokenBlacklistService).blacklistToken(anyString());

        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .with(csrf())
                .header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Successfully logged out"));

        verify(tokenBlacklistService, times(1)).blacklistToken("test-jwt-token");
    }

    @Test
    void testLogoutWithoutToken() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Successfully logged out"));

        verify(tokenBlacklistService, never()).blacklistToken(anyString());
    }

    @Test
    @WithMockUser
    void testRefreshTokenSuccess() throws Exception {
        // Given
        String oldToken = "Bearer old-jwt-token";
        AuthenticationResponse refreshResponse = AuthenticationResponse.builder()
                .token("new-jwt-token")
                .email("john.doe@example.com")
                .firstName("John")
                .lastName("Doe")
                .role("GUEST")
                .permissions(Set.of("VIEW_ACCOUNT", "EDIT_MY_DETAILS"))
                .build();

        when(authenticationService.refreshToken(anyString())).thenReturn(refreshResponse);

        // When & Then
        mockMvc.perform(post("/api/auth/refresh")
                .with(csrf())
                .header("Authorization", oldToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new-jwt-token"));

        verify(authenticationService, times(1)).refreshToken("old-jwt-token");
    }

    @Test
    void testRefreshTokenWithInvalidToken() throws Exception {
        // Given
        String invalidToken = "Bearer invalid-token";
        when(authenticationService.refreshToken(anyString()))
                .thenThrow(new SecurityException.TokenException("Invalid token"));

        // When & Then
        mockMvc.perform(post("/api/auth/refresh")
                .with(csrf())
                .header("Authorization", invalidToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Invalid token"));
    }

    @Test
    void testRefreshTokenWithExpiredToken() throws Exception {
        // Given
        String expiredToken = "Bearer expired-token";
        when(authenticationService.refreshToken(anyString()))
                .thenThrow(new SecurityException.TokenException("Token has expired"));

        // When & Then
        mockMvc.perform(post("/api/auth/refresh")
                .with(csrf())
                .header("Authorization", expiredToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Token has expired"));
    }

    @Test
    void testValidateTokenSuccess() throws Exception {
        // Given
        String validToken = "Bearer valid-token";
        Map<String, Object> tokenInfo = new HashMap<>();
        tokenInfo.put("valid", true);
        tokenInfo.put("email", "john.doe@example.com");
        tokenInfo.put("role", "GUEST");

        when(authenticationService.validateToken(anyString())).thenReturn(tokenInfo);

        // When & Then
        mockMvc.perform(post("/api/auth/validate")
                .with(csrf())
                .header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
    }

    @Test
    void testMissingRequiredFields() throws Exception {
        // Given - empty register request
        RegisterAuthRequest emptyRequest = new RegisterAuthRequest();

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest());
    }
}