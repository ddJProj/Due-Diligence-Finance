// frontend/src/store/slices/adminSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { adminService } from '@/api';
import {
  Role,
  UserAccountDTO,
  SystemStatistics,
  ActivityLogDTO,
} from '@/types';
import { RootState } from '../store';

export interface AdminState {
  systemStats: SystemStatistics | null;
  systemHealth: any | null; // Define proper type when available
  users: UserAccountDTO[];
  selectedUser: UserAccountDTO | null;
  activityLogs: ActivityLogDTO[];
  businessMetrics: any | null; // Define proper type when available
  maintenanceMode: boolean;
  userFilter: 'all' | 'active' | 'disabled' | 'client' | 'employee' | 'admin';
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
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
};

// Async thunks
export const fetchSystemStats = createAsyncThunk(
  'admin/fetchSystemStats',
  async () => {
    const response = await adminService.getSystemStatistics();
    return response;
  }
);

export const fetchSystemHealth = createAsyncThunk(
  'admin/fetchSystemHealth',
  async () => {
    const response = await adminService.getSystemHealth();
    return response;
  }
);

export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (role?: Role) => {
    const response = await adminService.getUsers(role);
    return response;
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (userId: number) => {
    const response = await adminService.getUserById(userId);
    return response;
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }: { userId: number; role: Role }) => {
    const response = await adminService.updateUserRole(userId, role);
    return response;
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async ({ userId, enable }: { userId: number; enable: boolean }) => {
    if (enable) {
      await adminService.enableUser(userId);
    } else {
      await adminService.disableUser(userId);
    }
    return { userId, enabled: enable };
  }
);

export const fetchActivityLogs = createAsyncThunk(
  'admin/fetchActivityLogs',
  async (params?: { userId?: number; startDate?: string; endDate?: string }) => {
    const response = await adminService.getActivityLogs(params);
    return response;
  }
);

export const fetchBusinessMetrics = createAsyncThunk(
  'admin/fetchBusinessMetrics',
  async () => {
    const response = await adminService.getBusinessMetrics();
    return response;
  }
);

export const updateSystemConfig = createAsyncThunk(
  'admin/updateSystemConfig',
  async (config: Record<string, any>) => {
    const response = await adminService.updateSystemConfiguration(config);
    return response;
  }
);

export const toggleMaintenanceMode = createAsyncThunk(
  'admin/toggleMaintenanceMode',
  async (enable: boolean) => {
    const response = await adminService.updateSystemConfiguration({ maintenanceMode: enable });
    return enable;
  }
);

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<UserAccountDTO>) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setUserFilter: (state, action: PayloadAction<AdminState['userFilter']>) => {
      state.userFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch System Stats
    builder
      .addCase(fetchSystemStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemStats.fulfilled, (state, action) => {
        state.loading = false;
        state.systemStats = action.payload;
      })
      .addCase(fetchSystemStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch system statistics';
      });

    // Fetch System Health
    builder
      .addCase(fetchSystemHealth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.loading = false;
        state.systemHealth = action.payload;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch system health';
      });

    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });

    // Fetch User By Id
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch user';
      });

    // Update User Role
    builder
      .addCase(updateUserRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update user role';
      });

    // Toggle User Status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        const user = state.users.find(u => u.id === action.payload.userId);
        if (user) {
          user.enabled = action.payload.enabled;
        }
        if (state.selectedUser?.id === action.payload.userId) {
          state.selectedUser.enabled = action.payload.enabled;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle user status';
      });

    // Fetch Activity Logs
    builder
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.activityLogs = action.payload;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activity logs';
      });

    // Fetch Business Metrics
    builder
      .addCase(fetchBusinessMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessMetrics.fulfilled, (state, action) => {
        state.loading = false;
        state.businessMetrics = action.payload;
      })
      .addCase(fetchBusinessMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch business metrics';
      });

    // Toggle Maintenance Mode
    builder
      .addCase(toggleMaintenanceMode.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleMaintenanceMode.fulfilled, (state, action) => {
        state.loading = false;
        state.maintenanceMode = action.payload;
      })
      .addCase(toggleMaintenanceMode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle maintenance mode';
      });
  },
});

// Actions
export const {
  setSelectedUser,
  clearSelectedUser,
  setUserFilter,
} = adminSlice.actions;

// Selectors
export const selectAdmin = (state: RootState) => state.admin;
export const selectSystemStats = (state: RootState) => state.admin.systemStats;
export const selectSystemHealth = (state: RootState) => state.admin.systemHealth;
export const selectUsers = (state: RootState) => state.admin.users;
export const selectSelectedUser = (state: RootState) => state.admin.selectedUser;
export const selectActivityLogs = (state: RootState) => state.admin.activityLogs;
export const selectBusinessMetrics = (state: RootState) => state.admin.businessMetrics;
export const selectMaintenanceMode = (state: RootState) => state.admin.maintenanceMode;
export const selectUserFilter = (state: RootState) => state.admin.userFilter;

// Filtered users selector
export const selectFilteredUsers = (state: RootState) => {
  const { users, userFilter } = state.admin;
  
  switch (userFilter) {
    case 'active':
      return users.filter(u => u.enabled);
    case 'disabled':
      return users.filter(u => !u.enabled);
    case 'client':
      return users.filter(u => u.role === Role.CLIENT);
    case 'employee':
      return users.filter(u => u.role === Role.EMPLOYEE);
    case 'admin':
      return users.filter(u => u.role === Role.ADMIN);
    case 'all':
    default:
      return users;
  }
};

// Reducer
export default adminSlice.reducer;
