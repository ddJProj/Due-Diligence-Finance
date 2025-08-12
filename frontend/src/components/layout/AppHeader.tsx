// frontend/src/components/layout/AppHeader.tsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth.types';
import './AppHeader.css';

// Navigation items for each role
const NAVIGATION_ITEMS = {
  [Role.GUEST]: [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
  ],
  [Role.CLIENT]: [
    { label: 'Dashboard', path: '/dashboard/client' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Messages', path: '/messages' },
  ],
  [Role.EMPLOYEE]: [
    { label: 'Dashboard', path: '/dashboard/employee' },
    { label: 'Clients', path: '/clients' },
    { label: 'Messages', path: '/messages' },
    { label: 'Reports', path: '/reports' },
  ],
  [Role.ADMIN]: [
    { label: 'Dashboard', path: '/dashboard/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'System', path: '/admin/system' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Messages', path: '/messages' },
  ],
};

// Dashboard paths for each role
const DASHBOARD_PATHS = {
  [Role.CLIENT]: '/dashboard/client',
  [Role.EMPLOYEE]: '/dashboard/employee',
  [Role.ADMIN]: '/dashboard/admin',
  [Role.GUEST]: '/',
};

/**
 * AppHeader component providing role-based navigation
 * Includes responsive mobile menu and user dropdown
 */
export const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Determine current user role
  const currentRole = isAuthenticated && user ? user.role : Role.GUEST;
  const navigationItems = NAVIGATION_ITEMS[currentRole];

  // Handle logo click - navigate to appropriate dashboard
  const handleLogoClick = () => {
    const destination = DASHBOARD_PATHS[currentRole];
    navigate(destination);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when link is clicked
  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  // Don't show full navigation during loading
  if (loading) {
    return (
      <header className="app-header">
        <div className="header-container">
          <div className="logo" onClick={handleLogoClick}>
            Due Diligence Finance
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo" onClick={handleLogoClick}>
          Due Diligence Finance
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          {navigationItems.map((item) => (
            <Link key={item.path} to={item.path} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="user-section">
          {isAuthenticated && user ? (
            <div className="user-menu-container">
              <button
                className="username-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.username}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)}>
                    Profile
                  </Link>
                  <Link to="/settings" onClick={() => setUserMenuOpen(false)}>
                    Settings
                  </Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className="login-button"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="register-button"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <nav
        className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}
        data-testid="mobile-menu"
      >
        {navigationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="mobile-nav-link"
            onClick={handleMobileNavClick}
          >
            {item.label}
          </Link>
        ))}
        {isAuthenticated && user ? (
          <>
            <Link
              to="/profile"
              className="mobile-nav-link"
              onClick={handleMobileNavClick}
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="mobile-nav-link"
              onClick={handleMobileNavClick}
            >
              Settings
            </Link>
            <button
              className="mobile-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="mobile-nav-link"
              onClick={handleMobileNavClick}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="mobile-nav-link"
              onClick={handleMobileNavClick}
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};
