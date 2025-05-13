package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Permissions;
import lombok.Getter;
import lombok.Setter;

/**
 * Permission entity - persisted in permission table
 */
@Setter
@Getter
public class Permission {

    // ID value for permission, auto generated, use lombok for access
    private Long id;

    /**
     * Default constructor
     */
    public Permission() {}


    /**
     * 2 Param constructor added for non-default calls
     */
    public Permission(Permissions permissionType, String permissionDescription) {

    }

}
