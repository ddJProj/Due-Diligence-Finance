// frontend/src/pages/admin/backup/BackupRestorePage.tsx

import React, { useState, useEffect } from 'react';
import { useAppDispatch } from '../../../hooks/redux';
import { adminService } from '../../../services/adminService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Select } from '../../../components/common/Select';
import { showToast } from '../../../store/slices/uiSlice';
import { formatBytes, formatDate } from '../../../utils/formatters';
import './BackupRestorePage.css';

interface Backup {
  id: string;
  filename: string;
  createdAt: string;
  size: number;
  type: 'FULL' | 'PARTIAL' | 'INCREMENTAL';
  createdBy: string;
  description?: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'FAILED';
  progress?: number;
}

interface BackupSettings {
  autoBackupEnabled: boolean;
  backupSchedule: string;
  backupTime: string;
  retentionDays: number;
  backupLocation: string;
  includeUserData: boolean;
  includeInvestments: boolean;
  includeSystemConfig: boolean;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
}

interface StorageInfo {
  totalSize: number;
  usedSize: number;
  availableSize: number;
  backupCount: number;
}

interface BackupOptions {
  type: string;
  description: string;
  includeUserData: boolean;
  includeInvestments: boolean;
  includeSystemConfig: boolean;
}

type TabType = 'backups' | 'settings' | 'upload';

