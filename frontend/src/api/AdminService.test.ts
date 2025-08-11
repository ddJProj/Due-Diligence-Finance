// frontend/src/api/AdminService.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminService } from './AdminService';
import { apiClient } from './apiClient';
import {
  SystemStatsDTO,
  UserAccountDTO,
  AdminDTO,
  Role,
  PageRequest,
  Page,
} from '@/types';

// Mock the apiClient
vi.mock('./apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AdminService', () => {
  let adminService: AdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    adminService = AdminService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AdminService.getInstance();
      const instance2 = AdminService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('System Management', () => {
    describe('getSystemStats', () => {
      it('should fetch system statistics', async () => {
        const mockStats: SystemStatsDTO = {
          totalUsers: 1250,
          activeUsers: 1100,
          totalClients: 950,
          totalEmployees: 45,
          totalAdmins: 5,
          totalInvestments: 3500,
          totalPortfolioValue: 125000000,
          systemHealth: 'HEALTHY',
          lastBackup: '2025-01-15T03:00:00Z',
          diskUsagePercent: 65,
          averageResponseTime: 120,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStats });

        const result = await adminService.getSystemStats();

        expect(apiClient.get).toHaveBeenCalledWith('/admin/stats');
        expect(result).toEqual(mockStats);
      });
    });

    describe('getSystemHealth', () => {
      it('should fetch detailed system health', async () => {
        const mockHealth = {
          status: 'HEALTHY',
          components: {
            database: { status: 'UP', responseTime: 15 },
            cache: { status: 'UP', responseTime: 2 },
            messageQueue: { status: 'UP', queueSize: 125 },
            stockApi: { status: 'UP', lastSync: '2025-01-15T10:00:00Z' },
          },
          uptime: '45 days, 3 hours',
          lastRestart: '2024-12-01T00:00:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHealth });

        const result = await adminService.getSystemHealth();

        expect(apiClient.get).toHaveBeenCalledWith('/admin/health');
        expect(result).toEqual(mockHealth);
      });
    });

    describe('performSystemBackup', () => {
      it('should trigger system backup', async () => {
        const mockResponse = {
          backupId: 'backup-2025-01-15-1100',
          status: 'IN_PROGRESS',
          startTime: '2025-01-15T11:00:00Z',
          estimatedDuration: '15 minutes',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.performSystemBackup();

        expect(apiClient.post).toHaveBeenCalledWith('/admin/backup');
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('User Management', () => {
    describe('getAllUsers', () => {
      it('should fetch paginated users', async () => {
        const pageRequest: PageRequest = {
          page: 0,
          size: 50,
          sort: 'createdDate',
        };

        const mockPage: Page<UserAccountDTO> = {
          content: [
            {
              id: 1,
              email: 'admin@ddfinance.com',
              firstName: 'Super',
              lastName: 'Admin',
              phoneNumber: '+1234567890',
              role: Role.ADMIN,
              emailVerified: true,
              active: true,
              createdDate: '2023-01-01T10:00:00Z',
            },
            {
              id: 2,
              email: 'client@example.com',
              firstName: 'John',
              lastName: 'Client',
              phoneNumber: '+0987654321',
              role: Role.CLIENT,
              emailVerified: true,
              active: true,
              createdDate: '2024-01-15T10:00:00Z',
            },
          ],
          totalElements: 1250,
          totalPages: 25,
          size: 50,
          number: 0,
          first: true,
          last: false,
          numberOfElements: 50,
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPage });

        const result = await adminService.getAllUsers(pageRequest);

        expect(apiClient.get).toHaveBeenCalledWith('/admin/users', {
          params: pageRequest,
        });
        expect(result).toEqual(mockPage);
      });
    });

    describe('getUserById', () => {
      it('should fetch specific user details', async () => {
        const userId = 123;
        const mockUser: UserAccountDTO = {
          id: userId,
          email: 'user@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+1234567890',
          role: Role.CLIENT,
          emailVerified: true,
          active: true,
          createdDate: '2024-01-15T10:00:00Z',
          lastLoginDate: '2025-01-14T15:30:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockUser });

        const result = await adminService.getUserById(userId);

        expect(apiClient.get).toHaveBeenCalledWith(`/admin/users/${userId}`);
        expect(result).toEqual(mockUser);
      });
    });

    describe('updateUserRole', () => {
      it('should update user role', async () => {
        const userId = 456;
        const newRole = Role.EMPLOYEE;

        const mockResponse: UserAccountDTO = {
          id: userId,
          email: 'promoted@example.com',
          firstName: 'Promoted',
          lastName: 'User',
          phoneNumber: '+1234567890',
          role: newRole,
          emailVerified: true,
          active: true,
          createdDate: '2024-01-15T10:00:00Z',
        };

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.updateUserRole(userId, newRole);

        expect(apiClient.put).toHaveBeenCalledWith(`/admin/users/${userId}/role`, {
          role: newRole,
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('deactivateUser', () => {
      it('should deactivate user account', async () => {
        const userId = 789;
        const reason = 'Terms of service violation';

        const mockResponse = {
          success: true,
          message: 'User account deactivated',
          deactivatedAt: '2025-01-15T11:00:00Z',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.deactivateUser(userId, reason);

        expect(apiClient.post).toHaveBeenCalledWith(`/admin/users/${userId}/deactivate`, {
          reason,
        });
        expect(result).toEqual(mockResponse);
      });
    });

    describe('reactivateUser', () => {
      it('should reactivate user account', async () => {
        const userId = 999;

        const mockResponse = {
          success: true,
          message: 'User account reactivated',
          reactivatedAt: '2025-01-15T11:30:00Z',
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.reactivateUser(userId);

        expect(apiClient.post).toHaveBeenCalledWith(`/admin/users/${userId}/reactivate`);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('System Configuration', () => {
    describe('getSystemConfig', () => {
      it('should fetch system configuration', async () => {
        const mockConfig = {
          maintenanceMode: false,
          maxUploadSize: 10485760, // 10MB
          sessionTimeout: 30,
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireNumber: true,
            requireSpecialChar: true,
          },
          emailSettings: {
            fromAddress: 'noreply@ddfinance.com',
            smtpHost: 'smtp.example.com',
            smtpPort: 587,
          },
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockConfig });

        const result = await adminService.getSystemConfig();

        expect(apiClient.get).toHaveBeenCalledWith('/admin/config');
        expect(result).toEqual(mockConfig);
      });
    });

    describe('updateSystemConfig', () => {
      it('should update system configuration', async () => {
        const configUpdate = {
          maintenanceMode: true,
          maintenanceMessage: 'System maintenance in progress',
        };

        const mockResponse = {
          success: true,
          message: 'Configuration updated successfully',
          updatedAt: '2025-01-15T11:00:00Z',
        };

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.updateSystemConfig(configUpdate);

        expect(apiClient.put).toHaveBeenCalledWith('/admin/config', configUpdate);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Activity Logs', () => {
    describe('getActivityLogs', () => {
      it('should fetch activity logs with filters', async () => {
        const filters = {
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-15T23:59:59Z',
          userId: 123,
          activityType: 'LOGIN',
        };

        const mockLogs = [
          {
            id: 1,
            userId: 123,
            userEmail: 'user@example.com',
            activityType: 'LOGIN',
            description: 'User logged in',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0...',
            timestamp: '2025-01-15T10:00:00Z',
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockLogs });

        const result = await adminService.getActivityLogs(filters);

        expect(apiClient.get).toHaveBeenCalledWith('/admin/activity-logs', {
          params: filters,
        });
        expect(result).toEqual(mockLogs);
      });
    });

    describe('getSecurityEvents', () => {
      it('should fetch security events', async () => {
        const mockEvents = [
          {
            id: 1,
            type: 'FAILED_LOGIN',
            severity: 'WARNING',
            description: 'Multiple failed login attempts',
            userEmail: 'user@example.com',
            ipAddress: '192.168.1.100',
            timestamp: '2025-01-15T09:30:00Z',
            resolved: false,
          },
          {
            id: 2,
            type: 'UNAUTHORIZED_ACCESS',
            severity: 'HIGH',
            description: 'Attempted access to admin endpoint',
            userEmail: 'suspicious@example.com',
            ipAddress: '10.0.0.50',
            timestamp: '2025-01-15T10:15:00Z',
            resolved: true,
          },
        ];

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockEvents });

        const result = await adminService.getSecurityEvents();

        expect(apiClient.get).toHaveBeenCalledWith('/admin/security-events');
        expect(result).toEqual(mockEvents);
      });
    });
  });

  describe('Admin Profile', () => {
    describe('getProfile', () => {
      it('should fetch admin profile', async () => {
        const mockProfile: AdminDTO = {
          id: 1,
          email: 'admin@ddfinance.com',
          firstName: 'Super',
          lastName: 'Admin',
          phoneNumber: '+1234567890',
          role: Role.ADMIN,
          emailVerified: true,
          active: true,
          createdDate: '2023-01-01T10:00:00Z',
          adminLevel: 'SUPER_ADMIN',
          permissions: ['ALL'],
          lastSystemAccess: '2025-01-15T10:00:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProfile });

        const result = await adminService.getProfile();

        expect(apiClient.get).toHaveBeenCalledWith('/admin/me/profile');
        expect(result).toEqual(mockProfile);
      });
    });

    describe('updateProfile', () => {
      it('should update admin profile', async () => {
        const profileUpdate = {
          phoneNumber: '+0987654321',
          twoFactorEnabled: true,
        };

        const mockResponse: AdminDTO = {
          id: 1,
          email: 'admin@ddfinance.com',
          firstName: 'Super',
          lastName: 'Admin',
          phoneNumber: '+0987654321',
          role: Role.ADMIN,
          emailVerified: true,
          active: true,
          createdDate: '2023-01-01T10:00:00Z',
          adminLevel: 'SUPER_ADMIN',
          permissions: ['ALL'],
          lastSystemAccess: '2025-01-15T10:00:00Z',
          twoFactorEnabled: true,
        };

        vi.mocked(apiClient.put).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.updateProfile(profileUpdate);

        expect(apiClient.put).toHaveBeenCalledWith('/admin/me/profile', profileUpdate);
        expect(result).toEqual(mockResponse);
      });
    });
  });

  describe('Reports and Analytics', () => {
    describe('generateSystemReport', () => {
      it('should generate system report', async () => {
        const reportRequest = {
          type: 'MONTHLY',
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          includeUserActivity: true,
          includeFinancialSummary: true,
          includeSystemHealth: true,
        };

        const mockResponse = {
          reportId: 'report-2025-01-monthly',
          status: 'GENERATING',
          estimatedTime: '5 minutes',
          downloadUrl: null,
        };

        vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.generateSystemReport(reportRequest);

        expect(apiClient.post).toHaveBeenCalledWith('/admin/reports/generate', reportRequest);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getReportStatus', () => {
      it('should check report generation status', async () => {
        const reportId = 'report-2025-01-monthly';
        
        const mockResponse = {
          reportId: reportId,
          status: 'COMPLETED',
          completedAt: '2025-01-15T11:05:00Z',
          downloadUrl: '/api/admin/reports/download/report-2025-01-monthly',
          expiresAt: '2025-01-22T11:05:00Z',
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockResponse });

        const result = await adminService.getReportStatus(reportId);

        expect(apiClient.get).toHaveBeenCalledWith(`/admin/reports/${reportId}/status`);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('getBusinessMetrics', () => {
      it('should fetch business metrics', async () => {
        const mockMetrics = {
          revenue: {
            monthly: 250000,
            quarterly: 750000,
            yearly: 3000000,
            growth: 15.5,
          },
          clients: {
            total: 950,
            new: 45,
            churnRate: 2.1,
            averagePortfolioValue: 131578.95,
          },
          investments: {
            totalVolume: 125000000,
            totalTransactions: 3500,
            topPerformingStock: 'NVDA',
            averageROI: 12.3,
          },
        };

        vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockMetrics });

        const result = await adminService.getBusinessMetrics();

        expect(apiClient.get).toHaveBeenCalledWith('/admin/metrics/business');
        expect(result).toEqual(mockMetrics);
      });
    });
  });
});
