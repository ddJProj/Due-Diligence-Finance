package com.ddfinance.core.domain.enums;

import lombok.Getter;

import java.util.EnumSet;
import java.util.Set;

@Getter
public enum Permissions {



    /**
     * UserAccount level:
     */
    VIEW_ACCOUNT("View the details of you UserAccount."),
    EDIT_MY_DETAILS("Edits the account details of this specific UserAccount instance."),
    UPDATE_MY_PASSWORD("Updates the stored password for this UserAccount's own password."),
    CREATE_USER("Creates a new UserAccount."),

    /**
     * Guest level:
     */
    REQUEST_CLIENT_ACCOUNT("Request upgrade to Client account status with the firm."),


    /**
     * Client level:
     */
    VIEW_INVESTMENT("Views the details of a specific investment for this Client account instance."),
    MESSAGE_PARTNER("Direct message to the Employee that a Client is partnered with at the firm. Used to modify investments, etc."),


    /**
     * Employee level:
     */
    CREATE_CLIENT("Creates a client account from by upgrading an existing Guest account."),
    EDIT_CLIENT("Edits the details of an existing Client account."),
    VIEW_CLIENT("Views the details of a specific client account instance"),
    VIEW_CLIENTS("Lists the details of all Client account instances"),
    ASSIGN_CLIENT("Assigns an individual Client account instance to an Employee partner."),
    CREATE_INVESTMENT("Creates a new investment for a specific Client account instance."),
    EDIT_INVESTMENT("Edits an existing investment for a specific Client account instance."),
    VIEW_EMPLOYEES("Lists the details of all Employee account instances."),
    VIEW_EMPLOYEE("Lists the details of a specific Employee account instance."),

    /**
     * Admin level:
     */
    EDIT_USER("Edits the details of a specific UserAccount."),
    DELETE_USER("Removes a UserAccount from the system."),
    EDIT_EMPLOYEE("Edit the details of a specific Employee account instance."),
    CREATE_EMPLOYEE("Creates a new Employee account instance."),
    UPDATE_OTHER_PASSWORD("Updates the stored password for the target UserAccount."),
    VIEW_ACCOUNTS("View all UserAccounts and details.");



    private final String description;

    Permissions(String description) {
        this.description = description;

    }

    /**
     *
     * @return
     */
    public static Set<Permissions> getAllPermissions() {
        return EnumSet.allOf(Permissions.class);
    }

}
