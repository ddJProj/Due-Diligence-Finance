package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;

public class UserAccount {

    private String email = "";
    private String password = "";
    private String firstName = "";
    private String lastName = "";
    private Role userRole;

    /**
     * Default UserAccount constructor
     */
    public UserAccount() {}

    /**
     * parameterized UserAccount constructor
     *
     * @param email
     * @param password
     * @param firstName
     * @param lastName
     */
    public UserAccount(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }


    public String getEmail() {
        return this.email;
    }

    public String getPassword() {
        return this.password;
    }

    public String getFirstName() {
        return this.firstName;
    }

    public String getLastName() {
        return this.lastName;
    }

    public void setRole(Role role) {
        this.userRole = role;
    }

    public Object getRole() {
        return this.userRole;
    }
}
