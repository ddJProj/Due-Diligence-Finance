package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;


/**
 * employee entity stub for testing (client initially)
 * will be fully implemented later
 */
@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "employee_id_pk")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "employee_id", unique = true)
    private String employeeId;

    @Column(name = "location_id")
    private String locationId = "HOMEBASE"; // Default location

    @Column(name = "department")
    private String department = "GENERAL"; // Default department

    @Column(name = "hire_date")
    private LocalDateTime hireDate;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private UserAccount userAccount;

    @OneToMany(mappedBy = "assignedEmployee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Client> clients = new HashSet<>();

    public Employee(UserAccount userAccount, String employeeId) {
        this.userAccount = userAccount;
        this.employeeId = employeeId;
        this.hireDate = LocalDateTime.now();
    }

    public Employee(UserAccount userAccount, String locationId, String department) {
        this.userAccount = userAccount;
        this.locationId = locationId;
        this.department = department;
        this.hireDate = LocalDateTime.now();
    }

    /**
     * Get employee ID, generating it if necessary
     * @return employee ID in format "DEPT-LOC-###"
     */
    public String getEmployeeId() {
        if (employeeId == null || employeeId.trim().isEmpty()) {
            generateEmployeeId();
        }
        return employeeId;
    }

    /**
     * Initialize hire date if not set (for JPA lifecycle)
     */
    @PrePersist
    protected void onCreate() {
        if (hireDate == null) {
            hireDate = LocalDateTime.now();
        }
    }

    /**
     * Generate employee ID after entity is persisted and has database ID
     * Format: DEPT-LOC-### (ex: "FIN-NYC-001"
     */
    @PostPersist
    protected void postPersist() {
        if (employeeId == null || employeeId.trim().isEmpty()) {
            generateEmployeeId();
        }
    }

    /**
     * Generate an employee ID based on department, location, and database ID
     * Format: DEPT-LOC-### (ex: "FIN-NYC-001"
     */
    protected void generateEmployeeId() {
        if (id != null) {
            String deptCode = getDepartmentCode();
            String locCode = getLocationCode();
            String paddedId = String.format("%03d", id); // pad with zeros: 001, 002, etc.
            this.employeeId = deptCode + "-" + locCode + "-" + paddedId;

            // Require a second database update to save the generated employeeId
            // use repository injection or service call here?
        }
    }

    /**
     * Get the department code for employee ID generation
     * @return department code (3 letters)
     */
    private String getDepartmentCode() {
        if (department != null && department.length() >= 3) {
            return department.substring(0, 3).toUpperCase();
        }
        return "GEN"; // Default department code
    }

    /**
     * Get the location code for employee ID generation
     * @return location code (3 letters)
     */
    private String getLocationCode() {
        if (locationId != null && locationId.length() >= 3) {
            return locationId.substring(0, 3).toUpperCase();
        }
        return "HQ"; // Default location code for headquarters
    }

    public String getFullName() {
        return userAccount != null ? userAccount.getFullName() : null;
    }
}
