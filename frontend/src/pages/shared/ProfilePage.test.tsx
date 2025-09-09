// frontend/src/pages/shared/ProfilePage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProfilePage from './ProfilePage';
import { authSlice } from '@/store/slices/authSlice';
import { adminService } from '@/api/AdminService';
import { clientService } from '@/api/ClientService';
import { employeeService } from '@/api/EmployeeService';
import type { UserDTO } from '@/types';

// Mock the API services
vi.mock('@/api/AdminService', () => ({
  adminService: {
    getUserProfile: vi.fn(),
  },
}));

vi.mock('@/api/ClientService', () => ({
  clientService: {
    getProfile: vi.fn(),
  },
}));

vi.mock('@/api/EmployeeService', () => ({
  employeeService: {
    getProfile: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProfilePage', () => {
  let store: any;
  const user = userEvent.setup();

  const mockClientProfile = {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CLIENT',
    phoneNumber: '+1234567890',
    address: '123 Main St, New York, NY 10001',
    dateOfBirth: '1980-01-15',
    joinDate: '2023-01-01T10:00:00Z',
    lastActive: '2024-12-15T10:00:00Z',
    isActive: true,
    assignedEmployeeId: 2,
    assignedEmployeeName: 'Jane Employee',
    portfolioValue: 150000.50,
    totalInvestments: 10,
  };

  const mockEmployeeProfile = {
    id: 2,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Employee',
    role: 'EMPLOYEE',
    phoneNumber: '+1987654321',
    department: 'Investment Advisory',
    employeeId: 'EMP-001',
    joinDate: '2022-06-15T10:00:00Z',
    lastActive: '2024-12-15T14:00:00Z',
    isActive: true,
    totalClients: 25,
    totalAUM: 5000000,
  };

  const mockAdminProfile = {
    id: 3,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    phoneNumber: '+1555555555',
    department: 'System Administration',
    joinDate: '2020-01-01T10:00:00Z',
    lastActive: '2024-12-15T16:00:00Z',
    isActive: true,
    systemRole: 'Super Admin',
    lastLogin: '2024-12-15T09:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createStore = (userRole: string, userData: any) => {
    return configureStore({
      reducer: {
        auth: authSlice.reducer,
      },
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: userData,
          token: 'mock-token',
          loading: false,
          error: null,
        },
      },
    });
  };

  const renderProfilePage = (userRole: string, userData: any) => {
    store = createStore(userRole, userData);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);
    
    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  describe('Client Profile', () => {
    beforeEach(() => {
      vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);
    });

    it('should display client profile information', async () => {
      renderProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('+1234567890')).toBeInTheDocument();
        expect(screen.getByText('123 Main St, New York, NY 10001')).toBeInTheDocument();
      });
    });

    it('should display portfolio information', async () => {
      renderProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByText('$150,000.50')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // Total investments
        expect(screen.getByText('Jane Employee')).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      renderProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByText('January 15, 1980')).toBeInTheDocument(); // Date of birth
        expect(screen.getByText(/January 1, 2023/)).toBeInTheDocument(); // Join date
      });
    });
  });

  describe('Employee Profile', () => {
    beforeEach(() => {
      vi.mocked(employeeService.getProfile).mockResolvedValue(mockEmployeeProfile);
    });

    it('should display employee profile information', async () => {
      renderProfilePage('EMPLOYEE', {
        id: 2,
        email: 'jane@example.com',
        name: 'Jane Employee',
        role: 'EMPLOYEE',
      });

      await waitFor(() => {
        expect(screen.getByText('Jane Employee')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
        expect(screen.getByText('Investment Advisory')).toBeInTheDocument();
        expect(screen.getByText('EMP-001')).toBeInTheDocument();
      });
    });

    it('should display employee statistics', async () => {
      renderProfilePage('EMPLOYEE', {
        id: 2,
        email: 'jane@example.com',
        name: 'Jane Employee',
        role: 'EMPLOYEE',
      });

      await waitFor(() => {
        expect(screen.getByText('25')).toBeInTheDocument(); // Total clients
        expect(screen.getByText('$5,000,000.00')).toBeInTheDocument(); // Total AUM
      });
    });
  });

  describe('Admin Profile', () => {
    beforeEach(() => {
      vi.mocked(adminService.getUserProfile).mockResolvedValue(mockAdminProfile);
    });

    it('should display admin profile information', async () => {
      renderProfilePage('ADMIN', {
        id: 3,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      });

      await waitFor(() => {
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
        expect(screen.getByText('System Administration')).toBeInTheDocument();
        expect(screen.getByText('Super Admin')).toBeInTheDocument();
      });
    });

    it('should display last login time', async () => {
      renderProfilePage('ADMIN', {
        id: 3,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      });

      await waitFor(() => {
        expect(screen.getByText(/Last Login/i)).toBeInTheDocument();
        expect(screen.getByText(/December 15, 2024/i)).toBeInTheDocument();
      });
    });
  });

  it('should handle loading state', () => {
    vi.mocked(clientService.getProfile).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    const error = new Error('Failed to load profile');
    vi.mocked(clientService.getProfile).mockRejectedValue(error);

    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should navigate to edit profile page', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);

    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit profile/i });
    await user.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile/edit');
  });

  it('should navigate to settings page', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);

    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('should display account status badge', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);

    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      const activeBadge = screen.getByText('Active');
      expect(activeBadge).toBeInTheDocument();
      expect(activeBadge.className).toContain('success');
    });
  });

  it('should display inactive status for inactive accounts', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue({
      ...mockClientProfile,
      isActive: false,
    });

    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      const inactiveBadge = screen.getByText('Inactive');
      expect(inactiveBadge).toBeInTheDocument();
      expect(inactiveBadge.className).toContain('danger');
    });
  });

  it('should refresh profile on retry', async () => {
    vi.mocked(clientService.getProfile)
      .mockRejectedValueOnce(new Error('Failed'))
      .mockResolvedValueOnce(mockClientProfile);

    renderProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should display guest message for guest users', () => {
    renderProfilePage('GUEST', {
      id: 4,
      email: 'guest@example.com',
      name: 'Guest User',
      role: 'GUEST',
    });

    expect(screen.getByText(/please log in to view your profile/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('should navigate to login for guest users', async () => {
    renderProfilePage('GUEST', {
      id: 4,
      email: 'guest@example.com',
      name: 'Guest User',
      role: 'GUEST',
    });

    const loginButton = screen.getByRole('button', { name: /log in/i });
    await user.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
