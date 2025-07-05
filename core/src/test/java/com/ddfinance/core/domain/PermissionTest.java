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

    @Test
    void testGetSetId() {
        Long id = 1L;
        permission.setId(id);

        assertEquals(id, permission.getId());
    }

    @Test
    void testPermissionEquality() {
        Permission permission1 = new Permission(Permissions.VIEW_CLIENT, "Description");
        Permission permission2 = new Permission(Permissions.VIEW_CLIENT, "Description");

        // Test that permissions with same type and description are considered equal
        permission1.setId(1L);
        permission2.setId(1L);

        assertEquals(permission1.getPermissionType(), permission2.getPermissionType());
        assertEquals(permission1.getDescription(), permission2.getDescription());
        assertEquals(permission1.getId(), permission2.getId());
    }

    @Test
    void testPermissionToString() {
        Permission permission = new Permission(Permissions.VIEW_CLIENT, "View client details");
        String expected = "Permission{id=null, permissionType=VIEW_CLIENT, description='View client details'}";

        assertEquals(expected, permission.toString());
    }

    @AfterEach
    void tearDown() {
        permission = null;

    }

}