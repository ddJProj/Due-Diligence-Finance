package com.ddfinance.core.exception;

public class DatabaseException extends ApplicationException {
    public DatabaseException(String message, Throwable cause) {
        super(message, cause);
    }

    public DatabaseException(String message) {
        super(message);
    }

    public static class ConnectionException extends DatabaseException{
        public ConnectionException(String message){
            super(message);
        }
    }


    public static class QueryException extends DatabaseException{
        public QueryException(String message){
            super(message);
        }
    }


    public static class TransactionException extends DatabaseException{
        public TransactionException(String message){
            super(message);
        }
    }


    public static class NotFoundException extends DatabaseException{
        public NotFoundException(String message){
            super(message);
        }
    }


}
