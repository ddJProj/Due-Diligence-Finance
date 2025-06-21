package com.ddfinance.core.repository;

import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.enums.Permissions;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class PermissionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private PermissionRepository repository;

    private Permission viewAccountPermission;
    private Permission createAUserPermission;
    @Autowired
    private PermissionRepository permissionRepository;


    @BeforeEach
    void setUp() {
        viewAccountPermission = new Permission(Permissions.VIEW_ACCOUNT, "View the details of you UserAccount.");
        createAUserPermission = new Permission(Permissions.CREATE_USER, "Creates a new UserAccount.");
    }

    @Test
    void testFindByTypeIfExistsReturnPermission() {
        entityManager.persistAndFlush(viewAccountPermission);
        Optional<Permission> result = permissionRepository.findByPermissionType(Permissions.VIEW_ACCOUNT);

        assertTrue(result.isPresent());
        assertEquals(Permissions.VIEW_ACCOUNT, result.get().getPermissionType());
        assertEquals("View the details of you UserAccount.", result.get().getDescription());
    }

    @AfterEach
    void tearDown() {
    }
}