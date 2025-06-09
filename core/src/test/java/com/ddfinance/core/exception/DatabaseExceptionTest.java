package com.ddfinance.core.exception;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseExceptionTest {
    @BeforeEach
    void setUp() {
    }


    @Test
    void testDatabaseExceptionMessageConstructor(){
        String message = "Test with only message.";

        DatabaseException databaseException = new DatabaseException(message);

        assertEquals(message, databaseException.getMessage());
        assertNull(databaseException.getCause());
    }

    @Test
    void testDatabaseExceptionThrowableConstructor(){
        String message = "Test with message and constructor";
        Throwable throwable = new RuntimeException("Throwable cause test...");

        DatabaseException databaseException= new DatabaseException(message, throwable);

        assertEquals(message, databaseException.getMessage());
        assertEquals(throwable, databaseException.getCause());
    }


    @Test
    void testConnectionException(){
        String message = "An exception occurred while connecting to the database.";

        DatabaseException.ConnectionException connectionException = new DatabaseException.ConnectionException(message);

        assertEquals(message, connectionException.getMessage());
        assertTrue(connectionException instanceof DatabaseException);
        assertNull(connectionException.getCause());
    }

    @Test
    void testNotFoundException(){
        String message = "An exception occurred while connecting to the database.";

        DatabaseException.ConnectionException notFoundException = new DatabaseException.ConnectionException(message);

        assertEquals(message, notFoundException.getMessage());
        assertTrue(notFoundException instanceof DatabaseException);
        assertNull(notFoundException.getCause());
    }


    @Test
    void testQueryException(){
        String message = "An exception occurred while connecting to the database.";

        DatabaseException.QueryException queryException = new DatabaseException.QueryException(message);

        assertEquals(message, queryException.getMessage());
        assertTrue(queryException instanceof DatabaseException);
        assertNull(queryException.getCause());
    }

    @Test
    void testTransactionException(){
        String message = "An exception occurred while connecting to the database.";

        DatabaseException.TransactionException transactionException = new DatabaseException.TransactionException(message);

        assertEquals(message, transactionException.getMessage());
        assertTrue(transactionException instanceof DatabaseException);
        assertNull(transactionException.getCause());
    }



    @AfterEach
    void tearDown() {
    }
}