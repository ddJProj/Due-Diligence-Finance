package com.ddfinance.core.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.enums.Permissions;

/**
 * Integration tests for PermissionRepository
 * Tests all repository methods with actual database interactions
 */
@DataJpaTest
class PermissionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PermissionRepository permissionRepository;

    private Permission readAccountsPermission;
    private Permission createClientPermission;
    private Permission deleteAccountPermission;

    @BeforeEach
    void setUp() {
        // Create test permissions
        readAccountsPermission = new Permission();
        readAccountsPermission.setPermissionType(Permissions.VIEW_ACCOUNTS);

        createClientPermission = new Permission();
        createClientPermission.setPermissionType(Permissions.CREATE_CLIENT);

        deleteAccountPermission = new Permission();
        deleteAccountPermission.setPermissionType(Permissions.DELETE_USER);
    }

    @Test
    void testFindByPermissionType_ShouldReturnPermissionWhenExists() {
        // Given
        entityManager.persistAndFlush(readAccountsPermission);

        // When
        Optional<Permission> result = permissionRepository.findByPermissionType(Permissions.VIEW_ACCOUNTS);

        // Then
        assertTrue(result.isPresent());
        assertEquals(Permissions.VIEW_ACCOUNTS, result.get().getPermissionType());
        assertNotNull(result.get().getId());
    }

    @Test
    void testFindByPermissionType_ShouldReturnEmptyWhenNotExists() {
        // When
        Optional<Permission> result = permissionRepository.findByPermissionType(Permissions.VIEW_INVESTMENT);

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testFindByPermissionType_ShouldReturnCorrectPermissionAmongMultiple() {
        // Given
        entityManager.persistAndFlush(readAccountsPermission);
        entityManager.persistAndFlush(createClientPermission);
        entityManager.persistAndFlush(deleteAccountPermission);

        // When
        Optional<Permission> result = permissionRepository.findByPermissionType(Permissions.CREATE_CLIENT);

        // Then
        assertTrue(result.isPresent());
        assertEquals(Permissions.CREATE_CLIENT, result.get().getPermissionType());
    }

    @Test
    void testExistsByPermissionType_ShouldReturnTrueWhenExists() {
        // Given
        entityManager.persistAndFlush(readAccountsPermission);

        // When
        boolean exists = permissionRepository.existsByPermissionType(Permissions.VIEW_ACCOUNTS);

        // Then
        assertTrue(exists);
    }

    @Test
    void testExistsByPermissionType_ShouldReturnFalseWhenNotExists() {
        // When
        boolean exists = permissionRepository.existsByPermissionType(Permissions.VIEW_INVESTMENT);

        // Then
        assertFalse(exists);
    }

    @Test
    void testExistsByPermissionType_ShouldReturnTrueForEachExistingPermission() {
        // Given
        entityManager.persistAndFlush(readAccountsPermission);
        entityManager.persistAndFlush(createClientPermission);
        entityManager.persistAndFlush(deleteAccountPermission);

        // When & Then
        assertTrue(permissionRepository.existsByPermissionType(Permissions.VIEW_ACCOUNTS));
        assertTrue(permissionRepository.existsByPermissionType(Permissions.CREATE_CLIENT));
        assertTrue(permissionRepository.existsByPermissionType(Permissions.DELETE_USER));
    }

    @Test
    void testSave_ShouldPersistPermission() {
        // When
        Permission saved = permissionRepository.save(readAccountsPermission);

        // Then
        assertNotNull(saved.getId());
        assertEquals(Permissions.VIEW_ACCOUNTS, saved.getPermissionType());

        // Verify it's actually in the database
        Permission found = entityManager.find(Permission.class, saved.getId());
        assertNotNull(found);
        assertEquals(Permissions.VIEW_ACCOUNTS, found.getPermissionType());
    }

    @Test
    void testFindById_ShouldReturnPermissionWhenExists() {
        // Given
        Permission persisted = entityManager.persistAndFlush(readAccountsPermission);

        // When
        Optional<Permission> result = permissionRepository.findById(persisted.getId());

        // Then
        assertTrue(result.isPresent());
        assertEquals(Permissions.VIEW_ACCOUNTS, result.get().getPermissionType());
    }

    @Test
    void testFindById_ShouldReturnEmptyWhenNotExists() {
        // When
        Optional<Permission> result = permissionRepository.findById(999L);

        // Then
        assertFalse(result.isPresent());
    }

    @Test
    void testDelete_ShouldRemovePermission() {
        // Given
        Permission persisted = entityManager.persistAndFlush(readAccountsPermission);
        Long permissionId = persisted.getId();

        // When
        permissionRepository.delete(persisted);
        entityManager.flush();

        // Then
        Permission found = entityManager.find(Permission.class, permissionId);
        assertNull(found);
    }

    @Test
    void testFindAll_ShouldReturnAllPermissions() {
        // Given
        entityManager.persistAndFlush(readAccountsPermission);
        entityManager.persistAndFlush(createClientPermission);
        entityManager.persistAndFlush(deleteAccountPermission);

        // When
        var allPermissions = permissionRepository.findAll();

        // Then
        assertEquals(3, allPermissions.size());
        assertTrue(allPermissions.stream().anyMatch(p -> p.getPermissionType() == Permissions.VIEW_ACCOUNTS));
        assertTrue(allPermissions.stream().anyMatch(p -> p.getPermissionType() == Permissions.CREATE_CLIENT));
        assertTrue(allPermissions.stream().anyMatch(p -> p.getPermissionType() == Permissions.DELETE_USER));
    }

    @Test
    void testCount_ShouldReturnTotalPermissionCount() {
        // Given
        entityManager.persistAndFlush(readAccountsPermission);
        entityManager.persistAndFlush(createClientPermission);

        // When
        long count = permissionRepository.count();

        // Then
        assertEquals(2, count);
    }

    @Test
    void testDuplicatePermissionType_ShouldNotCreateDuplicate() {
        // Given
        entityManager.persistAndFlush(readAccountsPermission);

        Permission duplicatePermission = new Permission();
        duplicatePermission.setPermissionType(Permissions.VIEW_ACCOUNTS);

        // When & Then
        // This should either fail due to unique constraint or handle gracefully
        // The behavior depends on how we implement unique constraints
        assertThrows(Exception.class, () -> {
            entityManager.persistAndFlush(duplicatePermission);
        });
    }

    @Test
    void testAllPermissionTypes_ShouldBeStorableAndRetrievable() {
        // Given - Create permissions for all enum values
        Permissions[] allPermissions = Permissions.values();

        // When - Save each permission type
        for (Permissions permType : allPermissions) {
            if (!permissionRepository.existsByPermissionType(permType)) {
                Permission permission = new Permission();
                permission.setPermissionType(permType);
                permissionRepository.save(permission);
            }
        }

        // Then - Verify all can be retrieved
        for (Permissions permType : allPermissions) {
            assertTrue(permissionRepository.existsByPermissionType(permType),
                    "Permission type " + permType + " should exist");

            Optional<Permission> found = permissionRepository.findByPermissionType(permType);
            assertTrue(found.isPresent(),
                    "Should be able to find permission type " + permType);
            assertEquals(permType, found.get().getPermissionType());
        }

        // Verify total count
        assertEquals(allPermissions.length, permissionRepository.count());
    }
}