export const BackupRestorePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('backups');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [restoreBackup, setRestoreBackup] = useState<Backup | null>(null);
  const [deleteBackup, setDeleteBackup] = useState<Backup | null>(null);
  const [validatingBackup, setValidatingBackup] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');

  // Backup creation state
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    type: 'FULL',
    description: '',
    includeUserData: true,
    includeInvestments: true,
    includeSystemConfig: true
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [backupList, backupSettings, storage] = await Promise.all([
        adminService.getBackupList(),
        adminService.getBackupSettings(),
        adminService.getBackupStorageInfo()
      ]);
      setBackups(backupList);
      setSettings(backupSettings);
      setStorageInfo(storage);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load backup data');
    } finally {
      setLoading(false);
    }
  };

  // Filter backups
  const filteredBackups = backups.filter(backup => {
    if (typeFilter === 'all') return true;
    return backup.type === typeFilter;
  });

  // Handle backup creation
  const handleCreateBackup = async () => {
    try {
      const result = await adminService.createBackup(backupOptions);
      dispatch(showToast({
        message: result.message || 'Backup initiated successfully',
        type: 'success'
      }));
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to create backup',
        type: 'error'
      }));
    }
  };

  // Handle backup download
  const handleDownload = async (backupId: string) => {
    try {
      const blob = await adminService.downloadBackup(backupId);
      const backup = backups.find(b => b.id === backupId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup?.filename || 'backup.zip';
      a.click();
      window.URL.revokeObjectURL(url);
      
      dispatch(showToast({
        message: 'Backup downloaded successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to download backup',
        type: 'error'
      }));
    }
  };

  // Handle backup restore
  const handleRestore = async () => {
    if (!restoreBackup || !adminPassword) return;

    try {
      await adminService.restoreBackup(restoreBackup.id, adminPassword);
      dispatch(showToast({
        message: 'System restore initiated. The system will restart shortly.',
        type: 'success'
      }));
      setRestoreBackup(null);
      setAdminPassword('');
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to restore backup',
        type: 'error'
      }));
    }
  };

  // Handle backup deletion
  const handleDelete = async () => {
    if (!deleteBackup) return;

    try {
      await adminService.deleteBackup(deleteBackup.id);
      dispatch(showToast({
        message: 'Backup deleted successfully',
        type: 'success'
      }));
      setDeleteBackup(null);
      loadData();
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to delete backup',
        type: 'error'
      }));
    }
  };

  // Handle backup validation
  const handleValidate = async (backupId: string) => {
    try {
      setValidatingBackup(backupId);
      const validation = await adminService.validateBackup(backupId);
      
      if (validation.valid) {
        dispatch(showToast({
          message: `Backup is valid. Version: ${validation.version}`,
          type: 'success'
        }));
      } else {
        dispatch(showToast({
          message: 'Backup validation failed',
          type: 'error'
        }));
      }
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to validate backup',
        type: 'error'
      }));
    } finally {
      setValidatingBackup(null);
    }
  };

  // Handle settings update
  const handleUpdateSettings = async () => {
    if (!settings) return;

    try {
      await adminService.updateBackupSettings(settings);
      dispatch(showToast({
        message: 'Backup settings updated successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to update settings',
        type: 'error'
      }));
    }
  };

  // Handle file upload and restore
  const handleFileUpload = async () => {
    if (!selectedFile || !adminPassword) return;

    try {
      await adminService.uploadAndRestoreBackup(selectedFile, adminPassword);
      dispatch(showToast({
        message: 'Backup uploaded and restore initiated',
        type: 'success'
      }));
      setSelectedFile(null);
      setAdminPassword('');
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to upload and restore backup',
        type: 'error'
      }));
    }
  };

  // Handle cleanup
  const handleCleanup = async () => {
    try {
      const result = await adminService.cleanupOldBackups();
      dispatch(showToast({
        message: `Cleaned up ${result.deletedCount} old backups`,
        type: 'success'
      }));
      loadData();
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to cleanup backups',
        type: 'error'
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error) {
    return (
      <div className="backup-restore-page">
        <Card>
          <div className="error-state">
            <p>{error}</p>
            <Button onClick={loadData} variant="primary">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const storagePercentage = storageInfo 
    ? (storageInfo.usedSize / storageInfo.totalSize * 100).toFixed(2)
    : 0;

  return (
    <div className="backup-restore-page">
      <div className="page-header">
        <h1>Backup & Restore</h1>
        <p>Manage system backups and restoration</p>
      </div>

      {storageInfo && (
        <Card className="storage-info">
          <h3>Storage Usage</h3>
          <div className="storage-bar">
            <div 
              className="storage-fill" 
              style={{ width: `${storagePercentage}%` }}
            />
          </div>
          <div className="storage-details">
            <span>{formatBytes(storageInfo.usedSize)} of {formatBytes(storageInfo.totalSize)}</span>
            <span>{storagePercentage}% used</span>
            <span>{storageInfo.backupCount} backups</span>
          </div>
        </Card>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'backups' ? 'active' : ''}`}
          onClick={() => setActiveTab('backups')}
          role="tab"
          aria-selected={activeTab === 'backups'}
        >
          Backups
        </button>
        <button
          className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          role="tab"
          aria-selected={activeTab === 'settings'}
        >
          Settings
        </button>
        <button
          className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
          role="tab"
          aria-selected={activeTab === 'upload'}
        >
          Upload
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'backups' && (
          <div className="backups-section">
            <div className="backups-controls">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by type"
              >
                <option value="all">All Types</option>
                <option value="FULL">Full Backups</option>
                <option value="PARTIAL">Partial Backups</option>
                <option value="INCREMENTAL">Incremental</option>
              </Select>

              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Backup
              </Button>
            </div>

            <div className="backups-list">
              {filteredBackups.length === 0 ? (
                <Card className="empty-state">
                  <p>No backups found</p>
                </Card>
              ) : (
                filteredBackups.map(backup => (
                  <Card key={backup.id} className="backup-item">
                    <div className="backup-header">
                      <div>
                        <h3>{backup.filename}</h3>
                        <p className="backup-description">{backup.description}</p>
                      </div>
                      <div className="backup-badges">
                        <Badge variant={backup.type === 'FULL' ? 'success' : 'info'}>
                          {backup.type}
                        </Badge>
                        {backup.status === 'IN_PROGRESS' && (
                          <Badge variant="warning">
                            In Progress {backup.progress}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="backup-details">
                      <span>Created: {formatDate(backup.createdAt)}</span>
                      <span>Size: {formatBytes(backup.size)}</span>
                      <span>By: {backup.createdBy}</span>
                    </div>

                    {backup.status === 'COMPLETED' && (
                      <div className="backup-actions">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleDownload(backup.id)}
                        >
                          Download
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => handleValidate(backup.id)}
                          disabled={validatingBackup === backup.id}
                        >
                          {validatingBackup === backup.id ? 'Validating...' : 'Validate'}
                        </Button>
                        <Button
                          size="small"
                          variant="warning"
                          onClick={() => setRestoreBackup(backup)}
                        >
                          Restore
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => setDeleteBackup(backup)}
                        >
                          Delete
                        </Button>
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && settings && (
          <Card className="settings-section">
            <h2>Backup Settings</h2>
            
            <div className="settings-form">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.autoBackupEnabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      autoBackupEnabled: e.target.checked
                    })}
                  />
                  Enable Automatic Backup
                </label>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="backupSchedule">Backup Schedule</label>
                  <Select
                    id="backupSchedule"
                    value={settings.backupSchedule}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupSchedule: e.target.value
                    })}
                  >
                    <option value="HOURLY">Hourly</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </Select>
                </div>

                <div className="form-group">
                  <label htmlFor="backupTime">Backup Time</label>
                  <input
                    type="time"
                    id="backupTime"
                    value={settings.backupTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      backupTime: e.target.value
                    })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="retentionDays">Retention Period (days)</label>
                <input
                  type="number"
                  id="retentionDays"
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({
                    ...settings,
                    retentionDays: parseInt(e.target.value) || 30
                  })}
                  min="1"
                  max="365"
                />
              </div>

              <div className="backup-options">
                <h3>Backup Contents</h3>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.includeUserData}
                    onChange={(e) => setSettings({
                      ...settings,
                      includeUserData: e.target.checked
                    })}
                  />
                  Include User Data
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.includeInvestments}
                    onChange={(e) => setSettings({
                      ...settings,
                      includeInvestments: e.target.checked
                    })}
                  />
                  Include Investments
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.includeSystemConfig}
                    onChange={(e) => setSettings({
                      ...settings,
                      includeSystemConfig: e.target.checked
                    })}
                  />
                  Include System Configuration
                </label>
              </div>

              <div className="form-actions">
                <Button
                  variant="secondary"
                  onClick={handleCleanup}
                >
                  Cleanup Old Backups
                </Button>
                <Button
                  variant="primary"
                  onClick={handleUpdateSettings}
                >
                  Save Settings
                </Button>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'upload' && (
          <Card className="upload-section">
            <h2>Upload Backup File</h2>
            <p>Upload and restore from an external backup file</p>

            <div className="upload-form">
              <div className="form-group">
                <label htmlFor="backupFile">Select Backup File</label>
                <input
                  type="file"
                  id="backupFile"
                  accept=".zip"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="file-info">
                    Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="uploadPassword">Admin Password</label>
                <input
                  type="password"
                  id="uploadPassword"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter your admin password"
                />
              </div>

              <div className="warning-message">
                <strong>Warning:</strong> Uploading and restoring a backup will overwrite all current system data.
                Make sure you have a recent backup before proceeding.
              </div>

              <Button
                variant="primary"
                onClick={handleFileUpload}
                disabled={!selectedFile || !adminPassword}
              >
                Upload and Restore
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Create Backup Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Backup Options"
      >
        <div className="backup-create-form">
          <div className="form-group">
            <label>Backup Type</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="backupType"
                  value="FULL"
                  checked={backupOptions.type === 'FULL'}
                  onChange={(e) => setBackupOptions({
                    ...backupOptions,
                    type: e.target.value
                  })}
                />
                Full Backup
              </label>
              <label>
                <input
                  type="radio"
                  name="backupType"
                  value="PARTIAL"
                  checked={backupOptions.type === 'PARTIAL'}
                  onChange={(e) => setBackupOptions({
                    ...backupOptions,
                    type: e.target.value
                  })}
                />
                Partial Backup
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="backupDescription">Description</label>
            <textarea
              id="backupDescription"
              value={backupOptions.description}
              onChange={(e) => setBackupOptions({
                ...backupOptions,
                description: e.target.value
              })}
              rows={3}
              placeholder="Backup description..."
            />
          </div>

          {backupOptions.type === 'PARTIAL' && (
            <div className="backup-options">
              <h4>Include in Backup:</h4>
              <label>
                <input
                  type="checkbox"
                  checked={backupOptions.includeUserData}
                  onChange={(e) => setBackupOptions({
                    ...backupOptions,
                    includeUserData: e.target.checked
                  })}
                />
                User Data
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={backupOptions.includeInvestments}
                  onChange={(e) => setBackupOptions({
                    ...backupOptions,
                    includeInvestments: e.target.checked
                  })}
                />
                Investments
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={backupOptions.includeSystemConfig}
                  onChange={(e) => setBackupOptions({
                    ...backupOptions,
                    includeSystemConfig: e.target.checked
                  })}
                />
                System Configuration
              </label>
            </div>
          )}

          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateBackup}
            >
              Start Backup
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore Confirmation */}
      <Modal
        isOpen={!!restoreBackup}
        onClose={() => {
          setRestoreBackup(null);
          setAdminPassword('');
        }}
        title="Confirm System Restore"
      >
        <div className="restore-confirm">
          <div className="warning-message">
            <strong>Warning:</strong> This will overwrite all current data with the backup from{' '}
            {restoreBackup && formatDate(restoreBackup.createdAt)}.
          </div>

          <div className="form-group">
            <label htmlFor="restorePassword">Admin Password</label>
            <input
              type="password"
              id="restorePassword"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Enter your admin password to confirm"
            />
          </div>

          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={() => {
                setRestoreBackup(null);
                setAdminPassword('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRestore}
              disabled={!adminPassword}
            >
              Confirm Restore
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteBackup}
        onClose={() => setDeleteBackup(null)}
        onConfirm={handleDelete}
        title="Delete Backup"
        message={`Are you sure you want to delete "${deleteBackup?.filename}"?`}
      />
    </div>
  );
};
