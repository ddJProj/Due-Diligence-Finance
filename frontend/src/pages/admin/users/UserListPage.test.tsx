// frontend/src/pages/admin/users/UserListPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import UserListPage from './UserListPage';
import { userService } from '../../../services/api/user.service';
import { UserRole } from '../../../types/auth.types';

vi.mock('../../../services/api/user.service');

const mockUsers = [
  {
    id: 1,
    username: 'john.admin',
    email: 'john.admin@example.com',
    firstName: 'John',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    enabled: true,
    createdAt: '2024-01-01T10:00:00',
    lastLoginAt: '2024-01-20T14:30:00'
  },
  {
    id: 2,
    username: 'jane.employee',
    email: 'jane.employee@example.com',
    firstName: 'Jane',
    lastName: 'Employee',
    role: UserRole.EMPLOYEE,
    enabled: true,
    createdAt: '2024-01-05T09:00:00',
    lastLoginAt: '2024-01-19T11:15:00'
  },
  {
    id: 3,
    username: 'bob.client',
    email: 'bob.client@example.com',
    firstName: 'Bob',
    lastName: 'Client',
    role: UserRole.CLIENT,
    enabled: false,
    createdAt: '2023-12-15T08:00:00',
    lastLoginAt: '2024-01-10T16:45:00'
  }
];

describe('UserListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    vi.mocked(userService.getAll).mockResolvedValue({ data: [] });
    renderWithProviders(<UserListPage />);
    expect(screen.getByText('User Management')).toBeInTheDocument();
  });

  it('should display loading state while fetching users', () => {
    vi.mocked(userService.getAll).mockImplementation(() => 
      new Promise(() => {})
    );
    renderWithProviders(<UserListPage />);
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('should display users when data is loaded', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Admin')).toBeInTheDocument();
      expect(screen.getByText('Jane Employee')).toBeInTheDocument();
      expect(screen.getByText('Bob Client')).toBeInTheDocument();
    });
  });

  it('should display empty state when no users exist', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ data: [] });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText('No users match your current filters.')).toBeInTheDocument();
    });
  });

  it('should display error state when fetching fails', async () => {
    vi.mocked(userService.getAll).mockRejectedValue(
      new Error('Failed to fetch users')
    );
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching when retry button is clicked', async () => {
    vi.mocked(userService.getAll)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockUsers });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading users')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('John Admin')).toBeInTheDocument();
    });
  });

  it('should search users by name or email', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Admin')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search by name, username, or email...');
    fireEvent.change(searchInput, { target: { value: 'jane' } });
    
    expect(screen.getByText('Jane Employee')).toBeInTheDocument();
    expect(screen.queryByText('John Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Client')).not.toBeInTheDocument();
  });

  it('should filter users by role', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByRole('row')).toHaveLength(4); // Header + 3 users
    });
    
    const roleFilter = screen.getByLabelText('Filter by role');
    fireEvent.change(roleFilter, { target: { value: UserRole.ADMIN } });
    
    expect(screen.getByText('John Admin')).toBeInTheDocument();
    expect(screen.queryByText('Jane Employee')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Client')).not.toBeInTheDocument();
  });

  it('should filter users by status', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bob Client')).toBeInTheDocument();
    });
    
    const statusFilter = screen.getByLabelText('Filter by status');
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    expect(screen.getByText('John Admin')).toBeInTheDocument();
    expect(screen.getByText('Jane Employee')).toBeInTheDocument();
    expect(screen.queryByText('Bob Client')).not.toBeInTheDocument();
  });

  it('should navigate to create user page', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Add User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Add User'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/new');
  });

  it('should navigate to edit user page', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Edit')).toHaveLength(3);
    });
    
    fireEvent.click(screen.getAllByText('Edit')[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin/users/1/edit');
  });

  it('should toggle user status', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    vi.mocked(userService.toggleStatus).mockResolvedValue({ 
      data: { ...mockUsers[2], enabled: true } 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bob Client')).toBeInTheDocument();
    });
    
    const toggleButtons = screen.getAllByText('Enable');
    fireEvent.click(toggleButtons[0]);
    
    await waitFor(() => {
      expect(vi.mocked(userService.toggleStatus)).toHaveBeenCalledWith(3);
    });
  });

  it('should show confirmation dialog before deleting user', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Delete')).toHaveLength(3);
    });
    
    fireEvent.click(screen.getAllByText('Delete')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Delete User')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this user?')).toBeInTheDocument();
    });
  });

  it('should delete user after confirmation', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    vi.mocked(userService.delete).mockResolvedValue({ data: null });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getAllByText('Delete')).toHaveLength(3);
    });
    
    fireEvent.click(screen.getAllByText('Delete')[0]);
    
    await waitFor(() => {
      expect(screen.getByText('Delete User')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Confirm Delete'));
    
    await waitFor(() => {
      expect(vi.mocked(userService.delete)).toHaveBeenCalledWith(1);
    });
  });

  it('should display user role badges correctly', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
      expect(screen.getByText('EMPLOYEE')).toBeInTheDocument();
      expect(screen.getByText('CLIENT')).toBeInTheDocument();
    });
  });

  it('should display user statistics', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total users
      expect(screen.getByText('2')).toBeInTheDocument(); // Active users
      expect(screen.getByText('1')).toBeInTheDocument(); // Admins or Inactive
    });
  });

  it('should sort users by name', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bob Client')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'name' } });
    
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('Bob Client')).toBeInTheDocument(); // First data row after sort
  });

  it('should format dates correctly', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
    });
  });

  it('should handle users with no last login', async () => {
    const usersWithNoLogin = [
      {
        ...mockUsers[0],
        lastLoginAt: null
      }
    ];
    
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: usersWithNoLogin 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  it('should export users list as CSV', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    const mockCreateElement = document.createElement.bind(document);
    const mockClick = vi.fn();
    document.createElement = vi.fn((tagName) => {
      const element = mockCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
      }
      return element;
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(mockClick).toHaveBeenCalled();
    
    document.createElement = mockCreateElement;
  });

  it('should refresh user list', async () => {
    vi.mocked(userService.getAll).mockResolvedValue({ 
      data: mockUsers 
    });
    
    renderWithProviders(<UserListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Admin')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Refresh'));
    
    expect(vi.mocked(userService.getAll)).toHaveBeenCalledTimes(2);
  });
});
