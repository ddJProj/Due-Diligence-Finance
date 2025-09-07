// frontend/src/pages/admin/users/EditUserPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { vi } from 'vitest';
import { EditUserPage } from './EditUserPage';
import { store } from '../../../store/store';
import { adminService } from '../../../services/adminService';
import type { UserAccountDTO, UpdateUserRequest } from '../../../types/admin.types';

// Mock the admin service
vi.mock('../../../services/adminService');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('EditUserPage', () => {
  const mockUser: UserAccountDTO = {
    id: 1,
    username: 'john.doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    role: 'CLIENT',
    active: true,
    createdDate: '2025-01-01',
    lastLogin: '2025-01-02'
  };

  const renderComponent = (userId = '1') => {
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/admin/users/${userId}/edit`]}>
          <Routes>
            <Route path="/admin/users/:id/edit" element={<EditUserPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getUser as any).mockResolvedValue(mockUser);
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should load and display user data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    expect(adminService.getUser).toHaveBeenCalledWith(1);
  });

  it('should display error when user not found', async () => {
    (adminService.getUser as any).mockRejectedValue(new Error('User not found'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByText(/retry/i);
    expect(retryButton).toBeInTheDocument();
  });

  it('should handle form submission with valid data', async () => {
    const updatedUser: UserAccountDTO = {
      ...mockUser,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com'
    };
    (adminService.updateUser as any).mockResolvedValue(updatedUser);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Update form fields
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    fireEvent.change(lastNameInput, { target: { value: 'Smith' } });
    fireEvent.change(emailInput, { target: { value: 'jane.smith@example.com' } });

    // Submit form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const expectedRequest: UpdateUserRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phoneNumber: '+1234567890',
        active: true
      };
      expect(adminService.updateUser).toHaveBeenCalledWith(1, expectedRequest);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
    });
  });

  it('should validate email format', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);

    expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('should validate required fields', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Clear required fields
    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const emailInput = screen.getByLabelText(/email address/i);

    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.change(lastNameInput, { target: { value: '' } });
    fireEvent.change(emailInput, { target: { value: '' } });

    fireEvent.blur(firstNameInput);
    fireEvent.blur(lastNameInput);
    fireEvent.blur(emailInput);

    expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('should handle role change', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const roleSelect = screen.getByLabelText(/user role/i);
    fireEvent.change(roleSelect, { target: { value: 'EMPLOYEE' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(adminService.updateUserRole).toHaveBeenCalledWith(1, 'EMPLOYEE');
    });
  });

  it('should toggle active status', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const activeCheckbox = screen.getByLabelText(/active account/i);
    expect(activeCheckbox).toBeChecked();

    fireEvent.click(activeCheckbox);
    expect(activeCheckbox).not.toBeChecked();
  });

  it('should show password reset section', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const resetPasswordButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetPasswordButton);

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('should handle password reset', async () => {
    (adminService.resetUserPassword as any).mockResolvedValue({ message: 'Password reset successfully' });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    // Open password reset section
    const resetPasswordButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetPasswordButton);

    // Enter new password
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123!' } });

    // Submit password reset
    const savePasswordButton = screen.getByRole('button', { name: /save new password/i });
    fireEvent.click(savePasswordButton);

    await waitFor(() => {
      expect(adminService.resetUserPassword).toHaveBeenCalledWith(1, 'NewPassword123!');
      expect(screen.getByText(/password reset successfully/i)).toBeInTheDocument();
    });
  });

  it('should validate password strength', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const resetPasswordButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetPasswordButton);

    const newPasswordInput = screen.getByLabelText(/new password/i);

    // Test weak password
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    expect(screen.queryByText(/strong/i)).not.toBeInTheDocument();

    // Test medium password
    fireEvent.change(newPasswordInput, { target: { value: 'Medium123!' } });
    expect(screen.getByText(/medium/i)).toBeInTheDocument();

    // Test strong password
    fireEvent.change(newPasswordInput, { target: { value: 'Str0ng!P@ssw0rd#2025' } });
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it('should validate password confirmation match', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const resetPasswordButton = screen.getByRole('button', { name: /reset password/i });
    fireEvent.click(resetPasswordButton);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123!' } });
    fireEvent.blur(confirmPasswordInput);

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();

    const savePasswordButton = screen.getByRole('button', { name: /save new password/i });
    expect(savePasswordButton).toBeDisabled();
  });

  it('should handle API errors during update', async () => {
    (adminService.updateUser as any).mockRejectedValue(new Error('Failed to update user'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/first name/i);
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to update user/i)).toBeInTheDocument();
    });
  });

  it('should navigate back on cancel', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/users');
  });

  it('should disable form during submission', async () => {
    (adminService.updateUser as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockUser), 1000))
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
  });

  it('should handle invalid user ID', async () => {
    renderComponent('invalid');

    await waitFor(() => {
      expect(screen.getByText(/invalid user id/i)).toBeInTheDocument();
    });
  });
});
