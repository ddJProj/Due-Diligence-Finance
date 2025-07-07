package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.admin.SystemConfigDTO;
import com.ddfinance.backend.dto.admin.SystemStatsDTO;
import com.ddfinance.backend.dto.admin.UserActivityDTO;
import com.ddfinance.core.domain.enums.Role;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Service interface for administrative operations.
 * Provides system management, monitoring, and admin functions.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
public interface AdminService {

    /**
     * Gets comprehensive system statistics.
     *
     * @return System statistics DTO
     */
    SystemStatsDTO getSystemStats();

    /**
     * Gets recent user activity (top 100).
     *
     * @return List of recent user activities
     */
    List<UserActivityDTO> getRecentUserActivity();

    /**
     * Gets user activities within a date range.
     *
     * @param startDate Start date
     * @param endDate End date
     * @return List of user activities
     */
    List<UserActivityDTO> getUserActivities(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Creates a new user account with role.
     *
     * @param userData User data including role
     * @return Result with user details
     */
    Map<String, Object> createUserAccount(Map<String, Object> userData);

    /**
     * Updates user permissions.
     *
     * @param userId User ID
     * @param permissions List of permission names
     */
    void updatePermissions(Long userId, List<String> permissions);

    /**
     * Resets a user's password.
     *
     * @param userId User ID
     */
    void resetUserPassword(Long userId);

    /**
     * Disables a user account.
     *
     * @param userId User ID
     */
    void disableUser(Long userId);

    /**
     * Enables a user account.
     *
     * @param userId User ID
     */
    void enableUser(Long userId);

    /**
     * Searches for users by email or name.
     *
     * @param query Search query
     * @return List of matching users
     */
    List<Map<String, Object>> searchUsers(String query);

    /**
     * Gets system configuration.
     *
     * @return Configuration map
     */
    Map<String, Object> getSystemConfiguration();

    /**
     * Updates system configuration.
     *
     * @param key Configuration key
     * @param value Configuration value
     * @return Update result
     */
    Map<String, Object> updateSystemConfiguration(String key, String value);

    /**
     * Gets pending upgrade requests.
     *
     * @return List of pending requests
     */
    List<Map<String, Object>> getPendingUpgradeRequests();

    /**
     * Approves an upgrade request.
     *
     * @param requestId Request ID
     */
    void approveUpgradeRequest(Long requestId);

    /**
     * Rejects an upgrade request.
     *
     * @param requestId Request ID
     * @param reason Rejection reason
     */
    void rejectUpgradeRequest(Long requestId, String reason);

    /**
     * Generates system backup.
     *
     * @return Backup data
     */
    byte[] generateBackup();

    /**
     * Restores from backup.
     *
     * @param backupData Backup data
     */
    void restoreFromBackup(byte[] backupData);

    /**
     * Gets audit logs with optional user filter.
     *
     * @param startDate Start date
     * @param endDate End date
     * @param userId Optional user ID filter
     * @return List of audit logs
     */
    List<Map<String, Object>> getAuditLogs(LocalDateTime startDate, LocalDateTime endDate, Long userId);

    /**
     * Assigns permissions to a user.
     *
     * @param userId User ID
     * @param permissionIds Set of permission IDs to assign
     * @return Operation result with details
     */
    Map<String, Object> assignPermissions(Long userId, Set<Long> permissionIds);

    /**
     * Removes permissions from a user.
     *
     * @param userId User ID
     * @param permissionIds Set of permission IDs to remove
     * @return Operation result with details
     */
    Map<String, Object> removePermissions(Long userId, Set<Long> permissionIds);

    /**
     * Performs bulk operations on multiple users.
     *
     * @param userIds List of user IDs
     * @param operation Operation to perform
     * @return Operation result with affected count
     */
    Map<String, Object> performBulkOperation(List<Long> userIds, String operation);

    /**
     * Gets current system configuration.
     *
     * @return System configuration
     */
    SystemConfigDTO getSystemConfig();

    /**
     * Updates system configuration.
     *
     * @param config New configuration
     * @return Updated configuration
     */
    SystemConfigDTO updateSystemConfig(SystemConfigDTO config);

    /**
     * Creates a new employee account.
     *
     * @param employeeData Employee data map
     * @return Creation result with employee ID
     */
    Map<String, Object> createEmployee(Map<String, Object> employeeData);

    /**
     * Gets distribution of users by role.
     *
     * @return Map of role to user count
     */
    Map<Role, Long> getRoleDistribution();

    /**
     * Exports user data in specified format.
     *
     * @param format Export format (CSV or JSON)
     * @return Exported data as byte array
     */
    byte[] exportUserData(String format);

    /**
     * Toggles system maintenance mode.
     *
     * @param enabled True to enable, false to disable
     * @return Result with status
     */
    Map<String, Object> toggleMaintenanceMode(boolean enabled);

    /**
     * Creates backup of system data.
     *
     * @return Backup file path
     */
    String backupSystemData();

    /**
     * Restores system data from backup.
     *
     * @param backupPath Path to backup file
     * @return Restore result
     */
    Map<String, Object> restoreSystemData(String backupPath);
}