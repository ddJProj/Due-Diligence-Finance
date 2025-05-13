package com.ddfinance.core.domain;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PermissionTest {
    private Permission permission;

    @BeforeEach
    void setUp() {
        permission = new Permission();
    }


    @Test
    void testNewEmptyPermission() {
        assertNotNull(permission);
        // is id null until persisted / auto generated?
        assertNull(permission.getId());

    }  @Test


    @AfterEach
    void tearDown() {
    }
}