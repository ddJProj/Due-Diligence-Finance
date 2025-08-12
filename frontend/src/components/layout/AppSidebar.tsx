// frontend/src/components/layout/AppSidebar.tsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth.types';
import './AppSidebar.css';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  children?: MenuItem[];
}

interface AppSidebarProps {
  isCollapsed?: boolean;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

// Menu items for each role
const MENU_ITEMS: Record<Role, MenuItem[]> = {
  [Role.CLIENT]: [
    { label: 'Dashboard', path: '/dashboard/client', icon: 'dashboard' },
    { label: 'My Portfolio', path: '/portfolio', icon: 'portfolio' },
    { label: 'Investments', path: '/investments', icon: 'investments' },
    { label: 'Messages', path: '/messages', icon: 'messages' },
    { label: 'Documents', path: '/documents', icon: 'documents' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ],
  [Role.EMPLOYEE]: [
    { label: 'Dashboard', path: '/dashboard/employee', icon: 'dashboard' },
    {
      label: 'Client Management',
      path: '/clients',
      icon: 'clients',
      children: [
        { label: 'All Clients', path: '/clients', icon: 'list' },
        { label: 'Add New Client', path: '/clients/new', icon: 'add' },
        { label: 'Client Reports', path: '/clients/reports', icon: 'report' },
      ],
    },
    { label: 'Investment Requests', path: '/requests', icon: 'requests' },
    { label: 'Messages', path: '/messages', icon: 'messages' },
    { label: 'Reports', path: '/reports', icon: 'reports' },
    { label: 'Analytics', path: '/analytics', icon: 'analytics' },
  ],
  [Role.ADMIN]: [
    { label: 'Dashboard', path: '/dashboard/admin', icon: 'dashboard' },
    {
      label: 'User Management',
      path: '/admin/users',
      icon: 'users',
      children: [
        { label: 'All Users', path: '/admin/users', icon: 'list' },
        { label: 'Roles & Permissions', path: '/admin/roles', icon: 'security' },
        { label: 'User Activity', path: '/admin/activity', icon: 'activity' },
      ],
    },
    {
      label: 'System Settings',
      path: '/admin/settings',
      icon: 'settings',
      children: [
        { label: 'General Settings', path: '/admin/settings/general', icon: 'config' },
        { label: 'Security Settings', path: '/admin/settings/security', icon: 'security' },
        { label: 'Email Configuration', path: '/admin/settings/email', icon: 'email' },
        { label: 'API Keys', path: '/admin/settings/api', icon: 'api' },
      ],
    },
    { label: 'Activity Logs', path: '/admin/logs', icon: 'logs' },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: 'reports' },
    { label: 'Messages', path: '/messages', icon: 'messages' },
    { label: 'Backup & Restore', path: '/admin/backup', icon: 'backup' },
  ],
  [Role.GUEST]: [],
};

/**
 * AppSidebar component providing role-specific navigation menu
 * Supports collapsible state and mobile responsive design
 */
export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed: controlledCollapsed,
  isMobileOpen = false,
  onClose,
}) => {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Use controlled collapsed state if provided, otherwise use internal state
  const isCollapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;

  // Don't render for guests or during loading
  if (!isAuthenticated || !user || loading) {
    return null;
  }

  const menuItems = MENU_ITEMS[user.role] || [];

  // Toggle collapsed state
  const toggleCollapsed = () => {
    if (controlledCollapsed === undefined) {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Toggle submenu expansion
  const toggleExpanded = (path: string) => {
    setExpandedItems(prev =>
      prev.includes(path)
        ? prev.filter(item => item !== path)
        : [...prev, path]
    );
  };

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Render menu item
  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const active = isActive(item.path);

    return (
      <li key={item.path} className={`menu-item ${isChild ? 'submenu-item' : ''}`}>
        {hasChildren ? (
          <button
            className={`menu-link ${active ? 'active' : ''}`}
            onClick={() => toggleExpanded(item.path)}
          >
            <span className="menu-icon" data-testid={`icon-${item.icon}`}>
              {/* Icon placeholder - replace with actual icon component */}
              <i className={`icon-${item.icon}`} />
            </span>
            {!isCollapsed && (
              <>
                <span className="menu-label">{item.label}</span>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                  ▼
                </span>
              </>
            )}
          </button>
        ) : (
          <Link
            to={item.path}
            className={`menu-link ${active ? 'active' : ''}`}
            onClick={isMobileOpen ? onClose : undefined}
          >
            <span className="menu-icon" data-testid={`icon-${item.icon}`}>
              {/* Icon placeholder - replace with actual icon component */}
              <i className={`icon-${item.icon}`} />
            </span>
            {!isCollapsed && <span className="menu-label">{item.label}</span>}
          </Link>
        )}
        {hasChildren && isExpanded && !isCollapsed && (
          <ul className="submenu">
            {item.children!.map(child => renderMenuItem(child, true))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          data-testid="sidebar-overlay"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
        data-testid="app-sidebar"
      >
        {/* Collapse toggle button */}
        <button
          className="collapse-button"
          onClick={toggleCollapsed}
          aria-label="Toggle sidebar"
        >
          <span className="collapse-icon">{isCollapsed ? '→' : '←'}</span>
        </button>

        {/* User info section */}
        {!isCollapsed && (
          <div className="sidebar-user-info">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.username}</div>
              <div className="user-role">{user.role}</div>
            </div>
          </div>
        )}

        {/* Navigation menu */}
        <nav className="sidebar-nav">
          <ul className="menu-list">
            {menuItems.map(item => renderMenuItem(item))}
          </ul>
        </nav>
      </aside>
    </>
  );
};
