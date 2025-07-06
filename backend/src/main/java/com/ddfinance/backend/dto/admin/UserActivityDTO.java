package com.ddfinance.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user activity tracking.
 * Used for monitoring user behavior and system usage.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserActivityDTO {

    private Long userId;
    private String userEmail;
    private String userRole;

    private LocalDateTime lastLogin;
    private LocalDateTime lastLogout;
    private Long totalLogins;
    private Long failedLoginAttempts;

    private String lastActivity;
    private LocalDateTime lastActivityTime;
    private String ipAddress;
    private String userAgent;

    private Boolean isActive;
    private Boolean isLocked;
}