package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class ClientTest {

    private Client client;
    private UserAccount userAccount;
    private Employee employee;



    @BeforeEach
    void setUp() {
        client = new Client();
        userAccount = new UserAccount("client@test.com", "testPass", "testFirst", "testLast", Role.client);
        employee = new Employee();

    }

    @Test
    void testParameterizedConstructor() {
        String clientId = "CLIENT-999";

        Client newClient = new Client(clientId, userAccount, employee);

        assertEquals(clientId, newClient.getClientId());
        assertEquals(userAccount, newClient.getUserAccount());
        assertEquals(employee, newClient.getAssignedEmployeePartner());
    }

    @Test
    void testSetAssignedEmployee(){

    }

        @AfterEach
    void tearDown() {
    }
}
