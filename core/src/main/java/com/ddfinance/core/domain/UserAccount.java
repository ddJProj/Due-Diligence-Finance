package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.Permission;
import com.ddfinance.core.domain.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;


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
@ToString(exclude = {"password", "permissions"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UserAccount {

    @Column(name="user_id")
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @EqualsAndHashCode.Include
    private Long id;


    @Column(name = "email", nullable = false, unique = true)
    private String email = "";

    @Column(name = "password", nullable = false)
    private String password = "";

    @Column(name = "first_name", nullable = false)
    private String firstName = "";

    @Column(name = "last_name", nullable = false)
    private String lastName = "";

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private Role role = Role.GUEST;

    @ManyToMany(fetch = FetchType.EAGER, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "user_account_permissions",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(length = 500)
    private String address;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "password_reset_required", nullable = false)
    private boolean passwordResetRequired = false;

    @Column(nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ========== NEW FIELDS ADDED FOR ADMINSERVICEIMPL ==========

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "last_modified_date")
    private LocalDateTime lastModifiedDate;

    @Column(name = "account_locked", nullable = false)
    private boolean accountLocked = false;

    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts = 0;

    @Column(name = "lock_expiry_time")
    private LocalDateTime lockExpiryTime;

    // ========== END NEW FIELDS ==========

    // Email validation pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    );

    /**
     * Constructor with basic user information (defaults to GUEST role)
     * @param email user's email address
     * @param password user's password (should be hashed)
     * @param firstName user's first name
     * @param lastName user's last name
     */
    public UserAccount(String email, String password, String firstName, String lastName) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = Role.GUEST;
        this.permissions = new HashSet<>();
        this.createdDate = LocalDateTime.now();
    }

    /**
     * Constructor with role specification
     * @param email user's email address
     * @param password user's password (should be hashed)
     * @param firstName user's first name
     * @param lastName user's last name
     * @param role user's role in the system
     */
    public UserAccount(String email, String password, String firstName, String lastName, Role role) {
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.permissions = new HashSet<>();
        this.createdDate = LocalDateTime.now();
    }

    // ========== JPA Lifecycle Methods ==========

    @PrePersist
    protected void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
        if (lastModifiedDate == null) {
            lastModifiedDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastModifiedDate = LocalDateTime.now();
    }

    // ========== Permission Management Methods ==========

    /**
     * Add a permission to this user account
     * @param permission the permission to add
     */
    public void addPermission(Permission permission) {
        if (permission != null) {
            this.permissions.add(permission);
        }
    }

    /**
     * Remove a permission from this user account
     * @param permission the permission to remove
     */
    public void removePermission(Permission permission) {
        this.permissions.remove(permission);
    }

    /**
     * Check if this user has a specific permission
     * @param permissionType the permission type to check
     * @return true if user has the permission
     */
    public boolean hasPermission(Permissions permissionType) {
        return permissions.stream()
                .anyMatch(p -> p.getPermissionType() == permissionType);
    }

    /**
     * Check if this user has a specific permission (overloaded for Permission object)
     * @param permission the permission to check
     * @return true if user has the permission
     */
    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }

    /**
     * Clear all permissions for this user
     */
    public void clearPermissions() {
        this.permissions.clear();
    }

    /**
     * Set all permissions for this user (replaces existing permissions)
     * @param permissions new set of permissions
     */
    public void setPermissions(Set<Permission> permissions) {
        this.permissions = permissions != null ? permissions : new HashSet<>();
    }

    // ========== Business Logic Methods ==========

    /**
     * Gets the user's full name.
     * @return full name in "FirstName LastName" format
     */
    public String getFullName() {
        StringBuilder fullName = new StringBuilder();
        if (firstName != null) {
            fullName.append(firstName);
        }
        if (lastName != null) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(lastName);
        }
        return fullName.toString();
    }

    /**
     * Check if this user is an admin
     * @return true if role is ADMIN
     */
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    /**
     * Check if this user is an employee
     * @return true if role is EMPLOYEE
     */
    public boolean isEmployee() {
        return role == Role.EMPLOYEE;
    }

    /**
     * Check if this user is a client
     * @return true if role is CLIENT
     */
    public boolean isClient() {
        return role == Role.CLIENT;
    }

    /**
     * Check if this user is a guest
     * @return true if role is GUEST
     */
    public boolean isGuest() {
        return role == Role.GUEST;
    }

    /**
     * Check if this user can upgrade to a target role
     * @param targetRole the role to upgrade to
     * @return true if upgrade is possible
     */
    public boolean canUpgradeRole(Role targetRole) {
        return this.role.canUpgradeTo(targetRole);
    }

    /**
     * Upgrade the user's role if possible
     * @param targetRole the role to upgrade to
     * @return true if upgrade was successful
     */
    public boolean upgradeRole(Role targetRole) {
        if (canUpgradeRole(targetRole)) {
            this.role = targetRole;
            return true;
        }
        return false;
    }

    // ========== Validation Methods ==========

    /**
     * Validate if the email format is correct
     * @return true if email is valid
     */
    public boolean isValidEmail() {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    /**
     * Check if all required fields are filled
     * @return true if account is complete
     */
    public boolean isComplete() {
        return email != null && !email.trim().isEmpty() &&
                password != null && !password.trim().isEmpty() &&
                firstName != null && !firstName.trim().isEmpty() &&
                lastName != null && !lastName.trim().isEmpty() &&
                role != null;
    }

    /**
     * Check if this user can manage other users
     * @return true if role allows user management
     */
    public boolean canManageUsers() {
        return role.canManageUsers();
    }

    /**
     * Check if this user can approve client upgrades
     * @return true if role allows approving upgrades
     */
    public boolean canApproveClientUpgrades() {
        return role.canApproveClientUpgrades();
    }

    /**
     * Checks if the account is currently locked.
     * @return true if account is locked and lock hasn't expired
     */
    public boolean isCurrentlyLocked() {
        return accountLocked && (lockExpiryTime == null || lockExpiryTime.isAfter(LocalDateTime.now()));
    }

    /**
     * Alias for password field to support different naming conventions
     * @return the hashed password
     */
    public String getHashedPassword() {
        return this.password;
    }

    /**
     * Alias for password field to support different naming conventions
     * @param hashedPassword the hashed password to set
     */
    public void setHashedPassword(String hashedPassword) {
        this.password = hashedPassword;
    }
}