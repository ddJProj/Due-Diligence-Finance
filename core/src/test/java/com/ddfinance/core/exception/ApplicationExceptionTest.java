package com.ddfinance.core.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApplicationExceptionTest {
    @BeforeEach
    void setUp() {
    }


    @Test
    void testApplicationExceptionMessageConstructor(){
        String message = "Test with only message.";

        ApplicationException applicationException = new ApplicationException(message);

        assertEquals(message, applicationException.getMessage());
        assertNull(applicationException.getCause());
    }

    @Test
    void testApplicationExceptionThrowableConstructor(){
        String message = "Test with message and constructor";
        Throwable throwable = new RuntimeException("Throwable cause test...");

        ApplicationException applicationException = new ApplicationException(message, throwable);

        assertEquals(message, applicationException.getMessage());
        assertEquals(throwable, applicationException.getCause());
    }





    @Test
    void testPasswordHashException(){
        String message = "Exception occurred while hashing password.";

        ApplicationException.PasswordHashException passwordHashException = new ApplicationException.PasswordHashException(message);

        assertEquals(message, passwordHashException.getMessage());
        assertTrue(passwordHashException instanceof ApplicationException);
        assertNull(passwordHashException.getCause());
    }

    @Test
    void testPasswordValidationException(){
        String message = "An exception occurred while validating the password.";

        ApplicationException.PasswordValidationException passwordValidationException = new ApplicationException.PasswordValidationException(message);

        assertEquals(message, passwordValidationException.getMessage());
        assertTrue(passwordValidationException instanceof ApplicationException);
        assertNull(passwordValidationException.getCause());

    }

    @Test
    void testEnvironmentVariableException(){
        String message = "An exception occurred while validating an environmental variable.";


        ApplicationException.EnvironmentVariableException environmentVariableException = new ApplicationException.EnvironmentVariableException(message);

        assertEquals(message, environmentVariableException.getMessage());
        assertTrue(environmentVariableException instanceof ApplicationException);
        assertNull(environmentVariableException.getCause());

    }


    @Test
    void testInputException(){
        String message = "An exception occurred while validating input.";


        ApplicationException.InputException inputException = new ApplicationException.InputException(message);

        assertEquals(message, inputException.getMessage());
        assertTrue(inputException instanceof ApplicationException);
        assertNull(inputException.getCause());
    }


    @Test
    void testConfigurationException(){
        String message = "A configuration exception occurred.";

        ApplicationException.ConfigurationException configurationException = new ApplicationException.ConfigurationException(message);

        assertEquals(message, configurationException.getMessage());
        assertTrue(configurationException instanceof ApplicationException);
        assertNull(configurationException.getCause());

    }

    @Test
    void testNoMatchException(){
        String message = "Exception occurred: No match was found.";

        ApplicationException.NoMatchException noMatchException = new ApplicationException.NoMatchException(message);

        assertEquals(message, noMatchException.getMessage());
        assertTrue(noMatchException instanceof ApplicationException);
        assertNull(noMatchException.getCause());

    }

}