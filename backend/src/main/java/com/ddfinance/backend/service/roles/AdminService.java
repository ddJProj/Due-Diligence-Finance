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
     * Gets user activities within a date range.
     *
     * @param startDate Start date
     * @param endDate End date
     * @return List of user activities
     */
    List<UserActivityDTO> getUserActivities(LocalDateTime startDate, LocalDateTime endDate);

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
     * @param enable True to enable, false to disable
     * @return Operation result
     */
    Map<String, Object> toggleMaintenanceMode(boolean enable);

    /**
     * Gets pending guest upgrade requests.
     *
     * @return List of pending requests
     */
    List<Map<String, Object>> getPendingUpgradeRequests();

    /**
     * Approves a guest upgrade request.
     *
     * @param requestId Request ID
     * @throws com.ddfinance.core.exception.EntityNotFoundException if request not found
     */
    void approveUpgradeRequest(Long requestId);

    /**
     * Rejects a guest upgrade request.
     *
     * @param requestId Request ID
     * @param reason Rejection reason
     * @throws com.ddfinance.core.exception.EntityNotFoundException if request not found
     */
    void rejectUpgradeRequest(Long requestId, String reason);

    /**
     * Gets system audit logs.
     *
     * @param startDate Start date
     * @param endDate End date
     * @param userId Optional user ID filter
     * @return List of audit logs
     */
    List<Map<String, Object>> getAuditLogs(LocalDateTime startDate, LocalDateTime endDate, Long userId);

    /**
     * Backs up system data.
     *
     * @return Backup file path
     */
    String backupSystemData();

    /**
     * Restores system data from backup.
     *
     * @param backupPath Backup file path
     * @return Restore result
     */
    Map<String, Object> restoreSystemData(String backupPath);
}
