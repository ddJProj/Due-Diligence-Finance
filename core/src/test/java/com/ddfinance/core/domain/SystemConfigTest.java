package com.ddfinance.core.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Nested;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for SystemConfig entity.
 * Tests configuration management, validation, and business logic.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
class SystemConfigTest {

    private SystemConfig systemConfig;

    @BeforeEach
    void setUp() {
        systemConfig = new SystemConfig();
    }

    @Nested
    @DisplayName("Constructor Tests")
    class ConstructorTests {

        @Test
        @DisplayName("Should create SystemConfig with default constructor")
        void shouldCreateWithDefaultConstructor() {
            // When
            SystemConfig config = new SystemConfig();

            // Then
            assertThat(config).isNotNull();
            assertThat(config.getId()).isNull();
            assertThat(config.getConfigKey()).isNull();
            assertThat(config.getConfigValue()).isNull();
            assertThat(config.isMaintenanceMode()).isFalse();
            assertThat(config.getMaxUploadSize()).isEqualTo(10485760L);
            assertThat(config.getSessionTimeout()).isEqualTo(30);
            assertThat(config.getPasswordMinLength()).isEqualTo(8);
            assertThat(config.isPasswordRequireSpecialChar()).isTrue();
            assertThat(config.isPasswordRequireNumber()).isTrue();
            assertThat(config.isPasswordRequireUppercase()).isTrue();
            assertThat(config.getPasswordExpiryDays()).isEqualTo(90);
            assertThat(config.getMaxLoginAttempts()).isEqualTo(5);
            assertThat(config.getLoginLockoutMinutes()).isEqualTo(30);
            assertThat(config.isTwoFactorRequired()).isFalse();
            assertThat(config.isEmailNotificationsEnabled()).isTrue();
            assertThat(config.isSmsNotificationsEnabled()).isFalse();
            assertThat(config.isBackupEnabled()).isTrue();
            assertThat(config.getBackupSchedule()).isEqualTo("DAILY");
            assertThat(config.getBackupRetentionDays()).isEqualTo(30);
        }

        @Test
        @DisplayName("Should create SystemConfig with all-args constructor")
        void shouldCreateWithAllArgsConstructor() {
            // Given
            Long id = 1L;
            String configKey = "maxUploadSize";
            String configValue = "20971520";
            boolean maintenanceMode = true;
            String maintenanceMessage = "System under maintenance";
            Long maxUploadSize = 20971520L;
            Integer sessionTimeout = 60;
            Integer passwordMinLength = 10;
            boolean passwordRequireSpecialChar = true;
            boolean passwordRequireNumber = true;
            boolean passwordRequireUppercase = true;
            Integer passwordExpiryDays = 60;
            Integer maxLoginAttempts = 3;
            Integer loginLockoutMinutes = 60;
            boolean twoFactorRequired = true;
            boolean emailNotificationsEnabled = true;
            boolean smsNotificationsEnabled = true;
            boolean backupEnabled = true;
            String backupSchedule = "WEEKLY";
            Integer backupRetentionDays = 60;
            LocalDateTime createdAt = LocalDateTime.now();
            LocalDateTime lastModified = LocalDateTime.now();
            String modifiedBy = "admin";

            // When
            SystemConfig config = new SystemConfig(id, configKey, configValue, maintenanceMode,
                    maintenanceMessage, maxUploadSize, sessionTimeout, passwordMinLength,
                    passwordRequireSpecialChar, passwordRequireNumber, passwordRequireUppercase,
                    passwordExpiryDays, maxLoginAttempts, loginLockoutMinutes, twoFactorRequired,
                    emailNotificationsEnabled, smsNotificationsEnabled, backupEnabled,
                    backupSchedule, backupRetentionDays, createdAt, lastModified, modifiedBy);

            // Then
            assertThat(config.getId()).isEqualTo(id);
            assertThat(config.getConfigKey()).isEqualTo(configKey);
            assertThat(config.getConfigValue()).isEqualTo(configValue);
            assertThat(config.isMaintenanceMode()).isTrue();
            assertThat(config.getMaintenanceMessage()).isEqualTo(maintenanceMessage);
            assertThat(config.getMaxUploadSize()).isEqualTo(maxUploadSize);
            assertThat(config.getSessionTimeout()).isEqualTo(sessionTimeout);
            assertThat(config.getPasswordMinLength()).isEqualTo(passwordMinLength);
            assertThat(config.isPasswordRequireSpecialChar()).isTrue();
            assertThat(config.isPasswordRequireNumber()).isTrue();
            assertThat(config.isPasswordRequireUppercase()).isTrue();
            assertThat(config.getPasswordExpiryDays()).isEqualTo(passwordExpiryDays);
            assertThat(config.getMaxLoginAttempts()).isEqualTo(maxLoginAttempts);
            assertThat(config.getLoginLockoutMinutes()).isEqualTo(loginLockoutMinutes);
            assertThat(config.isTwoFactorRequired()).isTrue();
            assertThat(config.isEmailNotificationsEnabled()).isTrue();
            assertThat(config.isSmsNotificationsEnabled()).isTrue();
            assertThat(config.isBackupEnabled()).isTrue();
            assertThat(config.getBackupSchedule()).isEqualTo(backupSchedule);
            assertThat(config.getBackupRetentionDays()).isEqualTo(backupRetentionDays);
            assertThat(config.getCreatedAt()).isEqualTo(createdAt);
            assertThat(config.getLastModified()).isEqualTo(lastModified);
            assertThat(config.getModifiedBy()).isEqualTo(modifiedBy);
        }
    }

