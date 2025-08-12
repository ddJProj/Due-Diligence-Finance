// frontend/src/store/slices/adminSlice.test.ts

import { configureStore } from '@reduxjs/toolkit';
import adminReducer, {
  fetchSystemStats,
  fetchSystemHealth,
  fetchUsers,
  fetchUserById,
  updateUserRole,
  toggleUserStatus,
  fetchActivityLogs,
  fetchBusinessMetrics,
  updateSystemConfig,
  toggleMaintenanceMode,
  setSelectedUser,
  clearSelectedUser,
  setUserFilter,
  selectAdmin,
  selectSystemStats,
  selectSystemHealth,
  selectUsers,
  selectSelectedUser,
  selectActivityLogs,
  selectBusinessMetrics,
  selectMaintenanceMode,
  selectUserFilter,
  selectFilteredUsers,
  AdminState,
} from './adminSlice';
import { adminService } from '@/api';
import {
  Role,
  UserAccountDTO,
  SystemStatistics,
  ActivityLogDTO,
} from '@/types';

// Mock the admin service
jest.mock('@/api', () => ({
  adminService: {
    getSystemStatistics: jest.fn(),
    getSystemHealth: jest.fn(),
    getUsers: jest.fn(),
    getUserById: jest.fn(),
    updateUserRole: jest.fn(),
    disableUser: jest.fn(),
    enableUser: jest.fn(),
    getActivityLogs: jest.fn(),
    getBusinessMetrics: jest.fn(),
    updateSystemConfiguration: jest.fn(),
  },
}));

