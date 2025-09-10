// frontend/src/pages/public/AboutPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AboutPage from './AboutPage';
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

describe('AboutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderWithProviders(<AboutPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  describe('Company Overview Section', () => {
    it('should display company overview', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/About Due Diligence Finance/i)).toBeInTheDocument();
      expect(screen.getByText(/Founded in 2009/i)).toBeInTheDocument();
      expect(screen.getByText(/trusted partner in wealth management/i)).toBeInTheDocument();
    });

    it('should display company statistics', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByTestId('company-stats')).toBeInTheDocument();
      expect(screen.getByText(/15\+ Years/i)).toBeInTheDocument();
      expect(screen.getByText(/50\+ Advisors/i)).toBeInTheDocument();
      expect(screen.getByText(/10K\+ Clients/i)).toBeInTheDocument();
      expect(screen.getByText(/\$5B\+ AUM/i)).toBeInTheDocument();
    });
  });

  describe('Mission & Vision Section', () => {
    it('should display mission statement', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/Our Mission/i)).toBeInTheDocument();
      expect(screen.getByText(/democratize access to professional/i)).toBeInTheDocument();
    });

    it('should display vision statement', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/Our Vision/i)).toBeInTheDocument();
      expect(screen.getByText(/leading digital wealth management/i)).toBeInTheDocument();
    });

    it('should display core values', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/Our Values/i)).toBeInTheDocument();
      expect(screen.getByText(/Integrity/i)).toBeInTheDocument();
      expect(screen.getByText(/Innovation/i)).toBeInTheDocument();
      expect(screen.getByText(/Excellence/i)).toBeInTheDocument();
      expect(screen.getByText(/Client-First/i)).toBeInTheDocument();
    });
  });

  describe('Team Section', () => {
    it('should display leadership team', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/Our Leadership Team/i)).toBeInTheDocument();
      expect(screen.getByTestId('team-section')).toBeInTheDocument();
    });

    it('should display team members', () => {
      renderWithProviders(<AboutPage />);

      // Check for CEO
      expect(screen.getByText(/John Smith/i)).toBeInTheDocument();
      expect(screen.getByText(/Chief Executive Officer/i)).toBeInTheDocument();
      
      // Check for CTO
      expect(screen.getByText(/Sarah Johnson/i)).toBeInTheDocument();
      expect(screen.getByText(/Chief Technology Officer/i)).toBeInTheDocument();
      
      // Check for CFO
      expect(screen.getByText(/Michael Chen/i)).toBeInTheDocument();
      expect(screen.getByText(/Chief Financial Officer/i)).toBeInTheDocument();
    });

    it('should display team member bios', () => {
      renderWithProviders(<AboutPage />);

      const teamCards = screen.getAllByTestId('team-member-card');
      expect(teamCards).toHaveLength(4); // CEO, CTO, CFO, Head of Advisory
      
      // Each card should have a bio
      teamCards.forEach(card => {
        expect(card.querySelector('.member-bio')).toBeInTheDocument();
      });
    });
  });

  describe('Timeline Section', () => {
    it('should display company timeline', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/Our Journey/i)).toBeInTheDocument();
      expect(screen.getByTestId('timeline-section')).toBeInTheDocument();
    });

    it('should display timeline milestones', () => {
      renderWithProviders(<AboutPage />);

      // Key milestones
      expect(screen.getByText(/2009/)).toBeInTheDocument();
      expect(screen.getByText(/Company Founded/i)).toBeInTheDocument();
      
      expect(screen.getByText(/2012/)).toBeInTheDocument();
      expect(screen.getByText(/\$100M AUM/i)).toBeInTheDocument();
      
      expect(screen.getByText(/2015/)).toBeInTheDocument();
      expect(screen.getByText(/Digital Platform Launch/i)).toBeInTheDocument();
      
      expect(screen.getByText(/2018/)).toBeInTheDocument();
      expect(screen.getByText(/\$1B AUM Milestone/i)).toBeInTheDocument();
      
      expect(screen.getByText(/2021/)).toBeInTheDocument();
      expect(screen.getByText(/AI-Powered Analytics/i)).toBeInTheDocument();
      
      expect(screen.getByText(/2024/)).toBeInTheDocument();
      expect(screen.getByText(/\$5B AUM/i)).toBeInTheDocument();
    });
  });

  describe('Awards & Recognition Section', () => {
    it('should display awards section', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/Awards & Recognition/i)).toBeInTheDocument();
      expect(screen.getByTestId('awards-section')).toBeInTheDocument();
    });

    it('should display award items', () => {
      renderWithProviders(<AboutPage />);

      const awards = [
        'Best Digital Wealth Platform 2023',
        'Top Financial Advisory Firm',
        'Excellence in Client Service',
        'Innovation in FinTech Award'
      ];

      awards.forEach(award => {
        expect(screen.getByText(new RegExp(award, 'i'))).toBeInTheDocument();
      });
    });
  });

  describe('CTA Section', () => {
    it('should display call-to-action', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText(/Ready to Start Your Journey/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Contact Us/i })).toBeInTheDocument();
    });

    it('should navigate to register when Get Started is clicked', () => {
      renderWithProviders(<AboutPage />);

      const getStartedButton = screen.getByRole('button', { name: /Get Started/i });
      fireEvent.click(getStartedButton);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should navigate to contact when Contact Us is clicked', () => {
      renderWithProviders(<AboutPage />);

      const contactButton = screen.getByRole('button', { name: /Contact Us/i });
      fireEvent.click(contactButton);

      expect(mockNavigate).toHaveBeenCalledWith('/contact');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly classes', () => {
      renderWithProviders(<AboutPage />);

      const aboutPage = screen.getByRole('main');
      expect(aboutPage).toHaveClass('about-page');
    });

    it('should have proper section structure', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByTestId('overview-section')).toBeInTheDocument();
      expect(screen.getByTestId('mission-section')).toBeInTheDocument();
      expect(screen.getByTestId('team-section')).toBeInTheDocument();
      expect(screen.getByTestId('timeline-section')).toBeInTheDocument();
      expect(screen.getByTestId('awards-section')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<AboutPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have proper ARIA labels', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByLabelText(/about page/i)).toBeInTheDocument();
    });

    it('should have accessible images', () => {
      renderWithProviders(<AboutPage />);

      const teamImages = screen.getAllByRole('img');
      teamImages.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
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

      renderWithProviders(<AboutPage />, store);

      expect(screen.getByRole('button', { name: /View Dashboard/i })).toBeInTheDocument();
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

      renderWithProviders(<AboutPage />, store);

      const dashboardButton = screen.getByRole('button', { name: /View Dashboard/i });
      fireEvent.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Navigation Links', () => {
    it('should have breadcrumb navigation', () => {
      renderWithProviders(<AboutPage />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should navigate home when breadcrumb is clicked', () => {
      renderWithProviders(<AboutPage />);

      const homeLink = screen.getByText('Home');
      fireEvent.click(homeLink);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
