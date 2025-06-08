package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmployeeTest {
    private Client client;
    private UserAccount userAccount;
    private Employee employee;

    @BeforeEach
    void setUp() {
        client = new Client();
        userAccount = new UserAccount("employee@test.com", "testPass", "testFirst", "testLast", Role.EMPLOYEE);
        employee = new Employee();
    }

    @AfterEach
    void tearDown() {
    }

    @Test
    void testGetSetId() {
        Long id = 1L;
        employee.setId(id);

        assertEquals(id, employee.getId());
    }

    @Test
    void testGetSetEmployeeId() {
        userAccount.setId(1L);
        employee.setId(1L);

        String employeeId = employee.getEmployeeId();

        assertEquals("1_1", employee.getEmployeeId());
        // returns same cached id value
        assertEquals(employeeId, employee.getEmployeeId());
    }

    @Test
    void testManualSetEmployeeId() {

        String employeeId = "TEST_1";
        employee.setEmployeeId(employeeId);

        assertEquals("TEST_1", employee.getEmployeeId());
    }

    @Test
    void testEmployeeIdReturnsNullWhenNoIdValuesSet() {

        String employeeId = employee.getEmployeeId();

        assertNull(employeeId);
    }

    @Test
    void testGetSetUserAccount() {

    }

    @Test
    void testGetSetClientList() {
    }

    @Test
    void testGetSetLocationId() {
    }

    @Test
    void testGetSetJobTitle() {
    }


}