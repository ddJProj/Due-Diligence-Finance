// frontend/src/pages/shared/EditProfilePage.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import EditProfilePage from './EditProfilePage';
import { authSlice } from '@/store/slices/authSlice';
import { adminService } from '@/api/AdminService';
import { clientService } from '@/api/ClientService';
import { employeeService } from '@/api/EmployeeService';

// Mock the API services
vi.mock('@/api/AdminService', () => ({
  adminService: {
    getUserProfile: vi.fn(),
    updateUserProfile: vi.fn(),
  },
}));

vi.mock('@/api/ClientService', () => ({
  clientService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

vi.mock('@/api/EmployeeService', () => ({
  employeeService: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
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

describe('EditProfilePage', () => {
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

  const renderEditProfilePage = (userRole: string, userData: any) => {
    store = createStore(userRole, userData);
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <EditProfilePage />
        </MemoryRouter>
      </Provider>
    );
  };

  it('should render without errors', () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);
    
    renderEditProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
  });

  describe('Client Profile Editing', () => {
    beforeEach(() => {
      vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);
    });

    it('should load and display client profile data in form', async () => {
      renderEditProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
        expect(screen.getByDisplayValue('123 Main St, New York, NY 10001')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1980-01-15')).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      renderEditProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Clear required fields
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);

      await user.clear(firstNameInput);
      await user.clear(lastNameInput);

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    });

    it('should validate phone number format', async () => {
      renderEditProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, '123');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
    });

    it('should validate date of birth', async () => {
      renderEditProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('1980-01-15')).toBeInTheDocument();
      });

      const dobInput = screen.getByLabelText(/date of birth/i);
      await user.clear(dobInput);
      await user.type(dobInput, '2030-01-01');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(screen.getByText(/date of birth cannot be in the future/i)).toBeInTheDocument();
    });

    it('should update client profile successfully', async () => {
      vi.mocked(clientService.updateProfile).mockResolvedValue({
        ...mockClientProfile,
        firstName: 'John Updated',
        phoneNumber: '+1999999999',
      });

      renderEditProfilePage('CLIENT', {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
        role: 'CLIENT',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Update fields
      const firstNameInput = screen.getByLabelText(/first name/i);
      const phoneInput = screen.getByLabelText(/phone number/i);

      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'John Updated');
      
      await user.clear(phoneInput);
      await user.type(phoneInput, '+1999999999');

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(vi.mocked(clientService.updateProfile)).toHaveBeenCalledWith({
        firstName: 'John Updated',
        lastName: 'Doe',
        phoneNumber: '+1999999999',
        address: '123 Main St, New York, NY 10001',
        dateOfBirth: '1980-01-15',
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/profile');
      });
    });
  });

  describe('Employee Profile Editing', () => {
    beforeEach(() => {
      vi.mocked(employeeService.getProfile).mockResolvedValue(mockEmployeeProfile);
    });

    it('should load and display employee profile data', async () => {
      renderEditProfilePage('EMPLOYEE', {
        id: 2,
        email: 'jane@example.com',
        name: 'Jane Employee',
        role: 'EMPLOYEE',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Employee')).toBeInTheDocument();
        expect(screen.getByDisplayValue('+1987654321')).toBeInTheDocument();
      });

      // Should not show editable department or employee ID fields
      expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/employee id/i)).not.toBeInTheDocument();
    });

    it('should update employee profile successfully', async () => {
      vi.mocked(employeeService.updateProfile).mockResolvedValue({
        ...mockEmployeeProfile,
        firstName: 'Jane Updated',
      });

      renderEditProfilePage('EMPLOYEE', {
        id: 2,
        email: 'jane@example.com',
        name: 'Jane Employee',
        role: 'EMPLOYEE',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane Updated');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(vi.mocked(employeeService.updateProfile)).toHaveBeenCalledWith({
        firstName: 'Jane Updated',
        lastName: 'Employee',
        phoneNumber: '+1987654321',
      });
    });
  });

  describe('Admin Profile Editing', () => {
    beforeEach(() => {
      vi.mocked(adminService.getUserProfile).mockResolvedValue(mockAdminProfile);
    });

    it('should update admin profile successfully', async () => {
      vi.mocked(adminService.updateUserProfile).mockResolvedValue({
        ...mockAdminProfile,
        phoneNumber: '+1777777777',
      });

      renderEditProfilePage('ADMIN', {
        id: 3,
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'ADMIN',
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue('+1555555555')).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, '+1777777777');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      expect(vi.mocked(adminService.updateUserProfile)).toHaveBeenCalledWith(3, {
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+1777777777',
      });
    });
  });

  it('should show loading state while saving', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);
    vi.mocked(clientService.updateProfile).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderEditProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  it('should handle save error', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);
    vi.mocked(clientService.updateProfile).mockRejectedValue(new Error('Update failed'));

    renderEditProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    });
  });

  it('should show confirmation when canceling with changes', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);

    renderEditProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Make changes
    const firstNameInput = screen.getByLabelText(/first name/i);
    await user.type(firstNameInput, ' Changed');

    // Try to cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Confirm dialog should appear
    expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();

    // Confirm cancellation
    const confirmButton = screen.getByRole('button', { name: /discard/i });
    await user.click(confirmButton);

    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('should cancel without confirmation if no changes', async () => {
    vi.mocked(clientService.getProfile).mockResolvedValue(mockClientProfile);

    renderEditProfilePage('CLIENT', {
      id: 1,
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Cancel without making changes
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    // Should navigate directly without confirmation
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
    expect(screen.queryByText(/you have unsaved changes/i)).not.toBeInTheDocument();
  });

  it('should prevent guest users from accessing edit page', () => {
    renderEditProfilePage('GUEST', {
      id: 4,
      email: 'guest@example.com',
      name: 'Guest User',
      role: 'GUEST',
    });

    expect(screen.getByText(/please log in to edit your profile/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });
});
