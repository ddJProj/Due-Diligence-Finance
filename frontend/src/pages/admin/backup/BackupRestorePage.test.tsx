// frontend/src/pages/admin/backup/BackupRestorePage.test.tsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { BackupRestorePage } from './BackupRestorePage';
import { store } from '../../../store/store';
import { adminService } from '../../../services/adminService';

// Mock the admin service
vi.mock('../../../services/adminService');

// Mock file input
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('BackupRestorePage', () => {
  const mockBackups = [
    {
      id: 'backup-001',
      filename: 'backup_2025-01-15_10-00-00.zip',
      createdAt: '2025-01-15T10:00:00',
      size: 52428800, // 50MB
      type: 'FULL',
      createdBy: 'admin@example.com',
      description: 'Full system backup',
      status: 'COMPLETED'
    },
    {
      id: 'backup-002',
      filename: 'backup_2025-01-14_10-00-00.zip',
      createdAt: '2025-01-14T10:00:00',
      size: 31457280, // 30MB
      type: 'PARTIAL',
      createdBy: 'system',
      description: 'Automated daily backup',
      status: 'COMPLETED'
    },
    {
      id: 'backup-003',
      filename: 'backup_2025-01-13_10-00-00.zip',
      createdAt: '2025-01-13T10:00:00',
      size: 41943040, // 40MB
      type: 'FULL',
      createdBy: 'admin@example.com',
      description: 'Pre-update backup',
      status: 'COMPLETED'
    }
  ];

  const mockBackupSettings = {
    autoBackupEnabled: true,
    backupSchedule: 'DAILY',
    backupTime: '02:00',
    retentionDays: 30,
    backupLocation: '/backups',
    includeUserData: true,
    includeInvestments: true,
    includeSystemConfig: true,
    compressionEnabled: true,
    encryptionEnabled: false
  };

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <BackupRestorePage />
        </MemoryRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (adminService.getBackupList as any).mockResolvedValue(mockBackups);
    (adminService.getBackupSettings as any).mockResolvedValue(mockBackupSettings);
  });

  it('should render loading state initially', () => {
    renderComponent();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should load and display backup list', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('backup_2025-01-15_10-00-00.zip')).toBeInTheDocument();
      expect(screen.getByText('Full system backup')).toBeInTheDocument();
      expect(screen.getByText('50 MB')).toBeInTheDocument();
    });

    expect(adminService.getBackupList).toHaveBeenCalled();
  });

  it('should display backup settings', async () => {
    renderComponent();

    await waitFor(() => {
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      fireEvent.click(settingsTab);
    });

    await waitFor(() => {
      expect(screen.getByText(/automatic backup/i)).toBeInTheDocument();
      expect(screen.getByText(/daily/i)).toBeInTheDocument();
      expect(screen.getByText(/02:00/i)).toBeInTheDocument();
      expect(screen.getByText(/30 days/i)).toBeInTheDocument();
    });
  });

  it('should create manual backup', async () => {
    (adminService.createBackup as any).mockResolvedValue({
      backupId: 'backup-004',
      message: 'Backup initiated successfully',
      estimatedTime: '5 minutes'
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create backup/i })).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create backup/i });
    fireEvent.click(createButton);

    // Open backup options modal
    expect(screen.getByText(/backup options/i)).toBeInTheDocument();

    // Select backup type
    const fullBackupRadio = screen.getByLabelText(/full backup/i);
    fireEvent.click(fullBackupRadio);

    // Add description
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Manual backup before upgrade' } });

    // Create backup
    const confirmButton = screen.getByRole('button', { name: /start backup/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminService.createBackup).toHaveBeenCalledWith({
        type: 'FULL',
        description: 'Manual backup before upgrade',
        includeUserData: true,
        includeInvestments: true,
        includeSystemConfig: true
      });
      expect(screen.getByText(/backup initiated successfully/i)).toBeInTheDocument();
    });
  });

  it('should download backup file', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /download/i })[0]).toBeInTheDocument();
    });

    const downloadButton = screen.getAllByRole('button', { name: /download/i })[0];
    fireEvent.click(downloadButton);

    // Should trigger download
    expect(adminService.downloadBackup).toHaveBeenCalledWith('backup-001');
  });

  it('should restore from backup', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /restore/i })[0]).toBeInTheDocument();
    });

    const restoreButton = screen.getAllByRole('button', { name: /restore/i })[0];
    fireEvent.click(restoreButton);

    // Show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/this will overwrite all current data/i)).toBeInTheDocument();

    // Require admin password
    const passwordInput = screen.getByLabelText(/admin password/i);
    fireEvent.change(passwordInput, { target: { value: 'adminPassword123!' } });

    // Confirm restore
    const confirmButton = screen.getByRole('button', { name: /confirm restore/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminService.restoreBackup).toHaveBeenCalledWith('backup-001', 'adminPassword123!');
    });
  });

  it('should delete old backup', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /delete/i }).length).toBeGreaterThan(0);
    });

    const deleteButton = screen.getAllByRole('button', { name: /delete/i })[2]; // Oldest backup
    fireEvent.click(deleteButton);

    // Show confirmation
    expect(screen.getByText(/delete backup/i)).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(adminService.deleteBackup).toHaveBeenCalledWith('backup-003');
    });
  });

  it('should update backup settings', async () => {
    renderComponent();

    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/enable automatic backup/i)).toBeInTheDocument();
    });

    // Change schedule
    const scheduleSelect = screen.getByLabelText(/backup schedule/i);
    fireEvent.change(scheduleSelect, { target: { value: 'WEEKLY' } });

    // Change retention days
    const retentionInput = screen.getByLabelText(/retention period/i);
    fireEvent.change(retentionInput, { target: { value: '60' } });

    // Save settings
    const saveButton = screen.getByRole('button', { name: /save settings/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(adminService.updateBackupSettings).toHaveBeenCalledWith({
        ...mockBackupSettings,
        backupSchedule: 'WEEKLY',
        retentionDays: 60
      });
    });
  });

  it('should upload and restore from file', async () => {
    renderComponent();

    const uploadTab = screen.getByRole('tab', { name: /upload/i });
    fireEvent.click(uploadTab);

    await waitFor(() => {
      expect(screen.getByText(/upload backup file/i)).toBeInTheDocument();
    });

    // Mock file selection
    const file = new File(['backup data'], 'backup.zip', { type: 'application/zip' });
    const fileInput = screen.getByLabelText(/select backup file/i);
    
    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Validate file
    expect(screen.getByText('backup.zip')).toBeInTheDocument();

    // Upload and restore
    const restoreButton = screen.getByRole('button', { name: /upload and restore/i });
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(adminService.uploadAndRestoreBackup).toHaveBeenCalledWith(file, expect.any(String));
    });
  });

  it('should validate backup file before restore', async () => {
    (adminService.validateBackup as any).mockResolvedValue({
      valid: true,
      version: '1.0',
      createdAt: '2025-01-15T10:00:00',
      dataTypes: ['users', 'investments', 'config']
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /validate/i })[0]).toBeInTheDocument();
    });

    const validateButton = screen.getAllByRole('button', { name: /validate/i })[0];
    fireEvent.click(validateButton);

    await waitFor(() => {
      expect(adminService.validateBackup).toHaveBeenCalledWith('backup-001');
      expect(screen.getByText(/backup is valid/i)).toBeInTheDocument();
      expect(screen.getByText(/version: 1.0/i)).toBeInTheDocument();
    });
  });

  it('should show backup in progress', async () => {
    const inProgressBackup = {
      id: 'backup-005',
      filename: 'backup_in_progress',
      createdAt: new Date().toISOString(),
      size: 0,
      type: 'FULL',
      createdBy: 'admin@example.com',
      description: 'Backup in progress',
      status: 'IN_PROGRESS',
      progress: 45
    };

    (adminService.getBackupList as any).mockResolvedValue([inProgressBackup, ...mockBackups]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/in progress/i)).toBeInTheDocument();
      expect(screen.getByText(/45%/i)).toBeInTheDocument();
    });
  });

  it('should display storage usage', async () => {
    (adminService.getBackupStorageInfo as any).mockResolvedValue({
      totalSize: 134217728, // 128MB
      usedSize: 125829120, // 120MB
      availableSize: 8388608, // 8MB
      backupCount: 3
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/storage usage/i)).toBeInTheDocument();
      expect(screen.getByText(/120 MB of 128 MB/i)).toBeInTheDocument();
      expect(screen.getByText(/93.75%/i)).toBeInTheDocument();
    });
  });

  it('should handle errors during backup creation', async () => {
    (adminService.createBackup as any).mockRejectedValue(new Error('Backup failed'));

    renderComponent();

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create backup/i });
      fireEvent.click(createButton);
    });

    const fullBackupRadio = screen.getByLabelText(/full backup/i);
    fireEvent.click(fullBackupRadio);

    const confirmButton = screen.getByRole('button', { name: /start backup/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText(/backup failed/i)).toBeInTheDocument();
    });
  });

  it('should cleanup old backups', async () => {
    renderComponent();

    const settingsTab = screen.getByRole('tab', { name: /settings/i });
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cleanup old backups/i })).toBeInTheDocument();
    });

    const cleanupButton = screen.getByRole('button', { name: /cleanup old backups/i });
    fireEvent.click(cleanupButton);

    await waitFor(() => {
      expect(adminService.cleanupOldBackups).toHaveBeenCalled();
    });
  });

  it('should display backup type badges', async () => {
    renderComponent();

    await waitFor(() => {
      const fullBadges = screen.getAllByText('FULL');
      const partialBadges = screen.getAllByText('PARTIAL');
      
      expect(fullBadges).toHaveLength(2);
      expect(partialBadges).toHaveLength(1);
    });
  });

  it('should filter backups by type', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByLabelText(/filter by type/i)).toBeInTheDocument();
    });

    const typeFilter = screen.getByLabelText(/filter by type/i);
    fireEvent.change(typeFilter, { target: { value: 'FULL' } });

    await waitFor(() => {
      expect(screen.getAllByText(/full system backup|pre-update backup/i)).toHaveLength(2);
      expect(screen.queryByText(/automated daily backup/i)).not.toBeInTheDocument();
    });
  });
});
