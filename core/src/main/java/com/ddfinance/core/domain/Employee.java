package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

    /**
     * Employee entity representing an employee in the investment management system
     * An employee is associated with a UserAccount and can manage multiple Clients
     */
    @Entity
    @Table(name = "employees")
    @Getter
    @Setter
    @NoArgsConstructor
    @ToString(exclude = {"clients"}) // Prevent circular references
    @EqualsAndHashCode(onlyExplicitlyIncluded = true)
    public class Employee {

        @Id
        @GeneratedValue(strategy = GenerationType.AUTO)
        @Column(name = "employee_id_pk")
        @EqualsAndHashCode.Include
        private Long id;

        @Column(name = "employee_id", unique = true)
        private String employeeId;

        @OneToOne
        @JoinColumn(name = "user_id", unique = true, nullable = false)
        private UserAccount userAccount;

        @Column(name = "location_id")
        private String locationId = "HOMEBASE";

        @Column(name = "department")
        private String department = "GENERAL";

        @Column(name = "hire_date", nullable = false)
        private LocalDateTime hireDate;

        @Column(name = "salary")
        private Double salary;

        @Column(name = "manager_id")
        private String managerId;

        @Column(name = "is_active", nullable = false)
        private Boolean isActive = true;

        @OneToMany(mappedBy = "assignedEmployee", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
        private Set<Client> clientList = new HashSet<>();



        // Employee ID validation pattern (e.g., "FIN-NYC-001", "ADM-CHI-123")
        private static final Pattern EMPLOYEE_ID_PATTERN = Pattern.compile("^[A-Z]{3}-[A-Z]{2,3}-\\d{3,}$");

        /**
         * Constructor with UserAccount and employee ID
         * @param userAccount the user account associated with this employee
         * @param employeeId the unique employee identifier
         */
        public Employee(UserAccount userAccount, String employeeId) {
            this.userAccount = userAccount;
            this.employeeId = employeeId;
            this.hireDate = LocalDateTime.now();
            this.isActive = true;
            this.clientList = new HashSet<>();
        }

        /**
         * Constructor with UserAccount, location, and department
         * @param userAccount the user account associated with this employee
         * @param locationId the location/office of this employee
         * @param department the department this employee works in
         */
        public Employee(UserAccount userAccount, String locationId, String department) {
            this.userAccount = userAccount;
            this.locationId = locationId;
            this.department = department;
            this.hireDate = LocalDateTime.now();
            this.isActive = true;
            this.clientList = new HashSet<>();
        }

        // ========== Client Management Methods ==========

        /**
         * Add a client to this employee's responsibility
         * @param client the client to add
         */
        public void addClient(Client client) {
            if (client != null) {
                clientList.add(client);
                client.setAssignedEmployee(this);
            }
        }

        /**
         * Remove a client from this employee's responsibility
         * @param client the client to remove
         */
        public void removeClient(Client client) {
            if (client != null) {
                clientList.remove(client);
                client.setAssignedEmployee(null);
            }
        }

        /**
         * Get the number of clients assigned to this employee
         * @return the count of clients
         */
        public int getClientCount() {
            return clientList.size();
        }

        /**
         * Check if this employee has any assigned clients
         * @return true if employee has clients
         */
        public boolean hasClients() {
            return !clientList.isEmpty();
        }

        /**
         * Get all active clients assigned to this employee
         * @return set of active clients
         */
        public Set<Client> getActiveClients() {
            return clientList.stream()
                    .filter(client -> "ACTIVE".equals(client.getClientStatus()))
                    .collect(Collectors.toSet());
        }

        /**
         * Set clients and maintain bidirectional relationship
         * @param clientList new set of clients
         */
        public void setClientList(Set<Client> clientList) {
            // Clear existing relationships
            if (this.clientList != null) {
                this.clientList.forEach(client -> client.setAssignedEmployee(null));
            }

            this.clientList = clientList != null ? clientList : new HashSet<>();

            // Set new relationships
            this.clientList.forEach(client -> client.setAssignedEmployee(this));
        }

        // ========== Business Logic Methods ==========

        /**
         * Gets the employee's full name from the associated UserAccount.
         * @return full name in "FirstName LastName" format
         */
        public String getFullName() {
            if (userAccount != null) {
                return userAccount.getFullName();
            }
            return null;
        }

        /**
         * Get the employee's email from the associated UserAccount
         * @return email or null if no UserAccount
         */
        public String getEmployeeEmail() {
            return userAccount != null ? userAccount.getEmail() : null;
        }

        /**
         * Check if this employee can manage clients
         * @return true if employee is active and can manage clients
         */
        public boolean canManageClients() {
            return isActive != null && isActive;
        }

        /**
         * Check if this employee is in a specific department
         * @param departmentName the department to check
         * @return true if employee is in the department
         */
        public boolean isInDepartment(String departmentName) {
            return department != null &&
                    department.equalsIgnoreCase(departmentName);
        }

        /**
         * Check if this employee is at a specific location
         * @param location the location to check
         * @return true if employee is at the location
         */
        public boolean isAtLocation(String location) {
            return locationId != null &&
                    locationId.equalsIgnoreCase(location);
        }

        /**
         * Get the number of years this employee has been with the company
         * @return years of service
         */
        public long getYearsOfService() {
            if (hireDate == null) {
                return 0;
            }
            return ChronoUnit.YEARS.between(hireDate.toLocalDate(), LocalDateTime.now().toLocalDate());
        }

        // ========== Employee ID Management ==========

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
         * Generate an employee ID based on department, location, and database ID
         * Format: DEPT-LOC-### (ex: "FIN-NYC-001"
         */
        protected void generateEmployeeId() {
            if (id != null) {
                String deptCode = getDepartmentCode();
                String locCode = getLocationCode();
                String paddedId = String.format("%03d", id); // Pads with zeros: 001, 002, etc.
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
         * @return location code (2-3 letters)
         */
        private String getLocationCode() {
            if (locationId != null && locationId.length() >= 2) {
                return locationId.substring(0, Math.min(3, locationId.length())).toUpperCase();
            }
            return "HQ"; // Default location code for headquarters
        }

        // ========== Validation Methods ==========

        /**
         * Validate if this employee has all required fields
         * @return true if employee is valid
         */
        public boolean isValidEmployee() {
            return userAccount != null &&
                    hireDate != null &&
                    isActive != null;
        }

        /**
         * Validate if the employee ID follows the expected format
         * @return true if employee ID is valid
         */
        public boolean isValidEmployeeId() {
            return employeeId != null && EMPLOYEE_ID_PATTERN.matcher(employeeId).matches();
        }

        // ========== Status and Performance Methods ==========

        /**
         * Get the current status of this employee
         * @return status string (ACTIVE, INACTIVE, etc.)
         */
        public String getEmployeeStatus() {
            if (!isValidEmployee()) {
                return "INVALID";
            }

            return isActive ? "ACTIVE" : "INACTIVE";
        }

        /**
         * Get the workload level based on number of clients
         * @return workload level (LIGHT, MODERATE, HEAVY)
         */
        public String getWorkload() {
            int clientCount = getClientCount();

            if (clientCount == 0) {
                return "LIGHT";
            } else if (clientCount <= 5) {
                return "LIGHT";
            } else if (clientCount <= 10) {
                return "MODERATE";
            } else {
                return "HEAVY";
            }
        }

        // ========== JPA Lifecycle Methods ==========

        /**
         * Initialize hire date and active status if not set (for JPA lifecycle)
         */
        @PrePersist
        protected void onCreate() {
            if (hireDate == null) {
                hireDate = LocalDateTime.now();
            }
            if (isActive == null) {
                isActive = true;
            }
        }

        /**
         * Generate employee ID after entity is persisted and has database ID
         * Format: DEPT-LOCATION-ID (e.g., "FIN-NYC-001", "ADM-CHI-123")
         */
        @PostPersist
        protected void postPersist() {
            if (employeeId == null || employeeId.trim().isEmpty()) {
                generateEmployeeId();
            }
        }
    }
