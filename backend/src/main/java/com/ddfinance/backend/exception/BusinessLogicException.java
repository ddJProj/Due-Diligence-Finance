// BusinessLogicException.java
package com.ddfinance.backend.exception;

/**
 * Exception thrown when business logic validation fails.
 */
public class BusinessLogicException extends RuntimeException {
    public BusinessLogicException(String message) {
        super(message);
    }
}