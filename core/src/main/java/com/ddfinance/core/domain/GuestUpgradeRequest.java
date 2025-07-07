package com.ddfinance.core.domain;

import com.ddfinance.core.domain.enums.UpgradeRequestStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

/**
 * Entity representing a guest user's request to upgrade their account to client status.
 * This entity tracks the request lifecycle from creation through approval or rejection.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "guest_upgrade_requests")
@Data
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
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
    private UpgradeRequestStatus status = UpgradeRequestStatus.PENDING;

    /**
     * Additional details about the upgrade request
     * Can include justification, rejection reasons, etc.
     * Maximum length of 1000 characters
     */
    @Column(length = 1000)
    private String details;


    @Column(name = "processed_date")
    private LocalDateTime processedDate;

    @Column(name = "processed_by", length = 100)
    private String processedBy;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @ElementCollection
    @CollectionTable(
        name = "upgrade_request_additional_info",
            joinColumns = @JoinColumn(name = "request_id"))
    @MapKeyColumn(name = "info_key")
    @Column(name = "info_value")
    private Map<String, String> additionalInfo = new HashMap<>();


    @Column(name = "income_verification", nullable = false)
    private boolean incomeVerification = false;

    @Column(name = "identity_verification", nullable = false)
    private boolean identityVerification = false;

    @Column(name = "documents_provided", nullable = false)
    private boolean documentsProvided = false;

    /**
     * Constructor with required fields.
     */
    public GuestUpgradeRequest(UserAccount userAccount, String details) {
        this.userAccount = userAccount;
        this.details = details;
        this.requestDate = LocalDateTime.now();
        this.status = UpgradeRequestStatus.PENDING;
    }

    @PrePersist
    protected void onCreate() {
        if (requestDate == null) {
            requestDate = LocalDateTime.now();
        }
        if (status == null) {
            status = UpgradeRequestStatus.PENDING;
        }
    }

    /**
     * Fluent setter for UserAccount.
     * @return this instance for chaining
     */
    public GuestUpgradeRequest setUserAccount(UserAccount userAccount) {
        this.userAccount = userAccount;
        return this;
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
     * Fluent setter for status.
     * @return this instance for chaining
     */
    public GuestUpgradeRequest setStatus(UpgradeRequestStatus status) {
        this.status = status;
        return this;
    }

    /**
     * Fluent setter for details.
     * @return this instance for chaining
     */
    public GuestUpgradeRequest setDetails(String details) {
        this.details = details;
        return this;
    }

    /**
     * Checks if the request can be processed.
     * @return true if status is PENDING
     */
    public boolean canBeProcessed() {
        return status == UpgradeRequestStatus.PENDING;
    }

    /**
     * Checks if all required verifications are complete.
     * @return true if all verifications are done
     */
    public boolean isFullyVerified() {
        return incomeVerification && identityVerification && documentsProvided;
    }

    /**
     * Approves the request.
     * @param processedBy The admin who approved it
     */
    public void approve(String processedBy) {
        this.status = UpgradeRequestStatus.APPROVED;
        this.processedDate = LocalDateTime.now();
        this.processedBy = processedBy;
    }

    /**
     * Rejects the request.
     * @param processedBy The admin who rejected it
     * @param reason The rejection reason
     */
    public void reject(String processedBy, String reason) {
        this.status = UpgradeRequestStatus.REJECTED;
        this.processedDate = LocalDateTime.now();
        this.processedBy = processedBy;
        this.rejectionReason = reason;
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