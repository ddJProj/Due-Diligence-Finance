package com.ddfinance.core.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity representing system-wide configuration settings.
 * Stores various configuration parameters that control system behavior.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Entity
@Table(name = "system_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class SystemConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", unique = true, nullable = false, length = 50)
    private String configKey;

    @Column(name = "maintenance_mode", nullable = false)
    private boolean maintenanceMode = false;

    @Column(name = "maintenance_message", length = 500)
    private String maintenanceMessage;

    @Column(name = "max_upload_size")
    private Long maxUploadSize = 10485760L; // 10MB default

    @Column(name = "session_timeout")
    private Integer sessionTimeout = 30; // minutes

    @Column(name = "password_min_length")
    private Integer passwordMinLength = 8;

    @Column(name = "password_require_special_char", nullable = false)
    private boolean passwordRequireSpecialChar = true;

    @Column(name = "password_require_number", nullable = false)
    private boolean passwordRequireNumber = true;

    @Column(name = "password_require_uppercase", nullable = false)
    private boolean passwordRequireUppercase = true;

    @Column(name = "password_expiry_days")
    private Integer passwordExpiryDays = 90;

    @Column(name = "max_login_attempts")
    private Integer maxLoginAttempts = 5;

    @Column(name = "login_lockout_minutes")
    private Integer loginLockoutMinutes = 30;

    @Column(name = "two_factor_required", nullable = false)
    private boolean twoFactorRequired = false;

    @Column(name = "email_notifications_enabled", nullable = false)
    private boolean emailNotificationsEnabled = true;

    @Column(name = "sms_notifications_enabled", nullable = false)
    private boolean smsNotificationsEnabled = false;

    @Column(name = "backup_enabled", nullable = false)
    private boolean backupEnabled = true;

    @Column(name = "backup_schedule", length = 50)
    private String backupSchedule = "DAILY"; // DAILY, WEEKLY, MONTHLY

    @Column(name = "backup_retention_days")
    private Integer backupRetentionDays = 30;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "modified_by", length = 100)
    private String modifiedBy;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (lastModified == null) {
            lastModified = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        lastModified = LocalDateTime.now();
    }

    /**
     * Validates if the configuration is valid.
     * @return true if all settings are within valid ranges
     */
    public boolean isValid() {
        return passwordMinLength >= 6 && passwordMinLength <= 128 &&
                sessionTimeout >= 5 && sessionTimeout <= 480 &&
                maxLoginAttempts >= 3 && maxLoginAttempts <= 10 &&
                loginLockoutMinutes >= 5 && loginLockoutMinutes <= 1440;
    }
}
