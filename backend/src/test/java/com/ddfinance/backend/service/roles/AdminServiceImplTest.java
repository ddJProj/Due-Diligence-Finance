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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Test class for AdminServiceImpl.
 * Tests administrative operations and system management functions.
 */
@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private UserAccountRepository userAccountRepository;
    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private GuestRepository guestRepository;
    @Mock
    private AdminRepository adminRepository;
    @Mock
    private PermissionRepository permissionRepository;
    @Mock
    private GuestUpgradeRequestRepository upgradeRequestRepository;
    @Mock
    private InvestmentRepository investmentRepository;
    @Mock
    private UserActivityLogRepository userActivityLogRepository;
    @Mock
    private SystemConfigRepository systemConfigRepository;
    @Mock
    private AuditLogRepository auditLogRepository;
    @Mock
    private RolePermissionService rolePermissionService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private BackupService backupService;

    private AdminServiceImpl adminService;
    private UserAccount adminUser;
    private UserAccount testUser;
    private GuestUpgradeRequest upgradeRequest;
    private SystemConfig systemConfig;
    private UserActivityLog activityLog;

    @BeforeEach
    void setUp() {
        adminService = new AdminServiceImpl(
                userAccountRepository, employeeRepository, clientRepository,
                guestRepository, adminRepository, permissionRepository,
                upgradeRequestRepository, investmentRepository, userActivityLogRepository,
                systemConfigRepository, auditLogRepository, rolePermissionService,
                notificationService, passwordEncoder, backupService
        );

        // Setup test data
        adminUser = new UserAccount();
        adminUser.setId(1L);
        adminUser.setEmail("admin@example.com");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setRole(Role.ADMIN);

        testUser = new UserAccount();
        testUser.setId(2L);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(Role.GUEST);

        upgradeRequest = new GuestUpgradeRequest();
        upgradeRequest.setId(1L);
        upgradeRequest.setUserAccount(testUser);
        upgradeRequest.setRequestDate(LocalDateTime.now());
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setDetails("Upgrade request details");

        systemConfig = new SystemConfig();
        systemConfig.setId(1L);
        systemConfig.setConfigKey("SYSTEM_CONFIG");
        systemConfig.setMaintenanceMode(false);
        systemConfig.setMaxUploadSize(10485760L);
        systemConfig.setSessionTimeout(30);
        systemConfig.setPasswordMinLength(8);
        systemConfig.setPasswordRequireSpecialChar(true);
        systemConfig.setPasswordRequireNumber(true);
        systemConfig.setPasswordExpiryDays(90);
        systemConfig.setMaxLoginAttempts(5);
        systemConfig.setLoginLockoutMinutes(30);

        activityLog = new UserActivityLog();
        activityLog.setId(1L);
        activityLog.setUserAccount(testUser);
        activityLog.setActivityType("LOGIN");
        activityLog.setActivityTime(LocalDateTime.now());
        activityLog.setSuccess(true);
    }

    @Test
    void getSystemStats_Success() {
        // Arrange
        when(userAccountRepository.count()).thenReturn(100L);
        when(userAccountRepository.countByRole(Role.ADMIN)).thenReturn(5);
        when(userAccountRepository.countByRole(Role.EMPLOYEE)).thenReturn(20);
        when(userAccountRepository.countByRole(Role.CLIENT)).thenReturn(60);
        when(userAccountRepository.countByRole(Role.GUEST)).thenReturn(15);
        when(investmentRepository.count()).thenReturn(150L);
        when(upgradeRequestRepository.findByStatus(UpgradeRequestStatus.PENDING))
                .thenReturn(Arrays.asList(upgradeRequest));

        // Act
        SystemStatsDTO stats = adminService.getSystemStats();

        // Assert
        assertNotNull(stats);
        assertEquals(100L, stats.getTotalUsers());
        assertEquals(5L, stats.getTotalAdmins());
        assertEquals(20L, stats.getTotalEmployees());
        assertEquals(60L, stats.getTotalClients());
        assertEquals(15L, stats.getTotalGuests());
        assertEquals(150L, stats.getTotalInvestments());
        assertEquals(1L, stats.getPendingUpgradeRequests());
    }

    @Test
    void getRecentUserActivity_Success() {
        // Arrange
        PageRequest pageRequest = PageRequest.of(0, 100);
        Page<UserActivityLog> page = new PageImpl<>(Arrays.asList(activityLog));
        when(userActivityLogRepository.findAll(any(PageRequest.class))).thenReturn(page);

        // Act
        List<UserActivityDTO> activities = adminService.getRecentUserActivity();

        // Assert
        assertNotNull(activities);
        assertEquals(1, activities.size());
        assertEquals("test@example.com", activities.get(0).getUserEmail());
        assertEquals("LOGIN", activities.get(0).getActivityType());
    }

    @Test
    void createUserAccount_Success() {
        // Arrange
        Map<String, Object> userData = new HashMap<>();
        userData.put("email", "newuser@example.com");
        userData.put("password", "password123");
        userData.put("firstName", "New");
        userData.put("lastName", "User");
        userData.put("role", "EMPLOYEE");
        userData.put("department", "Finance");

        when(userAccountRepository.existsByEmail("newuser@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
            UserAccount account = invocation.getArgument(0);
            account.setId(3L);
            return account;
        });
        when(rolePermissionService.getPermissionsByRole(Role.EMPLOYEE))
                .thenReturn(new HashSet<>());

        // Act
        Map<String, Object> result = adminService.createUserAccount(userData);

        // Assert
        assertNotNull(result);
        assertEquals(3L, result.get("id"));
        assertEquals("newuser@example.com", result.get("email"));
        assertEquals(Role.EMPLOYEE, result.get("role"));
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createUserAccount_EmailExists_ThrowsException() {
        // Arrange
        Map<String, Object> userData = new HashMap<>();
        userData.put("email", "existing@example.com");
        userData.put("password", "password123");
        userData.put("firstName", "Existing");
        userData.put("lastName", "User");
        userData.put("role", "CLIENT");

        when(userAccountRepository.existsByEmail("existing@example.com")).thenReturn(true);

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            adminService.createUserAccount(userData);
        });
    }

    @Test
    void updatePermissions_Success() {
        // Arrange
        Long userId = 2L;
        List<String> permissions = Arrays.asList("VIEW_INVESTMENT", "CREATE_INVESTMENT");

        Permission viewPerm = new Permission();
        viewPerm.setPermissionType(Permissions.VIEW_INVESTMENT);
        Permission createPerm = new Permission();
        createPerm.setPermissionType(Permissions.CREATE_INVESTMENT);

        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(permissionRepository.findByPermissionType(Permissions.VIEW_INVESTMENT))
                .thenReturn(Optional.of(viewPerm));
        when(permissionRepository.findByPermissionType(Permissions.CREATE_INVESTMENT))
                .thenReturn(Optional.of(createPerm));

        // Act
        assertDoesNotThrow(() -> {
            adminService.updatePermissions(userId, permissions);
        });

        // Assert
        verify(userAccountRepository).save(testUser);
        verify(notificationService).sendNotification(eq(testUser.getEmail()), anyString(), anyString());
    }

    @Test
    void resetUserPassword_Success() {
        // Arrange
        Long userId = 2L;
        when(userAccountRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(anyString())).thenReturn("newHashedPassword");

        // Act
        assertDoesNotThrow(() -> {
            adminService.resetUserPassword(userId);
        });

        // Assert
        verify(userAccountRepository).save(testUser);
        verify(notificationService).sendPasswordResetNotification(eq(testUser), anyString());
    }

    @Test
    void getSystemConfig_Success() {
        // Arrange
        when(systemConfigRepository.findByConfigKey("SYSTEM_CONFIG"))
                .thenReturn(Optional.of(systemConfig));

        // Act
        SystemConfigDTO config = adminService.getSystemConfig();

        // Assert
        assertNotNull(config);
        assertFalse(config.isMaintenanceMode());
        assertEquals(10485760L, config.getMaxUploadSize());
        assertEquals(30, config.getSessionTimeout());
        assertEquals(8, config.getPasswordMinLength());
    }

    @Test
    void updateSystemConfig_Success() {
        // Arrange
        SystemConfigDTO configDTO = new SystemConfigDTO();
        configDTO.setMaintenanceMode(true);
        configDTO.setMaxUploadSize(20971520L);
        configDTO.setSessionTimeout(60);
        configDTO.setPasswordMinLength(10);
        configDTO.setPasswordRequireSpecialChar(true);
        configDTO.setPasswordRequireNumber(true);
        configDTO.setPasswordExpiryDays(60);
        configDTO.setMaxLoginAttempts(3);
        configDTO.setLoginLockoutMinutes(60);

        when(systemConfigRepository.findByConfigKey("SYSTEM_CONFIG"))
                .thenReturn(Optional.of(systemConfig));
        when(systemConfigRepository.save(any(SystemConfig.class))).thenReturn(systemConfig);

        // Act
        SystemConfigDTO result = adminService.updateSystemConfig(configDTO);

        // Assert
        assertNotNull(result);
        assertTrue(result.isMaintenanceMode());
        verify(notificationService).broadcastMaintenanceNotification(true);
    }

    @Test
    void updateSystemConfiguration_MaintenanceMode_Success() {
        // Arrange
        SystemConfig maintenanceConfig = new SystemConfig();
        maintenanceConfig.setConfigKey("maintenanceMode");
        maintenanceConfig.setConfigValue("false");

        when(systemConfigRepository.findByConfigKey("maintenanceMode"))
                .thenReturn(Optional.of(maintenanceConfig));

        // Act
        Map<String, Object> result = adminService.updateSystemConfiguration("maintenanceMode", "true");

        // Assert
        assertNotNull(result);
        assertEquals("maintenanceMode", result.get("key"));
        assertEquals("true", result.get("value"));
        assertEquals("Configuration updated successfully", result.get("message"));
        assertTrue((Boolean) result.get("maintenanceMode"));

        verify(systemConfigRepository).save(maintenanceConfig);
        verify(notificationService).broadcastMaintenanceNotification(true);
    }

    @Test
    void getPendingUpgradeRequests_Success() {
        // Arrange
        when(upgradeRequestRepository.findByStatus(UpgradeRequestStatus.PENDING))
                .thenReturn(Arrays.asList(upgradeRequest));

        // Act
        List<Map<String, Object>> result = adminService.getPendingUpgradeRequests();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).get("id"));
        assertEquals("test@example.com", result.get(0).get("userEmail"));
        assertEquals("PENDING", result.get(0).get("status"));
    }

    @Test
    void approveUpgradeRequest_Success() {
        // Arrange
        UserAccount guestAccount = upgradeRequest.getUserAccount();
        guestAccount.setId(5L);
        Guest guest = new Guest();
        guest.setUserAccount(guestAccount);

        when(upgradeRequestRepository.findById(1L)).thenReturn(Optional.of(upgradeRequest));
        when(guestRepository.findByUserAccount(guestAccount)).thenReturn(Optional.of(guest));
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> {
            Client client = invocation.getArgument(0);
            client.setId(1L);
            client.setClientId("CLI-001");
            return client;
        });
        when(rolePermissionService.getPermissionsByRole(Role.CLIENT))
                .thenReturn(new HashSet<>());

        // Act
        assertDoesNotThrow(() -> {
            adminService.approveUpgradeRequest(1L);
        });

        // Assert
        assertEquals(UpgradeRequestStatus.APPROVED, upgradeRequest.getStatus());
        assertEquals(Role.CLIENT, guestAccount.getRole());
        verify(clientRepository).save(any(Client.class));
        verify(guestRepository).delete(guest);
        verify(notificationService).notifyUserOfUpgradeApproval(guestAccount);
    }

    @Test
    void rejectUpgradeRequest_Success() {
        // Arrange
        when(upgradeRequestRepository.findById(1L)).thenReturn(Optional.of(upgradeRequest));

        // Act
        assertDoesNotThrow(() -> {
            adminService.rejectUpgradeRequest(1L, "Insufficient documentation");
        });

        // Assert
        assertEquals(UpgradeRequestStatus.REJECTED, upgradeRequest.getStatus());
        assertEquals("Insufficient documentation", upgradeRequest.getRejectionReason());
        verify(notificationService).notifyUserOfUpgradeRejection(testUser, "Insufficient documentation");
    }

    @Test
    void searchUsers_Success() {
        // Arrange
        when(userAccountRepository.findAll()).thenReturn(Arrays.asList(testUser, adminUser));

        // Act
        List<Map<String, Object>> results = adminService.searchUsers("test");

        // Assert
        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("test@example.com", results.get(0).get("email"));
    }

    @Test
    void generateBackup_Success() throws Exception {
        // Arrange
        String backupPath = "/tmp/backup-123.zip";
        byte[] backupData = "backup data".getBytes();
        when(backupService.performBackup()).thenReturn(backupPath);

        // Act
        byte[] result = adminService.generateBackup();

        // Assert
        assertNotNull(result);
        assertEquals(backupPath.getBytes().length, result.length);
    }

    @Test
    void getAuditLogs_Success() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();

        AuditLog auditLog = new AuditLog();
        auditLog.setId(1L);
        auditLog.setUserId(2L);
        auditLog.setUserEmail("test@example.com");
        auditLog.setAction("UPDATE_USER");
        auditLog.setEntityType("UserAccount");
        auditLog.setEntityId(2L);
        auditLog.setTimestamp(LocalDateTime.now());

        when(auditLogRepository.findByTimestampBetween(startDate, endDate))
                .thenReturn(Arrays.asList(auditLog));

        // Act
        List<Map<String, Object>> logs = adminService.getAuditLogs(startDate, endDate, null);

        // Assert
        assertNotNull(logs);
        assertEquals(1, logs.size());
        assertEquals("UPDATE_USER", logs.get(0).get("action"));
        assertEquals("UserAccount", logs.get(0).get("entityType"));
    }

    @Test
    void performBulkOperation_Deactivate_Success() {
        // Arrange
        List<Long> userIds = Arrays.asList(2L, 3L);
        List<UserAccount> users = Arrays.asList(testUser, new UserAccount());

        when(userAccountRepository.findAllById(userIds)).thenReturn(users);

        // Act
        Map<String, Object> result = adminService.performBulkOperation(userIds, "DEACTIVATE");

        // Assert
        assertNotNull(result);
        assertEquals("Bulk operation completed successfully", result.get("message"));
        assertEquals("DEACTIVATE", result.get("operation"));
        assertEquals(2, result.get("affectedCount"));

        users.forEach(user -> assertFalse(user.isActive()));
        verify(userAccountRepository).saveAll(users);
    }

    @Test
    void createEmployee_Success() {
        // Arrange
        Map<String, Object> employeeData = new HashMap<>();
        employeeData.put("email", "employee@example.com");
        employeeData.put("password", "password123");
        employeeData.put("firstName", "Employee");
        employeeData.put("lastName", "Test");
        employeeData.put("department", "Finance");
        employeeData.put("location", "NYC");
        employeeData.put("salary", 75000.0);

        when(userAccountRepository.existsByEmail("employee@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
            UserAccount account = invocation.getArgument(0);
            account.setId(4L);
            return account;
        });
        when(rolePermissionService.getPermissionsByRole(Role.EMPLOYEE))
                .thenReturn(new HashSet<>());

        // Act
        Map<String, Object> result = adminService.createEmployee(employeeData);

        // Assert
        assertNotNull(result);
        assertEquals(4L, result.get("id"));
        assertEquals("employee@example.com", result.get("email"));
        assertNotNull(result.get("employeeId"));
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void disableUser_Success() {
        // Arrange
        when(userAccountRepository.findById(2L)).thenReturn(Optional.of(testUser));

        // Act
        assertDoesNotThrow(() -> {
            adminService.disableUser(2L);
        });

        // Assert
        assertFalse(testUser.isActive());
        verify(userAccountRepository).save(testUser);
        verify(notificationService).sendNotification(eq("test@example.com"), anyString(), anyString());
    }

    @Test
    void enableUser_Success() {
        // Arrange
        testUser.setActive(false);
        when(userAccountRepository.findById(2L)).thenReturn(Optional.of(testUser));

        // Act
        assertDoesNotThrow(() -> {
            adminService.enableUser(2L);
        });

        // Assert
        assertTrue(testUser.isActive());
        verify(userAccountRepository).save(testUser);
        verify(notificationService).sendNotification(eq("test@example.com"), anyString(), anyString());
    }
}