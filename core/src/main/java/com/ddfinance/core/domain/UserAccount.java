package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Role;
import lombok.Getter;
import lombok.Setter;

/**
 * Use the following format commit msgs for TDD cycle.
 *

 * Red
 Test-Class: affected attribute/methods/class test added

 * Green:
 Impl-Class: affected attribute/methods/class implementation added

 * Refactor:
 Refactor-Class: affected attribute/methods/class impl improved

 *
 *
 */



public class UserAccount {

    @Setter
    @Getter
    private String email = "";

    @Getter
    private String password = "";

    @Getter
    private String firstName = "";

    @Getter
    private String lastName = "";

    @Getter
    @Setter
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
        this.userRole = Role.guest; // default value
    }

    /**
     * parameterized UserAccount constructor with userRole
     *
     * @param email
     * @param password
     * @param firstName
     * @param lastName
     */
    public UserAccount(String email, String password, String firstName, String lastName, Role userRole) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.userRole = userRole;
    }

    public Role getRole() {
        return this.userRole;
    }

    public void setRole(Role role) {
        this.userRole = role;
    }
}
