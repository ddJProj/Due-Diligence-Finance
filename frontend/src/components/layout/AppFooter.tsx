// frontend/src/components/layout/AppFooter.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth.types';
import './AppFooter.css';

// Quick links for authenticated users by role
const QUICK_LINKS = {
  [Role.CLIENT]: [
    { label: 'Dashboard', path: '/dashboard/client' },
    { label: 'Portfolio', path: '/portfolio' },
    { label: 'Messages', path: '/messages' },
    { label: 'Settings', path: '/settings' },
  ],
  [Role.EMPLOYEE]: [
    { label: 'Dashboard', path: '/dashboard/employee' },
    { label: 'Clients', path: '/clients' },
    { label: 'Messages', path: '/messages' },
    { label: 'Reports', path: '/reports' },
  ],
  [Role.ADMIN]: [
    { label: 'Dashboard', path: '/dashboard/admin' },
    { label: 'System', path: '/admin/system' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Reports', path: '/admin/reports' },
  ],
};

/**
 * AppFooter component displaying company information and links
 * Shows different content based on authentication status
 */
export const AppFooter: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');

  const currentYear = new Date().getFullYear();
  const quickLinks = isAuthenticated && user ? QUICK_LINKS[user.role] : [];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const handleLinkClick = (path: string) => {
    navigate(path);
  };

  return (
    <footer className="app-footer" data-testid="app-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">Due Diligence Finance</h3>
            <p className="footer-tagline">Building trust through technology</p>
            <div className="social-links">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="social-link"
              >
                <span className="social-icon">in</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="social-link"
              >
                <span className="social-icon">𝕏</span>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="social-link"
              >
                <span className="social-icon">f</span>
              </a>
            </div>
          </div>

          {/* Quick Links for Authenticated Users */}
          {isAuthenticated && quickLinks.length > 0 && (
            <div className="footer-section">
              <h4 className="footer-section-title">Quick Links</h4>
              <ul className="footer-links">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Links */}
          <div className="footer-section">
            <h4 className="footer-section-title">Company</h4>
            <ul className="footer-links">
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/about')}
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/contact')}
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/careers')}
                >
                  Careers
                </button>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section">
            <h4 className="footer-section-title">Resources</h4>
            <ul className="footer-links">
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/help')}
                >
                  Help Center
                </button>
              </li>
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/blog')}
                >
                  Blog
                </button>
              </li>
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/faqs')}
                >
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4 className="footer-section-title">Legal</h4>
            <ul className="footer-links">
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/privacy')}
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/terms')}
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  className="footer-link-button"
                  onClick={() => handleLinkClick('/cookies')}
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-section-title">Contact Us</h4>
            <div className="contact-info">
              <p>
                Email:{' '}
                <a href="mailto:support@duediligencefinance.com" className="contact-link">
                  support@duediligencefinance.com
                </a>
              </p>
              <p>
                Phone:{' '}
                <a href="tel:1-800-FINANCE" className="contact-link">
                  1-800-FINANCE
                </a>
              </p>
              <p>Hours: Mon-Fri, 9AM-5PM EST</p>
            </div>
          </div>
        </div>

        {/* Newsletter Subscription for Guests */}
        {!isAuthenticated && (
          <div className="newsletter-section">
            <h4 className="newsletter-title">Stay Updated</h4>
            <p className="newsletter-description">
              Get the latest financial insights and updates delivered to your inbox.
            </p>
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-button">
                Subscribe
              </button>
            </form>
          </div>
        )}

        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} Due Diligence Finance LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
