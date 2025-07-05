package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive test class for Employee entity
 * Following TDD methodology - Red, Green, Refactor
 */
class EmployeeTest {
    private Employee employee;
    private UserAccount userAccount;
    private Client testClient1;
    private Client testClient2;

    @BeforeEach
    void setUp() {
        employee = new Employee();

        // Create a test UserAccount for the employee
        userAccount = new UserAccount("employee@example.com", "password123", "Jane", "Smith", Role.EMPLOYEE);
        userAccount.setId(1L);

        // Create test clients
        UserAccount clientAccount1 = new UserAccount("client1@example.com", "password123", "John", "Doe", Role.CLIENT);
        clientAccount1.setId(2L);
        testClient1 = new Client(clientAccount1, "CLI-001");
        testClient1.setId(1L);

        UserAccount clientAccount2 = new UserAccount("client2@example.com", "password123", "Alice", "Johnson", Role.CLIENT);
        clientAccount2.setId(3L);
        testClient2 = new Client(clientAccount2, "CLI-002");
        testClient2.setId(2L);
    }

    // ========== Constructor Tests ==========
    @Test
    void testDefaultConstructor() {
        assertNotNull(employee);
        assertNull(employee.getId());
        assertNull(employee.getEmployeeId());
        assertNull(employee.getUserAccount());
        assertNull(employee.getLocationId());
        assertNull(employee.getDepartment());
        assertNull(employee.getHireDate());
        assertNotNull(employee.getClients());
        assertTrue(employee.getClients().isEmpty());
    }

    @Test
    void testParameterizedConstructorWithEmployeeId() {
        String employeeId = "FIN-NYC-001";
        Employee paramEmployee = new Employee(userAccount, employeeId);

        assertNotNull(paramEmployee);
        assertEquals(employeeId, paramEmployee.getEmployeeId());
        assertEquals(userAccount, paramEmployee.getUserAccount());
        assertNotNull(paramEmployee.getHireDate());
        assertNotNull(paramEmployee.getClients());
    }

    @Test
    void testParameterizedConstructorWithLocationAndDepartment() {
        String locationId = "NYC";
        String department = "FINANCE";
        Employee paramEmployee = new Employee(userAccount, locationId, department);

        assertNotNull(paramEmployee);
        assertEquals(userAccount, paramEmployee.getUserAccount());
        assertEquals(locationId, paramEmployee.getLocationId());
        assertEquals(department, paramEmployee.getDepartment());
        assertNotNull(paramEmployee.getHireDate());
    }

    // ========== Basic Field Tests ==========
    @Test
    void testSetGetId() {
        Long id = 123L;
        employee.setId(id);
        assertEquals(id, employee.getId());
    }

    @Test
    void testSetGetEmployeeId() {
        String employeeId = "FIN-NYC-001";
        employee.setEmployeeId(employeeId);
        assertEquals(employeeId, employee.getEmployeeId());
    }

    @Test
    void testSetGetUserAccount() {
        employee.setUserAccount(userAccount);
        assertEquals(userAccount, employee.getUserAccount());
    }

    @Test
    void testSetGetLocationId() {
        String locationId = "NYC";
        employee.setLocationId(locationId);
        assertEquals(locationId, employee.getLocationId());
    }

    @Test
    void testSetGetDepartment() {
        String department = "FINANCE";
        employee.setDepartment(department);
        assertEquals(department, employee.getDepartment());
    }

    @Test
    void testSetGetHireDate() {
        LocalDateTime hireDate = LocalDateTime.now();
        employee.setHireDate(hireDate);
        assertEquals(hireDate, employee.getHireDate());
    }

    @Test
    void testSetGetSalary() {
        Double salary = 75000.0;
        employee.setSalary(salary);
        assertEquals(salary, employee.getSalary());
    }

    @Test
    void testSetGetManagerId() {
        String managerId = "MGR-001";
        employee.setManagerId(managerId);
        assertEquals(managerId, employee.getManagerId());
    }

