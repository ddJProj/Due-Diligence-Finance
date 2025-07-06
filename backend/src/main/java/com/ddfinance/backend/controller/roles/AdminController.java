package com.ddfinance.backend.controller.roles;

import com.ddfinance.backend.dto.admin.*;
import com.ddfinance.backend.service.roles.AdminService;
import com.ddfinance.core.domain.enums.Role;
import com.ddfinance.core.exception.ValidationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for admin-specific operations.
 * Provides system management, monitoring, and administrative functions.
 *
 * @author Due Diligence Finance Team
 * @version 1.0
 * @since 2025-01-15
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class AdminController {

    private final AdminService adminService;

    /**
     * Gets system statistics and health metrics.
     *
     * @return System statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<SystemStatsDTO> getSystemStats() {
        SystemStatsDTO stats = adminService.getSystemStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Gets user activity logs within a date range.
     *
     * @param startDate Start date for activity logs
     * @param endDate End date for activity logs
     * @return List of user activities
     */
    @GetMapping("/activities")
    public ResponseEntity<List<UserActivityDTO>> getUserActivities(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<UserActivityDTO> activities = adminService.getUserActivities(startDate, endDate);
        return ResponseEntity.ok(activities);
    }

    /**
     * Assigns permissions to a user.
     *
     * @param request Permission assignment request
     * @return Operation result
     */
    @PostMapping("/permissions/assign")
    public ResponseEntity<Map<String, Object>> assignPermissions(
            @Valid @RequestBody PermissionAssignmentRequest request) {

        Map<String, Object> result = adminService.assignPermissions(
                request.getUserId(), request.getPermissionIds());
        return ResponseEntity.ok(result);
    }

    /**
     * Removes permissions from a user.
     *
     * @param request Permission removal request
     * @return Operation result
     */
    @PostMapping("/permissions/remove")
    public ResponseEntity<Map<String, Object>> removePermissions(
            @Valid @RequestBody PermissionAssignmentRequest request) {

        Map<String, Object> result = adminService.removePermissions(
                request.getUserId(), request.getPermissionIds());
        return ResponseEntity.ok(result);
    }

    /**
     * Performs bulk operations on multiple users.
     *
     * @param request Bulk operation request
     * @return Operation result
     */
    @PostMapping("/users/bulk")
    public ResponseEntity<Map<String, Object>> performBulkOperation(
            @Valid @RequestBody BulkUserOperationRequest request) {

        Map<String, Object> result = adminService.performBulkOperation(
                request.getUserIds(), request.getOperation());
        return ResponseEntity.ok(result);
    }

    /**
     * Gets current system configuration.
     *
     * @return System configuration
     */
    @GetMapping("/config")
    public ResponseEntity<SystemConfigDTO> getSystemConfig() {
        SystemConfigDTO config = adminService.getSystemConfig();
        return ResponseEntity.ok(config);
    }

    /**
     * Updates system configuration.
     *
     * @param config New configuration
     * @return Updated configuration
     */
    @PutMapping("/config")
    public ResponseEntity<SystemConfigDTO> updateSystemConfig(
            @Valid @RequestBody SystemConfigDTO config) {

        SystemConfigDTO updatedConfig = adminService.updateSystemConfig(config);
        return ResponseEntity.ok(updatedConfig);
    }

    /**
     * Creates a new employee account.
     *
     * @param employeeData Employee creation data
     * @return Creation result
     */
    @PostMapping("/employees")
    public ResponseEntity<Map<String, Object>> createEmployee(
            @RequestBody Map<String, Object> employeeData) {

        Map<String, Object> result = adminService.createEmployee(employeeData);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /**
     * Gets role distribution statistics.
     *
     * @return Map of roles to user counts
     */
    @GetMapping("/roles/distribution")
    public ResponseEntity<Map<Role, Long>> getRoleDistribution() {
        Map<Role, Long> distribution = adminService.getRoleDistribution();
        return ResponseEntity.ok(distribution);
    }

    /**
     * Exports user data in specified format.
     *
     * @param format Export format (CSV, JSON)
     * @return Exported data
     */
    @GetMapping("/export/users")
    public ResponseEntity<byte[]> exportUserData(@RequestParam String format) {
        if (!format.equalsIgnoreCase("CSV") && !format.equalsIgnoreCase("JSON")) {
            throw new ValidationException("Format must be CSV or JSON");
        }

        byte[] data = adminService.exportUserData(format);

        HttpHeaders headers = new HttpHeaders();
        if (format.equalsIgnoreCase("CSV")) {
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "users_export.csv");
        } else {
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentDispositionFormData("attachment", "users_export.json");
        }

        return ResponseEntity.ok()
                .headers(headers)
                .body(data);
    }

    /**
     * Toggles system maintenance mode.
     *
     * @param enable True to enable, false to disable
     * @return Operation result
     */
    @PostMapping("/maintenance")
    public ResponseEntity<Map<String, Object>> toggleMaintenanceMode(@RequestParam boolean enable) {
        Map<String, Object> result = adminService.toggleMaintenanceMode(enable);
        return ResponseEntity.ok(result);
    }

    /**
     * Gets pending guest upgrade requests.
     *
     * @return List of pending upgrade requests
     */
    @GetMapping("/upgrade-requests/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingUpgradeRequests() {
        List<Map<String, Object>> requests = adminService.getPendingUpgradeRequests();
        return ResponseEntity.ok(requests);
    }

    /**
     * Approves a guest upgrade request.
     *
     * @param requestId Upgrade request ID
     * @return Operation result
     */
    @PostMapping("/upgrade-requests/{requestId}/approve")
    public ResponseEntity<Map<String, String>> approveUpgradeRequest(@PathVariable Long requestId) {
        adminService.approveUpgradeRequest(requestId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Upgrade request approved successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Rejects a guest upgrade request.
     *
     * @param requestId Upgrade request ID
     * @param reason Rejection reason
     * @return Operation result
     */
    @PostMapping("/upgrade-requests/{requestId}/reject")
    public ResponseEntity<Map<String, String>> rejectUpgradeRequest(
            @PathVariable Long requestId,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        if (reason == null || reason.trim().isEmpty()) {
            throw new ValidationException("Rejection reason is required");
        }

        adminService.rejectUpgradeRequest(requestId, reason);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Upgrade request rejected");
        return ResponseEntity.ok(response);
    }

    /**
     * Exception handler for validation errors.
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidation(ValidationException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
}
