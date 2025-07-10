package com.ddfinance.backend.service.accounts;

import com.ddfinance.backend.dto.accounts.UserAccountDTO;
import com.ddfinance.backend.dto.accounts.UpdatePasswordRequest;
import com.ddfinance.backend.dto.accounts.UpdateUserDetailsRequest;
import com.ddfinance.core.domain.enums.Role;

import java.util.List;

/**
 * Service interface for user account operations.
 * Handles user management, profile updates, and account administration.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface UserAccountService {

    /**
     * Gets the current user by email.
     *
     * @param email User's email
     * @return User account DTO
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     */
    UserAccountDTO getCurrentUser(String email);

    /**
     * Gets a user by ID.
     *
     * @param id User ID
     * @return User account DTO
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     */
    UserAccountDTO getUserById(Long id);

    /**
     * Gets all users in the system.
     *
     * @return List of all user accounts
     */
    List<UserAccountDTO> getAllUsers();

    /**
     * Updates user details.
     *
     * @param email User's email
     * @param request Update details request
     * @return Updated user account DTO
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     */
    UserAccountDTO updateUserDetails(String email, UpdateUserDetailsRequest request);

    /**
     * Updates user password.
     *
     * @param email User's email
     * @param request Password update request
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     * @throws com.ddfinance.core.exception.SecurityException.AuthenticationException if current password is wrong
     * @throws com.ddfinance.core.exception.ValidationException if new password doesn't meet requirements
     */
    void updatePassword(String email, UpdatePasswordRequest request);

    /**
     * Deletes a user account.
     *
     * @param id User ID to delete
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     */
    void deleteUser(Long id);

    /**
     * Updates a user's role.
     *
     * @param id User ID
     * @param newRole New role to assign
     * @return Updated user account DTO
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     */
    UserAccountDTO updateUserRole(Long id, Role newRole);

    /**
     * Searches for users by name or email.
     *
     * @param query Search query
     * @return List of matching users
     */
    List<UserAccountDTO> searchUsers(String query);

    /**
     * Creates a new user account.
     *
     * @param userDTO User details
     * @param temporaryPassword Temporary password for the new user
     * @return Created user account DTO
     * @throws com.ddfinance.core.exception.ValidationException if email already exists
     */
    UserAccountDTO createUser(UserAccountDTO userDTO, String temporaryPassword);

    /**
     * Activates a user account.
     *
     * @param id User ID
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     * @throws com.ddfinance.core.exception.ValidationException if user is already active
     */
    void activateUser(Long id);

    /**
     * Deactivates a user account.
     *
     * @param id User ID
     * @throws com.ddfinance.core.exception.EntityNotFoundException if user not found
     * @throws com.ddfinance.core.exception.ValidationException if user is already inactive
     */
    void deactivateUser(Long id);
}