describe('adminSlice', () => {
  let store: ReturnType<typeof configureStore>;

  const mockUsers: UserAccountDTO[] = [
    {
      id: 1,
      username: 'johndoe',
      email: 'john@example.com',
      role: Role.CLIENT,
      enabled: true,
      accountNonExpired: true,
      accountNonLocked: true,
      credentialsNonExpired: true,
    },
    {
      id: 2,
      username: 'janesmith',
      email: 'jane@example.com',
      role: Role.EMPLOYEE,
      enabled: true,
      accountNonExpired: true,
      accountNonLocked: true,
      credentialsNonExpired: true,
    },
  ];

  const mockSystemStats: SystemStatistics = {
    totalUsers: 150,
    activeUsers: 142,
    totalInvestments: 450,
    totalValue: 15000000,
    systemUptime: 99.9,
    lastBackup: '2024-01-15T03:00:00Z',
    storageUsed: 75.5,
    cpuUsage: 45.2,
    memoryUsage: 60.8,
  };

  const mockSystemHealth = {
    status: 'HEALTHY',
    database: { status: 'UP', responseTime: 25 },
    cache: { status: 'UP', hitRate: 95.5 },
    messageQueue: { status: 'UP', pendingMessages: 12 },
    services: [
      { name: 'AuthService', status: 'UP', uptime: 99.99 },
      { name: 'InvestmentService', status: 'UP', uptime: 99.95 },
    ],
  };

  const mockActivityLogs: ActivityLogDTO[] = [
    {
      id: 1,
      userId: 1,
      username: 'johndoe',
      action: 'LOGIN',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      timestamp: '2024-01-15T10:30:00Z',
    },
  ];

  const mockBusinessMetrics = {
    monthlyRevenue: 125000,
    yearlyRevenue: 1250000,
    userGrowth: 15.5,
    investmentGrowth: 22.3,
    topPerformingAssets: [
      { symbol: 'AAPL', performance: 25.5 },
      { symbol: 'GOOGL', performance: 18.3 },
    ],
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        admin: adminReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().admin;
      expect(state).toEqual({
        systemStats: null,
        systemHealth: null,
        users: [],
        selectedUser: null,
        activityLogs: [],
        businessMetrics: null,
        maintenanceMode: false,
        userFilter: 'all',
        loading: false,
        error: null,
      });
    });
  });

  describe('Synchronous Actions', () => {
    it('should handle setSelectedUser', () => {
      const user = mockUsers[0];
      store.dispatch(setSelectedUser(user));
      
      expect(store.getState().admin.selectedUser).toEqual(user);
    });

    it('should handle clearSelectedUser', () => {
      store.dispatch(setSelectedUser(mockUsers[0]));
      store.dispatch(clearSelectedUser());
      
      expect(store.getState().admin.selectedUser).toBeNull();
    });

    it('should handle setUserFilter', () => {
      store.dispatch(setUserFilter('active'));
      expect(store.getState().admin.userFilter).toBe('active');

      store.dispatch(setUserFilter('disabled'));
      expect(store.getState().admin.userFilter).toBe('disabled');
    });
  });

  describe('Async Actions', () => {
    describe('fetchSystemStats', () => {
      it('should handle successful system stats fetch', async () => {
        (adminService.getSystemStatistics as jest.Mock).mockResolvedValueOnce(mockSystemStats);

        await store.dispatch(fetchSystemStats() as any);
        const state = store.getState().admin;

        expect(adminService.getSystemStatistics).toHaveBeenCalled();
        expect(state.systemStats).toEqual(mockSystemStats);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle system stats fetch failure', async () => {
        const error = new Error('Failed to fetch stats');
        (adminService.getSystemStatistics as jest.Mock).mockRejectedValueOnce(error);

        await store.dispatch(fetchSystemStats() as any);
        const state = store.getState().admin;

        expect(state.systemStats).toBeNull();
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Failed to fetch stats');
      });
    });

    describe('fetchSystemHealth', () => {
      it('should handle successful system health fetch', async () => {
        (adminService.getSystemHealth as jest.Mock).mockResolvedValueOnce(mockSystemHealth);

        await store.dispatch(fetchSystemHealth() as any);
        const state = store.getState().admin;

        expect(adminService.getSystemHealth).toHaveBeenCalled();
        expect(state.systemHealth).toEqual(mockSystemHealth);
      });
    });

    describe('fetchUsers', () => {
      it('should handle successful users fetch', async () => {
        (adminService.getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

        await store.dispatch(fetchUsers() as any);
        const state = store.getState().admin;

        expect(adminService.getUsers).toHaveBeenCalled();
        expect(state.users).toEqual(mockUsers);
      });

      it('should handle users fetch with role filter', async () => {
        (adminService.getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);

        await store.dispatch(fetchUsers(Role.EMPLOYEE) as any);

        expect(adminService.getUsers).toHaveBeenCalledWith(Role.EMPLOYEE);
      });
    });

    describe('updateUserRole', () => {
      it('should handle successful role update', async () => {
        // Set initial users
        (adminService.getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);
        await store.dispatch(fetchUsers() as any);

        const updatedUser = { ...mockUsers[0], role: Role.EMPLOYEE };
        (adminService.updateUserRole as jest.Mock).mockResolvedValueOnce(updatedUser);

        await store.dispatch(updateUserRole({ userId: 1, role: Role.EMPLOYEE }) as any);
        const state = store.getState().admin;

        expect(adminService.updateUserRole).toHaveBeenCalledWith(1, Role.EMPLOYEE);
        
        const user = state.users.find(u => u.id === 1);
        expect(user?.role).toBe(Role.EMPLOYEE);
      });
    });

    describe('toggleUserStatus', () => {
      it('should handle disabling a user', async () => {
        // Set initial users
        (adminService.getUsers as jest.Mock).mockResolvedValueOnce(mockUsers);
        await store.dispatch(fetchUsers() as any);

        (adminService.disableUser as jest.Mock).mockResolvedValueOnce(undefined);

        await store.dispatch(toggleUserStatus({ userId: 1, enable: false }) as any);
        const state = store.getState().admin;

        expect(adminService.disableUser).toHaveBeenCalledWith(1);
        
        const user = state.users.find(u => u.id === 1);
        expect(user?.enabled).toBe(false);
      });

      it('should handle enabling a user', async () => {
        // Set initial users with one disabled
        const usersWithDisabled = [
          { ...mockUsers[0], enabled: false },
          mockUsers[1],
        ];
        store = configureStore({
          reducer: {
            admin: adminReducer,
          },
          preloadedState: {
            admin: {
              ...store.getState().admin,
              users: usersWithDisabled,
            },
          },
        });

        (adminService.enableUser as jest.Mock).mockResolvedValueOnce(undefined);

        await store.dispatch(toggleUserStatus({ userId: 1, enable: true }) as any);
        const state = store.getState().admin;

        expect(adminService.enableUser).toHaveBeenCalledWith(1);
        
        const user = state.users.find(u => u.id === 1);
        expect(user?.enabled).toBe(true);
      });
    });

    describe('fetchActivityLogs', () => {
      it('should handle successful activity logs fetch', async () => {
        (adminService.getActivityLogs as jest.Mock).mockResolvedValueOnce(mockActivityLogs);

        await store.dispatch(fetchActivityLogs() as any);
        const state = store.getState().admin;

        expect(adminService.getActivityLogs).toHaveBeenCalled();
        expect(state.activityLogs).toEqual(mockActivityLogs);
      });

      it('should handle activity logs fetch with parameters', async () => {
        const params = { userId: 1, startDate: '2024-01-01', endDate: '2024-01-31' };
        (adminService.getActivityLogs as jest.Mock).mockResolvedValueOnce(mockActivityLogs);

        await store.dispatch(fetchActivityLogs(params) as any);

        expect(adminService.getActivityLogs).toHaveBeenCalledWith(params);
      });
    });

    describe('toggleMaintenanceMode', () => {
      it('should handle enabling maintenance mode', async () => {
        (adminService.updateSystemConfiguration as jest.Mock).mockResolvedValueOnce({ maintenanceMode: true });

        await store.dispatch(toggleMaintenanceMode(true) as any);
        const state = store.getState().admin;

        expect(adminService.updateSystemConfiguration).toHaveBeenCalledWith({ maintenanceMode: true });
        expect(state.maintenanceMode).toBe(true);
      });

      it('should handle disabling maintenance mode', async () => {
        // Set initial state with maintenance mode on
        store = configureStore({
          reducer: {
            admin: adminReducer,
          },
          preloadedState: {
            admin: {
              ...store.getState().admin,
              maintenanceMode: true,
            },
          },
        });

        (adminService.updateSystemConfiguration as jest.Mock).mockResolvedValueOnce({ maintenanceMode: false });

        await store.dispatch(toggleMaintenanceMode(false) as any);
        const state = store.getState().admin;

        expect(state.maintenanceMode).toBe(false);
      });
    });
  });

  describe('Selectors', () => {
    const mockState = {
      admin: {
        systemStats: mockSystemStats,
        systemHealth: mockSystemHealth,
        users: mockUsers,
        selectedUser: mockUsers[0],
        activityLogs: mockActivityLogs,
        businessMetrics: mockBusinessMetrics,
        maintenanceMode: false,
        userFilter: 'active',
        loading: false,
        error: null,
      } as AdminState,
    };

    it('should select admin state', () => {
      expect(selectAdmin(mockState as any)).toEqual(mockState.admin);
    });

    it('should select system stats', () => {
      expect(selectSystemStats(mockState as any)).toEqual(mockSystemStats);
    });

    it('should select filtered users - all', () => {
      const stateWithAllFilter = {
        admin: { ...mockState.admin, userFilter: 'all' },
      };
      const filtered = selectFilteredUsers(stateWithAllFilter as any);
      expect(filtered).toEqual(mockUsers);
    });

    it('should select filtered users - active only', () => {
      const filtered = selectFilteredUsers(mockState as any);
      expect(filtered).toEqual(mockUsers.filter(u => u.enabled));
    });

    it('should select filtered users - disabled only', () => {
      const mixedUsers = [
        mockUsers[0],
        { ...mockUsers[1], enabled: false },
      ];
      const stateWithMixed = {
        admin: {
          ...mockState.admin,
          users: mixedUsers,
          userFilter: 'disabled',
        },
      };
      
      const filtered = selectFilteredUsers(stateWithMixed as any);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].enabled).toBe(false);
    });

    it('should select filtered users by role', () => {
      const stateWithRoleFilter = {
        admin: { ...mockState.admin, userFilter: 'employee' },
      };
      const filtered = selectFilteredUsers(stateWithRoleFilter as any);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].role).toBe(Role.EMPLOYEE);
    });
  });
});
