package com.ddfinance.core.service;

import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;

public class UserPermissionEvaluatorService implements PermissionEvaluator {
    @Override
    public boolean hasPermission(UserAccount userAccount, Permissions permissionType, Object resourceObject) {
        if(userAccount.getRole() == Role.ADMIN){
            return true;
        }
        if (resourceObject != null){
            // TODO: implement object specific checks
            return false;
        }
        return userAccount.getPermissions().stream() // create stream from permissions for this account
                .anyMatch(p->p.getPermissionType() == permissionType);  // creates stream from permissions for this account
    }

}
