// frontend/src/pages/dashboards/EmployeeDashboard.test.tsx

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeDashboard } from './EmployeeDashboard';
import { createTestStore } from '@/utils/test-utils';
import { Role, InvestmentStatus } from '@/types';

// Mock the hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useApi', () => ({
  useApi: vi.fn(),
}));

// Mock the API service
vi.mock('@/services/api/EmployeeService', () => ({
  employeeService: {
    getAssignedClients: vi.fn(),
    getDashboardStats: vi.fn(),
    getPendingRequests: vi.fn(),
  },
}));

import { useAuth } from '@/hooks/useAuth';
import { useApi } from '@/hooks/useApi';
import { employeeService } from '@/services/api/EmployeeService';

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseApi = useApi as jest.MockedFunction<typeof useApi>;
const mockEmployeeService = employeeService as jest.Mocked<typeof employeeService>;

describe('EmployeeDashboard', () => {
  const mockUser = {
    id: 1,
    email: 'employee@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: Role.EMPLOYEE,
  };

  const mockClients = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      portfolioValue: 150000,
      investmentCount: 5,
      lastActivity: '2024-03-15T10:30:00Z',
    },
    {
      id: 2,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      portfolioValue: 250000,
      investmentCount: 8,
      lastActivity: '2024-03-14T15:45:00Z',
    },
  ];

  const mockStats = {
    totalClients: 15,
    activeClients: 12,
    pendingRequests: 3,
    totalPortfolioValue: 2500000,
    monthlyGrowth: 5.2,
    newClientsThisMonth: 2,
  };

  const mockPendingRequests = [
    {
      id: 1,
      clientName: 'John Doe',
      type: 'NEW_INVESTMENT',
      stockSymbol: 'AAPL',
      quantity: 100,
      submittedAt: '2024-03-15T09:00:00Z',
      status: InvestmentStatus.PENDING_APPROVAL,
    },
    {
      id: 2,
      clientName: 'Alice Johnson',
      type: 'UPDATE_INVESTMENT',
      stockSymbol: 'GOOGL',
      quantity: 50,
      submittedAt: '2024-03-15T11:30:00Z',
      status: InvestmentStatus.PENDING_APPROVAL,
    },
  ];

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      loading: false,
      error: null,
    });

    mockUseApi.mockReturnValue({
      execute: vi.fn(),
      loading: false,
      error: null,
      data: null,
    });

    mockEmployeeService.getAssignedClients.mockResolvedValue({
      data: mockClients,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    mockEmployeeService.getDashboardStats.mockResolvedValue({
      data: mockStats,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    mockEmployeeService.getPendingRequests.mockResolvedValue({
      data: mockPendingRequests,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });
  });

  const renderDashboard = () => {
    const store = createTestStore();
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <EmployeeDashboard />
        </BrowserRouter>
      </Provider>
    );
  };

  it('should render welcome message with employee name', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(`Welcome back, ${mockUser.firstName}!`)).toBeInTheDocument();
      expect(screen.getByText(/manage your clients and investment requests/i)).toBeInTheDocument();
    });
  });

  it('should display dashboard statistics', async () => {
    renderDashboard();

    await waitFor(() => {
      // Total Clients
      expect(screen.getByText('Total Clients')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();

      // Active Clients
      expect(screen.getByText('Active Clients')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();

      // Pending Requests
      expect(screen.getByText('Pending Requests')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();

      // Total Portfolio Value
      expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument();
      expect(screen.getByText('$2,500,000.00')).toBeInTheDocument();
    });
  });

  it('should display client list', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Your Clients')).toBeInTheDocument();
      
      // Client names
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();

      // Client emails
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();

      // Portfolio values
      expect(screen.getByText('$150,000.00')).toBeInTheDocument();
      expect(screen.getByText('$250,000.00')).toBeInTheDocument();
    });
  });

  it('should display pending requests', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Pending Investment Requests')).toBeInTheDocument();
      
      // Request details
      expect(screen.getByText(/new investment/i)).toBeInTheDocument();
      expect(screen.getByText(/update investment/i)).toBeInTheDocument();
      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
    });
  });

  it('should navigate to client details when client is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const clientLink = screen.getAllByRole('link')[0];
    expect(clientLink).toHaveAttribute('href', '/clients/1');

    await user.click(clientLink);
  });

  it('should show quick actions', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view all clients/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /pending requests/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add new client/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /reports/i })).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    mockUseApi.mockReturnValue({
      execute: vi.fn(),
      loading: true,
      error: null,
      data: null,
    });

    renderDashboard();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should show error state', async () => {
    mockEmployeeService.getAssignedClients.mockRejectedValue(new Error('Failed to load data'));

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/unable to load dashboard/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('should refresh data when try again is clicked', async () => {
    const user = userEvent.setup();
    mockEmployeeService.getAssignedClients.mockRejectedValueOnce(new Error('Failed'));
    
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    // Mock successful response for retry
    mockEmployeeService.getAssignedClients.mockResolvedValueOnce({
      data: mockClients,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    renderDashboard();

    await waitFor(() => {
      // Should show formatted last activity dates
      expect(screen.getByText(/last activity:/i)).toBeInTheDocument();
    });
  });

  it('should show monthly growth percentage', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/monthly growth/i)).toBeInTheDocument();
      expect(screen.getByText(/5.2%/)).toBeInTheDocument();
    });
  });

  it('should show new clients this month', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/new clients this month/i)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should handle empty client list', async () => {
    mockEmployeeService.getAssignedClients.mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/no clients assigned yet/i)).toBeInTheDocument();
    });
  });

  it('should handle empty pending requests', async () => {
    mockEmployeeService.getPendingRequests.mockResolvedValue({
      data: [],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as any,
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/no pending requests/i)).toBeInTheDocument();
    });
  });

  it('should sort clients by last activity', async () => {
    renderDashboard();

    await waitFor(() => {
      const clientNames = screen.getAllByTestId('client-name');
      expect(clientNames[0]).toHaveTextContent('John Doe');
      expect(clientNames[1]).toHaveTextContent('Alice Johnson');
    });
  });

  it('should show investment count for each client', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/5 investments/i)).toBeInTheDocument();
      expect(screen.getByText(/8 investments/i)).toBeInTheDocument();
    });
  });

  it('should navigate to request details when request is clicked', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument();
    });

    const requestButton = screen.getAllByRole('button', { name: /review/i })[0];
    await user.click(requestButton);

    // Should navigate to request details
    expect(requestButton).toBeInTheDocument();
  });
});
