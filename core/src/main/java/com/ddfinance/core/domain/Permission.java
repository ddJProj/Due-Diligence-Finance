package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Permissions;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Permission entity - persisted in permission table
 */
@Setter
@Getter
@Entity
// use table "permission"
@Table(name = "permission")
@NoArgsConstructor
public class Permission {

    // ID value for permission, auto generated, use lombok for access
    @Id
    // auto generate the id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    // type matches enum value from Permissions
    @Enumerated(EnumType.STRING)
    // set table row constraints for perm type
    @Column(unique = true, nullable = false)
    private Permissions permissionType;

    private String description;



    /**
     * 2 Param constructor added for non-default calls
     */
    public Permission(Permissions permissionType, String permissionDescription) {
        this.permissionType = permissionType;
        this.description = permissionDescription;
    }

}