    @Nested
    @DisplayName("Property Tests")
    class PropertyTests {

        @Test
        @DisplayName("Should set and get config key")
        void shouldSetAndGetConfigKey() {
            // Given
            String key = "sessionTimeout";

            // When
            systemConfig.setConfigKey(key);

            // Then
            assertThat(systemConfig.getConfigKey()).isEqualTo(key);
        }

        @Test
        @DisplayName("Should set and get config value")
        void shouldSetAndGetConfigValue() {
            // Given
            String value = "60";

            // When
            systemConfig.setConfigValue(value);

            // Then
            assertThat(systemConfig.getConfigValue()).isEqualTo(value);
        }

        @Test
        @DisplayName("Should set and get maintenance mode")
        void shouldSetAndGetMaintenanceMode() {
            // When
            systemConfig.setMaintenanceMode(true);

            // Then
            assertThat(systemConfig.isMaintenanceMode()).isTrue();
        }

        @Test
        @DisplayName("Should set and get maintenance message")
        void shouldSetAndGetMaintenanceMessage() {
            // Given
            String message = "System maintenance in progress";

            // When
            systemConfig.setMaintenanceMessage(message);

            // Then
            assertThat(systemConfig.getMaintenanceMessage()).isEqualTo(message);
        }

        @Test
        @DisplayName("Should set and get max upload size")
        void shouldSetAndGetMaxUploadSize() {
            // Given
            Long size = 52428800L; // 50MB

            // When
            systemConfig.setMaxUploadSize(size);

            // Then
            assertThat(systemConfig.getMaxUploadSize()).isEqualTo(size);
        }

        @Test
        @DisplayName("Should set and get session timeout")
        void shouldSetAndGetSessionTimeout() {
            // Given
            Integer timeout = 45;

            // When
            systemConfig.setSessionTimeout(timeout);

            // Then
            assertThat(systemConfig.getSessionTimeout()).isEqualTo(timeout);
        }

        @Test
        @DisplayName("Should set and get password requirements")
        void shouldSetAndGetPasswordRequirements() {
            // When
            systemConfig.setPasswordMinLength(12);
            systemConfig.setPasswordRequireSpecialChar(false);
            systemConfig.setPasswordRequireNumber(false);
            systemConfig.setPasswordRequireUppercase(false);
            systemConfig.setPasswordExpiryDays(120);

            // Then
            assertThat(systemConfig.getPasswordMinLength()).isEqualTo(12);
            assertThat(systemConfig.isPasswordRequireSpecialChar()).isFalse();
            assertThat(systemConfig.isPasswordRequireNumber()).isFalse();
            assertThat(systemConfig.isPasswordRequireUppercase()).isFalse();
            assertThat(systemConfig.getPasswordExpiryDays()).isEqualTo(120);
        }

