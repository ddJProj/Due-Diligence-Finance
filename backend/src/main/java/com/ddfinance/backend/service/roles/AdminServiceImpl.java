package com.ddfinance.backend.service.roles;

import com.ddfinance.backend.dto.admin.SystemConfigDTO;
import com.ddfinance.backend.dto.admin.SystemStatsDTO;
import com.ddfinance.backend.dto.admin.UserActivityDTO;
import com.ddfinance.backend.repository.*;
import com.ddfinance.backend.service.notification.NotificationService;
import com.ddfinance.core.domain.*;
import com.ddfinance.core.domain.enums.Permissions;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.domain.enums.UpgradeRequestStatus;
import com.ddfinance.core.exception.EntityNotFoundException;
import com.ddfinance.core.exception.ValidationException;
import com.ddfinance.core.repository.PermissionRepository;
import com.ddfinance.core.repository.UserAccountRepository;
import com.ddfinance.core.service.RolePermissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service implementation for administrative operations.
 * Provides system management, monitoring, and admin functions.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserAccountRepository userAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final ClientRepository clientRepository;
    private final GuestRepository guestRepository;
    private final AdminRepository adminRepository;
    private final PermissionRepository permissionRepository;
    private final GuestUpgradeRequestRepository upgradeRequestRepository;
    private final InvestmentRepository investmentRepository;
    private final UserActivityLogRepository userActivityLogRepository;
    private final SystemConfigRepository systemConfigRepository;
    private final AuditLogRepository auditLogRepository;
    private final RolePermissionService rolePermissionService;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder;
    private final BackupService backupService;

    @Autowired
    public AdminServiceImpl(UserAccountRepository userAccountRepository,
                            EmployeeRepository employeeRepository,
                            ClientRepository clientRepository,
                            GuestRepository guestRepository,
                            AdminRepository adminRepository,
                            PermissionRepository permissionRepository,
                            GuestUpgradeRequestRepository upgradeRequestRepository,
                            InvestmentRepository investmentRepository,
                            UserActivityLogRepository userActivityLogRepository,
                            SystemConfigRepository systemConfigRepository,
                            AuditLogRepository auditLogRepository,
                            RolePermissionService rolePermissionService,
                            NotificationService notificationService,
                            PasswordEncoder passwordEncoder,
                            BackupService backupService) {
        this.userAccountRepository = userAccountRepository;
        this.employeeRepository = employeeRepository;
        this.clientRepository = clientRepository;
        this.guestRepository = guestRepository;
        this.adminRepository = adminRepository;
        this.permissionRepository = permissionRepository;
        this.upgradeRequestRepository = upgradeRequestRepository;
        this.investmentRepository = investmentRepository;
        this.userActivityLogRepository = userActivityLogRepository;
        this.systemConfigRepository = systemConfigRepository;
        this.auditLogRepository = auditLogRepository;
        this.rolePermissionService = rolePermissionService;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
        this.backupService = backupService;
    }

    @Override
    @Transactional(readOnly = true)
    public SystemStatsDTO getSystemStats() {
        SystemStatsDTO stats = new SystemStatsDTO();

        // User counts
        stats.setTotalUsers(userAccountRepository.count());
        stats.setTotalAdmins((long) userAccountRepository.countByRole(Role.ADMIN));
        stats.setTotalEmployees((long) userAccountRepository.countByRole(Role.EMPLOYEE));
        stats.setTotalClients((long) userAccountRepository.countByRole(Role.CLIENT));
        stats.setTotalGuests((long) userAccountRepository.countByRole(Role.GUEST));

        // Investment metrics
        stats.setTotalInvestments(investmentRepository.count());
        Double totalValue = investmentRepository.calculateTotalSystemValue();
        stats.setTotalSystemValue(totalValue != null ? totalValue : 0.0);

        // Pending requests
        stats.setPendingUpgradeRequests(upgradeRequestRepository.countByStatus(UpgradeRequestStatus.PENDING));

        // Active users (logged in within last 15 minutes)
        stats.setActiveUsers(userActivityLogRepository.countActiveSessionsInLastMinutes(15));

        // System health metrics
        stats.setSystemUptime(calculateSystemUptime());
        stats.setDatabaseSize(calculateDatabaseSize());

        stats.setGeneratedAt(LocalDateTime.now());

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserActivityDTO> getUserActivities(LocalDateTime startDate, LocalDateTime endDate) {
        List<UserActivityLog> activities = userActivityLogRepository.findByActivityTimeBetween(startDate, endDate);

        return activities.stream()
                .map(this::convertToUserActivityDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> assignPermissions(Long userId, Set<Long> permissionIds) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        List<Permission> permissions = permissionRepository.findAllById(permissionIds);

        if (permissions.size() != permissionIds.size()) {
            throw new ValidationException("Some permission IDs are invalid");
        }

        // Add new permissions
        user.getPermissions().addAll(permissions);
        userAccountRepository.save(user);

        // Log the action
        logAdminAction("ASSIGN_PERMISSIONS",
                String.format("Assigned %d permissions to user %s", permissions.size(), user.getEmail()));

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Permissions assigned successfully");
        result.put("userId", userId);
        result.put("assignedCount", permissions.size());
        result.put("totalPermissions", user.getPermissions().size());

        return result;
    }

    @Override
    public Map<String, Object> removePermissions(Long userId, Set<Long> permissionIds) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User", userId));

        List<Permission> permissionsToRemove = permissionRepository.findAllById(permissionIds);

        // Remove permissions
        user.getPermissions().removeAll(permissionsToRemove);
        userAccountRepository.save(user);

        // Log the action
        logAdminAction("REMOVE_PERMISSIONS",
                String.format("Removed %d permissions from user %s", permissionsToRemove.size(), user.getEmail()));

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Permissions removed successfully");
        result.put("userId", userId);
        result.put("removedCount", permissionsToRemove.size());
        result.put("remainingPermissions", user.getPermissions().size());

        return result;
    }

    @Override
    public Map<String, Object> performBulkOperation(List<Long> userIds, String operation) {
        List<UserAccount> users = userAccountRepository.findAllById(userIds);

        if (users.size() != userIds.size()) {
            throw new ValidationException("Some user IDs are invalid");
        }

        int affectedCount = 0;

        switch (operation.toUpperCase()) {
            case "DEACTIVATE":
                for (UserAccount user : users) {
                    user.setActive(false);
                    affectedCount++;
                }
                break;

            case "ACTIVATE":
                for (UserAccount user : users) {
                    user.setActive(true);
                    affectedCount++;
                }
                break;

            case "RESET_PASSWORD":
                for (UserAccount user : users) {
                    // Generate temporary password
                    String tempPassword = generateTemporaryPassword();
                    user.setHashedPassword(passwordEncoder.encode(tempPassword));
                    user.setPasswordResetRequired(true);

                    // Send notification with temp password
                    notificationService.sendPasswordResetNotification(user, tempPassword);
                    affectedCount++;
                }
                break;

            case "DELETE":
                // Soft delete
                for (UserAccount user : users) {
                    user.setDeleted(true);
                    user.setDeletedAt(LocalDateTime.now());
                    affectedCount++;
                }
                break;

            default:
                throw new ValidationException("Invalid operation: " + operation);
        }

        userAccountRepository.saveAll(users);

        // Log the action
        logAdminAction("BULK_OPERATION",
                String.format("Performed %s on %d users", operation, affectedCount));

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Bulk operation completed successfully");
        result.put("operation", operation);
        result.put("affectedCount", affectedCount);

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public SystemConfigDTO getSystemConfig() {
        SystemConfig config = systemConfigRepository.findByConfigKey("SYSTEM_CONFIG")
                .orElseGet(this::createDefaultSystemConfig);

        return convertToSystemConfigDTO(config);
    }

    @Override
    public SystemConfigDTO updateSystemConfig(SystemConfigDTO configDTO) {
        SystemConfig config = systemConfigRepository.findByConfigKey("SYSTEM_CONFIG")
                .orElseGet(this::createDefaultSystemConfig);

        // Update configuration
        config.setMaintenanceMode(configDTO.isMaintenanceMode());
        config.setMaxUploadSize(configDTO.getMaxUploadSize());
        config.setSessionTimeout(configDTO.getSessionTimeout());
        config.setPasswordMinLength(configDTO.getPasswordMinLength());
        config.setPasswordRequireSpecialChar(configDTO.isPasswordRequireSpecialChar());
        config.setPasswordRequireNumber(configDTO.isPasswordRequireNumber());
        config.setPasswordExpiryDays(configDTO.getPasswordExpiryDays());
        config.setMaxLoginAttempts(configDTO.getMaxLoginAttempts());
        config.setLoginLockoutMinutes(configDTO.getLoginLockoutMinutes());
        config.setLastModified(LocalDateTime.now());

        SystemConfig saved = systemConfigRepository.save(config);

        // Log the action
        logAdminAction("UPDATE_SYSTEM_CONFIG", "System configuration updated");

        return convertToSystemConfigDTO(saved);
    }

    @Override
    public Map<String, Object> createEmployee(Map<String, Object> employeeData) {
        // Validate required fields
        validateEmployeeData(employeeData);

        String email = (String) employeeData.get("email");

        // Check if email already exists
        if (userAccountRepository.existsByEmail(email)) {
            throw new ValidationException("Email already exists: " + email);
        }

        // Create user account
        UserAccount userAccount = new UserAccount();
        userAccount.setEmail(email);
        userAccount.setFirstName((String) employeeData.get("firstName"));
        userAccount.setLastName((String) employeeData.get("lastName"));
        userAccount.setHashedPassword(passwordEncoder.encode((String) employeeData.get("password")));
        userAccount.setRole(Role.EMPLOYEE);
        userAccount.setActive(true);
        userAccount.setCreatedAt(LocalDateTime.now());

        // Set default permissions for employee role
        Set<Permission> permissions = rolePermissionService.getBasePermissionForRole(
                Role.EMPLOYEE,
                new HashSet<>(permissionRepository.findAll())
        );
        userAccount.setPermissions(permissions);

        UserAccount savedAccount = userAccountRepository.save(userAccount);

        // Create employee profile
        Employee employee = new Employee();
        employee.setUserAccount(savedAccount);
        employee.setTitle((String) employeeData.get("title"));
        employee.setLocationId((String) employeeData.get("locationId"));
        employee.setEmployeeId(generateEmployeeId());

        Employee savedEmployee = employeeRepository.save(employee);

        // Send welcome email
        notificationService.sendEmployeeWelcomeEmail(savedAccount, (String) employeeData.get("password"));

        // Log the action
        logAdminAction("CREATE_EMPLOYEE", "Created employee: " + email);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Employee created successfully");
        result.put("employeeId", savedEmployee.getEmployeeId());
        result.put("userId", savedAccount.getId());
        result.put("email", savedAccount.getEmail());

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Role, Long> getRoleDistribution() {
        Map<Role, Long> distribution = new HashMap<>();

        for (Role role : Role.values()) {
            distribution.put(role, (long) userAccountRepository.countByRole(role));
        }

        return distribution;
    }

    @Override
    public byte[] exportUserData(String format) {
        List<UserAccount> users = userAccountRepository.findAll();

        try {
            switch (format.toUpperCase()) {
                case "CSV":
                    return exportUsersAsCSV(users);

                case "JSON":
                    return exportUsersAsJSON(users);

                default:
                    throw new ValidationException("Unsupported export format: " + format);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to export user data: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> toggleMaintenanceMode(boolean enable) {
        SystemConfig config = systemConfigRepository.findByConfigKey("SYSTEM_CONFIG")
                .orElseGet(this::createDefaultSystemConfig);

        config.setMaintenanceMode(enable);
        config.setLastModified(LocalDateTime.now());

        systemConfigRepository.save(config);

        // Broadcast notification to all active users
        notificationService.broadcastMaintenanceNotification(enable);

        // Log the action
        logAdminAction("TOGGLE_MAINTENANCE_MODE",
                enable ? "Maintenance mode enabled" : "Maintenance mode disabled");

        Map<String, Object> result = new HashMap<>();
        result.put("message", enable ? "Maintenance mode enabled" : "Maintenance mode disabled");
        result.put("maintenanceMode", enable);
        result.put("timestamp", LocalDateTime.now());

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingUpgradeRequests() {
        List<GuestUpgradeRequest> pendingRequests = upgradeRequestRepository
                .findByStatus(UpgradeRequestStatus.PENDING);

        return pendingRequests.stream()
                .map(this::convertUpgradeRequestToMap)
                .collect(Collectors.toList());
    }

    @Override
    public void approveUpgradeRequest(Long requestId) {
        GuestUpgradeRequest request = upgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Upgrade request", requestId));

        if (request.getStatus() != UpgradeRequestStatus.PENDING) {
            throw new ValidationException("Request is not in pending status");
        }

        UserAccount userAccount = request.getUserAccount();

        // Find guest profile
        Guest guest = guestRepository.findByUserAccount(userAccount)
                .orElseThrow(() -> new EntityNotFoundException("Guest profile not found"));

        // Update user role
        userAccount.setRole(Role.CLIENT);

        // Update permissions
        Set<Permission> clientPermissions = rolePermissionService.getBasePermissionForRole(
                Role.CLIENT,
                new HashSet<>(permissionRepository.findAll())
        );
        userAccount.setPermissions(clientPermissions);

        userAccountRepository.save(userAccount);

        // Create client profile
        Client client = new Client();
        client.setUserAccount(userAccount);
        client.setClientId(generateClientId());

        // Assign to least loaded employee
        Employee assignedEmployee = findLeastLoadedEmployee();
        client.setAssignedEmployee(assignedEmployee);

        clientRepository.save(client);

        // Update request status
        request.setStatus(UpgradeRequestStatus.APPROVED);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(getCurrentAdminEmail());
        upgradeRequestRepository.save(request);

        // Delete guest profile
        guestRepository.delete(guest);

        // Send notification
        notificationService.notifyUserOfUpgradeApproval(userAccount);

        // Log the action
        logAdminAction("APPROVE_UPGRADE_REQUEST",
                "Approved upgrade request for: " + userAccount.getEmail());
    }

    @Override
    public void rejectUpgradeRequest(Long requestId, String reason) {
        GuestUpgradeRequest request = upgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Upgrade request", requestId));

        if (request.getStatus() != UpgradeRequestStatus.PENDING) {
            throw new ValidationException("Request is not in pending status");
        }

        // Update request status
        request.setStatus(UpgradeRequestStatus.REJECTED);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(getCurrentAdminEmail());
        request.setRejectionReason(reason);

        upgradeRequestRepository.save(request);

        // Send notification
        notificationService.notifyUserOfUpgradeRejection(request.getUserAccount(), reason);

        // Log the action
        logAdminAction("REJECT_UPGRADE_REQUEST",
                "Rejected upgrade request for: " + request.getUserAccount().getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAuditLogs(LocalDateTime startDate, LocalDateTime endDate, Long userId) {
        List<AuditLog> logs;

        if (userId != null) {
            logs = auditLogRepository.findByUserIdAndTimestampBetween(userId, startDate, endDate);
        } else {
            logs = auditLogRepository.findByTimestampBetween(startDate, endDate);
        }

        return logs.stream()
                .map(this::convertAuditLogToMap)
                .collect(Collectors.toList());
    }

    @Override
    public String backupSystemData() {
        try {
            String backupPath = backupService.performBackup();

            // Log the action
            logAdminAction("BACKUP_SYSTEM", "System backup created: " + backupPath);

            return backupPath;
        } catch (Exception e) {
            throw new RuntimeException("Failed to backup system data: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> restoreSystemData(String backupPath) {
        try {
            // Validate backup file
            if (!backupService.validateBackup(backupPath)) {
                throw new ValidationException("Invalid backup file");
            }

            // Perform restore
            boolean success = backupService.performRestore(backupPath);

            // Log the action
            logAdminAction("RESTORE_SYSTEM", "System restored from: " + backupPath);

            Map<String, Object> result = new HashMap<>();
            result.put("message", success ? "System data restored successfully" : "Restore failed");
            result.put("success", success);
            result.put("backupPath", backupPath);
            result.put("timestamp", LocalDateTime.now());

            return result;
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore system data: " + e.getMessage(), e);
        }
    }

    // Helper methods

    private UserActivityDTO convertToUserActivityDTO(UserActivityLog log) {
        UserActivityDTO dto = new UserActivityDTO();
        dto.setId(log.getId());
        dto.setUserId(log.getUserAccount().getId());
        dto.setUserEmail(log.getUserAccount().getEmail());
        dto.setActivityType(log.getActivityType());
        dto.setActivityTime(log.getActivityTime());
        dto.setIpAddress(log.getIpAddress());
        dto.setUserAgent(log.getUserAgent());
        dto.setDetails(log.getDetails());
        return dto;
    }

    private SystemConfigDTO convertToSystemConfigDTO(SystemConfig config) {
        SystemConfigDTO dto = new SystemConfigDTO();
        dto.setId(config.getId());
        dto.setMaintenanceMode(config.isMaintenanceMode());
        dto.setMaxUploadSize(config.getMaxUploadSize());
        dto.setSessionTimeout(config.getSessionTimeout());
        dto.setPasswordMinLength(config.getPasswordMinLength());
        dto.setPasswordRequireSpecialChar(config.isPasswordRequireSpecialChar());
        dto.setPasswordRequireNumber(config.isPasswordRequireNumber());
        dto.setPasswordExpiryDays(config.getPasswordExpiryDays());
        dto.setMaxLoginAttempts(config.getMaxLoginAttempts());
        dto.setLoginLockoutMinutes(config.getLoginLockoutMinutes());
        dto.setLastModified(config.getLastModified());
        return dto;
    }

    private Map<String, Object> convertUpgradeRequestToMap(GuestUpgradeRequest request) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", request.getId());
        map.put("userEmail", request.getUserAccount().getEmail());
        map.put("userName", request.getUserAccount().getFullName());
        map.put("requestDate", request.getRequestDate());
        map.put("status", request.getStatus().name());
        map.put("details", request.getDetails());
        map.put("additionalInfo", request.getAdditionalInfo());
        return map;
    }

    private Map<String, Object> convertAuditLogToMap(AuditLog log) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", log.getId());
        map.put("userId", log.getUserId());
        map.put("userEmail", log.getUserEmail());
        map.put("action", log.getAction());
        map.put("details", log.getDetails());
        map.put("timestamp", log.getTimestamp());
        map.put("ipAddress", log.getIpAddress());
        return map;
    }

    private SystemConfig createDefaultSystemConfig() {
        SystemConfig config = new SystemConfig();
        config.setConfigKey("SYSTEM_CONFIG");
        config.setMaintenanceMode(false);
        config.setMaxUploadSize(10485760L); // 10MB
        config.setSessionTimeout(30); // 30 minutes
        config.setPasswordMinLength(8);
        config.setPasswordRequireSpecialChar(true);
        config.setPasswordRequireNumber(true);
        config.setPasswordExpiryDays(90);
        config.setMaxLoginAttempts(5);
        config.setLoginLockoutMinutes(30);
        config.setCreatedAt(LocalDateTime.now());
        config.setLastModified(LocalDateTime.now());
        return systemConfigRepository.save(config);
    }

    private void validateEmployeeData(Map<String, Object> employeeData) {
        if (!employeeData.containsKey("email") || employeeData.get("email") == null) {
            throw new ValidationException("Email is required");
        }
        if (!employeeData.containsKey("firstName") || employeeData.get("firstName") == null) {
            throw new ValidationException("First name is required");
        }
        if (!employeeData.containsKey("lastName") || employeeData.get("lastName") == null) {
            throw new ValidationException("Last name is required");
        }
        if (!employeeData.containsKey("password") || employeeData.get("password") == null) {
            throw new ValidationException("Password is required");
        }
        if (!employeeData.containsKey("title") || employeeData.get("title") == null) {
            throw new ValidationException("Title is required");
        }
        if (!employeeData.containsKey("locationId") || employeeData.get("locationId") == null) {
            throw new ValidationException("Location ID is required");
        }
    }

    private String generateEmployeeId() {
        // Generate unique employee ID
        long count = employeeRepository.count();
        return String.format("EMP-%06d", count + 1);
    }

    private String generateClientId() {
        // Generate unique client ID
        long count = clientRepository.count();
        return String.format("CLI-%06d", count + 1);
    }

    private Employee findLeastLoadedEmployee() {
        // Find employee with least number of assigned clients
        List<Employee> employees = employeeRepository.findAll();

        return employees.stream()
                .min(Comparator.comparing(emp -> emp.getClientList().size()))
                .orElseThrow(() -> new EntityNotFoundException("No employees available for assignment"));
    }

    private String generateTemporaryPassword() {
        // Generate a secure temporary password
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        Random random = new Random();
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 12; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }

    private byte[] exportUsersAsCSV(List<UserAccount> users) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(baos);

        // Write header
        writer.println("ID,Email,First Name,Last Name,Role,Active,Created At");

        // Write data
        for (UserAccount user : users) {
            writer.printf("%d,%s,%s,%s,%s,%s,%s%n",
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole(),
                    user.isActive(),
                    user.getCreatedDate()
            );
        }

        writer.flush();
        return baos.toByteArray();
    }

    private byte[] exportUsersAsJSON(List<UserAccount> users) throws Exception {
        List<Map<String, Object>> userList = users.stream()
                .map(user -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", user.getId());
                    map.put("email", user.getEmail());
                    map.put("firstName", user.getFirstName());
                    map.put("lastName", user.getLastName());
                    map.put("role", user.getRole().name());
                    map.put("active", user.isActive());
                    map.put("createdAt", user.getCreatedDate().toString());
                    return map;
                })
                .collect(Collectors.toList());

        // Convert to JSON (simplified - in production use Jackson or Gson)
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < userList.size(); i++) {
            if (i > 0) json.append(",");
            json.append(mapToJson(userList.get(i)));
        }
        json.append("]");

        return json.toString().getBytes();
    }

    private String mapToJson(Map<String, Object> map) {
        StringBuilder json = new StringBuilder("{");
        int count = 0;
        for (Map.Entry<String, Object> entry : map.entrySet()) {
            if (count++ > 0) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":\"")
                    .append(entry.getValue()).append("\"");
        }
        json.append("}");
        return json.toString();
    }

    private void logAdminAction(String action, String details) {
        AuditLog log = new AuditLog();
        log.setUserId(getCurrentAdminId());
        log.setUserEmail(getCurrentAdminEmail());
        log.setAction(action);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        log.setIpAddress(getCurrentIpAddress());

        auditLogRepository.save(log);
    }

    private Long getCurrentAdminId() {
        // TODO: Get from security context
        return 1L;
    }

    private String getCurrentAdminEmail() {
        // TODO: Get from security context
        return "admin@company.com";
    }

    private String getCurrentIpAddress() {
        // TODO: Get from request context
        return "127.0.0.1";
    }

    private Long calculateSystemUptime() {
        // TODO: Calculate actual system uptime
        return 99999L; // Placeholder
    }

    private Long calculateDatabaseSize() {
        // TODO: Calculate actual database size
        return 1024L * 1024L * 500L; // 500MB placeholder
    }
}
