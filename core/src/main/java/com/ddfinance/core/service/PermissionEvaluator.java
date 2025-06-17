package com.ddfinance.core.service;

import com.ddfinance.core.domain.UserAccount;
import com.ddfinance.core.domain.enums.Permissions;

public interface PermissionEvaluator {


    /**
     * Validate that a UserAccount has required permissions to work with desired resource
     *
     * @param userAccount entity
     * @param permissionType- required permission
     * @param resourceObject - the resource for desired work
     * @return boolean - true if permitted, false if not
     *
     */
    boolean hasPermission(UserAccount userAccount, Permissions permissionType, Object resourceObject);
}
