package com.ddfinance.core.domain;

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

}
