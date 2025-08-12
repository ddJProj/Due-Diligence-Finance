// frontend/src/components/layout/MainLayout.tsx

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import './MainLayout.css';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideSidebar?: boolean;
  hideFooter?: boolean;
}

/**
 * MainLayout component that combines all layout components
 * Provides responsive layout with sidebar for authenticated users
 * Handles mobile menu state and scroll behavior
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  className = '',
  hideSidebar = false,
  hideFooter = false,
}) => {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Show sidebar only for authenticated users and when not explicitly hidden
  const showSidebar = isAuthenticated && !hideSidebar;

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileSidebarOpen]);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className={`main-layout ${className}`} data-testid="layout-wrapper">
      {/* Header */}
      <AppHeader />

      {/* Mobile menu button */}
      {showSidebar && (
        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileSidebar}
          aria-label="Toggle mobile menu"
        >
          <span className="hamburger-icon">☰</span>
        </button>
      )}

      {/* Layout container */}
      <div
        className={`layout-container ${showSidebar ? 'with-sidebar' : 'no-sidebar'}`}
        data-testid="layout-container"
      >
        {/* Sidebar */}
        {showSidebar && (
          <AppSidebar
            isMobileOpen={isMobileSidebarOpen}
            onClose={closeMobileSidebar}
          />
        )}

        {/* Main content area */}
        <main className="main-content" data-testid="main-content">
          {loading ? (
            <div className="layout-loading" data-testid="layout-loading">
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            </div>
          ) : (
            <div className="content-wrapper">{children}</div>
          )}
        </main>
      </div>

      {/* Footer */}
      {!hideFooter && <AppFooter />}
    </div>
  );
};
