package com.ddfinance.core.service;

import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;

import java.util.HashSet;
import java.util.Set;

import static com.ddfinance.core.domain.enums.Permissions.*;


public class RolePermissionService {


    private Set<Permissions> permissions;




    public Set<Permissions> getPermissionsByRole(Role role) {
        permissions = new HashSet<>();

        // list of general permissions for any UserAccount type
        permissions.add(VIEW_ACCOUNT);
        permissions.add(EDIT_MY_DETAILS);
        permissions.add(UPDATE_MY_PASSWORD);
        permissions.add(CREATE_USER);

        switch (role) {
            case GUEST:
                permissions.add(REQUEST_CLIENT_ACCOUNT);
                break;
            case CLIENT:
                permissions.add(VIEW_INVESTMENT);
                permissions.add(MESSAGE_PARTNER);
                break;
            case EMPLOYEE:
                permissions.add(CREATE_INVESTMENT);
                permissions.add(EDIT_INVESTMENT);
                permissions.add(CREATE_CLIENT);
                permissions.add(EDIT_CLIENT);
                permissions.add(VIEW_CLIENT);
                permissions.add(VIEW_CLIENTS);
                permissions.add(ASSIGN_CLIENT);
                permissions.add(VIEW_EMPLOYEE);
                permissions.add(VIEW_EMPLOYEES);
                break;

            case ADMIN:
                permissions = Permissions.getAllPermissions();
                break;

            default:
                break;

        }

        return permissions;
    }
}
