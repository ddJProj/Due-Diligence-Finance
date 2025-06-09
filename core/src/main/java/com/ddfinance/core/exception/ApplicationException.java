package com.ddfinance.core.exception;

public class ApplicationException extends Exception {

    public ApplicationException(String message, Throwable cause) {
        super(message, cause);
    }

    public ApplicationException(String message) {
        super(message);
    }

    public static class PasswordHashException extends ApplicationException {
        public PasswordHashException(String message) {
            super(message);
        }
    }
    public static class PasswordValidationException extends ApplicationException{
        public PasswordValidationException(String message){
            super(message);
        }
    }
    public static class EnvironmentVariableException extends ApplicationException{
        public EnvironmentVariableException(String message){
            super(message);
        }
    }
    public static class InputException extends ApplicationException{
        public InputException(String message){
            super(message);
        }
    }
    public static class ConfigurationException extends ApplicationException{
        public ConfigurationException(String message){
            super(message);
        }
    }

    public static class NoMatchException extends ApplicationException{
        public NoMatchException(String message){
            super(message);
        }
    }

}