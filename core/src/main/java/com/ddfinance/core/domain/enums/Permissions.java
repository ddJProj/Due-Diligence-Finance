package com.ddfinance.core.domain.enums;

import lombok.Getter;

@Getter
public enum Permissions {

    /**
     * Client level permissions
     */
    VIEW_CLIENT("Views the details of a specific client account instance");


    private final String description;

    Permissions(String description) {
        this.description = description;
    }
}
