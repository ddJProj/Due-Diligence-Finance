package com.ddfinance.backend.controller;

import com.ddfinance.backend.dto.accounts.UserAccountDTO;
import com.ddfinance.backend.dto.accounts.UpdatePasswordRequest;
import com.ddfinance.backend.dto.accounts.UpdateUserDetailsRequest;
import com.ddfinance.backend.service.accounts.UserAccountService;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.exception.EntityNotFoundException;
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

import java.util.Arrays;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for UserAccountController.
 * Tests user account management endpoints.
 */
@WebMvcTest(UserAccountController.class)
class UserAccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserAccountService userAccountService;

    private UserAccountDTO userAccountDTO;
    private UpdateUserDetailsRequest updateDetailsRequest;
    private UpdatePasswordRequest updatePasswordRequest;

    @BeforeEach
    void setUp() {
        // Setup test data
        userAccountDTO = UserAccountDTO.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("John")
                .lastName("Doe")
                .role(Role.CLIENT)
                .permissions(Set.of(Permissions.VIEW_ACCOUNT, Permissions.EDIT_MY_DETAILS))
                .build();

        updateDetailsRequest = UpdateUserDetailsRequest.builder()
                .firstName("Updated")
                .lastName("Name")
                .build();

        updatePasswordRequest = UpdatePasswordRequest.builder()
                .currentPassword("oldPassword123!")
                .newPassword("newPassword123!")
                .confirmPassword("newPassword123!")
                .build();
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testGetCurrentUser() throws Exception {
        // Given
        when(userAccountService.getCurrentUser(anyString())).thenReturn(userAccountDTO);

        // When & Then
        mockMvc.perform(get("/api/users/me")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.role").value("CLIENT"));

        verify(userAccountService, times(1)).getCurrentUser("user@example.com");
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testGetCurrentUserNotFound() throws Exception {
        // Given
        when(userAccountService.getCurrentUser(anyString()))
                .thenThrow(new EntityNotFoundException("UserAccount", "user@example.com"));

        // When & Then
        mockMvc.perform(get("/api/users/me")
                        .with(csrf()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetUserById() throws Exception {
        // Given
        when(userAccountService.getUserById(1L)).thenReturn(userAccountDTO);

        // When & Then
        mockMvc.perform(get("/api/users/1")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("user@example.com"));

        verify(userAccountService, times(1)).getUserById(1L);
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testGetUserByIdForbidden() throws Exception {
        // When & Then - Non-admin trying to access another user
        mockMvc.perform(get("/api/users/2")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetAllUsers() throws Exception {
        // Given
        List<UserAccountDTO> users = Arrays.asList(
                userAccountDTO,
                UserAccountDTO.builder()
                        .id(2L)
                        .email("another@example.com")
                        .firstName("Jane")
                        .lastName("Smith")
                        .role(Role.EMPLOYEE)
                        .build()
        );
        when(userAccountService.getAllUsers()).thenReturn(users);

        // When & Then
        mockMvc.perform(get("/api/users")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].email").value("user@example.com"))
                .andExpect(jsonPath("$[1].email").value("another@example.com"));

        verify(userAccountService, times(1)).getAllUsers();
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testGetAllUsersForbidden() throws Exception {
        // When & Then - Non-admin trying to get all users
        mockMvc.perform(get("/api/users")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testUpdateMyDetails() throws Exception {
        // Given
        UserAccountDTO updatedUser = UserAccountDTO.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("Updated")
                .lastName("Name")
                .role(Role.CLIENT)
                .build();
        when(userAccountService.updateUserDetails(anyString(), any(UpdateUserDetailsRequest.class)))
                .thenReturn(updatedUser);

        // When & Then
        mockMvc.perform(put("/api/users/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDetailsRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"));

        verify(userAccountService, times(1)).updateUserDetails(eq("user@example.com"), any(UpdateUserDetailsRequest.class));
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testUpdateMyDetailsValidationError() throws Exception {
        // Given - empty first name
        updateDetailsRequest.setFirstName("");

        // When & Then
        mockMvc.perform(put("/api/users/me")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDetailsRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testUpdateMyPassword() throws Exception {
        // Given
        doNothing().when(userAccountService).updatePassword(anyString(), any(UpdatePasswordRequest.class));

        // When & Then
        mockMvc.perform(put("/api/users/me/password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePasswordRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Password updated successfully"));

        verify(userAccountService, times(1)).updatePassword(eq("user@example.com"), any(UpdatePasswordRequest.class));
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testUpdateMyPasswordMismatch() throws Exception {
        // Given
        updatePasswordRequest.setConfirmPassword("differentPassword123!");

        // When & Then
        mockMvc.perform(put("/api/users/me/password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePasswordRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testUpdateMyPasswordWrongCurrent() throws Exception {
        // Given
        doThrow(new SecurityException.AuthenticationException("Current password is incorrect"))
                .when(userAccountService).updatePassword(anyString(), any(UpdatePasswordRequest.class));

        // When & Then
        mockMvc.perform(put("/api/users/me/password")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatePasswordRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Current password is incorrect"));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testDeleteUser() throws Exception {
        // Given
        doNothing().when(userAccountService).deleteUser(1L);

        // When & Then
        mockMvc.perform(delete("/api/users/1")
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(userAccountService, times(1)).deleteUser(1L);
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testDeleteUserForbidden() throws Exception {
        // When & Then - Non-admin trying to delete user
        mockMvc.perform(delete("/api/users/1")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testUpdateUserRole() throws Exception {
        // Given
        UserAccountDTO updatedUser = UserAccountDTO.builder()
                .id(1L)
                .email("user@example.com")
                .firstName("John")
                .lastName("Doe")
                .role(Role.EMPLOYEE)
                .build();
        when(userAccountService.updateUserRole(1L, Role.EMPLOYEE)).thenReturn(updatedUser);

        // When & Then
        mockMvc.perform(put("/api/users/1/role")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"EMPLOYEE\""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("EMPLOYEE"));

        verify(userAccountService, times(1)).updateUserRole(1L, Role.EMPLOYEE);
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = {"EMPLOYEE"})
    void testUpdateUserRoleForbidden() throws Exception {
        // When & Then - Non-admin trying to change role
        mockMvc.perform(put("/api/users/1/role")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("\"CLIENT\""))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testSearchUsers() throws Exception {
        // Given
        List<UserAccountDTO> searchResults = Arrays.asList(userAccountDTO);
        when(userAccountService.searchUsers(anyString())).thenReturn(searchResults);

        // When & Then
        mockMvc.perform(get("/api/users/search")
                        .param("query", "john")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("John"));

        verify(userAccountService, times(1)).searchUsers("john");
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        // When & Then - No authentication
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }
}
