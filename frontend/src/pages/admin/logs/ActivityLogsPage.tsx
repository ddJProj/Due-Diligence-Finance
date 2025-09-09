// frontend/src/pages/admin/logs/ActivityLogsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../hooks/redux';
import { adminService } from '../../../services/adminService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Button } from '../../../components/common/Button';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Pagination } from '../../../components/common/Pagination';
import { SearchInput } from '../../../components/common/SearchInput';
import { Select } from '../../../components/common/Select';
import { showToast } from '../../../store/slices/uiSlice';
import { debounce } from '../../../utils/debounce';
import './ActivityLogsPage.css';

interface ActivityLog {
  id: number;
  userId: number;
  userEmail: string;
  activityType: string;
  activityTime: string;
  ipAddress?: string;
  userAgent?: string;
  resourceType?: string;
  resourceId?: number;
  details?: string;
  success: boolean;
  errorMessage?: string;
  isCritical?: boolean;
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
}

interface FilterState {
  userEmail: string;
  activityType: string;
  success: string;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
}

const ACTIVITY_TYPES = [
  'LOGIN',
  'LOGOUT',
  'CREATE',
  'UPDATE',
  'DELETE',
  'VIEW',
  'DOWNLOAD',
  'UPLOAD',
  'APPROVE',
  'REJECT'
];

export const ActivityLogsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    userEmail: '',
    activityType: '',
    success: '',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0], // Today
    page: 1,
    pageSize: 20
  });

  // Load activity logs
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.page,
        pageSize: filters.pageSize,
        startDate: filters.startDate,
        endDate: filters.endDate
      };

      if (filters.userEmail) params.userEmail = filters.userEmail;
      if (filters.activityType) params.activityType = filters.activityType;
      if (filters.success !== '') params.success = filters.success === 'true';

      const response: ActivityLogsResponse = await adminService.getActivityLogs(params);
      setLogs(response.logs);
      setTotalLogs(response.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setFilters(prev => ({ ...prev, userEmail: searchTerm, page: 1 }));
    }, 500),
    []
  );

  // Load logs on mount and filter changes
  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle filter changes
  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLogs();
    setRefreshing(false);
    dispatch(showToast({
      message: 'Logs refreshed successfully',
      type: 'success'
    }));
  };

  // Handle export
  const handleExport = async () => {
    try {
      const blob = await adminService.exportActivityLogs({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-logs_${filters.startDate}_${filters.endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      dispatch(showToast({
        message: 'Logs exported successfully',
        type: 'success'
      }));
    } catch (err: any) {
      dispatch(showToast({
        message: err.message || 'Failed to export logs',
        type: 'error'
      }));
    }
  };

  // Toggle log expansion
  const toggleExpanded = (logId: number) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  // Navigate to resource
  const navigateToResource = (resourceType: string, resourceId: number) => {
    const routes: Record<string, string> = {
      USER: `/admin/users/${resourceId}/edit`,
      CLIENT: `/employee/clients/${resourceId}`,
      INVESTMENT: `/client/investments/${resourceId}`,
      TRANSACTION: `/client/transactions/${resourceId}`
    };

    const route = routes[resourceType];
    if (route) {
      navigate(route);
    }
  };

  // Get activity badge variant
  const getActivityBadgeVariant = (type: string): 'info' | 'success' | 'warning' | 'danger' => {
    switch (type) {
      case 'DELETE':
        return 'danger';
      case 'CREATE':
      case 'APPROVE':
        return 'success';
      case 'UPDATE':
      case 'REJECT':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Format time
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    
    return date.toLocaleString();
  };

  if (loading && logs.length === 0) {
    return <LoadingSpinner data-testid="loading-spinner" />;
  }

  if (error && logs.length === 0) {
    return (
      <div className="activity-logs-page">
        <Card>
          <div className="error-state">
            <p>{error}</p>
            <Button onClick={loadLogs} variant="primary">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="activity-logs-page">
      <div className="page-header">
        <h1>Activity Logs</h1>
        <p>Monitor and audit system activity</p>
      </div>

      <div className="filters-section">
        <div className="filters-row">
          <SearchInput
            value={filters.userEmail}
            onChange={(value) => debouncedSearch(value)}
            placeholder="Search by user email..."
          />

          <Select
            value={filters.activityType}
            onChange={(e) => handleFilterChange('activityType', e.target.value)}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            {ACTIVITY_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </Select>

          <Select
            value={filters.success}
            onChange={(e) => handleFilterChange('success', e.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All Status</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </Select>
        </div>

        <div className="filters-row">
          <div className="date-range">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          <div className="date-range">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>

          <div className="filter-actions">
            <Button 
              variant="secondary" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="secondary" onClick={handleExport}>
              Export
            </Button>
          </div>
        </div>
      </div>

      <Card className="logs-container">
        {logs.length === 0 ? (
          <div className="empty-state">
            <p>No activity logs found for the selected criteria</p>
          </div>
        ) : (
          <div className="logs-table">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Activity</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr className={log.isCritical ? 'critical-log' : ''}>
                      <td className="time-cell">
                        <span className="time-display">{formatTime(log.activityTime)}</span>
                      </td>
                      <td className="user-cell">{log.userEmail}</td>
                      <td className="activity-cell">
                        <Badge variant={getActivityBadgeVariant(log.activityType)}>
                          {log.activityType}
                        </Badge>
                        {log.isCritical && (
                          <Badge variant="danger" className="critical-badge">Critical</Badge>
                        )}
                      </td>
                      <td className="resource-cell">
                        {log.resourceType ? (
                          <div>
                            <span>{log.resourceType}</span>
                            {log.resourceId && (
                              <>
                                <span> #{log.resourceId}</span>
                                <Button
                                  size="small"
                                  variant="link"
                                  onClick={() => navigateToResource(log.resourceType!, log.resourceId!)}
                                >
                                  View Resource
                                </Button>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="no-resource">-</span>
                        )}
                      </td>
                      <td className="status-cell">
                        <Badge variant={log.success ? 'success' : 'danger'}>
                          {log.success ? 'Success' : 'Failed'}
                        </Badge>
                        {log.errorMessage && (
                          <span className="error-message">{log.errorMessage}</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => toggleExpanded(log.id)}
                          aria-label="Expand"
                        >
                          {expandedLogs.has(log.id) ? 'Collapse' : 'Expand'}
                        </Button>
                      </td>
                    </tr>
                    {expandedLogs.has(log.id) && (
                      <tr className="expanded-row">
                        <td colSpan={6}>
                          <div className="expanded-details">
                            {log.details && (
                              <div className="detail-item">
                                <strong>Details:</strong> {log.details}
                              </div>
                            )}
                            {log.ipAddress && (
                              <div className="detail-item">
                                <strong>IP Address:</strong> {log.ipAddress}
                              </div>
                            )}
                            {log.userAgent && (
                              <div className="detail-item">
                                <strong>User Agent:</strong> {log.userAgent}
                              </div>
                            )}
                            <div className="detail-item">
                              <strong>Log ID:</strong> {log.id}
                            </div>
                            <div className="detail-item">
                              <strong>User ID:</strong> {log.userId}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {logs.length > 0 && (
        <Pagination
          currentPage={filters.page}
          totalPages={Math.ceil(totalLogs / filters.pageSize)}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
