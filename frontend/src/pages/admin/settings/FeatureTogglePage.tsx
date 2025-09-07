// frontend/src/pages/admin/settings/FeatureTogglePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useAppDispatch } from '../../../hooks/redux';
import { adminService } from '../../../services/adminService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { Badge } from '../../../components/common/Badge';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { showToast } from '../../../store/slices/uiSlice';
import './FeatureTogglePage.css';

interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  dependencies: string[];
  isCritical?: boolean;
  lastModified: string;
  modifiedBy: string;
}

interface FeatureFlags {
  features: Feature[];
  lastSync: string;
}

interface PendingToggle {
  feature: Feature;
  newState: boolean;
  message: string;
}

export const FeatureTogglePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [lastSync, setLastSync] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Confirmation states
  const [pendingToggle, setPendingToggle] = useState<PendingToggle | null>(null);

  // Load feature flags
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    try {
      setLoading(true);
      const data: FeatureFlags = await adminService.getFeatureFlags();
      setFeatures(data.features);
      setLastSync(data.lastSync);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const refreshFeatures = async () => {
    try {
      setRefreshing(true);
      const data: FeatureFlags = await adminService.getFeatureFlags();
      setFeatures(data.features);
      setLastSync(data.lastSync);
      dispatch(showToast({
        message: 'Features refreshed successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to refresh features',
        type: 'error'
      }));
    } finally {
      setRefreshing(false);
    }
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(features.map(f => f.category))];
    return cats.sort();
  }, [features]);

  // Filter features
  const filteredFeatures = useMemo(() => {
    let filtered = features;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(feature =>
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(feature => feature.category === categoryFilter);
    }

    return filtered;
  }, [features, searchQuery, categoryFilter]);

  // Group features by category
  const groupedFeatures = useMemo(() => {
    const groups: Record<string, Feature[]> = {};
    filteredFeatures.forEach(feature => {
      if (!groups[feature.category]) {
        groups[feature.category] = [];
      }
      groups[feature.category].push(feature);
    });
    return groups;
  }, [filteredFeatures]);

  // Get feature by ID
  const getFeatureById = (id: string): Feature | undefined => {
    return features.find(f => f.id === id);
  };

  // Get feature name by ID
  const getFeatureName = (id: string): string => {
    const feature = getFeatureById(id);
    return feature ? feature.name : id;
  };

  // Check if feature has enabled dependencies
  const hasEnabledDependencies = (feature: Feature): boolean => {
    if (feature.dependencies.length === 0) return true;
    return feature.dependencies.every(depId => {
      const dep = getFeatureById(depId);
      return dep && dep.enabled;
    });
  };

  // Get dependent features
  const getDependentFeatures = (featureId: string): Feature[] => {
    return features.filter(f => f.dependencies.includes(featureId) && f.enabled);
  };

  // Handle toggle click
  const handleToggleClick = (feature: Feature) => {
    const newState = !feature.enabled;

    // Check for critical features
    if (feature.isCritical) {
      setPendingToggle({
        feature,
        newState,
        message: `Are you sure you want to ${newState ? 'enable' : 'disable'} this critical feature?`
      });
      return;
    }

    // Check dependencies when enabling
    if (newState && !hasEnabledDependencies(feature)) {
      const disabledDeps = feature.dependencies
        .filter(depId => {
          const dep = getFeatureById(depId);
          return dep && !dep.enabled;
        })
        .map(getFeatureName);

      setPendingToggle({
        feature,
        newState,
        message: `This feature requires: ${disabledDeps.join(', ')}. Please enable these features first.`
      });
      return;
    }

    // Check dependents when disabling
    if (!newState) {
      const dependents = getDependentFeatures(feature.id);
      if (dependents.length > 0) {
        setPendingToggle({
          feature,
          newState,
          message: `This will also disable: ${dependents.map(d => d.name).join(', ')}`
        });
        return;
      }
    }

    // Toggle immediately for non-critical features without issues
    toggleFeature(feature, newState);
  };

  // Toggle feature
  const toggleFeature = async (feature: Feature, newState: boolean) => {
    try {
      const result = await adminService.updateFeatureFlag(feature.id, newState);
      
      // Update local state
      setFeatures(prev => prev.map(f => 
        f.id === feature.id ? { ...f, enabled: newState } : f
      ));

      // Also disable dependent features if needed
      if (!newState) {
        const dependents = getDependentFeatures(feature.id);
        setFeatures(prev => prev.map(f => 
          dependents.some(d => d.id === f.id) ? { ...f, enabled: false } : f
        ));
      }

      dispatch(showToast({
        message: result.message || 'Feature updated successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to update feature',
        type: 'error'
      }));
    }
  };

  // Handle confirmation
  const handleConfirmToggle = async () => {
    if (!pendingToggle) return;

    const { feature, newState } = pendingToggle;
    
    // Only toggle if it's a critical feature or disabling with dependents
    if (feature.isCritical || (!newState && getDependentFeatures(feature.id).length > 0)) {
      await toggleFeature(feature, newState);
    }

    setPendingToggle(null);
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await adminService.exportFeatureConfig();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feature-config_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      dispatch(showToast({
        message: 'Feature configuration exported successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to export configuration',
        type: 'error'
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error) {
    return (
      <div className="feature-toggle-page">
        <Card>
          <div className="error-state">
            <p>{error}</p>
            <Button onClick={loadFeatures} variant="primary">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const enabledCount = features.filter(f => f.enabled).length;

  return (
    <div className="feature-toggle-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Feature Toggles</h1>
          <p>Manage feature flags across the application</p>
        </div>
        <div className="header-stats">
          <Badge variant="info">
            {enabledCount} of {features.length} features enabled
          </Badge>
        </div>
      </div>

      <div className="controls-section">
        <div className="filters">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search features..."
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
        </div>

        <div className="actions">
          <Button 
            variant="secondary" 
            onClick={refreshFeatures}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="secondary" onClick={handleExport}>
            Export Configuration
          </Button>
        </div>
      </div>

      <div className="features-container">
        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
          <Card key={category} className="category-section">
            <h2>{category}</h2>
            <div className="features-list">
              {categoryFeatures.map(feature => (
                <div key={feature.id} className="feature-item">
                  <div className="feature-content">
                    <div className="feature-header">
                      <h3>{feature.name}</h3>
                      {feature.isCritical && (
                        <Badge variant="danger">Critical</Badge>
                      )}
                    </div>
                    <p className="feature-description">{feature.description}</p>
                    {feature.dependencies.length > 0 && (
                      <div className="feature-dependencies">
                        <span className="deps-label">Requires:</span>
                        {feature.dependencies.map(depId => (
                          <Badge key={depId} variant="secondary">
                            {getFeatureName(depId)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="feature-metadata">
                      <span>Modified by {feature.modifiedBy}</span>
                      <span> • </span>
                      <span>{new Date(feature.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="feature-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        role="switch"
                        aria-label={feature.name}
                        checked={feature.enabled}
                        onChange={() => handleToggleClick(feature)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {lastSync && (
        <div className="sync-info">
          <p>Last synced: {new Date(lastSync).toLocaleString()}</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!pendingToggle}
        onClose={() => setPendingToggle(null)}
        onConfirm={handleConfirmToggle}
        title={pendingToggle?.feature.isCritical ? 'Confirm Critical Change' : 'Confirm Change'}
        message={pendingToggle?.message || ''}
        confirmText={
          pendingToggle && !hasEnabledDependencies(pendingToggle.feature) 
            ? 'OK' 
            : 'Confirm'
        }
        showCancel={
          pendingToggle && 
          (pendingToggle.feature.isCritical || 
           (!pendingToggle.newState && getDependentFeatures(pendingToggle.feature.id).length > 0))
        }
      />
    </div>
  );
};