    @Test
    void testSetGetIsActive() {
        employee.setIsActive(false);
        assertFalse(employee.getIsActive());

        employee.setIsActive(true);
        assertTrue(employee.getIsActive());
    }

    // ========== Client Management Tests ==========
    @Test
    void testSetGetClients() {
        Set<Client> clients = new HashSet<>();
        clients.add(testClient1);
        clients.add(testClient2);

        employee.setClients(clients);
        assertEquals(clients, employee.getClients());
        assertEquals(2, employee.getClients().size());
    }

    @Test
    void testAddClient() {
        assertTrue(employee.getClients().isEmpty());

        employee.addClient(testClient1);

        assertEquals(1, employee.getClients().size());
        assertTrue(employee.getClients().contains(testClient1));
        assertEquals(employee, testClient1.getAssignedEmployee());
    }

    @Test
    void testRemoveClient() {
        employee.addClient(testClient1);
        assertEquals(1, employee.getClients().size());

        employee.removeClient(testClient1);

        assertTrue(employee.getClients().isEmpty());
        assertNull(testClient1.getAssignedEmployee());
    }

    @Test
    void testGetClientCount() {
        assertEquals(0, employee.getClientCount());

        employee.addClient(testClient1);
        employee.addClient(testClient2);

        assertEquals(2, employee.getClientCount());
    }

    @Test
    void testHasClients() {
        assertFalse(employee.hasClients());

        employee.addClient(testClient1);
        assertTrue(employee.hasClients());
    }

    @Test
    void testGetClientsByStatus() {
        testClient1.setAssignedEmployee(employee);
        testClient2.setAssignedEmployee(null); // Pending client

        employee.addClient(testClient1);

        // Test getting active clients (those assigned to this employee)
        Set<Client> activeClients = employee.getActiveClients();
        assertEquals(1, activeClients.size());
        assertTrue(activeClients.contains(testClient1));
    }

    // ========== Business Logic Tests ==========
    @Test
    void testGetFullName() {
        employee.setUserAccount(userAccount);
        assertEquals("Jane Smith", employee.getFullName());
    }

    @Test
    void testGetFullNameWithNullUserAccount() {
        assertNull(employee.getFullName());
    }

    @Test
    void testGetEmployeeEmail() {
        employee.setUserAccount(userAccount);
        assertEquals("employee@example.com", employee.getEmployeeEmail());
    }

    @Test
    void testGetEmployeeEmailWithNullUserAccount() {
        assertNull(employee.getEmployeeEmail());
    }

    @Test
    void testCanManageClients() {
        // Default should be true for employees
        assertTrue(employee.canManageClients());

        employee.setIsActive(false);
        assertFalse(employee.canManageClients());
    }

    @Test
    void testIsInDepartment() {
        employee.setDepartment("FINANCE");

        assertTrue(employee.isInDepartment("FINANCE"));
        assertTrue(employee.isInDepartment("finance")); // Case insensitive
        assertFalse(employee.isInDepartment("ADMIN"));
    }

    @Test
    void testIsAtLocation() {
        employee.setLocationId("NYC");

        assertTrue(employee.isAtLocation("NYC"));
        assertTrue(employee.isAtLocation("nyc")); // Case insensitive
        assertFalse(employee.isAtLocation("CHI"));
    }

    @Test
    void testGetYearsOfService() {
        LocalDateTime twoYearsAgo = LocalDateTime.now().minusYears(2);
        employee.setHireDate(twoYearsAgo);

        assertEquals(2, employee.getYearsOfService());
    }

    @Test
    void testGetYearsOfServiceWithNullHireDate() {
        assertEquals(0, employee.getYearsOfService());
    }

    // ========== Auto-Generation Tests ==========
    @Test
    void testAutoGeneratedEmployeeId() {
        employee.setId(123L);
        employee.setDepartment("FINANCE");
        employee.setLocationId("NYC");

        // Manually trigger the generation for testing
        employee.generateEmployeeId();

        assertEquals("FIN-NYC-123", employee.getEmployeeId());
    }

