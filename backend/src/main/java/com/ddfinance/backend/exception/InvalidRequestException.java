// InvalidRequestException.java
package com.ddfinance.backend.exception;

/**
 * Exception thrown when request data is invalid.
 */
public class InvalidRequestException extends RuntimeException {
    public InvalidRequestException(String message) {
        super(message);
    }
}
