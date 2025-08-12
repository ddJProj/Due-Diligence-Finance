// frontend/src/components/layout/AppFooter.test.tsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AppFooter } from './AppFooter';
import authReducer from '@/store/slices/authSlice';
import { Role } from '@/types/auth.types';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Create a test store factory
const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
};

describe('AppFooter', () => {
  const renderWithProviders = (
    store = createTestStore()
  ) => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <AppFooter />
        </BrowserRouter>
      </Provider>
    );
  };

  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Company Information', () => {
    it('should display company name and tagline', () => {
      renderWithProviders();

      expect(screen.getByText('Due Diligence Finance')).toBeInTheDocument();
      expect(screen.getByText('Building trust through technology')).toBeInTheDocument();
    });

    it('should display copyright with current year', () => {
      renderWithProviders();

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Due Diligence Finance LLC. All rights reserved.`)).toBeInTheDocument();
    });
  });

  describe('Guest Footer Links', () => {
    it('should display guest navigation links', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      // Company section
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('About Us')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Careers')).toBeInTheDocument();

      // Resources section
      expect(screen.getByText('Resources')).toBeInTheDocument();
      expect(screen.getByText('Help Center')).toBeInTheDocument();
      expect(screen.getByText('Blog')).toBeInTheDocument();
      expect(screen.getByText('FAQs')).toBeInTheDocument();

      // Legal section
      expect(screen.getByText('Legal')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
      expect(screen.getByText('Cookie Policy')).toBeInTheDocument();

      // Should not show authenticated links
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should navigate to appropriate pages when links are clicked', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      const aboutLink = screen.getByText('About Us');
      fireEvent.click(aboutLink);

      expect(mockNavigate).toHaveBeenCalledWith('/about');
    });
  });

  describe('Authenticated Footer Links', () => {
    it('should display client-specific links when authenticated', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'client',
            email: 'client@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      // Quick Links section for authenticated users
      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Messages')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should display employee-specific links', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'employee',
            email: 'employee@example.com',
            role: Role.EMPLOYEE,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Clients')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });

    it('should display admin-specific links', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: Role.ADMIN,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  describe('Social Media Links', () => {
    it('should display social media links', () => {
      renderWithProviders();

      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    });

    it('should open social media links in new window', () => {
      renderWithProviders();

      const linkedInLink = screen.getByLabelText('LinkedIn');
      expect(linkedInLink).toHaveAttribute('target', '_blank');
      expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Contact Information', () => {
    it('should display contact information', () => {
      renderWithProviders();

      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Email: support@duediligencefinance.com')).toBeInTheDocument();
      expect(screen.getByText('Phone: 1-800-FINANCE')).toBeInTheDocument();
      expect(screen.getByText('Hours: Mon-Fri, 9AM-5PM EST')).toBeInTheDocument();
    });

    it('should make email clickable', () => {
      renderWithProviders();

      const emailLink = screen.getByText('support@duediligencefinance.com');
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:support@duediligencefinance.com');
    });

    it('should make phone clickable', () => {
      renderWithProviders();

      const phoneLink = screen.getByText('1-800-FINANCE');
      expect(phoneLink.closest('a')).toHaveAttribute('href', 'tel:1-800-FINANCE');
    });
  });

  describe('Loading State', () => {
    it('should display footer even during loading', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: true,
          error: null,
        },
      });

      renderWithProviders(store);

      // Basic footer should still be visible
      expect(screen.getByText('Due Diligence Finance')).toBeInTheDocument();
      expect(screen.getByText('Building trust through technology')).toBeInTheDocument();
    });
  });

  describe('Newsletter Subscription', () => {
    it('should display newsletter subscription form for guests', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      expect(screen.getByText('Stay Updated')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByText('Subscribe')).toBeInTheDocument();
    });

    it('should not display newsletter form for authenticated users', () => {
      const store = createTestStore({
        auth: {
          user: {
            id: 1,
            username: 'client',
            email: 'client@example.com',
            role: Role.CLIENT,
            isActive: true,
          },
          accessToken: 'valid-token',
          refreshToken: 'refresh-token',
          isAuthenticated: true,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      expect(screen.queryByText('Stay Updated')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter your email')).not.toBeInTheDocument();
    });

    it('should handle newsletter subscription', () => {
      const store = createTestStore({
        auth: {
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        },
      });

      renderWithProviders(store);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      const subscribeButton = screen.getByText('Subscribe');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(subscribeButton);

      // In a real implementation, this would call an API
      // For now, we just verify the form exists and is interactive
      expect(emailInput).toHaveValue('test@example.com');
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive class for mobile', () => {
      renderWithProviders();

      const footer = screen.getByTestId('app-footer');
      expect(footer).toHaveClass('app-footer');
    });
  });
});
