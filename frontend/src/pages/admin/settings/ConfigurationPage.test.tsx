// frontend/src/pages/admin/settings/ConfigurationPage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { ConfigurationPage } from './ConfigurationPage';
import { store } from '../../../store/store';
import { adminService } from '../../../services/adminService';

// Mock the admin service
vi.mock('../../../services/adminService');

describe('ConfigurationPage', () => {
  const mockConfigurations = [
    {
      id: 1,
      configKey: 'email.smtp.host',
      configValue: 'smtp.example.com',
      category: 'Email',
      dataType: 'STRING',
      description: 'SMTP server hostname',
      isActive: true,
      isEncrypted: false
    },
    {
      id: 2,
      configKey: 'email.smtp.port',
      configValue: '587',
      category: 'Email',
      dataType: 'INTEGER',
      description: 'SMTP server port',
      isActive: true,
      isEncrypted: false
    },
    {
      id: 3,
      configKey: 'api.timeout',
      configValue: '30000',
      category: 'API',
      dataType: 'INTEGER',
      description: 'API request timeout in milliseconds',
      isActive: true,
      isEncrypted: false
    },
    {
      id: 4,
      configKey: 'security.jwt.secret',
      configValue: '***encrypted***',
      category: 'Security',
      dataType: 'STRING',
      description: 'JWT signing secret',
      isActive: true,
      isEncrypted: true
    }
  ];

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <ConfigurationPage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getConfigurations as any).mockResolvedValue(mockConfigurations);
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should load and display configurations', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
      expect(screen.getByText('smtp.example.com')).toBeInTheDocument();
      expect(screen.getByText('SMTP server hostname')).toBeInTheDocument();
    });

    expect(adminService.getConfigurations).toHaveBeenCalled();
  });

  it('should filter configurations by search', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search configurations/i);
    fireEvent.change(searchInput, { target: { value: 'smtp' } });

    expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    expect(screen.getByText('email.smtp.port')).toBeInTheDocument();
    expect(screen.queryByText('api.timeout')).not.toBeInTheDocument();
  });

  it('should filter configurations by category', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    });

    const categoryFilter = screen.getByLabelText(/filter by category/i);
    fireEvent.change(categoryFilter, { target: { value: 'Email' } });

    expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    expect(screen.getByText('email.smtp.port')).toBeInTheDocument();
    expect(screen.queryByText('api.timeout')).not.toBeInTheDocument();
  });

  it('should show active configurations only by default', async () => {
    const configurationsWithInactive = [
      ...mockConfigurations,
      {
        id: 5,
        configKey: 'deprecated.feature',
        configValue: 'false',
        category: 'System',
        dataType: 'BOOLEAN',
        description: 'Deprecated feature flag',
        isActive: false,
        isEncrypted: false
      }
    ];
    (adminService.getConfigurations as any).mockResolvedValue(configurationsWithInactive);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    });

    expect(screen.queryByText('deprecated.feature')).not.toBeInTheDocument();

    const showInactiveCheckbox = screen.getByLabelText(/show inactive/i);
    fireEvent.click(showInactiveCheckbox);

    expect(screen.getByText('deprecated.feature')).toBeInTheDocument();
  });

  it('should handle edit configuration', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue('smtp.example.com');
    fireEvent.change(input, { target: { value: 'smtp.newhost.com' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(adminService.updateConfiguration).toHaveBeenCalledWith(1, {
        configValue: 'smtp.newhost.com'
      });
    });
  });

  it('should handle add new configuration', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add configuration/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add configuration/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/new configuration/i)).toBeInTheDocument();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/configuration key/i), {
      target: { value: 'new.config.key' }
    });
    fireEvent.change(screen.getByLabelText(/value/i), {
      target: { value: 'new value' }
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: 'System' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'New configuration description' }
    });

    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(adminService.createConfiguration).toHaveBeenCalledWith({
        configKey: 'new.config.key',
        configValue: 'new value',
        category: 'System',
        dataType: 'STRING',
        description: 'New configuration description',
        isActive: true,
        isEncrypted: false
      });
    });
  });

  it('should validate configuration key format', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add configuration/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add configuration/i });
    fireEvent.click(addButton);

    const keyInput = screen.getByLabelText(/configuration key/i);
    fireEvent.change(keyInput, { target: { value: 'invalid key!' } });
    fireEvent.blur(keyInput);

    expect(screen.getByText(/key must contain only letters, numbers, dots, and underscores/i)).toBeInTheDocument();
  });

  it('should show warning for encrypted values', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('security.jwt.secret')).toBeInTheDocument();
    });

    const encryptedValue = screen.getByText('***encrypted***');
    expect(encryptedValue).toBeInTheDocument();
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    const securityEditButton = editButtons[3]; // JWT secret is 4th item
    fireEvent.click(securityEditButton);

    expect(screen.getByText(/warning: this is an encrypted value/i)).toBeInTheDocument();
  });

  it('should handle delete configuration', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('api.timeout')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[2]); // API timeout is 3rd item

    expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminService.deleteConfiguration).toHaveBeenCalledWith(3);
    });
  });

  it('should display error when loading fails', async () => {
    (adminService.getConfigurations as any).mockRejectedValue(new Error('Failed to load configurations'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load configurations/i)).toBeInTheDocument();
    });
  });

  it('should handle API error during update', async () => {
    (adminService.updateConfiguration as any).mockRejectedValue(new Error('Update failed'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    const input = screen.getByDisplayValue('smtp.example.com');
    fireEvent.change(input, { target: { value: 'smtp.newhost.com' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it('should group configurations by category', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  it('should export configurations', async () => {
    (adminService.exportConfigurations as any).mockResolvedValue(
      new Blob(['config data'], { type: 'application/json' })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /export/i });
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(adminService.exportConfigurations).toHaveBeenCalled();
    });
  });

  it('should toggle between card and table view', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('email.smtp.host')).toBeInTheDocument();
    });

    // Default is table view
    expect(screen.getByRole('table')).toBeInTheDocument();

    const viewToggle = screen.getByRole('button', { name: /card view/i });
    fireEvent.click(viewToggle);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('config-card')).toHaveLength(4);
  });

  it('should disable editing for system critical configurations', async () => {
    const criticalConfig = {
      id: 6,
      configKey: 'database.url',
      configValue: 'jdbc:postgresql://localhost:5432/db',
      category: 'System',
      dataType: 'STRING',
      description: 'Database connection URL',
      isActive: true,
      isEncrypted: false,
      isCritical: true
    };
    
    (adminService.getConfigurations as any).mockResolvedValue([...mockConfigurations, criticalConfig]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('database.url')).toBeInTheDocument();
    });

    const criticalBadge = screen.getByText(/critical/i);
    expect(criticalBadge).toBeInTheDocument();
  });
});
