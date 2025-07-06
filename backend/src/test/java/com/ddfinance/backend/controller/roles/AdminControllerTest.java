package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.admin.SystemStatsDTO;
import com.ddfinance.backend.dto.admin.UserActivityDTO;
import com.ddfinance.backend.dto.admin.PermissionAssignmentRequest;
import com.ddfinance.backend.dto.admin.BulkUserOperationRequest;
import com.ddfinance.backend.dto.admin.SystemConfigDTO;
import com.ddfinance.backend.service.roles.AdminService;
import com.ddfinance.core.domain.enums.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for AdminController.
 * Tests admin-specific endpoints for system management.
 */
@WebMvcTest(AdminController.class)
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AdminService adminService;

    private SystemStatsDTO systemStats;
    private UserActivityDTO userActivity;
    private PermissionAssignmentRequest permissionRequest;
    private BulkUserOperationRequest bulkOperationRequest;
    private SystemConfigDTO systemConfig;

    @BeforeEach
    void setUp() {
        // Setup test data
        systemStats = SystemStatsDTO.builder()
                .totalUsers(150L)
                .activeUsers(120L)
                .totalClients(80L)
                .totalEmployees(20L)
                .totalInvestments(250L)
                .totalInvestmentValue(5000000.0)
                .systemUptime("45 days, 12:34:56")
                .build();

        userActivity = UserActivityDTO.builder()
                .userId(1L)
                .userEmail("user@example.com")
                .lastLogin(LocalDateTime.now().minusHours(2))
                .totalLogins(45L)
                .lastActivity("Viewed investment portfolio")
                .build();

        permissionRequest = PermissionAssignmentRequest.builder()
                .userId(1L)
                .permissionIds(Set.of(1L, 2L, 3L))
                .build();

        bulkOperationRequest = BulkUserOperationRequest.builder()
                .userIds(List.of(1L, 2L, 3L))
                .operation("DEACTIVATE")
                .build();

        systemConfig = SystemConfigDTO.builder()
                .maxLoginAttempts(5)
                .sessionTimeout(30)
                .passwordExpiryDays(90)
                .maintenanceMode(false)
                .build();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetSystemStats() throws Exception {
        // Given
        when(adminService.getSystemStats()).thenReturn(systemStats);

        // When & Then
        mockMvc.perform(get("/api/admin/stats")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(150))
                .andExpect(jsonPath("$.activeUsers").value(120))
                .andExpect(jsonPath("$.totalClients").value(80))
                .andExpect(jsonPath("$.totalInvestmentValue").value(5000000.0));

        verify(adminService, times(1)).getSystemStats();
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = {"CLIENT"})
    void testGetSystemStatsForbidden() throws Exception {
        // When & Then - Non-admin user
        mockMvc.perform(get("/api/admin/stats")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetUserActivities() throws Exception {
        // Given
        List<UserActivityDTO> activities = Arrays.asList(userActivity);
        when(adminService.getUserActivities(any(), any())).thenReturn(activities);

        // When & Then
        mockMvc.perform(get("/api/admin/activities")
                        .param("startDate", "2025-01-01T00:00:00")
                        .param("endDate", "2025-01-31T23:59:59")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userEmail").value("user@example.com"))
                .andExpect(jsonPath("$[0].totalLogins").value(45));

        verify(adminService, times(1)).getUserActivities(any(), any());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testAssignPermissions() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Permissions assigned successfully");
        response.put("userId", 1L);
        when(adminService.assignPermissions(anyLong(), anySet())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/admin/permissions/assign")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(permissionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Permissions assigned successfully"));

        verify(adminService, times(1)).assignPermissions(1L, Set.of(1L, 2L, 3L));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testRemovePermissions() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Permissions removed successfully");
        when(adminService.removePermissions(anyLong(), anySet())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/admin/permissions/remove")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(permissionRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Permissions removed successfully"));

        verify(adminService, times(1)).removePermissions(1L, Set.of(1L, 2L, 3L));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testBulkUserOperation() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Operation completed successfully");
        response.put("affectedUsers", 3);
        when(adminService.performBulkOperation(anyList(), anyString())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/admin/users/bulk")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkOperationRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.affectedUsers").value(3));

        verify(adminService, times(1)).performBulkOperation(List.of(1L, 2L, 3L), "DEACTIVATE");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testBulkOperationValidationError() throws Exception {
        // Given - empty user list
        bulkOperationRequest.setUserIds(Collections.emptyList());

        // When & Then
        mockMvc.perform(post("/api/admin/users/bulk")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bulkOperationRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetSystemConfig() throws Exception {
        // Given
        when(adminService.getSystemConfig()).thenReturn(systemConfig);

        // When & Then
        mockMvc.perform(get("/api/admin/config")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maxLoginAttempts").value(5))
                .andExpect(jsonPath("$.sessionTimeout").value(30))
                .andExpect(jsonPath("$.maintenanceMode").value(false));

        verify(adminService, times(1)).getSystemConfig();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testUpdateSystemConfig() throws Exception {
        // Given
        systemConfig.setMaintenanceMode(true);
        when(adminService.updateSystemConfig(any(SystemConfigDTO.class))).thenReturn(systemConfig);

        // When & Then
        mockMvc.perform(put("/api/admin/config")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(systemConfig)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maintenanceMode").value(true));

        verify(adminService, times(1)).updateSystemConfig(any(SystemConfigDTO.class));
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testCreateEmployee() throws Exception {
        // Given
        Map<String, Object> request = new HashMap<>();
        request.put("email", "newemployee@example.com");
        request.put("firstName", "New");
        request.put("lastName", "Employee");
        request.put("location", "New York");
        request.put("title", "Investment Advisor");

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Employee created successfully");
        response.put("employeeId", 123L);
        when(adminService.createEmployee(any())).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/admin/employees")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Employee created successfully"))
                .andExpect(jsonPath("$.employeeId").value(123));

        verify(adminService, times(1)).createEmployee(any());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testGetRoleDistribution() throws Exception {
        // Given
        Map<Role, Long> distribution = new HashMap<>();
        distribution.put(Role.ADMIN, 5L);
        distribution.put(Role.EMPLOYEE, 20L);
        distribution.put(Role.CLIENT, 80L);
        distribution.put(Role.GUEST, 45L);
        when(adminService.getRoleDistribution()).thenReturn(distribution);

        // When & Then
        mockMvc.perform(get("/api/admin/roles/distribution")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ADMIN").value(5))
                .andExpect(jsonPath("$.EMPLOYEE").value(20))
                .andExpect(jsonPath("$.CLIENT").value(80))
                .andExpect(jsonPath("$.GUEST").value(45));

        verify(adminService, times(1)).getRoleDistribution();
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testExportUserData() throws Exception {
        // Given
        byte[] csvData = "id,email,firstName,lastName,role\n1,user@example.com,John,Doe,CLIENT".getBytes();
        when(adminService.exportUserData(anyString())).thenReturn(csvData);

        // When & Then
        mockMvc.perform(get("/api/admin/export/users")
                        .param("format", "CSV")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(content().contentType("text/csv"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=users_export.csv"));

        verify(adminService, times(1)).exportUserData("CSV");
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = {"ADMIN"})
    void testToggleMaintenanceMode() throws Exception {
        // Given
        Map<String, Object> response = new HashMap<>();
        response.put("maintenanceMode", true);
        response.put("message", "Maintenance mode enabled");
        when(adminService.toggleMaintenanceMode(true)).thenReturn(response);

        // When & Then
        mockMvc.perform(post("/api/admin/maintenance")
                        .param("enable", "true")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.maintenanceMode").value(true))
                .andExpect(jsonPath("$.message").value("Maintenance mode enabled"));

        verify(adminService, times(1)).toggleMaintenanceMode(true);
    }

    @Test
    void testUnauthenticatedAccess() throws Exception {
        // When & Then - No authentication
        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "employee@example.com", roles = {"EMPLOYEE"})
    void testEmployeeCannotAccessAdmin() throws Exception {
        // When & Then - Employee trying to access admin endpoints
        mockMvc.perform(get("/api/admin/stats")
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }
}
