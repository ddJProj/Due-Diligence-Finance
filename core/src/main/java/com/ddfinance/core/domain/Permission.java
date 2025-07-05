package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Permissions;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.proxy.HibernateProxy;

import java.util.Objects;

/**
 * Permission entity - persisted in permission table
 */
@Setter
@Getter
@Entity
// use table "permission"
@Table(name = "permissions")
@NoArgsConstructor
@ToString
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

//    @ManyToMany(mappedBy = "permissions")
//    private Set<UserAccount> userAccounts = new HashSet<>();


    /**
     * 2 Param constructor added for non-default calls
     */
    public Permission(Permissions permissionType, String permissionDescription) {
        this.permissionType = permissionType;
        this.description = permissionDescription;
    }

    @Override
    public final boolean equals(Object o) {
        if (this == o) return true;
        if (o == null) return false;
        Class<?> oEffectiveClass = o instanceof HibernateProxy ? ((HibernateProxy) o).getHibernateLazyInitializer().getPersistentClass() : o.getClass();
        Class<?> thisEffectiveClass = this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass() : this.getClass();
        if (thisEffectiveClass != oEffectiveClass) return false;
        Permission that = (Permission) o;
        return getId() != null && Objects.equals(getId(), that.getId());
    }

    @Override
    public final int hashCode() {
        return this instanceof HibernateProxy ? ((HibernateProxy) this).getHibernateLazyInitializer().getPersistentClass().hashCode() : getClass().hashCode();
    }
}
