// frontend/src/types/user.types.ts

import { Role } from './common.types';

export interface UserAccountDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  active: boolean;
  createdAt: string;
  lastLogin: string;
  phoneNumber?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ClientDTO {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  assignedEmployeeId: number;
  assignedEmployeeName: string;
  portfolioValue: number;
  totalInvestments: number;
  joinDate: string;
  lastActivity: string;
  riskProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
}

export interface EmployeeDTO {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  department: string;
  managedClients: number;
  totalAssetsUnderManagement: number;
  performanceRating: number;
  joinDate: string;
}

export interface AdminDTO {
  id: number;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  adminLevel: 'ADMIN' | 'SUPER_ADMIN';
  permissions: string[];
  lastSystemAccess: string;
}

export interface UpdateUserDetailsRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: Address;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ClientDetailsDTO extends ClientDTO {
  notes?: string;
  preferences?: UserPreferences;
}

export interface EmployeeDetailsDTO extends EmployeeDTO {
  clients: ClientDTO[];
  monthlyPerformance: MonthlyPerformance[];
}

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  monthlyStatements: boolean;
  tradingAlerts: boolean;
}

export interface MonthlyPerformance {
  month: string;
  newClients: number;
  totalTransactions: number;
  revenue: number;
}

export interface SystemStatsDTO {
  totalUsers: number;
  activeUsers: number;
  totalClients: number;
  totalEmployees: number;
  totalAdmins: number;
  totalInvestments: number;
  totalPortfolioValue: number;
  systemUptime: string;
  lastBackup: string;
  storageUsed: string;
  storageTotal: string;
}

export interface UserActivity {
  userId: number;
  userName: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}
