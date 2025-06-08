package com.ddfinance.core.service;

import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import jakarta.validation.constraints.AssertTrue;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RolePermissionServiceTest {

    private RolePermissionService rolePermissionService;

    private Client client;
    private UserAccount userAccount;
    private Employee employee;
    private Admin admin;
    private Guest guest;

    private Set<Permissions> permissions;
    private Set<Permissions> allPermissions = Permissions.getAllPermissions();


    @BeforeEach
    void setUp() {
        rolePermissionService = new RolePermissionService();

        userAccount = new UserAccount("rolePerm@test.com", "testPass", "testFirst", "testLast");
        guest = new Guest();
        client = new Client();
        employee = new Employee();
        admin = new Admin();

        Set<Permissions> permissions = new HashSet<>();

    }







    /*
     * Guest specific role permission tests
     */
    @Test
    void testGuestRoleHasGuestPermissions() {
        permissions = rolePermissionService.getPermissionsByRole(Role.GUEST);

        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));
        assertTrue(permissions.contains(Permissions.REQUEST_CLIENT_ACCOUNT));

        assertEquals(5,permissions.size());

    }

    @Test
    void testGuestRoleDoesNotHaveWrongPermissions() {
    }


    /*
     * Client specific role permission tests
     */
    @Test
    void testClientRoleHasClientPermissions() {

        permissions = rolePermissionService.getPermissionsByRole(Role.CLIENT);

        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));
        assertTrue(permissions.contains(Permissions.VIEW_INVESTMENT));
        assertTrue(permissions.contains(Permissions.MESSAGE_PARTNER));

        assertEquals(6,permissions.size());

    }
    @Test
    void testClientRoleDoesNotHaveWrongPermissions() {
    }



    /*
     * Employee specific role permission tests
     */
    @Test
    void testEmployeeRoleHasEmployeePermissions() {


        permissions = rolePermissionService.getPermissionsByRole(Role.EMPLOYEE);


        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));

        assertTrue(permissions.contains(Permissions.CREATE_INVESTMENT));
        assertTrue(permissions.contains(Permissions.EDIT_INVESTMENT));
        assertTrue(permissions.contains(Permissions.CREATE_CLIENT));
        assertTrue(permissions.contains(Permissions.EDIT_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENTS));
        assertTrue(permissions.contains(Permissions.ASSIGN_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEES));


        assertEquals(13, permissions.size());
    }


    @Test
    void testEmployeeRoleDoesNotHaveWrongPermissions() {
    }






    /*
     * Admin specific role permission tests
     */
    @Test
    void testAdminRoleHasAdminPermissions() {

        permissions = rolePermissionService.getPermissionsByRole(Role.ADMIN);



        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNT));
        assertTrue(permissions.contains(Permissions.EDIT_MY_DETAILS));
        assertTrue(permissions.contains(Permissions.UPDATE_MY_PASSWORD));
        assertTrue(permissions.contains(Permissions.CREATE_USER));

        assertTrue(permissions.contains(Permissions.REQUEST_CLIENT_ACCOUNT));

        assertTrue(permissions.contains(Permissions.VIEW_INVESTMENT));
        assertTrue(permissions.contains(Permissions.MESSAGE_PARTNER));


        assertTrue(permissions.contains(Permissions.CREATE_CLIENT));
        assertTrue(permissions.contains(Permissions.EDIT_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENT));
        assertTrue(permissions.contains(Permissions.VIEW_CLIENTS));
        assertTrue(permissions.contains(Permissions.ASSIGN_CLIENT));
        assertTrue(permissions.contains(Permissions.CREATE_INVESTMENT));
        assertTrue(permissions.contains(Permissions.EDIT_INVESTMENT));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.VIEW_EMPLOYEES));

        assertTrue(permissions.contains(Permissions.CREATE_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.EDIT_EMPLOYEE));
        assertTrue(permissions.contains(Permissions.EDIT_USER));
        assertTrue(permissions.contains(Permissions.DELETE_USER));
        assertTrue(permissions.contains(Permissions.UPDATE_OTHER_PASSWORD));
        assertTrue(permissions.contains(Permissions.VIEW_ACCOUNTS));

        assertEquals(Permissions.getAllPermissions().size(), permissions.size());

    }

    @Test
    void testAdminRoleDoesNotHaveWrongPermissions() {
    }




    @Test
    void testMethod() {
        fail("Not implemented yet");
    }

    @AfterEach
    void tearDown() {
    }
}