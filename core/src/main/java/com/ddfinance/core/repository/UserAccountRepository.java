package com.ddfinance.core.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Role;

/**
 * Repository interface for UserAccount entity
 * Provides data access operations for user account management
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-01
 */
@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, Long> {

    /**
     * Locate/retrieve a UserAccount by its email address
     * Email lookup is case-sensitive for security reasons
     *
     * @param email the email address to search for
     * @return Optional UserAccount, present if found, empty otherwise
     */
    Optional<UserAccount> findByEmail(String email);

    /**
     * Determines if a UserAccount with matching email exists
     * Used for email uniqueness validation during registration
     *
     * @param email the email address to check
     * @return true if a user account with this email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Locate/retrieve all UserAccounts by the provided role
     * Useful for administrative functions and role-based queries
     *
     * @param role the target role to search for
     * @return List of UserAccount entities with the specified role, empty list if none found
     */
    List<UserAccount> findByRole(Role role);

    /**
     * Determines if any UserAccount with matching role exists
     * Useful for checking if specific roles are present in the system
     *
     * @param role the target role to check
     * @return true if at least one user account with this role exists, false otherwise
     */
    boolean existsByRole(Role role);

    /**
     * Counts the number of users with a specific role.
     *
     * @param role The role to count
     * @return Number of users with the role
     */
    int countByRole(Role role);

    /**
     * Finds active user accounts.
     *
     * @return List of active users
     */
    List<UserAccount> findByActiveTrue();

    /**
     * Finds user accounts by role and active status.
     *
     * @param role The role to filter by
     * @param active The active status
     * @return List of matching users
     */
    List<UserAccount> findByRoleAndActive(Role role, boolean active);

    /**
     * Searches for users by email or name (case-insensitive).
     *
     * @param query The search query
     * @return List of matching users
     */
    @Query("SELECT u FROM UserAccount u WHERE " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<UserAccount> searchByEmailOrName(@Param("query") String query);

    /**
     * Finds users by role that match a search query.
     *
     * @param role The role to filter by
     * @param query The search query
     * @return List of matching users
     */
    @Query("SELECT u FROM UserAccount u WHERE u.role = :role AND " +
            "(LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<UserAccount> findByRoleAndSearchQuery(@Param("role") Role role, @Param("query") String query);

    /**
     * Finds all user accounts ordered by creation date.
     *
     * @return List of users ordered by creation date
     */
    @Query("SELECT u FROM UserAccount u ORDER BY u.createdDate DESC")
    List<UserAccount> findAllOrderByCreatedDateDesc();

    /**
     * Counts active users by role.
     *
     * @param role The role to count
     * @return Number of active users with the role
     */
    @Query("SELECT COUNT(u) FROM UserAccount u WHERE u.role = :role AND u.active = true")
    long countActiveByRole(@Param("role") Role role);
}
