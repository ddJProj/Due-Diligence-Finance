// frontend/src/pages/public/ContactPage.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ContactPage from './ContactPage';
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

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  describe('Page Header', () => {
    it('should display page title and description', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
      expect(screen.getByText(/Get in touch with our team/i)).toBeInTheDocument();
    });

    it('should display breadcrumb navigation', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('Contact Form', () => {
    it('should display all form fields', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Subject/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
    });

    it('should display department selection', () => {
      renderWithProviders(<ContactPage />);

      const departmentSelect = screen.getByLabelText(/Department/i);
      expect(departmentSelect).toBeInTheDocument();
      
      // Check options
      expect(screen.getByText('General Inquiry')).toBeInTheDocument();
      expect(screen.getByText('Sales')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Advisory Services')).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      renderWithProviders(<ContactPage />);

      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/Message is required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderWithProviders(<ContactPage />);

      const emailInput = screen.getByLabelText(/Email/i);
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('should validate phone format', async () => {
      renderWithProviders(<ContactPage />);

      const phoneInput = screen.getByLabelText(/Phone/i);
      fireEvent.change(phoneInput, { target: { value: '123' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
      });
    });

    it('should submit form with valid data', async () => {
      renderWithProviders(<ContactPage />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '123-456-7890' } });
      fireEvent.change(screen.getByLabelText(/Subject/i), { target: { value: 'Test Subject' } });
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test message content' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Thank you for contacting us/i)).toBeInTheDocument();
      });
    });

    it('should show loading state during submission', async () => {
      renderWithProviders(<ContactPage />);

      // Fill required fields
      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);

      expect(screen.getByText(/Sending.../i)).toBeInTheDocument();
    });

    it('should reset form after successful submission', async () => {
      renderWithProviders(<ContactPage />);

      const firstNameInput = screen.getByLabelText(/First Name/i);
      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Test' } });
      
      const submitButton = screen.getByRole('button', { name: /Send Message/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(firstNameInput).toHaveValue('');
      });
    });
  });

  describe('Contact Information', () => {
    it('should display office locations', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByText(/Office Locations/i)).toBeInTheDocument();
      expect(screen.getByText(/New York Headquarters/i)).toBeInTheDocument();
      expect(screen.getByText(/San Francisco Office/i)).toBeInTheDocument();
      expect(screen.getByText(/London Office/i)).toBeInTheDocument();
    });

    it('should display addresses', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByText(/123 Financial District/i)).toBeInTheDocument();
      expect(screen.getByText(/456 Market Street/i)).toBeInTheDocument();
      expect(screen.getByText(/789 Canary Wharf/i)).toBeInTheDocument();
    });

    it('should display phone numbers as clickable links', () => {
      renderWithProviders(<ContactPage />);

      const phoneLinks = screen.getAllByRole('link', { name: /\+1.*|212.*|415.*|44.*/ });
      expect(phoneLinks.length).toBeGreaterThan(0);
      expect(phoneLinks[0]).toHaveAttribute('href', expect.stringContaining('tel:'));
    });

    it('should display email addresses as clickable links', () => {
      renderWithProviders(<ContactPage />);

      const nyEmail = screen.getByRole('link', { name: /ny@duediligencefinance.com/i });
      expect(nyEmail).toHaveAttribute('href', 'mailto:ny@duediligencefinance.com');

      const sfEmail = screen.getByRole('link', { name: /sf@duediligencefinance.com/i });
      expect(sfEmail).toHaveAttribute('href', 'mailto:sf@duediligencefinance.com');

      const londonEmail = screen.getByRole('link', { name: /london@duediligencefinance.com/i });
      expect(londonEmail).toHaveAttribute('href', 'mailto:london@duediligencefinance.com');
    });
  });

  describe('Support Information', () => {
    it('should display support hours', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByText(/Support Hours/i)).toBeInTheDocument();
      expect(screen.getByText(/Monday - Friday/i)).toBeInTheDocument();
      expect(screen.getByText(/9:00 AM - 6:00 PM EST/i)).toBeInTheDocument();
      expect(screen.getByText(/24\/7 Emergency Support/i)).toBeInTheDocument();
    });

    it('should display support contact methods', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByText(/Email Support/i)).toBeInTheDocument();
      expect(screen.getByText(/support@duediligencefinance.com/i)).toBeInTheDocument();
      
      expect(screen.getByText(/Phone Support/i)).toBeInTheDocument();
      expect(screen.getByText(/1-800-FINANCE/i)).toBeInTheDocument();
    });
  });

  describe('FAQ Link', () => {
    it('should display FAQ section', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByText(/Frequently Asked Questions/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View FAQ/i })).toBeInTheDocument();
    });

    it('should navigate to FAQ when clicked', () => {
      renderWithProviders(<ContactPage />);

      const faqButton = screen.getByRole('button', { name: /View FAQ/i });
      fireEvent.click(faqButton);

      expect(mockNavigate).toHaveBeenCalledWith('/faq');
    });
  });

  describe('Authenticated User Behavior', () => {
    it('should pre-fill form for authenticated users', () => {
      const store = createTestStore({
        auth: {
          isAuthenticated: true,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            phone: '123-456-7890',
          },
        },
      });

      renderWithProviders(<ContactPage />, store);

      expect(screen.getByLabelText(/First Name/i)).toHaveValue('Test');
      expect(screen.getByLabelText(/Last Name/i)).toHaveValue('User');
      expect(screen.getByLabelText(/Email/i)).toHaveValue('test@example.com');
      expect(screen.getByLabelText(/Phone/i)).toHaveValue('123-456-7890');
    });
  });

  describe('Map Section', () => {
    it('should display office locations map', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByTestId('office-map')).toBeInTheDocument();
      expect(screen.getByText(/Our Global Presence/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      renderWithProviders(<ContactPage />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    it('should have proper form labels', () => {
      renderWithProviders(<ContactPage />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('should have accessible buttons', () => {
      renderWithProviders(<ContactPage />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile-friendly classes', () => {
      renderWithProviders(<ContactPage />);

      const contactPage = screen.getByRole('main');
      expect(contactPage).toHaveClass('contact-page');
    });

    it('should have proper section structure', () => {
      renderWithProviders(<ContactPage />);

      expect(screen.getByTestId('contact-form-section')).toBeInTheDocument();
      expect(screen.getByTestId('contact-info-section')).toBeInTheDocument();
      expect(screen.getByTestId('support-section')).toBeInTheDocument();
    });
  });
});
