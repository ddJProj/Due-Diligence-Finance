// frontend/src/api/AdminService.ts

import { apiClient } from './apiClient';
import {
  SystemStatsDTO,
  UserAccountDTO,
  AdminDTO,
  Role,
  PageRequest,
  Page,
} from '@/types';

/**
 * Service for handling all admin-specific API operations.
 * Includes system management, user administration, and analytics.
 */
export class AdminService {
  private static instance: AdminService;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance of AdminService
   */
  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  // System Management
  // =================

  /**
   * Get system-wide statistics
   * @returns System statistics including users, investments, and health
   */
  public async getSystemStats(): Promise<SystemStatsDTO> {
    const response = await apiClient.get<SystemStatsDTO>('/admin/stats');
    return response.data;
  }

  /**
   * Get detailed system health information
   * @returns System health status with component details
   */
  public async getSystemHealth(): Promise<any> {
    const response = await apiClient.get('/admin/health');
    return response.data;
  }

  /**
   * Trigger a system backup
   * @returns Backup job information
   */
  public async performSystemBackup(): Promise<any> {
    const response = await apiClient.post('/admin/backup');
    return response.data;
  }

  /**
   * Get backup history
   * @returns List of previous backups
   */
  public async getBackupHistory(): Promise<any[]> {
    const response = await apiClient.get('/admin/backup/history');
    return response.data;
  }

  // User Management
  // ===============

  /**
   * Get all users with pagination
   * @param pageRequest - Pagination parameters
   * @returns Page of users
   */
  public async getAllUsers(pageRequest?: PageRequest): Promise<Page<UserAccountDTO>> {
    const response = await apiClient.get<Page<UserAccountDTO>>('/admin/users', {
      params: pageRequest,
    });
    return response.data;
  }

  /**
   * Get specific user details
   * @param userId - User ID
   * @returns User account details
   */
  public async getUserById(userId: number): Promise<UserAccountDTO> {
    const response = await apiClient.get<UserAccountDTO>(`/admin/users/${userId}`);
    return response.data;
  }

  /**
   * Update user role
   * @param userId - User ID
   * @param role - New role
   * @returns Updated user
   */
  public async updateUserRole(userId: number, role: Role): Promise<UserAccountDTO> {
    const response = await apiClient.put<UserAccountDTO>(`/admin/users/${userId}/role`, { role });
    return response.data;
  }

  /**
   * Deactivate user account
   * @param userId - User ID
   * @param reason - Reason for deactivation
   * @returns Deactivation result
   */
  public async deactivateUser(userId: number, reason: string): Promise<any> {
    const response = await apiClient.post(`/admin/users/${userId}/deactivate`, { reason });
    return response.data;
  }

  /**
   * Reactivate user account
   * @param userId - User ID
   * @returns Reactivation result
   */
  public async reactivateUser(userId: number): Promise<any> {
    const response = await apiClient.post(`/admin/users/${userId}/reactivate`);
    return response.data;
  }

  /**
   * Search users by criteria
   * @param query - Search query
   * @returns List of matching users
   */
  public async searchUsers(query: string): Promise<UserAccountDTO[]> {
    const response = await apiClient.get<UserAccountDTO[]>('/admin/users/search', {
      params: { q: query },
    });
    return response.data;
  }

  // System Configuration
  // ====================

  /**
   * Get system configuration
   * @returns Current system configuration
   */
  public async getSystemConfig(): Promise<any> {
    const response = await apiClient.get('/admin/config');
    return response.data;
  }

  /**
   * Update system configuration
   * @param config - Configuration updates
   * @returns Update result
   */
  public async updateSystemConfig(config: any): Promise<any> {
    const response = await apiClient.put('/admin/config', config);
    return response.data;
  }

  /**
   * Get feature flags
   * @returns Current feature flags
   */
  public async getFeatureFlags(): Promise<any> {
    const response = await apiClient.get('/admin/features');
    return response.data;
  }

