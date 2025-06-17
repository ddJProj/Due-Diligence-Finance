package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

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



@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "user_account")
public class UserAccount {

    @Column(name="user_id")
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String email = "";

    private String password = "";

    private String firstName = "";

    private String lastName = "";

    private Role role;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_account_permissions",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    /**
     * parameterized UserAccount constructor
     *
     * @param email - email address for new UserAccount
     * @param password  - password for new UserAccount
     * @param firstName - first name of user for new UserAccount
     * @param lastName - last name of user for new UserAccount
     */
    public UserAccount(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = Role.GUEST; // default value
    }

    /**
     * parameterized UserAccount constructor with userRole
     *
     * @param email - email address for new UserAccount
     * @param password  - password for new UserAccount
     * @param firstName - first name of user for new UserAccount
     * @param lastName - last name of user for new UserAccount
     */
    public UserAccount(String email, String password, String firstName, String lastName, Role userRole) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = userRole;
    }






}
