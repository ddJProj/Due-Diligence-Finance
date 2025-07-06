package com.ddfinance.backend.controller;

import com.ddfinance.backend.dto.accounts.UserAccountDTO;
import com.ddfinance.backend.dto.accounts.UpdatePasswordRequest;
import com.ddfinance.backend.dto.accounts.UpdateUserDetailsRequest;
import com.ddfinance.backend.service.accounts.UserAccountService;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.exception.SecurityException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for user account management.
 * Handles user profile operations, password changes, and admin user management.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class UserAccountController {

    private final UserAccountService userAccountService;

    /**
     * Gets the current authenticated user's account information.
     *
     * @param userDetails The authenticated user details
     * @return Current user's account information
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserAccountDTO> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserAccountDTO currentUser = userAccountService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(currentUser);
    }

    /**
     * Gets a specific user by ID (Admin only).
     *
     * @param id The user ID
     * @return User account information
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAccountDTO> getUserById(@PathVariable Long id) {
        UserAccountDTO user = userAccountService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    /**
     * Gets all users in the system (Admin only).
     *
     * @return List of all user accounts
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserAccountDTO>> getAllUsers() {
        List<UserAccountDTO> users = userAccountService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Updates the current user's details.
     *
     * @param userDetails The authenticated user
     * @param request Update details request
     * @return Updated user account information
     */
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserAccountDTO> updateMyDetails(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateUserDetailsRequest request) {

        UserAccountDTO updatedUser = userAccountService.updateUserDetails(
                userDetails.getUsername(), request);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Updates the current user's password.
     *
     * @param userDetails The authenticated user
     * @param request Password update request
     * @return Success message
     */
    @PutMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updateMyPassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdatePasswordRequest request) {

        // Validate passwords match
        if (!request.passwordsMatch()) {
            throw new ValidationException("New password and confirmation do not match");
        }

        userAccountService.updatePassword(userDetails.getUsername(), request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a user account (Admin only).
     *
     * @param id The user ID to delete
     * @return No content on success
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userAccountService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Updates a user's role (Admin only).
     *
     * @param id The user ID
     * @param role The new role
     * @return Updated user account
     */
    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserAccountDTO> updateUserRole(
            @PathVariable Long id,
            @RequestBody Role role) {

        UserAccountDTO updatedUser = userAccountService.updateUserRole(id, role);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Searches for users by name or email (Admin/Employee only).
     *
     * @param query Search query
     * @return List of matching users
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<UserAccountDTO>> searchUsers(@RequestParam String query) {
        List<UserAccountDTO> results = userAccountService.searchUsers(query);
        return ResponseEntity.ok(results);
    }

    /**
     * Exception handler for entity not found errors.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEntityNotFound(EntityNotFoundException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Exception handler for validation errors.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(ValidationException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());

        if (e.hasFieldErrors()) {
            error.put("details", e.getFieldErrorSummary());
        }

        return ResponseEntity.badRequest().body(error);
    }

    /**
     * Exception handler for security errors.
     */
    @ExceptionHandler(SecurityException.AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthentication(SecurityException.AuthenticationException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
