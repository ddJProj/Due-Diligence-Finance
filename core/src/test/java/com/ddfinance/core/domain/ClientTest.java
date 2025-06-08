package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class ClientTest {

    private Client client;
    private UserAccount userAccount;
    private Employee employee;



    @BeforeEach
    void setUp() {
        client = new Client();
        userAccount = new UserAccount("client@test.com", "testPass", "testFirst", "testLast", Role.CLIENT);
        employee = new Employee();

    }

    @Test
    void testParameterizedConstructor() {

        Client newClient = new Client(userAccount, employee);

        assertEquals(userAccount, newClient.getUserAccount());
        assertEquals(employee, newClient.getAssignedEmployeePartner());
        assertNull(newClient.getClientId());
    }


    @Test
    void testClientIdGenerationNonNullIds() {

        userAccount.setId(150L);
        client.setId(175L);
        client.setUserAccount(userAccount);

        String expectedClientId = userAccount.getId() + "_" + client.getId();

        assertEquals(expectedClientId, client.getClientId());
    }

    @Test
    void testSetGetEmployeePartner(){
        client.setAssignedEmployeePartner(employee);
        assertEquals(employee, client.getAssignedEmployeePartner());

    }



        @AfterEach
    void tearDown() {
    }
}
