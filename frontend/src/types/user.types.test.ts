// frontend/src/types/user.types.test.ts
import { describe, it, expect } from 'vitest';
import type {
  UserAccountDTO,
  ClientDTO,
  EmployeeDTO,
  AdminDTO,
  UpdateUserDetailsRequest,
  UpdatePasswordRequest,
  ClientDetailsDTO,
  EmployeeDetailsDTO,
  SystemStatsDTO,
  UserActivity,
} from './user.types';

describe('User Types', () => {
  describe('UserAccountDTO', () => {
    it('should have correct structure for user account', () => {
      const validUser: UserAccountDTO = {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CLIENT',
        active: true,
        createdAt: '2024-01-01T10:00:00Z',
        lastLogin: '2024-12-15T09:30:00Z',
        phoneNumber: '+1-555-123-4567',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
      };

      expect(validUser.id).toBe(1);
      expect(validUser.email).toBe('user@example.com');
      expect(validUser.role).toBe('CLIENT');
      expect(validUser.active).toBe(true);
      expect(validUser.address?.city).toBe('New York');
    });

    it('should allow user without optional fields', () => {
      const minimalUser: UserAccountDTO = {
        id: 2,
        email: 'minimal@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'GUEST',
        active: true,
        createdAt: '2024-01-01T10:00:00Z',
        lastLogin: '2024-12-15T09:30:00Z',
      };

      expect(minimalUser.phoneNumber).toBeUndefined();
      expect(minimalUser.address).toBeUndefined();
    });
  });

  describe('ClientDTO', () => {
    it('should have correct structure for client data', () => {
      const validClient: ClientDTO = {
        id: 1,
        userId: 100,
        email: 'client@example.com',
        firstName: 'John',
        lastName: 'Client',
        assignedEmployeeId: 50,
        assignedEmployeeName: 'Jane Employee',
        portfolioValue: 250000.00,
        totalInvestments: 10,
        joinDate: '2023-01-15',
        lastActivity: '2024-12-15T10:00:00Z',
        riskProfile: 'MODERATE',
      };

      expect(validClient.assignedEmployeeId).toBe(50);
      expect(validClient.portfolioValue).toBe(250000.00);
      expect(validClient.riskProfile).toBe('MODERATE');
    });
  });

  describe('EmployeeDTO', () => {
    it('should have correct structure for employee data', () => {
      const validEmployee: EmployeeDTO = {
        id: 1,
        userId: 50,
        email: 'employee@example.com',
        firstName: 'Jane',
        lastName: 'Employee',
        employeeCode: 'EMP001',
        department: 'Investment Advisory',
        managedClients: 15,
        totalAssetsUnderManagement: 3750000.00,
        performanceRating: 4.5,
        joinDate: '2022-06-01',
      };

      expect(validEmployee.employeeCode).toBe('EMP001');
      expect(validEmployee.managedClients).toBe(15);
      expect(validEmployee.totalAssetsUnderManagement).toBe(3750000.00);
    });
  });

  describe('AdminDTO', () => {
    it('should have correct structure for admin data', () => {
      const validAdmin: AdminDTO = {
        id: 1,
        userId: 1,
        email: 'admin@example.com',
        firstName: 'System',
        lastName: 'Admin',
        adminLevel: 'SUPER_ADMIN',
        permissions: [
          'USER_MANAGEMENT',
          'SYSTEM_CONFIG',
          'REPORT_GENERATION',
          'BACKUP_RESTORE',
        ],
        lastSystemAccess: '2024-12-15T08:00:00Z',
      };

      expect(validAdmin.adminLevel).toBe('SUPER_ADMIN');
      expect(validAdmin.permissions).toContain('USER_MANAGEMENT');
      expect(validAdmin.permissions).toHaveLength(4);
    });
  });

  describe('UpdateUserDetailsRequest', () => {
    it('should have correct structure for updating user details', () => {
      const validUpdate: UpdateUserDetailsRequest = {
        firstName: 'Updated',
        lastName: 'Name',
        phoneNumber: '+1-555-987-6543',
        address: {
          street: '456 New Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA',
        },
      };

      expect(validUpdate.firstName).toBe('Updated');
      expect(validUpdate.address?.city).toBe('Los Angeles');
    });
  });

  describe('UpdatePasswordRequest', () => {
    it('should have correct structure for password update', () => {
      const validRequest: UpdatePasswordRequest = {
        currentPassword: 'OldPassword123!',
        newPassword: 'NewSecurePass456!',
        confirmPassword: 'NewSecurePass456!',
      };

      expect(validRequest.currentPassword).toBe('OldPassword123!');
      expect(validRequest.newPassword).toBe('NewSecurePass456!');
      expect(validRequest.confirmPassword).toBe('NewSecurePass456!');
    });
  });

  describe('SystemStatsDTO', () => {
    it('should have correct structure for system statistics', () => {
      const validStats: SystemStatsDTO = {
        totalUsers: 1000,
        activeUsers: 850,
        totalClients: 750,
        totalEmployees: 50,
        totalAdmins: 5,
        totalInvestments: 5000,
        totalPortfolioValue: 125000000.00,
        systemUptime: '99.98%',
        lastBackup: '2024-12-15T03:00:00Z',
        storageUsed: '45.5 GB',
        storageTotal: '100 GB',
      };

      expect(validStats.totalUsers).toBe(1000);
      expect(validStats.activeUsers).toBe(850);
      expect(validStats.totalPortfolioValue).toBe(125000000.00);
      expect(validStats.systemUptime).toBe('99.98%');
    });
  });
});
