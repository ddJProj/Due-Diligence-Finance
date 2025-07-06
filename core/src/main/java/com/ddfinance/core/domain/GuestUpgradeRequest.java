package com.ddfinance.core.domain;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

import com.ddfinance.core.domain.enums.UpgradeRequestStatus;

import jakarta.persistence.*;

/**
 * Entity representing a guest user's request to upgrade their account to client status.
 * This entity tracks the request lifecycle from creation through approval or rejection.
 *
 * @author DDFinance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "guest_upgrade_requests")
public class GuestUpgradeRequest {

    /**
     * Primary key for the upgrade request
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user account making the upgrade request
     * Must be a user with GUEST role
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    /**
     * Date and time when the upgrade request was submitted
     */
    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    /**
     * Current status of the upgrade request
     * Can be PENDING, APPROVED, or REJECTED
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private UpgradeRequestStatus status;

    /**
     * Additional details about the upgrade request
     * Can include justification, rejection reasons, etc.
     * Maximum length of 1000 characters
     */
    @Column(name = "details", length = 1000)
    private String details;


    @Column(name = "processed_date")
    private LocalDateTime processedDate;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @ElementCollection
    @CollectionTable(name = "upgrade_request_additional_info",
            joinColumns = @JoinColumn(name = "request_id"))
    @MapKeyColumn(name = "info_key")
    @Column(name = "info_value", length = 1000)
    private Map<String, Object> additionalInfo = new HashMap<>();





    /**
     * Default constructor for JPA
     */
    public GuestUpgradeRequest() {
    }

    /**
     * Parameterized constructor for creating a new upgrade request
     *
     * @param userAccount The user account requesting the upgrade
     * @param requestDate The date and time of the request
     * @param status The initial status of the request
     * @param details Additional details about the request
     */
    public GuestUpgradeRequest(UserAccount userAccount, LocalDateTime requestDate,
                               UpgradeRequestStatus status, String details) {
        this.userAccount = userAccount;
        this.requestDate = requestDate;
        this.status = status;
        this.details = details;
    }

    /**
     * Gets the unique identifier for this upgrade request
     *
     * @return The request ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the unique identifier for this upgrade request
     *
     * @param id The request ID
     * @return This GuestUpgradeRequest instance for method chaining
     */
    public GuestUpgradeRequest setId(Long id) {
        this.id = id;
        return this;
    }

    /**
     * Gets the user account associated with this upgrade request
     *
     * @return The user account
     */
    public UserAccount getUserAccount() {
        return userAccount;
    }

    /**
     * Sets the user account associated with this upgrade request
     *
     * @param userAccount The user account requesting the upgrade
     * @return This GuestUpgradeRequest instance for method chaining
     */
    public GuestUpgradeRequest setUserAccount(UserAccount userAccount) {
        this.userAccount = userAccount;
        return this;
    }

    /**
     * Gets the date and time when this upgrade request was submitted
     *
     * @return The request date
     */
    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    /**
     * Sets the date and time when this upgrade request was submitted
     *
     * @param requestDate The request date
     * @return This GuestUpgradeRequest instance for method chaining
     */
    public GuestUpgradeRequest setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
        return this;
    }

    /**
     * Gets the current status of this upgrade request
     *
     * @return The request status
     */
    public UpgradeRequestStatus getStatus() {
        return status;
    }

    /**
     * Sets the current status of this upgrade request
     *
     * @param status The request status
     * @return This GuestUpgradeRequest instance for method chaining
     */
    public GuestUpgradeRequest setStatus(UpgradeRequestStatus status) {
        this.status = status;
        return this;
    }

    /**
     * Gets the additional details about this upgrade request
     *
     * @return The request details
     */
    public String getDetails() {
        return details;
    }

    /**
     * Sets the additional details about this upgrade request
     *
     * @param details The request details (max 1000 characters)
     * @return This GuestUpgradeRequest instance for method chaining
     */
    public GuestUpgradeRequest setDetails(String details) {
        this.details = details;
        return this;
    }

    /**
     * Checks if this upgrade request is currently pending
     *
     * @return true if the status is PENDING, false otherwise
     */
    public boolean isPending() {
        return status == UpgradeRequestStatus.PENDING;
    }

    /**
     * Checks if this upgrade request has been approved
     *
     * @return true if the status is APPROVED, false otherwise
     */
    public boolean isApproved() {
        return status == UpgradeRequestStatus.APPROVED;
    }

    /**
     * Checks if this upgrade request has been rejected
     *
     * @return true if the status is REJECTED, false otherwise
     */
    public boolean isRejected() {
        return status == UpgradeRequestStatus.REJECTED;
    }

    /**
     * Marks this upgrade request as approved
     *
     * @return This GuestUpgradeRequest instance for method chaining
     */
    public GuestUpgradeRequest approve() {
        this.status = UpgradeRequestStatus.APPROVED;
        return this;
    }

    /**
     * Marks this upgrade request as rejected with a reason
     *
     * @param rejectionReason The reason for rejection
     * @return This GuestUpgradeRequest instance for method chaining
     */
    public GuestUpgradeRequest reject(String rejectionReason) {
        this.status = UpgradeRequestStatus.REJECTED;
        this.details = "Reason for Rejection: " + rejectionReason;
        return this;
    }


    /**
     * Process this upgrade request.
     * @param status the new status (APPROVED or REJECTED)
     * @param processedBy the user who processed the request
     * @param reason rejection reason if status is REJECTED
     */
    public void processRequest(UpgradeRequestStatus status, String processedBy, String reason) {
        if (!status.isProcessed()) {
            throw new IllegalArgumentException("Status must be APPROVED or REJECTED");
        }

        this.status = status;
        this.processedDate = LocalDateTime.now();
        this.processedBy = processedBy;

        if (status == UpgradeRequestStatus.REJECTED) {
            this.rejectionReason = reason;
        }
    }


    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GuestUpgradeRequest that = (GuestUpgradeRequest) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(userAccount, that.userAccount) &&
                Objects.equals(requestDate, that.requestDate) &&
                status == that.status &&
                Objects.equals(details, that.details);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, userAccount, requestDate, status, details);
    }

    @Override
    public String toString() {
        return "GuestUpgradeRequest{" +
                "id=" + id +
                ", userAccount=" + (userAccount != null ? userAccount.getEmail() : "null") +
                ", requestDate=" + requestDate +
                ", status=" + status +
                ", details='" + details + '\'' +
                '}';
    }
}