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
import org.springframework.data.domain.PageRequest;
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

        // TODO: Implement active users calculation based on last login time
        stats.setActiveUsers(stats.getTotalUsers()); // Placeholder

        // Investment stats
        stats.setTotalInvestments(investmentRepository.count());
        // TODO: Implement active investments count
        stats.setActiveInvestments(investmentRepository.count()); // Placeholder
        // TODO: Calculate total investment value from actual investment data
        stats.setTotalInvestmentValue(0.0); // Placeholder

        // Pending upgrade requests
        stats.setPendingUpgradeRequests(
                (long) upgradeRequestRepository.findByStatus(UpgradeRequestStatus.PENDING).size()
        );

        // TODO: Implement transaction count
        stats.setTotalTransactions(0L); // Placeholder

        // System metrics
        Runtime runtime = Runtime.getRuntime();
        stats.setSystemUptime(calculateUptime());
        stats.setCpuUsage(0.0); // TODO: Implement CPU usage monitoring
        stats.setMemoryUsage((double) (runtime.totalMemory() - runtime.freeMemory()) / runtime.maxMemory() * 100);
        stats.setDiskSpaceAvailable(runtime.freeMemory());

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserActivityDTO> getRecentUserActivity() {
        // Get top 100 recent activities
        PageRequest pageRequest = PageRequest.of(0, 100);
        List<UserActivityLog> logs = userActivityLogRepository.findAll(pageRequest).getContent();

        return logs.stream()
                .sorted((a, b) -> b.getActivityTime().compareTo(a.getActivityTime()))
                .map(this::convertToActivityDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserActivityDTO> getUserActivities(LocalDateTime startDate, LocalDateTime endDate) {
        List<UserActivityLog> activities = userActivityLogRepository.findByActivityTimeBetween(startDate, endDate);

        return activities.stream()
                .map(this::convertToActivityDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> assignPermissions(Long userId, Set<Long> permissionIds) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

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
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

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
                    String tempPassword = generateTemporaryPassword();
                    user.setPassword(passwordEncoder.encode(tempPassword));
                    user.setPasswordResetRequired(true);

                    // Send notification with temp password
                    sendPasswordResetNotification(user, tempPassword);
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

        config = systemConfigRepository.save(config);

        // If maintenance mode changed, broadcast notification
        broadcastMaintenanceNotification(config.isMaintenanceMode());

        return convertToSystemConfigDTO(config);
    }

    @Override
    public Map<String, Object> createEmployee(Map<String, Object> employeeData) {
        validateEmployeeData(employeeData);

        String email = (String) employeeData.get("email");
        if (userAccountRepository.existsByEmail(email)) {
            throw new ValidationException("Email already exists: " + email);
        }

        // Create user account
        UserAccount userAccount = new UserAccount();
        userAccount.setEmail(email);
        userAccount.setFirstName((String) employeeData.get("firstName"));
        userAccount.setLastName((String) employeeData.get("lastName"));
        userAccount.setPassword(passwordEncoder.encode((String) employeeData.get("password")));
        userAccount.setRole(Role.EMPLOYEE);

        userAccount = userAccountRepository.save(userAccount);

        // Create employee entity
        Employee employee = new Employee();
        employee.setUserAccount(userAccount);
        employee.setEmployeeId(generateEmployeeId());

        // Set optional fields from employeeData
        if (employeeData.containsKey("department")) {
            employee.setDepartment((String) employeeData.get("department"));
        }
        if (employeeData.containsKey("location")) {
            employee.setLocationId((String) employeeData.get("location"));
        }
        if (employeeData.containsKey("salary")) {
            employee.setSalary(Double.parseDouble(employeeData.get("salary").toString()));
        }
        if (employeeData.containsKey("managerId")) {
            employee.setManagerId((String) employeeData.get("managerId"));
        }
        employee.setHireDate(LocalDateTime.now());
        employee.setIsActive(true);

        employeeRepository.save(employee);

        // Assign employee permissions
        Set<Permissions> employeePermissions = rolePermissionService.getPermissionsByRole(Role.EMPLOYEE);
        Set<Permission> permissions = new HashSet<>();
        for (Permissions perm : employeePermissions) {
            permissionRepository.findByPermissionType(perm).ifPresent(permissions::add);
        }
        userAccount.setPermissions(permissions);
        userAccountRepository.save(userAccount);

        // Send welcome email with temp password
        sendEmployeeWelcomeEmail(userAccount, (String) employeeData.get("password"));

        Map<String, Object> response = new HashMap<>();
        response.put("id", userAccount.getId());
        response.put("employeeId", employee.getEmployeeId());
        response.put("email", userAccount.getEmail());
        response.put("message", "Employee account created successfully");

        return response;
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
            ByteArrayOutputStream baos = new ByteArrayOutputStream();

            if ("CSV".equalsIgnoreCase(format)) {
                PrintWriter writer = new PrintWriter(baos);
                writer.println("ID,Email,FirstName,LastName,Role,Active,CreatedDate");

                for (UserAccount user : users) {
                    writer.printf("%d,%s,%s,%s,%s,%s,%s%n",
                            user.getId(),
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getRole(),
                            user.isActive(),
                            user.getCreatedDate() != null ? user.getCreatedDate().toString() : "");
                }

                writer.flush();
            } else if ("JSON".equalsIgnoreCase(format)) {
                PrintWriter writer = new PrintWriter(baos);
                writer.print(convertUsersToJson(users));
                writer.flush();
            } else {
                throw new ValidationException("Unsupported export format: " + format);
            }

            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export user data", e);
        }
    }

    @Override
    public Map<String, Object> toggleMaintenanceMode(boolean enabled) {
        SystemConfig config = systemConfigRepository.findByConfigKey("SYSTEM_CONFIG")
                .orElseGet(this::createDefaultSystemConfig);

        config.setMaintenanceMode(enabled);
        if (enabled) {
            config.setMaintenanceMessage("System is currently under maintenance. Please try again later.");
        }

        systemConfigRepository.save(config);

        // Broadcast notification
        broadcastMaintenanceNotification(enabled);

        Map<String, Object> result = new HashMap<>();
        result.put("maintenanceMode", enabled);
        result.put("message", enabled ? "Maintenance mode enabled" : "Maintenance mode disabled");

        return result;
    }

    @Override
    public Map<String, Object> updateSystemConfiguration(String key, String value) {
        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElse(new SystemConfig());

        config.setConfigKey(key);
        config.setConfigValue(value);
        config.setLastModified(LocalDateTime.now());

        systemConfigRepository.save(config);

        Map<String, Object> response = new HashMap<>();
        response.put("key", key);
        response.put("value", value);
        response.put("message", "Configuration updated successfully");

        if ("maintenanceMode".equals(key)) {
            boolean maintenanceMode = Boolean.parseBoolean(value);
            response.put("maintenanceMode", maintenanceMode);
            broadcastMaintenanceNotification(maintenanceMode);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingUpgradeRequests() {
        List<GuestUpgradeRequest> requests = upgradeRequestRepository.findByStatus(UpgradeRequestStatus.PENDING);
        return requests.stream()
                .map(this::mapUpgradeRequest)
                .collect(Collectors.toList());
    }

    @Override
    public void approveUpgradeRequest(Long requestId) {
        GuestUpgradeRequest request = upgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Upgrade request not found with ID: " + requestId));

        if (request.getStatus() != UpgradeRequestStatus.PENDING) {
            throw new ValidationException("Request is not in pending status");
        }

        UserAccount userAccount = request.getUserAccount();

        // Delete guest entity
        Guest guest = guestRepository.findByUserAccount(userAccount)
                .orElseThrow(() -> new EntityNotFoundException("Guest not found for user"));
        guestRepository.delete(guest);

        // Update user role
        userAccount.setRole(Role.CLIENT);

        // Create client entity
        Client client = new Client();
        client.setUserAccount(userAccount);
        client.setClientId(generateClientId());
        clientRepository.save(client);

        // Update permissions
        Set<Permissions> clientPermissions = rolePermissionService.getPermissionsByRole(Role.CLIENT);
        Set<Permission> permissions = new HashSet<>();
        for (Permissions perm : clientPermissions) {
            permissionRepository.findByPermissionType(perm).ifPresent(permissions::add);
        }
        userAccount.setPermissions(permissions);
        userAccountRepository.save(userAccount);

        // Update request status
        request.setStatus(UpgradeRequestStatus.APPROVED);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(getCurrentAdminEmail());
        upgradeRequestRepository.save(request);

        notifyUserOfUpgradeApproval(userAccount);
    }

    @Override
    public void rejectUpgradeRequest(Long requestId, String reason) {
        GuestUpgradeRequest request = upgradeRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Upgrade request not found with ID: " + requestId));

        if (request.getStatus() != UpgradeRequestStatus.PENDING) {
            throw new ValidationException("Request is not in pending status");
        }

        request.setStatus(UpgradeRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request.setProcessedDate(LocalDateTime.now());
        request.setProcessedBy(getCurrentAdminEmail());
        request.setDetails(request.getDetails() + "\nRejection reason: " + reason);
        upgradeRequestRepository.save(request);

        notifyUserOfUpgradeRejection(request.getUserAccount(), reason);
    }

    @Override
    public List<Map<String, Object>> searchUsers(String query) {
        // Implement search by email or name
        List<UserAccount> users = userAccountRepository.findAll().stream()
                .filter(u -> u.getEmail().toLowerCase().contains(query.toLowerCase()) ||
                        u.getFirstName().toLowerCase().contains(query.toLowerCase()) ||
                        u.getLastName().toLowerCase().contains(query.toLowerCase()))
                .collect(Collectors.toList());

        return users.stream()
                .map(this::mapUserToSearchResult)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getSystemConfiguration() {
        List<SystemConfig> configs = systemConfigRepository.findAll();
        Map<String, Object> configMap = new HashMap<>();

        for (SystemConfig config : configs) {
            configMap.put(config.getConfigKey(), config.getConfigValue());
        }

        return configMap;
    }

    @Override
    public byte[] generateBackup() {
        try {
            return backupService.performBackup().getBytes();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate backup", e);
        }
    }

    @Override
    public void restoreFromBackup(byte[] backupData) {
        try {
            // Save backup data to temporary file
            String tempPath = "/tmp/restore-" + System.currentTimeMillis() + ".zip";
            // TODO: Write backupData to tempPath

            backupService.performRestore(tempPath);
        } catch (Exception e) {
            throw new RuntimeException("Failed to restore from backup", e);
        }
    }

    @Override
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
    public void disableUser(Long userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        user.setActive(false);
        userAccountRepository.save(user);

        notifyUserOfAccountDisable(user);
    }

    @Override
    public void enableUser(Long userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        user.setActive(true);
        userAccountRepository.save(user);

        notifyUserOfAccountEnable(user);
    }

    @Override
    public void resetUserPassword(Long userId) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        String tempPassword = generateTemporaryPassword();
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setPasswordResetRequired(true);
        userAccountRepository.save(user);

        sendPasswordResetNotification(user, tempPassword);
    }

    @Override
    public void updatePermissions(Long userId, List<String> permissions) {
        UserAccount user = userAccountRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        Set<Permission> newPermissions = new HashSet<>();
        for (String permName : permissions) {
            Permissions permEnum = Permissions.valueOf(permName);
            Permission perm = permissionRepository.findByPermissionType(permEnum)
                    .orElseThrow(() -> new EntityNotFoundException("Permission not found: " + permName));
            newPermissions.add(perm);
        }

        user.setPermissions(newPermissions);
        userAccountRepository.save(user);

        notifyUserOfPermissionChange(user);
    }

    @Override
    public Map<String, Object> createUserAccount(Map<String, Object> userData) {
        validateUserData(userData);

        String email = (String) userData.get("email");
        if (userAccountRepository.existsByEmail(email)) {
            throw new ValidationException("Email already exists: " + email);
        }

        // Create user account
        UserAccount userAccount = new UserAccount();
        userAccount.setEmail(email);
        userAccount.setFirstName((String) userData.get("firstName"));
        userAccount.setLastName((String) userData.get("lastName"));
        userAccount.setPassword(passwordEncoder.encode((String) userData.get("password")));

        Role role = Role.valueOf(((String) userData.get("role")).toUpperCase());
        userAccount.setRole(role);

        userAccount = userAccountRepository.save(userAccount);

        // Create role-specific entity
        createRoleSpecificEntity(userAccount, role, userData);

        // Assign permissions
        Set<Permissions> rolePermissions = rolePermissionService.getPermissionsByRole(role);
        Set<Permission> permissions = new HashSet<>();
        for (Permissions perm : rolePermissions) {
            permissionRepository.findByPermissionType(perm).ifPresent(permissions::add);
        }
        userAccount.setPermissions(permissions);
        userAccountRepository.save(userAccount);

        Map<String, Object> response = new HashMap<>();
        response.put("id", userAccount.getId());
        response.put("email", userAccount.getEmail());
        response.put("role", userAccount.getRole());
        response.put("message", "User account created successfully");

        return response;
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

    private void validateUserData(Map<String, Object> userData) {
        if (!userData.containsKey("email") || ((String) userData.get("email")).isEmpty()) {
            throw new ValidationException("Email is required");
        }
        if (!userData.containsKey("password") || ((String) userData.get("password")).isEmpty()) {
            throw new ValidationException("Password is required");
        }
        if (!userData.containsKey("firstName") || ((String) userData.get("firstName")).isEmpty()) {
            throw new ValidationException("First name is required");
        }
        if (!userData.containsKey("lastName") || ((String) userData.get("lastName")).isEmpty()) {
            throw new ValidationException("Last name is required");
        }
        if (!userData.containsKey("role") || ((String) userData.get("role")).isEmpty()) {
            throw new ValidationException("Role is required");
        }
    }

    private void validateEmployeeData(Map<String, Object> employeeData) {
        validateUserData(employeeData);
        // Additional employee-specific validation if needed
    }

    private void createRoleSpecificEntity(UserAccount userAccount, Role role, Map<String, Object> userData) {
        switch (role) {
            case ADMIN:
                Admin admin = new Admin();
                admin.setUserAccount(userAccount);
                admin.setAdminId(generateAdminId());
                admin.setDepartment((String) userData.getOrDefault("department", "System Administration"));
                admin.setAccessLevel((String) userData.getOrDefault("accessLevel", "SYSTEM_ADMIN"));
                adminRepository.save(admin);
                break;

            case EMPLOYEE:
                Employee employee = new Employee();
                employee.setUserAccount(userAccount);
                employee.setEmployeeId(generateEmployeeId());

                // Set optional fields from userData
                if (userData.containsKey("department")) {
                    employee.setDepartment((String) userData.get("department"));
                }
                if (userData.containsKey("location")) {
                    employee.setLocationId((String) userData.get("location"));
                }
                if (userData.containsKey("salary")) {
                    employee.setSalary(Double.parseDouble(userData.get("salary").toString()));
                }
                if (userData.containsKey("managerId")) {
                    employee.setManagerId((String) userData.get("managerId"));
                }
                employee.setHireDate(LocalDateTime.now());
                employee.setIsActive(true);

                employeeRepository.save(employee);
                break;

            case CLIENT:
                Client client = new Client();
                client.setUserAccount(userAccount);
                client.setClientId(generateClientId());
                clientRepository.save(client);
                break;

            case GUEST:
                Guest guest = new Guest();
                guest.setUserAccount(userAccount);
                guest.setGuestId(generateGuestId());
                guest.setRegistrationDate(LocalDateTime.now());
                guestRepository.save(guest);
                break;
        }
    }

    private UserActivityDTO convertToActivityDTO(UserActivityLog log) {
        UserActivityDTO dto = new UserActivityDTO();
        dto.setId(log.getId());
        dto.setUserId(log.getUserAccount().getId());
        dto.setUserEmail(log.getUserAccount().getEmail());
        dto.setActivityType(log.getActivityType());
        dto.setActivityTime(log.getActivityTime());
        dto.setIpAddress(log.getIpAddress());
        dto.setUserAgent(log.getUserAgent());
        dto.setDetails(log.getDetails());
        dto.setSuccess(log.isSuccess());
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

    private Map<String, Object> mapUserToSearchResult(UserAccount user) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("email", user.getEmail());
        result.put("firstName", user.getFirstName());
        result.put("lastName", user.getLastName());
        result.put("role", user.getRole().toString());
        result.put("permissionCount", user.getPermissions().size());
        result.put("active", user.isActive());
        return result;
    }

    private Map<String, Object> mapUpgradeRequest(GuestUpgradeRequest request) {
        Map<String, Object> mapped = new HashMap<>();
        mapped.put("id", request.getId());
        mapped.put("userId", request.getUserAccount().getId());
        mapped.put("userEmail", request.getUserAccount().getEmail());
        mapped.put("userName", request.getUserAccount().getFirstName() + " " + request.getUserAccount().getLastName());
        mapped.put("requestDate", request.getRequestDate());
        mapped.put("status", request.getStatus().toString());
        mapped.put("details", request.getDetails());
        return mapped;
    }

    private Map<String, Object> convertAuditLogToMap(AuditLog log) {
        Map<String, Object> mapped = new HashMap<>();
        mapped.put("id", log.getId());
        mapped.put("userId", log.getUserId());
        mapped.put("userEmail", log.getUserEmail());
        mapped.put("action", log.getAction());
        mapped.put("entityType", log.getEntityType());
        mapped.put("entityId", log.getEntityId());
        mapped.put("timestamp", log.getTimestamp());
        mapped.put("details", log.getDetails());
        return mapped;
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
        return systemConfigRepository.save(config);
    }

    private String calculateUptime() {
        // TODO: Implement actual uptime calculation
        return "7 days, 14 hours, 32 minutes";
    }

    private String generateTemporaryPassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    private String generateAdminId() {
        return "ADM-" + System.currentTimeMillis();
    }

    private String generateEmployeeId() {
        return "EMP-" + System.currentTimeMillis();
    }

    private String generateClientId() {
        return "CLI-" + System.currentTimeMillis();
    }

    private String generateGuestId() {
        return "GST-" + System.currentTimeMillis();
    }

    private String convertUsersToJson(List<UserAccount> users) {
        StringBuilder json = new StringBuilder("[");

        for (int i = 0; i < users.size(); i++) {
            UserAccount user = users.get(i);
            if (i > 0) json.append(",");

            json.append("{")
                    .append("\"id\":").append(user.getId()).append(",")
                    .append("\"email\":\"").append(user.getEmail()).append("\",")
                    .append("\"firstName\":\"").append(user.getFirstName()).append("\",")
                    .append("\"lastName\":\"").append(user.getLastName()).append("\",")
                    .append("\"role\":\"").append(user.getRole()).append("\",")
                    .append("\"active\":").append(user.isActive())
                    .append("}");
        }

        json.append("]");
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

    // Notification wrapper methods to handle missing NotificationService methods

    private void sendPasswordResetNotification(UserAccount user, String tempPassword) {
        notificationService.sendPasswordResetNotification(user, tempPassword);
    }

    private void sendEmployeeWelcomeEmail(UserAccount employee, String tempPassword) {
        notificationService.sendEmployeeWelcomeEmail(employee, tempPassword);
    }

    private void broadcastMaintenanceNotification(boolean enabled) {
        notificationService.broadcastMaintenanceNotification(enabled);
    }

    private void notifyUserOfUpgradeApproval(UserAccount user) {
        notificationService.notifyUserOfUpgradeApproval(user);
    }

    private void notifyUserOfUpgradeRejection(UserAccount user, String reason) {
        notificationService.notifyUserOfUpgradeRejection(user, reason);
    }

    private void notifyUserOfAccountDisable(UserAccount user) {
        notificationService.sendNotification(user.getEmail(),
                "Account Disabled",
                "Your account has been disabled. Please contact support for assistance.");
    }

    private void notifyUserOfAccountEnable(UserAccount user) {
        notificationService.sendNotification(user.getEmail(),
                "Account Enabled",
                "Your account has been re-enabled. You can now log in.");
    }

    private void notifyUserOfPermissionChange(UserAccount user) {
        notificationService.sendNotification(user.getEmail(),
                "Permissions Updated",
                "Your account permissions have been updated. Please log out and log back in for changes to take effect.");
    }
}