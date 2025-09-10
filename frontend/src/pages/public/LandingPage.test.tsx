// frontend/src/pages/public/LandingPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import LandingPage from './LandingPage';
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

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderWithProviders(<LandingPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  describe('Hero Section', () => {
    it('should display hero content', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByText(/Welcome to Due Diligence Finance/i)).toBeInTheDocument();
      expect(screen.getByText(/Your trusted partner in wealth management/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Learn More/i })).toBeInTheDocument();
    });

    it('should navigate to register when Get Started is clicked', () => {
      renderWithProviders(<LandingPage />);

      const getStartedButton = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(getStartedButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should scroll to features section when Learn More is clicked', () => {
      renderWithProviders(<LandingPage />);
      
      // Mock scrollIntoView
      const scrollIntoViewMock = vi.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      const learnMoreButton = screen.getByRole('button', { name: /Learn More/i });
      fireEvent.click(learnMoreButton);

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  describe('Features Section', () => {
    it('should display all key features', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByText(/Portfolio Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Expert Advisors/i)).toBeInTheDocument();
      expect(screen.getByText(/Secure Platform/i)).toBeInTheDocument();
      expect(screen.getByText(/Real-time Analytics/i)).toBeInTheDocument();
    });

    it('should display feature descriptions', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByText(/Track and manage your investments/i)).toBeInTheDocument();
      expect(screen.getByText(/Access to certified financial advisors/i)).toBeInTheDocument();
      expect(screen.getByText(/Bank-level security/i)).toBeInTheDocument();
      expect(screen.getByText(/Monitor your portfolio performance/i)).toBeInTheDocument();
    });
  });

  describe('Statistics Section', () => {
    it('should display company statistics', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByText(/10K\+/)).toBeInTheDocument();
      expect(screen.getByText(/Active Clients/i)).toBeInTheDocument();
      
      expect(screen.getByText(/\$5B\+/)).toBeInTheDocument();
      expect(screen.getByText(/Assets Managed/i)).toBeInTheDocument();
      
      expect(screen.getByText(/15\+/)).toBeInTheDocument();
      expect(screen.getByText(/Years Experience/i)).toBeInTheDocument();
      
      expect(screen.getByText(/98%/)).toBeInTheDocument();
      expect(screen.getByText(/Client Satisfaction/i)).toBeInTheDocument();
    });

    it('should animate statistics on scroll', () => {
      renderWithProviders(<LandingPage />);

      const statsSection = screen.getByTestId('statistics-section');
      expect(statsSection).toHaveClass('statistics');
    });
  });

  describe('Testimonials Section', () => {
    it('should display client testimonials', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByText(/What Our Clients Say/i)).toBeInTheDocument();
      expect(screen.getByText(/Sarah Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/CEO, Tech Startup/)).toBeInTheDocument();
    });

    it('should display multiple testimonials', () => {
      renderWithProviders(<LandingPage />);

      const testimonials = screen.getAllByTestId('testimonial-card');
      expect(testimonials).toHaveLength(3);
    });

    it('should display star ratings', () => {
      renderWithProviders(<LandingPage />);

      const starRatings = screen.getAllByTestId('star-rating');
      expect(starRatings.length).toBeGreaterThan(0);
    });
  });

  describe('CTA Section', () => {
    it('should display call-to-action section', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByText(/Ready to Get Started?/i)).toBeInTheDocument();
      expect(screen.getByText(/Join thousands of satisfied clients/i)).toBeInTheDocument();
    });

    it('should have CTA buttons', () => {
      renderWithProviders(<LandingPage />);

      const ctaSection = screen.getByTestId('cta-section');
      const startNowButton = within(ctaSection).getByRole('button', { name: /Start Now/i });
      const contactButton = within(ctaSection).getByRole('button', { name: /Contact Sales/i });

      expect(startNowButton).toBeInTheDocument();
      expect(contactButton).toBeInTheDocument();
    });

    it('should navigate to register when Start Now is clicked', () => {
      renderWithProviders(<LandingPage />);

      const ctaSection = screen.getByTestId('cta-section');
      const startNowButton = within(ctaSection).getByRole('button', { name: /Start Now/i });
      
      fireEvent.click(startNowButton);
      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should navigate to contact when Contact Sales is clicked', () => {
      renderWithProviders(<LandingPage />);

      const ctaSection = screen.getByTestId('cta-section');
      const contactButton = within(ctaSection).getByRole('button', { name: /Contact Sales/i });
      
      fireEvent.click(contactButton);
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

      renderWithProviders(<LandingPage />, store);

      expect(screen.getByRole('button', { name: /Go to Dashboard/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Get Started/i })).not.toBeInTheDocument();
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

      renderWithProviders(<LandingPage />, store);

      const dashboardButton = screen.getByRole('button', { name: /Go to Dashboard/i });
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly classes', () => {
      renderWithProviders(<LandingPage />);

      const heroSection = screen.getByTestId('hero-section');
      expect(heroSection).toHaveClass('hero');
    });

    it('should have proper section structure', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      expect(screen.getByTestId('features-section')).toBeInTheDocument();
      expect(screen.getByTestId('statistics-section')).toBeInTheDocument();
      expect(screen.getByTestId('testimonials-section')).toBeInTheDocument();
      expect(screen.getByTestId('cta-section')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<LandingPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/landing page/i)).toBeInTheDocument();
    });

    it('should have accessible buttons', () => {
      renderWithProviders(<LandingPage />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Newsletter Section', () => {
    it('should display newsletter signup', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByText(/Stay Updated/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Subscribe/i })).toBeInTheDocument();
    });

    it('should validate email input', async () => {
      renderWithProviders(<LandingPage />);

      const emailInput = screen.getByPlaceholderText(/Enter your email/i);
      const subscribeButton = screen.getByRole('button', { name: /Subscribe/i });

      // Test invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(subscribeButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument();
      });

      // Test valid email
      fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
      fireEvent.click(subscribeButton);

      await waitFor(() => {
        expect(screen.queryByText(/Please enter a valid email/i)).not.toBeInTheDocument();
      });
    });

    it('should show success message after subscription', async () => {
      renderWithProviders(<LandingPage />);

      const emailInput = screen.getByPlaceholderText(/Enter your email/i);
      const subscribeButton = screen.getByRole('button', { name: /Subscribe/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(subscribeButton);

      await waitFor(() => {
        expect(screen.getByText(/Thank you for subscribing/i)).toBeInTheDocument();
      });
    });
  });

  describe('Footer Links', () => {
    it('should have footer navigation links', () => {
      renderWithProviders(<LandingPage />);

      expect(screen.getByRole('link', { name: /About/i })).toHaveAttribute('href', '/about');
      expect(screen.getByRole('link', { name: /Features/i })).toHaveAttribute('href', '/features');
      expect(screen.getByRole('link', { name: /Pricing/i })).toHaveAttribute('href', '/pricing');
      expect(screen.getByRole('link', { name: /Contact/i })).toHaveAttribute('href', '/contact');
    });
  });
});

// Add missing import for within
import { within } from '@testing-library/react';
