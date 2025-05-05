package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserAccountTest {
    private UserAccount userAccount;


    @BeforeEach
    void setUp() {

//        userAccount = new UserAccount("email@test.com", "hashed-password", "firstName", "lastName", );
        userAccount = new UserAccount();
    }



    @Test
    void testParameterizedConstructor() {
        String email = "email@test.com";
        String password = "hashedPassword";
        String firstName = "firstName";
        String lastName = "lastName";

        userAccount = new UserAccount(email, password, firstName, lastName);

        assertEquals(email, userAccount.getEmail());
        assertEquals(password, userAccount.getPassword());
        assertEquals(firstName, userAccount.getFirstName());
        assertEquals(lastName, userAccount.getLastName());

    }


    @Test
    void testMethod() {
        fail("Not implemented yet");
    }

    // TODO :  test then implement each piece of the feature
    @Test
    void testSetEmail() {
        fail("Not implemented yet");
    }

    @Test
    void testSetGetRole() {

        Role expectedRole = Role.client;
        userAccount.setRole(expectedRole);

        assertEquals(expectedRole, userAccount.getRole());
    }


        @AfterEach
    void tearDown() {
    }
}