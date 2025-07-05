package com.ddfinance.core.repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.enums.Permissions;

/**
 * Repository interface for Permission entity
 * Provides data access operations for permission management
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-03-01
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    /**
     * Locate/retrieve a permission by its permission type
     * Used to find specific permissions for role assignment and validation
     *
     * @param permissionType the permission type to search for
     * @return Optional Permission, present if found, empty otherwise
     */
    Optional<Permission> findByPermissionType(Permissions permissionType);

    /**
     * Determines if a permission with the specified type already exists
     * Used for permission initialization and duplicate prevention
     *
     * @param permissionType the permission type to check
     * @return true if a permission with this type exists, false otherwise
     */
    boolean existsByPermissionType(Permissions permissionType);

    /**
     * Find multiple permissions by their types
     * Useful for bulk permission retrieval when assigning permissions to roles
     *
     * @param permissionTypes set of permission types to search for
     * @return List of Permission entities matching the specified types
     */
    @Query("SELECT p FROM Permission p WHERE p.permissionType IN :permissionTypes")
    List<Permission> findByPermissionTypeIn(@Param("permissionTypes") Set<Permissions> permissionTypes);

    /**
     * Find all permissions ordered by permission type name
     * Useful for administrative interfaces that need consistent ordering
     *
     * @return List of all Permission entities ordered by permission type name
     */
    @Query("SELECT p FROM Permission p ORDER BY p.permissionType")
    List<Permission> findAllOrderedByType();

    /**
     * Count permissions by checking if all specified types exist
     * Useful for validating that all required permissions are initialized
     *
     * @param permissionTypes set of permission types to count
     * @return the number of existing permissions from the specified set
     */
    @Query("SELECT COUNT(p) FROM Permission p WHERE p.permissionType IN :permissionTypes")
    long countByPermissionTypeIn(@Param("permissionTypes") Set<Permissions> permissionTypes);

    /**
     * Find permissions that are missing from the database
     * Compares all possible permission types with existing ones
     *
     * @param allPermissionTypes set of all possible permission types
     * @return List of permission types that don't exist in the database
     */
    @Query("SELECT p FROM Permission p WHERE p.permissionType NOT IN :existingTypes")
    List<Permission> findMissingPermissions(@Param("existingTypes") Set<Permissions> existingTypes);

    /**
     * Check if all required permissions exist in the database
     * Useful for system initialization and health checks
     *
     * @param requiredPermissions set of required permission types
     * @return true if all required permissions exist, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(p) = :requiredCount THEN true ELSE false END " +
            "FROM Permission p WHERE p.permissionType IN :requiredPermissions")
    boolean allRequiredPermissionsExist(@Param("requiredPermissions") Set<Permissions> requiredPermissions,
                                        @Param("requiredCount") long requiredCount);
}
