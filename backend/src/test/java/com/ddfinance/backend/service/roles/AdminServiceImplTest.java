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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdminServiceImpl.
 * Tests all administrative operations including system management,
 * user operations, and configuration.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
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

    @InjectMocks
    private AdminServiceImpl adminService;

    private UserAccount adminUserAccount;
    private Admin admin;
    private UserAccount employeeUserAccount;
    private Employee employee;
    private Permission permission1;
    private Permission permission2;
    private GuestUpgradeRequest upgradeRequest;

    @BeforeEach
    void setUp() {
        // Setup admin user account
        adminUserAccount = new UserAccount();
        adminUserAccount.setId(1L);
        adminUserAccount.setEmail("admin@company.com");
        adminUserAccount.setFirstName("System");
        adminUserAccount.setLastName("Admin");
        adminUserAccount.setRole(Role.ADMIN);

        admin = new Admin();
        admin.setId(1L);
        admin.setUserAccount(adminUserAccount);
        admin.setAdminId("ADMIN-001");

        // Setup employee user account
        employeeUserAccount = new UserAccount();
        employeeUserAccount.setId(2L);
        employeeUserAccount.setEmail("employee@company.com");
        employeeUserAccount.setFirstName("John");
        employeeUserAccount.setLastName("Doe");
        employeeUserAccount.setRole(Role.EMPLOYEE);

        employee = new Employee();
        employee.setId(1L);
        employee.setUserAccount(employeeUserAccount);
        employee.setEmployeeId("EMP-001");

        // Setup permissions
        permission1 = new Permission();
        permission1.setId(1L);
        permission1.setPermissionType(Permissions.VIEW_USERS);

        permission2 = new Permission();
        permission2.setId(2L);
        permission2.setPermissionType(Permissions.EDIT_USERS);

        // Setup upgrade request
        UserAccount guestAccount = new UserAccount();
        guestAccount.setEmail("guest@example.com");

        upgradeRequest = new GuestUpgradeRequest();
        upgradeRequest.setId(1L);
        upgradeRequest.setUserAccount(guestAccount);
        upgradeRequest.setStatus(UpgradeRequestStatus.PENDING);
        upgradeRequest.setRequestDate(LocalDateTime.now());
    }

    @Test
    void getSystemStats_Success() {
        // Arrange
        when(userAccountRepository.count()).thenReturn(100L);
        when(userAccountRepository.countByRole(Role.ADMIN)).thenReturn(5L);
        when(userAccountRepository.countByRole(Role.EMPLOYEE)).thenReturn(20L);
        when(userAccountRepository.countByRole(Role.CLIENT)).thenReturn(70L);
        when(userAccountRepository.countByRole(Role.GUEST)).thenReturn(5L);
        when(investmentRepository.count()).thenReturn(500L);
        when(investmentRepository.calculateTotalSystemValue()).thenReturn(10000000.00);
        when(upgradeRequestRepository.countByStatus(UpgradeRequestStatus.PENDING)).thenReturn(3L);
        when(userActivityLogRepository.countActiveSessionsInLastMinutes(15)).thenReturn(25L);

        // Act
        SystemStatsDTO result = adminService.getSystemStats();

        // Assert
        assertNotNull(result);
        assertEquals(100L, result.getTotalUsers());
        assertEquals(5L, result.getTotalAdmins());
        assertEquals(20L, result.getTotalEmployees());
        assertEquals(70L, result.getTotalClients());
        assertEquals(5L, result.getTotalGuests());
        assertEquals(500L, result.getTotalInvestments());
        assertEquals(10000000.00, result.getTotalSystemValue());
        assertEquals(3L, result.getPendingUpgradeRequests());
        assertEquals(25L, result.getActiveUsers());
        assertNotNull(result.getGeneratedAt());

        verify(userAccountRepository).count();
        verify(investmentRepository).calculateTotalSystemValue();
    }

    @Test
    void getUserActivities_Success() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();

        UserActivityLog activity1 = new UserActivityLog();
        activity1.setId(1L);
        activity1.setUserAccount(employeeUserAccount);
        activity1.setActivityType("LOGIN");
        activity1.setActivityTime(LocalDateTime.now().minusHours(2));
        activity1.setIpAddress("192.168.1.1");

        when(userActivityLogRepository.findByActivityTimeBetween(startDate, endDate))
                .thenReturn(Arrays.asList(activity1));

        // Act
        List<UserActivityDTO> result = adminService.getUserActivities(startDate, endDate);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("employee@company.com", result.get(0).getUserEmail());
        assertEquals("LOGIN", result.get(0).getActivityType());

        verify(userActivityLogRepository).findByActivityTimeBetween(startDate, endDate);
    }

    @Test
    void assignPermissions_Success() {
        // Arrange
        Set<Long> permissionIds = Set.of(1L, 2L);
        Set<Permission> newPermissions = Set.of(permission1, permission2);

        when(userAccountRepository.findById(2L)).thenReturn(Optional.of(employeeUserAccount));
        when(permissionRepository.findAllById(permissionIds)).thenReturn(new ArrayList<>(newPermissions));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(employeeUserAccount);

        // Act
        Map<String, Object> result = adminService.assignPermissions(2L, permissionIds);

        // Assert
        assertNotNull(result);
        assertEquals("Permissions assigned successfully", result.get("message"));
        assertEquals(2, result.get("assignedCount"));

        verify(userAccountRepository).save(employeeUserAccount);
        verify(auditLogRepository).save(any());
    }

    @Test
    void removePermissions_Success() {
        // Arrange
        employeeUserAccount.setPermissions(new HashSet<>(Set.of(permission1, permission2)));
        Set<Long> permissionIds = Set.of(1L);

        when(userAccountRepository.findById(2L)).thenReturn(Optional.of(employeeUserAccount));
        when(permissionRepository.findAllById(permissionIds)).thenReturn(Arrays.asList(permission1));
        when(userAccountRepository.save(any(UserAccount.class))).thenReturn(employeeUserAccount);

        // Act
        Map<String, Object> result = adminService.removePermissions(2L, permissionIds);

        // Assert
        assertNotNull(result);
        assertEquals("Permissions removed successfully", result.get("message"));
        assertEquals(1, result.get("removedCount"));
        assertEquals(1, employeeUserAccount.getPermissions().size());

        verify(userAccountRepository).save(employeeUserAccount);
    }

    @Test
    void performBulkOperation_Deactivate_Success() {
        // Arrange
        List<Long> userIds = Arrays.asList(2L, 3L);
        UserAccount user2 = new UserAccount();
        user2.setId(3L);

        when(userAccountRepository.findAllById(userIds)).thenReturn(Arrays.asList(employeeUserAccount, user2));
        when(userAccountRepository.saveAll(anyList())).thenReturn(Arrays.asList(employeeUserAccount, user2));

        // Act
        Map<String, Object> result = adminService.performBulkOperation(userIds, "DEACTIVATE");

        // Assert
        assertNotNull(result);
        assertEquals("Bulk operation completed successfully", result.get("message"));
        assertEquals(2, result.get("affectedCount"));

        verify(userAccountRepository).saveAll(anyList());
    }

    @Test
    void getSystemConfig_Success() {
        // Arrange
        SystemConfig config = new SystemConfig();
        config.setId(1L);
        config.setConfigKey("SYSTEM_CONFIG");
        config.setMaintenanceMode(false);
        config.setMaxUploadSize(10485760L);
        config.setSessionTimeout(30);

        when(systemConfigRepository.findByConfigKey("SYSTEM_CONFIG")).thenReturn(Optional.of(config));

        // Act
        SystemConfigDTO result = adminService.getSystemConfig();

        // Assert
        assertNotNull(result);
        assertFalse(result.isMaintenanceMode());
        assertEquals(10485760L, result.getMaxUploadSize());
        assertEquals(30, result.getSessionTimeout());

        verify(systemConfigRepository).findByConfigKey("SYSTEM_CONFIG");
    }

    @Test
    void updateSystemConfig_Success() {
        // Arrange
        SystemConfig existingConfig = new SystemConfig();
        existingConfig.setId(1L);
        existingConfig.setConfigKey("SYSTEM_CONFIG");

        SystemConfigDTO newConfigDTO = new SystemConfigDTO();
        newConfigDTO.setMaintenanceMode(true);
        newConfigDTO.setMaxUploadSize(20971520L);
        newConfigDTO.setSessionTimeout(60);

        when(systemConfigRepository.findByConfigKey("SYSTEM_CONFIG")).thenReturn(Optional.of(existingConfig));
        when(systemConfigRepository.save(any(SystemConfig.class))).thenReturn(existingConfig);

        // Act
        SystemConfigDTO result = adminService.updateSystemConfig(newConfigDTO);

        // Assert
        assertNotNull(result);
        assertTrue(result.isMaintenanceMode());
        assertEquals(20971520L, result.getMaxUploadSize());

        verify(systemConfigRepository).save(any(SystemConfig.class));
    }

    @Test
    void createEmployee_Success() {
        // Arrange
        Map<String, Object> employeeData = new HashMap<>();
        employeeData.put("email", "newemployee@company.com");
        employeeData.put("firstName", "Jane");
        employeeData.put("lastName", "Smith");
        employeeData.put("password", "password123");
        employeeData.put("title", "Financial Advisor");
        employeeData.put("locationId", "NYC");

        when(userAccountRepository.existsByEmail("newemployee@company.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashedPassword");
        when(userAccountRepository.save(any(UserAccount.class))).thenAnswer(invocation -> {
            UserAccount ua = invocation.getArgument(0);
            ua.setId(4L);
            return ua;
        });
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> {
            Employee emp = invocation.getArgument(0);
            emp.setId(2L);
            emp.setEmployeeId("EMP-002");
            return emp;
        });
        when(rolePermissionService.getBasePermissionForRole(eq(Role.EMPLOYEE), anySet()))
                .thenReturn(new HashSet<>());

        // Act
        Map<String, Object> result = adminService.createEmployee(employeeData);

        // Assert
        assertNotNull(result);
        assertEquals("Employee created successfully", result.get("message"));
        assertNotNull(result.get("employeeId"));
        assertEquals("newemployee@company.com", result.get("email"));

        verify(userAccountRepository).save(any(UserAccount.class));
        verify(employeeRepository).save(any(Employee.class));
    }

    @Test
    void createEmployee_EmailExists_ThrowsException() {
        // Arrange
        Map<String, Object> employeeData = new HashMap<>();
        employeeData.put("email", "existing@company.com");

        when(userAccountRepository.existsByEmail("existing@company.com")).thenReturn(true);

        // Act & Assert
        assertThrows(ValidationException.class, () -> {
            adminService.createEmployee(employeeData);
        });
    }

    @Test
    void getRoleDistribution_Success() {
        // Arrange
        when(userAccountRepository.countByRole(Role.ADMIN)).thenReturn(5);
        when(userAccountRepository.countByRole(Role.EMPLOYEE)).thenReturn(20);
        when(userAccountRepository.countByRole(Role.CLIENT)).thenReturn(70);
        when(userAccountRepository.countByRole(Role.GUEST)).thenReturn(5);

        // Act
        Map<Role, Long> result = adminService.getRoleDistribution();

        // Assert
        assertNotNull(result);
        assertEquals(5L, result.get(Role.ADMIN));
        assertEquals(20L, result.get(Role.EMPLOYEE));
        assertEquals(70L, result.get(Role.CLIENT));
        assertEquals(5L, result.get(Role.GUEST));
    }

    @Test
    void exportUserData_CSV_Success() throws Exception {
        // Arrange
        List<UserAccount> users = Arrays.asList(adminUserAccount, employeeUserAccount);
        when(userAccountRepository.findAll()).thenReturn(users);

        // Act
        byte[] result = adminService.exportUserData("CSV");

        // Assert
        assertNotNull(result);
        assertTrue(result.length > 0);
        String csvContent = new String(result);
        assertTrue(csvContent.contains("admin@company.com"));
        assertTrue(csvContent.contains("employee@company.com"));
    }

    @Test
    void toggleMaintenanceMode_Enable_Success() {
        // Arrange
        SystemConfig config = new SystemConfig();
        config.setMaintenanceMode(false);

        when(systemConfigRepository.findByConfigKey("SYSTEM_CONFIG")).thenReturn(Optional.of(config));
        when(systemConfigRepository.save(any(SystemConfig.class))).thenReturn(config);

        // Act
        Map<String, Object> result = adminService.toggleMaintenanceMode(true);

        // Assert
        assertNotNull(result);
        assertEquals("Maintenance mode enabled", result.get("message"));
        assertTrue((Boolean) result.get("maintenanceMode"));

        verify(systemConfigRepository).save(config);
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
        assertEquals("guest@example.com", result.get(0).get("userEmail"));
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
        verify(upgradeRequestRepository).save(upgradeRequest);
        verify(notificationService).notifyUserOfUpgradeRejection(upgradeRequest.getUserAccount(), "Insufficient documentation");
    }

    @Test
    void getAuditLogs_Success() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().minusDays(7);
        LocalDateTime endDate = LocalDateTime.now();

        AuditLog log1 = new AuditLog();
        log1.setId(1L);
        log1.setUserId(2L);
        log1.setUserEmail("employee@company.com");
        log1.setAction("LOGIN");
        log1.setTimestamp(LocalDateTime.now().minusHours(1));

        when(auditLogRepository.findByTimestampBetween(startDate, endDate))
                .thenReturn(Arrays.asList(log1));

        // Act
        List<Map<String, Object>> result = adminService.getAuditLogs(startDate, endDate, null);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("LOGIN", result.get(0).get("action"));
        assertEquals("employee@company.com", result.get(0).get("userEmail"));
    }

    @Test
    void backupSystemData_Success() throws Exception {
        // Arrange
        when(backupService.performBackup()).thenReturn("/backups/backup-20250115-120000.zip");

        // Act
        String result = adminService.backupSystemData();

        // Assert
        assertNotNull(result);
        assertTrue(result.contains("backup"));
        verify(backupService).performBackup();
        verify(auditLogRepository).save(any());
    }

    @Test
    void restoreSystemData_Success() throws Exception {
        // Arrange
        String backupPath = "/backups/backup-20250115-120000.zip";

        when(backupService.validateBackup(backupPath)).thenReturn(true);
        when(backupService.performRestore(backupPath)).thenReturn(true);

        // Act
        Map<String, Object> result = adminService.restoreSystemData(backupPath);

        // Assert
        assertNotNull(result);
        assertEquals("System data restored successfully", result.get("message"));
        assertTrue((Boolean) result.get("success"));

        verify(backupService).performRestore(backupPath);
        verify(auditLogRepository).save(any());
    }
}