    @Test
    void testAutoGeneratedEmployeeIdWithDefaults() {
        employee.setId(456L);
        // No department or location set

        employee.generateEmployeeId();

        assertEquals("GEN-HQ-456", employee.getEmployeeId());
    }

    @Test
    void testGetEmployeeIdGeneratesIfNull() {
        employee.setId(789L);
        employee.setDepartment("ADMIN");
        employee.setLocationId("CHI");

        // employeeId is null, should generate when accessed
        String result = employee.getEmployeeId();

        assertEquals("ADM-CHI-789", result);
        assertEquals("ADM-CHI-789", employee.getEmployeeId()); // Should be cached
    }

    // ========== Validation Tests ==========
    @Test
    void testIsValidEmployee() {
        // Empty employee should not be valid
        assertFalse(employee.isValidEmployee());

        // Set required fields
        employee.setUserAccount(userAccount);
        employee.setHireDate(LocalDateTime.now());
        employee.setIsActive(true);

        assertTrue(employee.isValidEmployee());
    }

    @Test
    void testIsValidEmployeeWithMissingFields() {
        employee.setUserAccount(userAccount);
        employee.setHireDate(LocalDateTime.now());
        // Missing isActive flag

        assertFalse(employee.isValidEmployee());
    }

    @Test
    void testIsValidEmployeeId() {
        employee.setEmployeeId("FIN-NYC-001");
        assertTrue(employee.isValidEmployeeId());

        employee.setEmployeeId("");
        assertFalse(employee.isValidEmployeeId());

        employee.setEmployeeId(null);
        assertFalse(employee.isValidEmployeeId());

        employee.setEmployeeId("INVALID_FORMAT");
        assertFalse(employee.isValidEmployeeId());
    }

    // ========== Status and Performance Tests ==========
    @Test
    void testGetEmployeeStatus() {
        employee.setUserAccount(userAccount);
        employee.setHireDate(LocalDateTime.now());
        employee.setIsActive(true);

        assertEquals("ACTIVE", employee.getEmployeeStatus());

        employee.setIsActive(false);
        assertEquals("INACTIVE", employee.getEmployeeStatus());
    }

    @Test
    void testGetWorkload() {
        assertEquals("LIGHT", employee.getWorkload()); // No clients

        employee.addClient(testClient1);
        assertEquals("LIGHT", employee.getWorkload()); // 1 client

        // Add more clients to test different workload levels
        for (int i = 0; i < 10; i++) {
            UserAccount clientAccount = new UserAccount("client" + i + "@example.com", "password", "Client", "Name" + i, Role.CLIENT);
            Client client = new Client(clientAccount, "CLI-" + String.format("%03d", i + 10));
            employee.addClient(client);
        }

        assertEquals("HEAVY", employee.getWorkload()); // 11 clients total
    }

    // ========== ToString and Equality Tests ==========
    @Test
    void testToString() {
        employee.setId(1L);
        employee.setEmployeeId("FIN-NYC-001");
        employee.setUserAccount(userAccount);
        employee.setDepartment("FINANCE");

        String result = employee.toString();
        assertTrue(result.contains("Employee"));
        assertTrue(result.contains("id=1"));
        assertTrue(result.contains("employeeId=FIN-NYC-001"));
        assertTrue(result.contains("department=FINANCE"));
    }

    @Test
    void testEqualsAndHashCode() {
        Employee employee1 = new Employee(userAccount, "FIN-NYC-001");
        Employee employee2 = new Employee(userAccount, "FIN-NYC-001");

        employee1.setId(1L);
        employee2.setId(1L);

        assertEquals(employee1, employee2);
        assertEquals(employee1.hashCode(), employee2.hashCode());

        // Different IDs should not be equal
        employee2.setId(2L);
        assertNotEquals(employee1, employee2);
    }

    @AfterEach
    void tearDown() {
        employee = null;
        userAccount = null;
        testClient1 = null;
        testClient2 = null;
    }
}
