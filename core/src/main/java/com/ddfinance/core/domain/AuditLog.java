package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing audit logs for administrative actions.
 * Tracks all significant system changes and administrative operations.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_email", nullable = false, length = 100)
    private String userEmail;

    @Column(nullable = false, length = 100)
    private String action; // CREATE_USER, UPDATE_PERMISSIONS, DELETE_INVESTMENT, etc.

    @Column(name = "entity_type", length = 50)
    private String entityType; // USER, CLIENT, INVESTMENT, SYSTEM_CONFIG, etc.

    @Column(name = "entity_id")
    private Long entityId;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 2000)
    private String details;

    @Column(name = "old_value", length = 2000)
    private String oldValue;

    @Column(name = "new_value", length = 2000)
    private String newValue;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "success", nullable = false)
    private boolean success = true;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    /**
     * Creates a summary of the audit log entry.
     * @return formatted summary string
     */
    public String getSummary() {
        return String.format("%s performed %s on %s #%d at %s",
                userEmail, action, entityType, entityId, timestamp);
    }

    /**
     * Checks if this audit log represents a critical action.
     * @return true if the action is considered critical
     */
    public boolean isCriticalAction() {
        return action != null && (
                action.startsWith("DELETE_") ||
                        action.contains("PERMISSION") ||
                        action.contains("ROLE") ||
                        action.contains("SYSTEM_CONFIG") ||
                        action.contains("BACKUP") ||
                        action.contains("RESTORE")
        );
    }
}
