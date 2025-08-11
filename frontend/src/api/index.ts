// frontend/src/api/index.ts

/**
 * Central export for all API services and utilities
 */

// Export API client and utilities
export { apiClient, setAuthToken, clearAuthToken, setupInterceptors } from './apiClient';
export * from './helpers';

// Export service instances
export { authService, AuthService } from './AuthService';
export { clientService, ClientService } from './ClientService';
export { employeeService, EmployeeService } from './EmployeeService';
export { adminService, AdminService } from './AdminService';
export { guestService, GuestService } from './GuestService';

// Re-export types for convenience
export type {
  ApiResponse,
} from './helpers';