        @Test
        @DisplayName("Should set and get login security settings")
        void shouldSetAndGetLoginSecuritySettings() {
            // When
            systemConfig.setMaxLoginAttempts(10);
            systemConfig.setLoginLockoutMinutes(15);
            systemConfig.setTwoFactorRequired(true);

            // Then
            assertThat(systemConfig.getMaxLoginAttempts()).isEqualTo(10);
            assertThat(systemConfig.getLoginLockoutMinutes()).isEqualTo(15);
            assertThat(systemConfig.isTwoFactorRequired()).isTrue();
        }

        @Test
        @DisplayName("Should set and get notification settings")
        void shouldSetAndGetNotificationSettings() {
            // When
            systemConfig.setEmailNotificationsEnabled(false);
            systemConfig.setSmsNotificationsEnabled(true);

            // Then
            assertThat(systemConfig.isEmailNotificationsEnabled()).isFalse();
            assertThat(systemConfig.isSmsNotificationsEnabled()).isTrue();
        }

        @Test
        @DisplayName("Should set and get backup settings")
        void shouldSetAndGetBackupSettings() {
            // When
            systemConfig.setBackupEnabled(false);
            systemConfig.setBackupSchedule("MONTHLY");
            systemConfig.setBackupRetentionDays(90);

            // Then
            assertThat(systemConfig.isBackupEnabled()).isFalse();
            assertThat(systemConfig.getBackupSchedule()).isEqualTo("MONTHLY");
            assertThat(systemConfig.getBackupRetentionDays()).isEqualTo(90);
        }
    }

    @Nested
    @DisplayName("Validation Tests")
    class ValidationTests {

        @Test
        @DisplayName("Should validate valid configuration")
        void shouldValidateValidConfiguration() {
            // Given
            systemConfig.setConfigKey("testKey");
            systemConfig.setPasswordMinLength(8);
            systemConfig.setSessionTimeout(30);
            systemConfig.setMaxLoginAttempts(5);
            systemConfig.setLoginLockoutMinutes(30);

            // When
            boolean isValid = systemConfig.isValid();

            // Then
            assertThat(isValid).isTrue();
        }