  /**
   * Update feature flag
   * @param feature - Feature name
   * @param enabled - Enable/disable flag
   * @returns Update result
   */
  public async updateFeatureFlag(feature: string, enabled: boolean): Promise<any> {
    const response = await apiClient.put(`/admin/features/${feature}`, { enabled });
    return response.data;
  }

  // Activity & Security
  // ===================

  /**
   * Get activity logs with filters
   * @param filters - Log filters (date range, user, type)
   * @returns Filtered activity logs
   */
  public async getActivityLogs(filters?: any): Promise<any[]> {
    const response = await apiClient.get('/admin/activity-logs', {
      params: filters,
    });
    return response.data;
  }

  /**
   * Get security events
   * @returns List of security events
   */
  public async getSecurityEvents(): Promise<any[]> {
    const response = await apiClient.get('/admin/security-events');
    return response.data;
  }

  /**
   * Mark security event as resolved
   * @param eventId - Event ID
   * @param resolution - Resolution details
   * @returns Update result
   */
  public async resolveSecurityEvent(eventId: number, resolution: string): Promise<any> {
    const response = await apiClient.post(`/admin/security-events/${eventId}/resolve`, {
      resolution,
    });
    return response.data;
  }

  // Admin Profile
  // =============

  /**
   * Get current admin profile
   * @returns Admin profile
   */
  public async getProfile(): Promise<AdminDTO> {
    const response = await apiClient.get<AdminDTO>('/admin/me/profile');
    return response.data;
  }

  /**
   * Update admin profile
   * @param profileData - Profile updates
   * @returns Updated profile
   */
  public async updateProfile(profileData: Partial<AdminDTO>): Promise<AdminDTO> {
    const response = await apiClient.put<AdminDTO>('/admin/me/profile', profileData);
    return response.data;
  }

  // Reports & Analytics
  // ==================

  /**
   * Generate system report
   * @param reportRequest - Report parameters
   * @returns Report generation status
   */
  public async generateSystemReport(reportRequest: any): Promise<any> {
    const response = await apiClient.post('/admin/reports/generate', reportRequest);
    return response.data;
  }

  /**
   * Get report generation status
   * @param reportId - Report ID
   * @returns Report status and download URL
   */
  public async getReportStatus(reportId: string): Promise<any> {
    const response = await apiClient.get(`/admin/reports/${reportId}/status`);
    return response.data;
  }

  /**
   * Get business metrics
   * @returns Business performance metrics
   */
  public async getBusinessMetrics(): Promise<any> {
    const response = await apiClient.get('/admin/metrics/business');
    return response.data;
  }

  /**
   * Get system performance metrics
   * @returns System performance data
   */
  public async getSystemMetrics(): Promise<any> {
    const response = await apiClient.get('/admin/metrics/system');
    return response.data;
  }

  // Maintenance
  // ===========

  /**
   * Enable maintenance mode
   * @param message - Maintenance message for users
   * @param estimatedDuration - Estimated duration in minutes
   * @returns Maintenance mode status
   */
  public async enableMaintenanceMode(message: string, estimatedDuration?: number): Promise<any> {
    const response = await apiClient.post('/admin/maintenance/enable', {
      message,
      estimatedDuration,
    });
    return response.data;
  }

  /**
   * Disable maintenance mode
   * @returns Maintenance mode status
   */
  public async disableMaintenanceMode(): Promise<any> {
    const response = await apiClient.post('/admin/maintenance/disable');
    return response.data;
  }

  // Notifications
  // =============

  /**
   * Send system-wide notification
   * @param notification - Notification details
   * @returns Send result
   */
  public async sendSystemNotification(notification: any): Promise<any> {
    const response = await apiClient.post('/admin/notifications/broadcast', notification);
    return response.data;
  }

  /**
   * Get notification templates
   * @returns List of notification templates
   */
  public async getNotificationTemplates(): Promise<any[]> {
    const response = await apiClient.get('/admin/notifications/templates');
    return response.data;
  }
}

// Export singleton instance
export const adminService = AdminService.getInstance();
