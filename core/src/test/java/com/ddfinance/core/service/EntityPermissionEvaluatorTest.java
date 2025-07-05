package com.ddfinance.core.service;

import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Test class for EntityPermissionEvaluator.
 * Tests entity-specific permission evaluation logic.
 */
class EntityPermissionEvaluatorTest {

    private EntityPermissionEvaluator entityPermissionEvaluator;
    private UserAccount userAccount;
    private UserAccount targetAccount;
    private Client clientEntity;
    private Employee employeeEntity;
    private Investment investmentEntity;
    private Set<Permission> userPermissions;

    @BeforeEach
    void setUp() {
        entityPermissionEvaluator = new EntityPermissionEvaluator();
        userAccount = new UserAccount("user@test.com", "password", "Test", "User");
        targetAccount = new UserAccount("target@test.com", "password", "Target", "User");
        userPermissions = new HashSet<>();

        // Create test entities
        clientEntity = new Client();
        clientEntity.setId(100L);

        employeeEntity = new Employee();
        employeeEntity.setId(200L);

        investmentEntity = new Investment();
        investmentEntity.setId(300L);
    }

    @Test
    void testAdminHasAllEntityPermissions() {
        // Given an admin user
        userAccount.setRole(Role.ADMIN);

        // When checking any entity permission
        // Then admin should have access to all entities
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_CLIENT, clientEntity));
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.EDIT_CLIENT, clientEntity));
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_INVESTMENT, investmentEntity));
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.DELETE_USER, targetAccount));
    }

    @Test
    void testEmployeeCanOnlyAccessAssignedClients() {
        // Given an employee with assigned clients
        userAccount.setRole(Role.EMPLOYEE);
        userAccount.setId(10L);

        // Create employee entity linked to user account
        Employee employee = new Employee();
        employee.setUserAccount(userAccount);

        // Create client assigned to this employee
        Client assignedClient = new Client();
        assignedClient.setId(101L);
        assignedClient.setAssignedEmployee(employee);

        // Create client assigned to different employee
        Client unassignedClient = new Client();
        unassignedClient.setId(102L);
        Employee otherEmployee = new Employee();
        otherEmployee.setId(201L);
        unassignedClient.setAssignedEmployee(otherEmployee);

        // Add VIEW_CLIENT permission to employee
        Permission viewClientPerm = new Permission(Permissions.VIEW_CLIENT, "View client details");
        userPermissions.add(viewClientPerm);
        userAccount.setPermissions(userPermissions);

        // When checking permissions
        // Then employee can view assigned client
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_CLIENT, assignedClient));

        // But cannot view unassigned client
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_CLIENT, unassignedClient));
    }

    @Test
    void testClientCanOnlyViewOwnInvestments() {
        // Given a client user
        userAccount.setRole(Role.CLIENT);
        userAccount.setId(20L);

        // Create client entity linked to user account
        Client client = new Client();
        client.setUserAccount(userAccount);
        client.setId(103L);

        // Create investment for this client
        Investment ownInvestment = new Investment();
        ownInvestment.setId(301L);
        ownInvestment.setClient(client);

        // Create investment for different client
        Client otherClient = new Client();
        otherClient.setId(104L);
        Investment otherInvestment = new Investment();
        otherInvestment.setId(302L);
        otherInvestment.setClient(otherClient);

        // Add VIEW_INVESTMENT permission
        Permission viewInvestmentPerm = new Permission(Permissions.VIEW_INVESTMENT, "View investment details");
        userPermissions.add(viewInvestmentPerm);
        userAccount.setPermissions(userPermissions);

        // When checking permissions
        // Then client can view own investment
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_INVESTMENT, ownInvestment));

        // But cannot view other client's investment
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_INVESTMENT, otherInvestment));
    }

    @Test
    void testUserCanEditOwnAccount() {
        // Given a user wanting to edit their own account
        userAccount.setRole(Role.CLIENT);
        userAccount.setId(30L);
        targetAccount.setId(30L); // Same ID as userAccount

        // Add EDIT_MY_DETAILS permission
        Permission editDetailsPerm = new Permission(Permissions.EDIT_MY_DETAILS, "Edit own account details");
        userPermissions.add(editDetailsPerm);
        userAccount.setPermissions(userPermissions);

        // When checking permission to edit own account
        // Then should be allowed
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.EDIT_MY_DETAILS, targetAccount));
    }

    @Test
    void testUserCannotEditOtherAccount() {
        // Given a user wanting to edit another account
        userAccount.setRole(Role.CLIENT);
        userAccount.setId(30L);
        targetAccount.setId(31L); // Different ID

        // Add EDIT_MY_DETAILS permission
        Permission editDetailsPerm = new Permission(Permissions.EDIT_MY_DETAILS, "Edit own account details");
        userPermissions.add(editDetailsPerm);
        userAccount.setPermissions(userPermissions);

        // When checking permission to edit other account
        // Then should be denied
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.EDIT_MY_DETAILS, targetAccount));
    }

    @Test
    void testNullResourceObjectFallsBackToGeneralPermission() {
        // Given a user with general permission
        userAccount.setRole(Role.EMPLOYEE);
        Permission createClientPerm = new Permission(Permissions.CREATE_CLIENT, "Create new clients");
        userPermissions.add(createClientPerm);
        userAccount.setPermissions(userPermissions);

        // When checking permission with null resource
        // Then should fall back to general permission check
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.CREATE_CLIENT, null));
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.DELETE_USER, null));
    }

    @Test
    void testNullUserAccountReturnsFalse() {
        // Given null user account
        // When checking any permission
        // Then should return false
        assertFalse(entityPermissionEvaluator.hasPermission(null, Permissions.VIEW_CLIENT, clientEntity));
    }

    @Test
    void testNullPermissionTypeReturnsFalse() {
        // Given valid user but null permission
        userAccount.setRole(Role.EMPLOYEE);

        // When checking null permission
        // Then should return false
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, null, clientEntity));
    }

    @Test
    void testGuestCannotAccessAnyEntities() {
        // Given a guest user
        userAccount.setRole(Role.GUEST);

        // Even with custom permissions
        Permission viewClientPerm = new Permission(Permissions.VIEW_CLIENT, "View client");
        userPermissions.add(viewClientPerm);
        userAccount.setPermissions(userPermissions);

        // When checking entity permissions
        // Then guest should be denied access to entities
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_CLIENT, clientEntity));
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.VIEW_INVESTMENT, investmentEntity));
    }

    @Test
    void testEmployeeCanCreateButNotDeleteClients() {
        // Given an employee with appropriate permissions
        userAccount.setRole(Role.EMPLOYEE);

        Permission createPerm = new Permission(Permissions.CREATE_CLIENT, "Create clients");
        Permission editPerm = new Permission(Permissions.EDIT_CLIENT, "Edit clients");
        userPermissions.add(createPerm);
        userPermissions.add(editPerm);
        userAccount.setPermissions(userPermissions);

        // When checking permissions
        // Then can create (no entity needed)
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.CREATE_CLIENT, null));

        // But cannot delete (even with entity)
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.DELETE_USER, clientEntity));
    }

    @Test
    void testUpdatePasswordPermissions() {
        // Given users with password update permissions
        userAccount.setRole(Role.CLIENT);
        userAccount.setId(40L);
        targetAccount.setId(40L);

        // User has permission to update their own password
        Permission updateOwnPerm = new Permission(Permissions.UPDATE_MY_PASSWORD, "Update own password");
        userPermissions.add(updateOwnPerm);
        userAccount.setPermissions(userPermissions);

        // When checking permission to update own password
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.UPDATE_MY_PASSWORD, targetAccount));

        // But not others' passwords
        targetAccount.setId(41L);
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.UPDATE_MY_PASSWORD, targetAccount));

        // Admin can update others' passwords
        userAccount.setRole(Role.ADMIN);
        assertTrue(entityPermissionEvaluator.hasPermission(userAccount, Permissions.UPDATE_OTHER_PASSWORD, targetAccount));
    }

    @Test
    void testMessagePartnerPermission() {
        // Given a client with their assigned employee
        userAccount.setRole(Role.CLIENT);
        userAccount.setId(50L);

        Client client = new Client();
        client.setUserAccount(userAccount);
        client.setId(105L);

        Employee assignedEmployee = new Employee();
        assignedEmployee.setId(202L);
        client.setAssignedEmployee(assignedEmployee);

        // Add message partner permission
        Permission messagePerm = new Permission(Permissions.MESSAGE_PARTNER, "Message assigned partner");
        userPermissions.add(messagePerm);
        userAccount.setPermissions(userPermissions);

        // When checking permission to message employee
        // TODO: update test when ClientRepository is injected
        assertFalse(entityPermissionEvaluator.hasPermission(userAccount, Permissions.MESSAGE_PARTNER, assignedEmployee));
    }
}