        @Test
        @DisplayName("Should fail validation without config key")
        void shouldFailValidationWithoutConfigKey() {
            // Given
            systemConfig.setConfigKey(null);

            // When
            boolean isValid = systemConfig.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation with empty config key")
        void shouldFailValidationWithEmptyConfigKey() {
            // Given
            systemConfig.setConfigKey("");

            // When
            boolean isValid = systemConfig.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation with invalid password length")
        void shouldFailValidationWithInvalidPasswordLength() {
            // Given
            systemConfig.setConfigKey("testKey");
            systemConfig.setPasswordMinLength(5); // Less than 6

            // When
            boolean isValid = systemConfig.isValid();

            // Then
            assertThat(isValid).isFalse();
        }

        @Test
        @DisplayName("Should fail validation with invalid session timeout")
        void shouldFailValidationWithInvalidSessionTimeout() {
            // Given
            systemConfig.setConfigKey("testKey");
            systemConfig.setSessionTimeout(0);

            // When
            boolean isValid = systemConfig.isValid();

            // Then
            assertThat(isValid).isFalse();
        }
    }

    @Nested
    @DisplayName("Configuration Value Tests")
    class ConfigurationValueTests {

        @Test
        @DisplayName("Should get configuration value from configValue field")
        void shouldGetConfigurationValueFromConfigValueField() {
            // Given
            systemConfig.setConfigKey("customKey");
            systemConfig.setConfigValue("customValue");

            // When
            String value = systemConfig.getConfigurationValue();

            // Then
            assertThat(value).isEqualTo("customValue");
        }

        @Test
        @DisplayName("Should get maintenance mode value")
        void shouldGetMaintenanceModeValue() {
            // Given
            systemConfig.setConfigKey("maintenanceMode");
            systemConfig.setMaintenanceMode(true);

            // When
            String value = systemConfig.getConfigurationValue();

            // Then
            assertThat(value).isEqualTo("true");
        }

        @Test
        @DisplayName("Should get max upload size value")
        void shouldGetMaxUploadSizeValue() {
            // Given
            systemConfig.setConfigKey("maxUploadSize");
            systemConfig.setMaxUploadSize(20971520L);

            // When
            String value = systemConfig.getConfigurationValue();

            // Then
            assertThat(value).isEqualTo("20971520");
        }

        @Test
        @DisplayName("Should get session timeout value")
        void shouldGetSessionTimeoutValue() {
            // Given
            systemConfig.setConfigKey("sessionTimeout");
            systemConfig.setSessionTimeout(45);

            // When
            String value = systemConfig.getConfigurationValue();

            // Then
            assertThat(value).isEqualTo("45");
        }

        @Test
        @DisplayName("Should get password min length value")
        void shouldGetPasswordMinLengthValue() {
            // Given
            systemConfig.setConfigKey("passwordMinLength");
            systemConfig.setPasswordMinLength(10);

            // When
            String value = systemConfig.getConfigurationValue();

            // Then
            assertThat(value).isEqualTo("10");
        }

        @Test
        @DisplayName("Should get default config value for unknown key")
        void shouldGetDefaultConfigValueForUnknownKey() {
            // Given
            systemConfig.setConfigKey("unknownKey");
            systemConfig.setConfigValue("defaultValue");

            // When
            String value = systemConfig.getConfigurationValue();

            // Then
            assertThat(value).isEqualTo("defaultValue");
        }
    }

    @Nested
    @DisplayName("Equality Tests")
    class EqualityTests {

        @Test
        @DisplayName("Should be equal to self")
        void shouldBeEqualToSelf() {
            // Given
            systemConfig.setId(1L);

            // Then
            assertThat(systemConfig).isEqualTo(systemConfig);
        }

        @Test
        @DisplayName("Should be equal to another config with same id")
        void shouldBeEqualToAnotherConfigWithSameId() {
            // Given
            systemConfig.setId(1L);
            SystemConfig other = new SystemConfig();
            other.setId(1L);

            // Then
            assertThat(systemConfig).isEqualTo(other);
            assertThat(systemConfig.hashCode()).isEqualTo(other.hashCode());
        }

        @Test
        @DisplayName("Should not be equal to config with different id")
        void shouldNotBeEqualToConfigWithDifferentId() {
            // Given
            systemConfig.setId(1L);
            SystemConfig other = new SystemConfig();
            other.setId(2L);

            // Then
            assertThat(systemConfig).isNotEqualTo(other);
        }

        @Test
        @DisplayName("Should not be equal to null")
        void shouldNotBeEqualToNull() {
            assertThat(systemConfig).isNotEqualTo(null);
        }

        @Test
        @DisplayName("Should not be equal to different type")
        void shouldNotBeEqualToDifferentType() {
            assertThat(systemConfig).isNotEqualTo("not a config");
        }
    }

    @Nested
    @DisplayName("Lifecycle Tests")
    class LifecycleTests {

        @Test
        @DisplayName("Should set timestamps on create")
        void shouldSetTimestampsOnCreate() {
            // Given
            LocalDateTime before = LocalDateTime.now().minusSeconds(1);

            // When
            systemConfig.onCreate();

            // Then
            assertThat(systemConfig.getCreatedAt()).isAfter(before);
            assertThat(systemConfig.getLastModified()).isAfter(before);
            assertThat(systemConfig.getCreatedAt()).isEqualTo(systemConfig.getLastModified());
        }

        @Test
        @DisplayName("Should update last modified on update")
        void shouldUpdateLastModifiedOnUpdate() {
            // Given
            systemConfig.setCreatedAt(LocalDateTime.now().minusDays(1));
            systemConfig.setLastModified(LocalDateTime.now().minusDays(1));
            LocalDateTime before = systemConfig.getLastModified();

            // When
            systemConfig.onUpdate();

            // Then
            assertThat(systemConfig.getLastModified()).isAfter(before);
            assertThat(systemConfig.getCreatedAt()).isBefore(systemConfig.getLastModified());
        }
    }
}