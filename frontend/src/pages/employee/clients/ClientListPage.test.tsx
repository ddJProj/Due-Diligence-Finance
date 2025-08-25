// frontend/src/pages/employee/clients/ClientListPage.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import ClientListPage from './ClientListPage';
import { userService } from '../../../services/api/user.service';
import { UserRole } from '../../../types/auth.types';

vi.mock('../../../services/api/user.service');

const mockClients = [
  {
    id: 1,
    username: 'john.doe',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.CLIENT,
    enabled: true,
    createdAt: '2024-01-01T10:00:00',
    lastLoginAt: '2024-01-15T14:30:00',
    portfolioValue: 150000.00,
    totalInvestments: 12
  },
  {
    id: 2,
    username: 'jane.smith',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: UserRole.CLIENT,
    enabled: true,
    createdAt: '2024-01-05T09:00:00',
    lastLoginAt: '2024-01-20T11:15:00',
    portfolioValue: 275000.00,
    totalInvestments: 18
  },
  {
    id: 3,
    username: 'bob.johnson',
    email: 'bob.johnson@example.com',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: UserRole.CLIENT,
    enabled: false,
    createdAt: '2023-12-15T08:00:00',
    lastLoginAt: '2024-01-10T16:45:00',
    portfolioValue: 50000.00,
    totalInvestments: 5
  }
];

describe('ClientListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ data: [] });
    renderWithProviders(<ClientListPage />);
    expect(screen.getByText('Client Management')).toBeInTheDocument();
  });

  it('should display loading state while fetching clients', () => {
    vi.mocked(userService.getClientsList).mockImplementation(() => 
      new Promise(() => {})
    );
    renderWithProviders(<ClientListPage />);
    expect(screen.getByText('Loading clients...')).toBeInTheDocument();
  });

  it('should display clients when data is loaded', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
  });

  it('should display empty state when no clients exist', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ data: [] });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('No clients found')).toBeInTheDocument();
      expect(screen.getByText('No clients match your current filters. Try adjusting your search criteria.')).toBeInTheDocument();
    });
  });

  it('should display error state when fetching fails', async () => {
    vi.mocked(userService.getClientsList).mockRejectedValue(
      new Error('Failed to fetch clients')
    );
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading clients')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch clients')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching when retry button is clicked', async () => {
    vi.mocked(userService.getClientsList)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ data: mockClients });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading clients')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Try Again'));
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should search clients by name', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText('Search by name or email...');
    fireEvent.change(searchInput, { target: { value: 'jane' } });
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should filter clients by status', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });
    
    const statusFilter = screen.getByLabelText('Filter by status');
    fireEvent.change(statusFilter, { target: { value: 'active' } });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('should sort clients by portfolio value', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
    
    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'portfolio-desc' } });
    
    const rows = screen.getAllByRole('row');
    const firstDataRow = rows[1]; // Skip header row
    expect(within(firstDataRow).getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should navigate to client details when view button is clicked', async () => {
    const mockNavigate = vi.fn();
    vi.mock('react-router-dom', () => ({
      ...vi.importActual('react-router-dom'),
      useNavigate: () => mockNavigate
    }));
    
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByText('View Portfolio');
    fireEvent.click(viewButtons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/employee/clients/1');
  });

  it('should display client statistics summary', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // Total clients
      expect(screen.getByText('2')).toBeInTheDocument(); // Active clients
      expect(screen.getByText('$475,000.00')).toBeInTheDocument(); // Total AUM
      expect(screen.getByText('$158,333.33')).toBeInTheDocument(); // Average portfolio
    });
  });

  it('should format currency values correctly', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('$150,000.00')).toBeInTheDocument();
      expect(screen.getByText('$275,000.00')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    });
  });

  it('should display client status badges correctly', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      const activeBadges = screen.getAllByText('Active');
      const inactiveBadges = screen.getAllByText('Inactive');
      
      expect(activeBadges).toHaveLength(2);
      expect(inactiveBadges).toHaveLength(1);
    });
  });

  it('should export client list as CSV', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
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
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Export CSV')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Export CSV'));
    
    expect(mockClick).toHaveBeenCalled();
    
    document.createElement = mockCreateElement;
  });

  it('should handle email client action', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
    
    const emailLink = screen.getByText('john.doe@example.com');
    expect(emailLink.tagName).toBe('A');
    expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
  });

  it('should display last login information', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Jan 15, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 20, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 10, 2024')).toBeInTheDocument();
    });
  });

  it('should switch between table and card view on mobile', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    window.dispatchEvent(new Event('resize'));
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      // Should show cards on mobile
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('client-card')).toHaveLength(3);
    });
  });

  it('should handle clients with no last login', async () => {
    const clientsWithNoLogin = [
      {
        ...mockClients[0],
        lastLoginAt: null
      }
    ];
    
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: clientsWithNoLogin 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  it('should refresh client list when refresh button is clicked', async () => {
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: mockClients 
    });
    
    renderWithProviders(<ClientListPage />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    
    vi.mocked(userService.getClientsList).mockResolvedValue({ 
      data: [...mockClients, {
        id: 4,
        username: 'new.client',
        email: 'new.client@example.com',
        firstName: 'New',
        lastName: 'Client',
        role: UserRole.CLIENT,
        enabled: true,
        createdAt: '2024-01-21T10:00:00',
        lastLoginAt: null,
        portfolioValue: 0,
        totalInvestments: 0
      }] 
    });
    
    fireEvent.click(screen.getByText('Refresh'));
    
    await waitFor(() => {
      expect(screen.getByText('New Client')).toBeInTheDocument();
    });
  });
});
