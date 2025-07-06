package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing a contact request from guests or potential clients.
 * Used to track sales inquiries and follow-ups.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "contact_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class ContactRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false, length = 50)
    private String source; // GUEST_PORTAL, WEBSITE, REFERRAL, etc.

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(nullable = false, length = 20)
    private String status = "NEW"; // NEW, CONTACTED, QUALIFIED, CONVERTED, CLOSED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private Employee assignedTo;

    @Column(name = "contacted_at")
    private LocalDateTime contactedAt;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(length = 2000)
    private String notes;

    @Column(name = "conversion_date")
    private LocalDateTime conversionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "converted_to_client")
    private Client convertedToClient;

    @PrePersist
    protected void onCreate() {
        if (submittedAt == null) {
            submittedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "NEW";
        }
    }
}
