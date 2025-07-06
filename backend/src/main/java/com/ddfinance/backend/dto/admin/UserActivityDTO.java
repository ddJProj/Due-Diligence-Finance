package com.ddfinance.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user activity logging and tracking.
 * Contains information about user actions and system interactions.
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

    private Long id;

    private Long userId;

    private String userEmail;

    private String userName;

    private String activityType; // LOGIN, LOGOUT, VIEW, CREATE, UPDATE, DELETE

    private LocalDateTime activityTime;

    private String ipAddress;

    private String userAgent;

    private String sessionId;

    private String resourceType;

    private Long resourceId;

    private String details;

    private boolean success;

    private String errorMessage;
}
