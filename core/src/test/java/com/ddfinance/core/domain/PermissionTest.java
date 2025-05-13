package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Permissions;
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
    }


    @Test
    void testParameterizedConstructor() {
        Permissions permissionType = Permissions.VIEW_CLIENT;
        String permissionDescription = "Allows the viewing of Client account details";

        Permission parameterizedPermission = new Permission(permissionType, permissionDescription);

    }


    @Test
    void testGetSetPermissionTypeViewClient() {
        Permissions permissionType = Permissions.VIEW_CLIENT;
        permission.setPermissionType(permissionType);

        assertEquals(permissionType, permission.getPermissionType());
    }

    @Test
    void testGetSetPermissionDescriptionViewClient() {
        String permissionDescription = "Allows the viewing of Client account details";
        permission.setDescription(permissionDescription);

        assertEquals(permissionDescription, permission.getDescription());

    }


    @AfterEach
    void tearDown() {
    }
}