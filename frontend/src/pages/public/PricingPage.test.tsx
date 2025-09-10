// frontend/src/pages/public/PricingPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PricingPage from './PricingPage';
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

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderWithProviders(<PricingPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  describe('Page Header', () => {
    it('should display page title and description', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText(/Pricing Plans/i)).toBeInTheDocument();
      expect(screen.getByText(/Choose the perfect plan for your financial journey/i)).toBeInTheDocument();
    });

    it('should display breadcrumb navigation', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
    });

    it('should display billing toggle', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText(/Monthly/i)).toBeInTheDocument();
      expect(screen.getByText(/Annual/i)).toBeInTheDocument();
      expect(screen.getByText(/Save 20%/i)).toBeInTheDocument();
    });
  });

  describe('Pricing Tiers', () => {
    it('should display all pricing tiers', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('should display monthly prices by default', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText('$29')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should display annual prices when toggled', () => {
      renderWithProviders(<PricingPage />);

      const annualToggle = screen.getByRole('button', { name: /Annual/i });
      fireEvent.click(annualToggle);

      expect(screen.getByText('$279')).toBeInTheDocument();
      expect(screen.getByText('$949')).toBeInTheDocument();
      expect(screen.getByText('Custom')).toBeInTheDocument();
    });

    it('should display tier descriptions', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText(/Perfect for individuals/i)).toBeInTheDocument();
      expect(screen.getByText(/Ideal for serious investors/i)).toBeInTheDocument();
      expect(screen.getByText(/Tailored solutions for organizations/i)).toBeInTheDocument();
    });

    it('should highlight Professional tier as recommended', () => {
      renderWithProviders(<PricingPage />);

      const professionalCard = screen.getByTestId('pricing-card-professional');
      expect(professionalCard).toHaveClass('recommended');
      expect(screen.getByText(/Most Popular/i)).toBeInTheDocument();
    });
  });

  describe('Feature Lists', () => {
    it('should display features for Basic plan', () => {
      renderWithProviders(<PricingPage />);

      const basicFeatures = [
        'Portfolio tracking',
        'Basic analytics',
        'Mobile app access',
        'Email support',
        'Up to 5 portfolios'
      ];

      basicFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should display features for Professional plan', () => {
      renderWithProviders(<PricingPage />);

      const professionalFeatures = [
        'Everything in Basic',
        'Advanced analytics',
        'Tax optimization',
        'Priority support',
        'Unlimited portfolios',
        'API access',
        'Custom alerts'
      ];

      professionalFeatures.forEach(feature => {
        expect(screen.getByText(new RegExp(feature, 'i'))).toBeInTheDocument();
      });
    });

    it('should display features for Enterprise plan', () => {
      renderWithProviders(<PricingPage />);

      const enterpriseFeatures = [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        'SLA guarantee',
        'On-premise deployment',
        'Training & onboarding'
      ];

      enterpriseFeatures.forEach(feature => {
        expect(screen.getByText(new RegExp(feature, 'i'))).toBeInTheDocument();
      });
    });

    it('should display check marks for all features', () => {
      renderWithProviders(<PricingPage />);

      const checkMarks = screen.getAllByText('✓');
      expect(checkMarks.length).toBeGreaterThan(15);
    });
  });

  describe('CTA Buttons', () => {
    it('should display appropriate CTA buttons for each tier', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Start Free Trial/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Contact Sales/i })).toBeInTheDocument();
    });

    it('should navigate to register for Basic plan', () => {
      renderWithProviders(<PricingPage />);

      const getStartedButton = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(getStartedButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register?plan=basic');
    });

    it('should navigate to register for Professional plan', () => {
      renderWithProviders(<PricingPage />);

      const trialButton = screen.getByRole('button', { name: /Start Free Trial/i });
      fireEvent.click(trialButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register?plan=professional');
    });

    it('should navigate to contact for Enterprise plan', () => {
      renderWithProviders(<PricingPage />);

      const contactButton = screen.getByRole('button', { name: /Contact Sales/i });
      fireEvent.click(contactButton);

      expect(mockNavigate).toHaveBeenCalledWith('/contact?plan=enterprise');
    });
  });

  describe('Feature Comparison Table', () => {
    it('should display detailed comparison table', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText(/Detailed Feature Comparison/i)).toBeInTheDocument();
      expect(screen.getByTestId('comparison-table')).toBeInTheDocument();
    });

    it('should display all comparison categories', () => {
      renderWithProviders(<PricingPage />);

      const categories = [
        'Core Features',
        'Analytics & Reporting',
        'Support & Services',
        'Security & Compliance'
      ];

      categories.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument();
      });
    });

    it('should show feature availability across plans', () => {
      renderWithProviders(<PricingPage />);

      // Check for specific features in table
      expect(screen.getByText('Portfolio Management')).toBeInTheDocument();
      expect(screen.getByText('Real-time Data')).toBeInTheDocument();
      expect(screen.getByText('24/7 Phone Support')).toBeInTheDocument();
      expect(screen.getByText('SSO Integration')).toBeInTheDocument();
    });
  });

  describe('FAQ Section', () => {
    it('should display FAQ section', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    });

    it('should display FAQ items', () => {
      renderWithProviders(<PricingPage />);

      const faqs = [
        'Can I change plans anytime?',
        'Is there a free trial?',
        'What payment methods do you accept?',
        'Do you offer refunds?',
        'Is there a setup fee?'
      ];

      faqs.forEach(question => {
        expect(screen.getByText(question)).toBeInTheDocument();
      });
    });

    it('should toggle FAQ answers', () => {
      renderWithProviders(<PricingPage />);

      const firstQuestion = screen.getByText('Can I change plans anytime?');
      const questionButton = firstQuestion.closest('button');
      
      fireEvent.click(questionButton!);

      expect(screen.getByText(/Yes, you can upgrade or downgrade/i)).toBeInTheDocument();
    });

    it('should collapse FAQ answers when clicked again', () => {
      renderWithProviders(<PricingPage />);

      const firstQuestion = screen.getByText('Can I change plans anytime?');
      const questionButton = firstQuestion.closest('button');
      
      // Open
      fireEvent.click(questionButton!);
      expect(screen.getByText(/Yes, you can upgrade or downgrade/i)).toBeInTheDocument();
      
      // Close
      fireEvent.click(questionButton!);
      expect(screen.queryByText(/Yes, you can upgrade or downgrade/i)).not.toBeVisible();
    });
  });

  describe('Money Back Guarantee', () => {
    it('should display guarantee section', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText(/30-Day Money Back Guarantee/i)).toBeInTheDocument();
      expect(screen.getByText(/Try our platform risk-free/i)).toBeInTheDocument();
    });
  });

  describe('Enterprise CTA Section', () => {
    it('should display enterprise call-to-action', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByText(/Need a Custom Solution?/i)).toBeInTheDocument();
      expect(screen.getByText(/Let's discuss how we can tailor/i)).toBeInTheDocument();
    });

    it('should have enterprise contact button', () => {
      renderWithProviders(<PricingPage />);

      const enterpriseCTA = screen.getByTestId('enterprise-cta');
      const contactButton = within(enterpriseCTA).getByRole('button', { name: /Contact Our Team/i });
      
      expect(contactButton).toBeInTheDocument();
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

      renderWithProviders(<PricingPage />, store);

      expect(screen.getByRole('button', { name: /Upgrade Plan/i })).toBeInTheDocument();
    });

    it('should navigate to settings for authenticated users', () => {
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

      renderWithProviders(<PricingPage />, store);

      const upgradeButton = screen.getByRole('button', { name: /Upgrade Plan/i });
      fireEvent.click(upgradeButton);

      expect(mockNavigate).toHaveBeenCalledWith('/settings/billing');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly classes', () => {
      renderWithProviders(<PricingPage />);

      const pricingPage = screen.getByRole('main');
      expect(pricingPage).toHaveClass('pricing-page');
    });

    it('should have proper section structure', () => {
      renderWithProviders(<PricingPage />);

      expect(screen.getByTestId('pricing-tiers')).toBeInTheDocument();
      expect(screen.getByTestId('comparison-section')).toBeInTheDocument();
      expect(screen.getByTestId('faq-section')).toBeInTheDocument();
      expect(screen.getByTestId('enterprise-cta')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<PricingPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have accessible pricing cards', () => {
      renderWithProviders(<PricingPage />);

      const pricingCards = screen.getAllByRole('article');
      expect(pricingCards).toHaveLength(3);
      
      pricingCards.forEach(card => {
        expect(card).toHaveAccessibleName();
      });
    });

    it('should have ARIA labels for toggle', () => {
      renderWithProviders(<PricingPage />);

      const billingToggle = screen.getByRole('group', { name: /Billing period/i });
      expect(billingToggle).toBeInTheDocument();
    });
  });
});

// Add missing import for within
import { within } from '@testing-library/react';
