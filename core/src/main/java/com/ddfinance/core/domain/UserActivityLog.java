package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing user activity logs for tracking and auditing.
 * Records various user actions and system interactions.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "user_activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class UserActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false)
    private UserAccount userAccount;

    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType; // LOGIN, LOGOUT, VIEW, CREATE, UPDATE, DELETE, etc.

    @Column(name = "activity_time", nullable = false)
    private LocalDateTime activityTime;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "resource_type", length = 50)
    private String resourceType; // CLIENT, INVESTMENT, REPORT, etc.

    @Column(name = "resource_id")
    private Long resourceId;

    @Column(length = 1000)
    private String details;

    @Column(name = "success", nullable = false)
    private boolean success = true;

    @Column(name = "error_message", length = 500)
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        if (activityTime == null) {
            activityTime = LocalDateTime.now();
        }
    }

    /**
     * Checks if this activity represents an active session.
     * @param minutesThreshold Number of minutes to consider a session active
     * @return true if activity is within the threshold
     */
    public boolean isActiveSession(int minutesThreshold) {
        return activityTime.isAfter(LocalDateTime.now().minusMinutes(minutesThreshold));
    }
}
