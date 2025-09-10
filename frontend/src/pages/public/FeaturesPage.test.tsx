// frontend/src/pages/public/FeaturesPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import FeaturesPage from './FeaturesPage';
import authReducer from '../../store/slices/authSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (component: React.ReactElement, store?: any) => {
  const testStore = store || createTestStore();
  
  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('FeaturesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderWithProviders(<FeaturesPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  describe('Page Header', () => {
    it('should display page title and description', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Our Features/i)).toBeInTheDocument();
      expect(screen.getByText(/Discover what makes Due Diligence Finance/i)).toBeInTheDocument();
    });

    it('should display breadcrumb navigation', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Features')).toBeInTheDocument();
    });
  });

  describe('Core Features Section', () => {
    it('should display all core features', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Core Features/i)).toBeInTheDocument();
      
      // Check for main features
      expect(screen.getByText(/Portfolio Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Financial Planning/i)).toBeInTheDocument();
      expect(screen.getByText(/Investment Analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/Risk Assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/Tax Optimization/i)).toBeInTheDocument();
      expect(screen.getByText(/Automated Rebalancing/i)).toBeInTheDocument();
    });

    it('should display feature descriptions', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Comprehensive portfolio tracking/i)).toBeInTheDocument();
      expect(screen.getByText(/Personalized financial roadmaps/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-time market data/i)).toBeInTheDocument();
    });

    it('should display feature icons', () => {
      renderWithProviders(<FeaturesPage />);

      const featureCards = screen.getAllByTestId('feature-card');
      expect(featureCards.length).toBeGreaterThanOrEqual(6);
      
      featureCards.forEach(card => {
        expect(card.querySelector('.feature-icon')).toBeInTheDocument();
      });
    });
  });

  describe('Platform Capabilities Section', () => {
    it('should display platform capabilities', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Platform Capabilities/i)).toBeInTheDocument();
      expect(screen.getByText(/Bank-Level Security/i)).toBeInTheDocument();
      expect(screen.getByText(/Mobile Access/i)).toBeInTheDocument();
      expect(screen.getByText(/API Integration/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-Time Sync/i)).toBeInTheDocument();
    });

    it('should display capability details', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/256-bit encryption/i)).toBeInTheDocument();
      expect(screen.getByText(/Manage your wealth on the go/i)).toBeInTheDocument();
      expect(screen.getByText(/Connect with your favorite tools/i)).toBeInTheDocument();
      expect(screen.getByText(/Instant updates across all devices/i)).toBeInTheDocument();
    });
  });

  describe('Feature Comparison Section', () => {
    it('should display comparison table', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Feature Comparison/i)).toBeInTheDocument();
      expect(screen.getByTestId('comparison-table')).toBeInTheDocument();
    });

    it('should display plan tiers', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('should display features in comparison', () => {
      renderWithProviders(<FeaturesPage />);

      const features = [
        'Portfolio Tracking',
        'Financial Planning',
        'Investment Analytics',
        'Risk Assessment',
        'Tax Optimization',
        'API Access',
        'Priority Support',
        'Custom Reports'
      ];

      features.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should show check marks for included features', () => {
      renderWithProviders(<FeaturesPage />);

      const checkMarks = screen.getAllByText('✓');
      expect(checkMarks.length).toBeGreaterThan(0);
    });

    it('should show X marks for excluded features', () => {
      renderWithProviders(<FeaturesPage />);

      const xMarks = screen.getAllByText('✗');
      expect(xMarks.length).toBeGreaterThan(0);
    });
  });

  describe('Integration Section', () => {
    it('should display integration partners', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Seamless Integrations/i)).toBeInTheDocument();
      expect(screen.getByTestId('integrations-section')).toBeInTheDocument();
    });

    it('should display integration logos', () => {
      renderWithProviders(<FeaturesPage />);

      const integrations = screen.getAllByTestId('integration-logo');
      expect(integrations.length).toBeGreaterThanOrEqual(6);
    });

    it('should display integration names', () => {
      renderWithProviders(<FeaturesPage />);

      const partners = [
        'Major Banks',
        'Accounting Software',
        'Tax Platforms',
        'Trading Platforms',
        'CRM Systems',
        'Analytics Tools'
      ];

      partners.forEach(partner => {
        expect(screen.getByText(partner)).toBeInTheDocument();
      });
    });
  });

  describe('Screenshots/Demo Section', () => {
    it('should display demo section', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/See It In Action/i)).toBeInTheDocument();
      expect(screen.getByTestId('demo-section')).toBeInTheDocument();
    });

    it('should display screenshot carousel', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByTestId('screenshot-carousel')).toBeInTheDocument();
      const screenshots = screen.getAllByTestId('screenshot-item');
      expect(screenshots.length).toBeGreaterThanOrEqual(3);
    });

    it('should have navigation buttons', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByRole('button', { name: /Previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    });

    it('should navigate screenshots', () => {
      renderWithProviders(<FeaturesPage />);

      const nextButton = screen.getByRole('button', { name: /Next/i });
      const screenshots = screen.getAllByTestId('screenshot-item');
      
      // Initially first screenshot should be active
      expect(screenshots[0]).toHaveClass('active');
      
      // Click next
      fireEvent.click(nextButton);
      
      // Second screenshot should now be active
      expect(screenshots[1]).toHaveClass('active');
    });
  });

  describe('Benefits Section', () => {
    it('should display key benefits', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Why Choose Our Platform/i)).toBeInTheDocument();
      
      const benefits = [
        'Save Time',
        'Reduce Errors',
        'Increase Returns',
        'Lower Fees'
      ];

      benefits.forEach(benefit => {
        expect(screen.getByText(new RegExp(benefit, 'i'))).toBeInTheDocument();
      });
    });

    it('should display benefit statistics', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/90%/)).toBeInTheDocument();
      expect(screen.getByText(/time saved/i)).toBeInTheDocument();
      
      expect(screen.getByText(/99.9%/)).toBeInTheDocument();
      expect(screen.getByText(/accuracy/i)).toBeInTheDocument();
    });
  });

  describe('CTA Section', () => {
    it('should display call-to-action', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByText(/Ready to Experience These Features/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Free Trial/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Request Demo/i })).toBeInTheDocument();
    });

    it('should navigate to register when Start Free Trial is clicked', () => {
      renderWithProviders(<FeaturesPage />);

      const trialButton = screen.getByRole('button', { name: /Start Free Trial/i });
      fireEvent.click(trialButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should navigate to contact when Request Demo is clicked', () => {
      renderWithProviders(<FeaturesPage />);

      const demoButton = screen.getByRole('button', { name: /Request Demo/i });
      fireEvent.click(demoButton);

      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });
  });

  describe('Authenticated User Behavior', () => {
    it('should show different CTA for authenticated users', () => {
      const store = createTestStore({
        auth: {
          isAuthenticated: true,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            roles: ['CLIENT'],
          },
        },
      });

      renderWithProviders(<FeaturesPage />, store);

      expect(screen.getByRole('button', { name: /Explore Dashboard/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Start Free Trial/i })).not.toBeInTheDocument();
    });

    it('should navigate to dashboard for authenticated users', () => {
      const store = createTestStore({
        auth: {
          isAuthenticated: true,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            roles: ['CLIENT'],
          },
        },
      });

      renderWithProviders(<FeaturesPage />, store);

      const dashboardButton = screen.getByRole('button', { name: /Explore Dashboard/i });
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly classes', () => {
      renderWithProviders(<FeaturesPage />);

      const featuresPage = screen.getByRole('main');
      expect(featuresPage).toHaveClass('features-page');
    });

    it('should have proper section structure', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByTestId('core-features-section')).toBeInTheDocument();
      expect(screen.getByTestId('capabilities-section')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-section')).toBeInTheDocument();
      expect(screen.getByTestId('integrations-section')).toBeInTheDocument();
      expect(screen.getByTestId('demo-section')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<FeaturesPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', () => {
      renderWithProviders(<FeaturesPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/features page/i)).toBeInTheDocument();
    });

    it('should have accessible table', () => {
      renderWithProviders(<FeaturesPage />);

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveAccessibleName();
    });
  });
});
