// frontend/src/pages/admin/settings/ConfigurationPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../../hooks/redux';
import { adminService } from '../../../services/adminService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Modal } from '../../../components/common/Modal';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Badge } from '../../../components/common/Badge';
import { showToast } from '../../../store/slices/uiSlice';
import './ConfigurationPage.css';

interface Configuration {
  id: number;
  configKey: string;
  configValue: string;
  category: string;
  dataType: string;
  description?: string;
  isActive: boolean;
  isEncrypted: boolean;
  isCritical?: boolean;
}

interface ConfigFormData {
  configKey: string;
  configValue: string;
  category: string;
  dataType: string;
  description: string;
  isActive: boolean;
  isEncrypted: boolean;
}

export const ConfigurationPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [filteredConfigs, setFilteredConfigs] = useState<Configuration[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<Configuration | null>(null);
  const [deleteConfig, setDeleteConfig] = useState<Configuration | null>(null);

  // Form state
  const [formData, setFormData] = useState<ConfigFormData>({
    configKey: '',
    configValue: '',
    category: '',
    dataType: 'STRING',
    description: '',
    isActive: true,
    isEncrypted: false
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load configurations
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      setLoading(true);
      const data = await adminService.getConfigurations();
      setConfigurations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load configurations');
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(configurations.map(c => c.category))];
    return cats.sort();
  }, [configurations]);

  // Filter configurations
  useEffect(() => {
    let filtered = configurations;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(config =>
        config.configKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.configValue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (config.description && config.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(config => config.category === categoryFilter);
    }

    // Active filter
    if (!showInactive) {
      filtered = filtered.filter(config => config.isActive);
    }

    setFilteredConfigs(filtered);
  }, [configurations, searchQuery, categoryFilter, showInactive]);

  // Group configurations by category
  const groupedConfigs = useMemo(() => {
    const groups: Record<string, Configuration[]> = {};
    filteredConfigs.forEach(config => {
      if (!groups[config.category]) {
        groups[config.category] = [];
      }
      groups[config.category].push(config);
    });
    return groups;
  }, [filteredConfigs]);

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.configKey.trim()) {
      errors.configKey = 'Configuration key is required';
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.configKey)) {
      errors.configKey = 'Key must contain only letters, numbers, dots, and underscores';
    }

    if (!formData.configValue.trim()) {
      errors.configValue = 'Value is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle add configuration
  const handleAdd = async () => {
    if (!validateForm()) return;

    try {
      await adminService.createConfiguration(formData);
      dispatch(showToast({
        message: 'Configuration added successfully',
        type: 'success'
      }));
      setShowAddModal(false);
      loadConfigurations();
      resetForm();
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to add configuration',
        type: 'error'
      }));
    }
  };

  // Handle edit configuration
  const handleEdit = async () => {
    if (!editingConfig || !validateForm()) return;

    try {
      await adminService.updateConfiguration(editingConfig.id, {
        configValue: formData.configValue
      });
      dispatch(showToast({
        message: 'Configuration updated successfully',
        type: 'success'
      }));
      setEditingConfig(null);
      loadConfigurations();
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to update configuration',
        type: 'error'
      }));
    }
  };

  // Handle delete configuration
  const handleDelete = async () => {
    if (!deleteConfig) return;

    try {
      await adminService.deleteConfiguration(deleteConfig.id);
      dispatch(showToast({
        message: 'Configuration deleted successfully',
        type: 'success'
      }));
      setDeleteConfig(null);
      loadConfigurations();
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to delete configuration',
        type: 'error'
      }));
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await adminService.exportConfigurations();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `configurations_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      dispatch(showToast({
        message: 'Configurations exported successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to export configurations',
        type: 'error'
      }));
    }
  };

  // Start edit
  const startEdit = (config: Configuration) => {
    setEditingConfig(config);
    setFormData({
      configKey: config.configKey,
      configValue: config.configValue,
      category: config.category,
      dataType: config.dataType,
      description: config.description || '',
      isActive: config.isActive,
      isEncrypted: config.isEncrypted
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      configKey: '',
      configValue: '',
      category: '',
      dataType: 'STRING',
      description: '',
      isActive: true,
      isEncrypted: false
    });
    setFormErrors({});
  };

  if (loading) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error) {
    return (
      <div className="configuration-page">
        <Card>
          <div className="error-state">
            <p>{error}</p>
            <Button onClick={loadConfigurations} variant="primary">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="configuration-page">
      <div className="page-header">
        <h1>Configuration Management</h1>
        <p>Manage system configuration settings</p>
      </div>

      <div className="controls-section">
        <div className="filters">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search configurations..."
          />
          
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>

          <label className="checkbox-filter">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show Inactive
          </label>
        </div>

        <div className="actions">
          <Button
            variant="secondary"
            onClick={() => setViewMode(viewMode === 'table' ? 'card' : 'table')}
          >
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            Export
          </Button>
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            Add Configuration
          </Button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-view">
          {Object.entries(groupedConfigs).map(([category, configs]) => (
            <Card key={category} className="category-section">
              <h2>{category}</h2>
              <table className="config-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map(config => (
                    <tr key={config.id}>
                      <td className="config-key">
                        {config.configKey}
                        {config.isCritical && (
                          <Badge variant="danger" className="critical-badge">Critical</Badge>
                        )}
                      </td>
                      <td className="config-value">
                        {config.isEncrypted ? '***encrypted***' : config.configValue}
                      </td>
                      <td className="config-description">{config.description}</td>
                      <td>
                        <Badge variant={config.isActive ? 'success' : 'secondary'}>
                          {config.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="config-actions">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => startEdit(config)}
                          disabled={config.isCritical}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() => setDeleteConfig(config)}
                          disabled={config.isCritical}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))}
        </div>
      ) : (
        <div className="card-view">
          {Object.entries(groupedConfigs).map(([category, configs]) => (
            <div key={category} className="category-section">
              <h2>{category}</h2>
              <div className="config-cards">
                {configs.map(config => (
                  <Card key={config.id} className="config-card" data-testid="config-card">
                    <div className="config-header">
                      <h3>{config.configKey}</h3>
                      <Badge variant={config.isActive ? 'success' : 'secondary'}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {config.isCritical && (
                      <Badge variant="danger" className="critical-badge">Critical</Badge>
                    )}
                    <p className="config-value">
                      <strong>Value:</strong> {config.isEncrypted ? '***encrypted***' : config.configValue}
                    </p>
                    {config.description && (
                      <p className="config-description">{config.description}</p>
                    )}
                    <p className="config-metadata">
                      <strong>Type:</strong> {config.dataType}
                    </p>
                    <div className="card-actions">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => startEdit(config)}
                        disabled={config.isCritical}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => setDeleteConfig(config)}
                        disabled={config.isCritical}
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Configuration Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="New Configuration"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
          <div className="form-group">
            <label htmlFor="configKey">Configuration Key</label>
            <input
              type="text"
              id="configKey"
              name="configKey"
              value={formData.configKey}
              onChange={handleInputChange}
              className={formErrors.configKey ? 'error' : ''}
            />
            {formErrors.configKey && (
              <span className="error-message">{formErrors.configKey}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="configValue">Value</label>
            <input
              type="text"
              id="configValue"
              name="configValue"
              value={formData.configValue}
              onChange={handleInputChange}
              className={formErrors.configValue ? 'error' : ''}
            />
            {formErrors.configValue && (
              <span className="error-message">{formErrors.configValue}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              list="categories"
              className={formErrors.category ? 'error' : ''}
            />
            <datalist id="categories">
              {categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {formErrors.category && (
              <span className="error-message">{formErrors.category}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dataType">Data Type</label>
            <select
              id="dataType"
              name="dataType"
              value={formData.dataType}
              onChange={handleInputChange}
            >
              <option value="STRING">String</option>
              <option value="INTEGER">Integer</option>
              <option value="BOOLEAN">Boolean</option>
              <option value="DOUBLE">Double</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <Button type="button" variant="secondary" onClick={() => {
              setShowAddModal(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Configuration Modal */}
      <Modal
        isOpen={!!editingConfig}
        onClose={() => {
          setEditingConfig(null);
          resetForm();
        }}
        title="Edit Configuration"
      >
        {editingConfig && (
          <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
            <div className="form-group">
              <label>Configuration Key</label>
              <input
                type="text"
                value={formData.configKey}
                disabled
                className="disabled"
              />
            </div>

            {editingConfig.isEncrypted && (
              <div className="warning-message">
                <p>Warning: This is an encrypted value. Enter a new value to update.</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="editConfigValue">Value</label>
              <input
                type="text"
                id="editConfigValue"
                name="configValue"
                value={formData.configValue}
                onChange={handleInputChange}
                className={formErrors.configValue ? 'error' : ''}
              />
              {formErrors.configValue && (
                <span className="error-message">{formErrors.configValue}</span>
              )}
            </div>

            <div className="modal-actions">
              <Button type="button" variant="secondary" onClick={() => {
                setEditingConfig(null);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfig}
        onClose={() => setDeleteConfig(null)}
        onConfirm={handleDelete}
        title="Delete Configuration"
        message={`Are you sure you want to delete "${deleteConfig?.configKey}"?`}
      />
    </div>
  );
};
