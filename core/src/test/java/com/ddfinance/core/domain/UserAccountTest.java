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

    /*
       FOR INTEGRATION TESTS:
       ADD TRANSACTIONAL TAG to roll back transactions after tests

    */
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
    void testSetEmail() {
       String email = "email@test.com";
       userAccount.setEmail(email);

       assertEquals(email, userAccount.getEmail());
    }

    @Test
    void testSetPassword() {
        String password = "testpassword";
        userAccount.setPassword(password);

        assertEquals(password, userAccount.getPassword());
    }
    @Test
    void testSetFirstName() {
        String firstName = "firstname";
        userAccount.setFirstName(firstName);

        assertEquals(firstName, userAccount.getFirstName());
    }

    @Test
    void testSetLastName() {
        String lastName = "lastname";
        userAccount.setLastName(lastName);

        assertEquals(lastName, userAccount.getLastName());
    }

    @Test
    void testSetGetRole() {

        Role expectedRole = Role.client;
        userAccount.setRole(expectedRole);

        assertEquals(expectedRole, userAccount.getRole());
    }



//    // TODO :  test then implement each piece of the feature
//    @Test
//    void testMethod() {
//        fail("Not implemented yet");
//    }
//


        @AfterEach
    void tearDown() {
    }
}