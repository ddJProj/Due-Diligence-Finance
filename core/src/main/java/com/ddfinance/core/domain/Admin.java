package com.ddfinance.core.domain;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.*;

/**
 * Entity representing an admin user account with system-wide permissions.
 * Admins have the highest level of access and can manage all aspects of the system
 * including user accounts, system configuration, and financial operations oversight.
 *
 * @author DDFinance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "admins")
public class Admin {

        /**
         * Primary key for the admin record
         */
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        /**
         * The user account associated with this admin
         * Must be a user with ADMIN role
         */
        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_account_id", nullable = false, unique = true)
        private UserAccount userAccount;

        /**
         * Unique admin identifier following format ADM-XXX, SADM-XXX, etc.
         */
        @Column(name = "admin_id", unique = true, nullable = false, length = 20)
        private String adminId;

        @Column(name = "super_admin", nullable = false)
        private boolean superAdmin = false;

        @Column(name = "system_access_level", length = 50)
        private String systemAccessLevel = "FULL"; // FULL, LIMITED, READONLY

        @Column(length = 500)
        private String notes;


        /**
         * Department or area of administrative responsibility
         * Examples: System Administration, IT Security, Compliance, Investment Management
         */
        @Column(name = "department", length = 100)
        private String department;

        /**
         * Access level within admin hierarchy
         * Examples: SUPER_ADMIN, SYSTEM_ADMIN, FINANCIAL_ADMIN, COMPLIANCE_ADMIN
         */
        @Column(name = "access_level", length = 50)
        private String accessLevel;

        /**
         * Timestamp of the admin's last login for security tracking
         */
        @Column(name = "last_login_date")
        private LocalDateTime lastLoginDate;

        /**
         * Default constructor for JPA
         */
        public Admin() {
        }

        /**
         * Parameterized constructor for creating a new admin
         *
         * @param userAccount The user account with ADMIN role
         * @param adminId Unique admin identifier
         * @param department Administrative department
         * @param accessLevel Admin access level
         * @param lastLoginDate Last login timestamp
         */
        public Admin(UserAccount userAccount, String adminId, String department,
                     String accessLevel, LocalDateTime lastLoginDate) {
                this.userAccount = userAccount;
                this.adminId = adminId;
                this.department = department;
                this.accessLevel = accessLevel;
                this.lastLoginDate = lastLoginDate;
        }

        /**
         * Gets the unique identifier for this admin record
         *
         * @return The admin record ID
         */
        public Long getId() {
                return id;
        }

        /**
         * Sets the unique identifier for this admin record
         *
         * @param id The admin record ID
         * @return This Admin instance for method chaining
         */
        public Admin setId(Long id) {
                this.id = id;
                return this;
        }

        /**
         * Gets the user account associated with this admin
         *
         * @return The admin's user account
         */
        public UserAccount getUserAccount() {
                return userAccount;
        }

        /**
         * Sets the user account associated with this admin
         *
         * @param userAccount The admin's user account
         * @return This Admin instance for method chaining
         */
        public Admin setUserAccount(UserAccount userAccount) {
                this.userAccount = userAccount;
                return this;
        }

        /**
         * Gets the unique admin identifier
         *
         * @return The admin ID
         */
        public String getAdminId() {
                return adminId;
        }

        /**
         * Sets the unique admin identifier
         *
         * @param adminId The admin ID (format: ADM-XXX, SADM-XXX, etc.)
         * @return This Admin instance for method chaining
         */
        public Admin setAdminId(String adminId) {
                this.adminId = adminId;
                return this;
        }

        /**
         * Gets the administrative department
         *
         * @return The department name
         */
        public String getDepartment() {
                return department;
        }

        /**
         * Sets the administrative department
         *
         * @param department The department name
         * @return This Admin instance for method chaining
         */
        public Admin setDepartment(String department) {
                this.department = department;
                return this;
        }

        /**
         * Gets the admin access level
         *
         * @return The access level
         */
        public String getAccessLevel() {
                return accessLevel;
        }

        /**
         * Sets the admin access level
         *
         * @param accessLevel The access level
         * @return This Admin instance for method chaining
         */
        public Admin setAccessLevel(String accessLevel) {
                this.accessLevel = accessLevel;
                return this;
        }

        /**
         * Gets the last login date
         *
         * @return The last login timestamp
         */
        public LocalDateTime getLastLoginDate() {
                return lastLoginDate;
        }
        /**
         * Gets the admin's full name from the associated UserAccount.
         * @return full name or null if no UserAccount
         */
        public String getAdminName() {
                return userAccount != null ? userAccount.getFullName() : null;
        }

        /**
         * Gets the admin's email from the associated UserAccount.
         * @return email or null if no UserAccount
         */
        public String getAdminEmail() {
                return userAccount != null ? userAccount.getEmail() : null;
        }

        /**
         * Checks if this admin has full system access.
         * @return true if access level is FULL
         */
        public boolean hasFullAccess() {
                return "FULL".equals(systemAccessLevel);
        }
        /**
         * Sets the last login date
         *
         * @param lastLoginDate The last login timestamp
         * @return This Admin instance for method chaining
         */
        public Admin setLastLoginDate(LocalDateTime lastLoginDate) {
                this.lastLoginDate = lastLoginDate;
                return this;
        }

        /**
         * Updates the last login date to current time
         * Called when admin successfully logs into the system
         *
         * @return This Admin instance for method chaining
         */
        public Admin updateLastLogin() {
                this.lastLoginDate = LocalDateTime.now();
                return this;
        }

        /**
         * Checks if this admin has high-level system access
         * High-level access includes SUPER_ADMIN and SYSTEM_ADMIN levels
         *
         * @return true if admin has high-level access, false otherwise
         */
        public boolean hasHighLevelAccess() {
                if (accessLevel == null) return false;
                return accessLevel.equals("SUPER_ADMIN") || accessLevel.equals("SYSTEM_ADMIN");
        }

        /**
         * Checks if this admin is a system administrator
         * System admins manage technical infrastructure and user accounts
         *
         * @return true if admin is system admin, false otherwise
         */
        public boolean isSystemAdmin() {
                if (accessLevel == null) return false;
                return accessLevel.equals("SUPER_ADMIN") ||
                        accessLevel.equals("SYSTEM_ADMIN") ||
                        (department != null && department.contains("System Administration"));
        }

        /**
         * Checks if this admin is a financial administrator
         * Financial admins oversee investment operations and financial reporting
         *
         * @return true if admin is financial admin, false otherwise
         */
        public boolean isFinancialAdmin() {
                if (accessLevel == null) return false;
                return accessLevel.equals("SUPER_ADMIN") ||
                        accessLevel.equals("FINANCIAL_ADMIN") ||
                        (department != null && (department.contains("Investment Management") ||
                                department.contains("Financial Operations")));
        }

        /**
         * Checks if this admin is a compliance administrator
         * Compliance admins ensure regulatory adherence and risk management
         *
         * @return true if admin is compliance admin, false otherwise
         */
        public boolean isComplianceAdmin() {
                if (accessLevel == null) return false;
                return accessLevel.equals("SUPER_ADMIN") ||
                        accessLevel.equals("COMPLIANCE_ADMIN") ||
                        (department != null && (department.contains("Compliance") ||
                                department.contains("Risk Management")));
        }

        /**
         * Gets the admin's full name from the associated user account
         *
         * @return Full name or empty string if user account is null
         */
        public String getFullName() {
                if (userAccount == null) return "";
                return (userAccount.getFirstName() + " " + userAccount.getLastName()).trim();
        }

        /**
         * Gets the admin's email from the associated user account
         *
         * @return Email address or empty string if user account is null
         */
        public String getEmail() {
                if (userAccount == null) return "";
                return userAccount.getEmail() != null ? userAccount.getEmail() : "";
        }

        /**
         * Checks if the admin account is currently active
         * Based on user account status and recent login activity
         *
         * @return true if admin is active, false otherwise
         */
        public boolean isActive() {
                if (userAccount == null) return false;
                // Additional business logic could check last login date recency
                return true; // Simplified for now
        }

        @Override
        public boolean equals(Object o) {
                if (this == o) return true;
                if (o == null || getClass() != o.getClass()) return false;
                Admin admin = (Admin) o;
                return Objects.equals(id, admin.id) &&
                        Objects.equals(userAccount, admin.userAccount) &&
                        Objects.equals(adminId, admin.adminId) &&
                        Objects.equals(department, admin.department) &&
                        Objects.equals(accessLevel, admin.accessLevel) &&
                        Objects.equals(lastLoginDate, admin.lastLoginDate);
        }

        @Override
        public int hashCode() {
                return Objects.hash(id, userAccount, adminId, department, accessLevel, lastLoginDate);
        }

        @Override
        public String toString() {
                return "Admin{" +
                        "id=" + id +
                        ", userAccount=" + (userAccount != null ? userAccount.getEmail() : "null") +
                        ", adminId='" + adminId + '\'' +
                        ", department='" + department + '\'' +
                        ", accessLevel='" + accessLevel + '\'' +
                        ", lastLoginDate=" + lastLoginDate +
                        ", fullName='" + getFullName() + '\'' +
                        '}';
        }
}
