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

/**
 * Client entity representing a client in the investment management system
 * A client is associated with a UserAccount and can be assigned to an Employee
 */
@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@ToString(exclude = {"investments", "assignedEmployee"}) // Prevent circular references
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "client_id_pk")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "client_id", unique = true, nullable = false)
    private String clientId;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private UserAccount userAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_employee_id")
    private Employee assignedEmployee;

    @Column(name = "registration_date", nullable = false)
    private LocalDateTime registrationDate;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Investment> investments = new HashSet<>();

    // Client ID validation pattern (e.g., "CLI-001", "NYC-123")
    private static final Pattern CLIENT_ID_PATTERN = Pattern.compile("^[A-Z]{3}-\\d{3,}$");

    /**
     * Constructor with UserAccount and generated client ID
     * @param userAccount the user account associated with this client
     * @param clientId the unique client identifier
     */
    public Client(UserAccount userAccount, String clientId) {
        this.userAccount = userAccount;
        this.clientId = clientId;
        this.registrationDate = LocalDateTime.now();
        this.investments = new HashSet<>();
    }

    /**
     * Constructor with UserAccount, client ID, and assigned employee
     * @param userAccount the user account associated with this client
     * @param clientId the unique client identifier
     * @param assignedEmployee the employee assigned to this client
     */
    public Client(UserAccount userAccount, String clientId, Employee assignedEmployee) {
        this.userAccount = userAccount;
        this.clientId = clientId;
        this.assignedEmployee = assignedEmployee;
        this.registrationDate = LocalDateTime.now();
        this.investments = new HashSet<>();
    }

    // ========== Investment Management Methods ==========

    /**
     * Add an investment to this client's portfolio
     * @param investment the investment to add
     */
    public void addInvestment(Investment investment) {
        if (investment != null) {
            investments.add(investment);
            investment.setClient(this);
        }
    }

    /**
     * Remove an investment from this client's portfolio
     * @param investment the investment to remove
     */
    public void removeInvestment(Investment investment) {
        if (investment != null) {
            investments.remove(investment);
            investment.setClient(null);
        }
    }

    /**
     * Get the number of investments for this client
     * @return the count of investments
     */
    public int getInvestmentCount() {
        return investments.size();
    }

    /**
     * Check if this client has any investments
     * @return true if client has investments
     */
    public boolean hasInvestments() {
        return !investments.isEmpty();
    }

    /**
     * Set investments and maintain bidirectional relationship
     * @param investments new set of investments
     */
    public void setInvestments(Set<Investment> investments) {
        // Clear existing relationships
        if (this.investments != null) {
            this.investments.forEach(inv -> inv.setClient(null));
        }

        this.investments = investments != null ? investments : new HashSet<>();

        // Set new relationships
        this.investments.forEach(inv -> inv.setClient(this));
    }

    // ========== Business Logic Methods ==========

    /**
     * Get the client's full name from the associated UserAccount
     * @return full name or null if no UserAccount
     */
    public String getClientName() {
        return userAccount != null ? userAccount.getFullName() : null;
    }

    /**
     * Get the client's email from the associated UserAccount
     * @return email or null if no UserAccount
     */
    public String getClientEmail() {
        return userAccount != null ? userAccount.getEmail() : null;
    }

    /**
     * Get the assigned employee's full name
     * @return employee name or null if no assigned employee
     */
    public String getAssignedEmployeeName() {
        return assignedEmployee != null ? assignedEmployee.getFullName() : null;
    }

    /**
     * Get the assigned employee's ID
     * @return employee ID or null if no assigned employee
     */
    public String getAssignedEmployeeId() {
        return assignedEmployee != null ? assignedEmployee.getEmployeeId() : null;
    }

    /**
     * Check if this client is assigned to an employee
     * @return true if assigned to an employee
     */
    public boolean isAssignedToEmployee() {
        return assignedEmployee != null;
    }

    // ========== Assignment Management ==========

    /**
     * Assign this client to an employee
     * @param employee the employee to assign to
     * @return true if assignment was successful
     */
    public boolean assignToEmployee(Employee employee) {
        if (employee == null) {
            return false;
        }

        // Remove from previous employee if exists
        if (this.assignedEmployee != null) {
            this.assignedEmployee.getClients().remove(this);
        }

        this.assignedEmployee = employee;
        employee.getClients().add(this);
        return true;
    }

    /**
     * Unassign this client from their current employee
     */
    public void unassignFromEmployee() {
        if (assignedEmployee != null) {
            assignedEmployee.getClients().remove(this);
            this.assignedEmployee = null;
        }
    }

    // ========== Validation Methods ==========

    /**
     * Validate if this client has all required fields
     * @return true if client is valid
     */
    public boolean isValidClient() {
        return clientId != null && !clientId.trim().isEmpty() &&
                userAccount != null &&
                registrationDate != null;
    }

    /**
     * Validate if the client ID follows the expected format
     * @return true if client ID is valid
     */
    public boolean isValidClientId() {
        return clientId != null && CLIENT_ID_PATTERN.matcher(clientId).matches();
    }

    // ========== Status and Metrics ==========

    /**
     * Get the current status of this client
     * @return status string (PENDING, ACTIVE, etc.)
     */
    public String getClientStatus() {
        if (!isValidClient()) {
            return "INVALID";
        }

        if (!isAssignedToEmployee()) {
            return "PENDING";
        }

        return "ACTIVE";
    }

    /**
     * Get the number of days since registration
     * @return days since registration
     */
    public long getDaysSinceRegistration() {
        if (registrationDate == null) {
            return 0;
        }
        return ChronoUnit.DAYS.between(registrationDate.toLocalDate(), LocalDateTime.now().toLocalDate());
    }

    /**
     * Initialize registration date if not set (for JPA lifecycle)
     */
    @PrePersist
    protected void onCreate() {
        if (registrationDate == null) {
            registrationDate = LocalDateTime.now();
        }
    }

    /**
     * Generate client ID after entity is persisted and has database ID
     * Format: LOCATION-ID (e.g., "CLI-001", "NYC-123")
     */
    @PostPersist
    protected void postPersist() {
        if (clientId == null || clientId.trim().isEmpty()) {
            generateClientId();
        }
    }

    /**
     * Generate a client ID based on location and database ID
     * Uses employee's location if assigned, otherwise defaults to "CLI"
     */
    protected void generateClientId() {
        if (id != null) {
            String locationCode = getLocationCode();
            String paddedId = String.format("%03d", id); // Pads with zeros: 001, 002, etc.
            this.clientId = locationCode + "-" + paddedId;

            // Note: This will require a second database update to save the generated clientId
            // Consider using a repository injection or service call here if needed
        }
    }

    /**
     * Get the location code for client ID generation
     * @return location code (3 letters)
     */
    private String getLocationCode() {
        if (assignedEmployee != null && assignedEmployee.getLocationId() != null) {
            return assignedEmployee.getLocationId().substring(0, Math.min(3, assignedEmployee.getLocationId().length())).toUpperCase();
        }
        return "CLI"; // Default location code
    }
}
