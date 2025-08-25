// frontend/src/pages/errors/NotFoundPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { NotFoundPage } from './NotFoundPage';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const renderWithRouter = (initialRoute = '/non-existent') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <NotFoundPage />
    </MemoryRouter>
  );
};

describe('NotFoundPage', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate = vi.fn();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render without errors', () => {
    renderWithRouter();
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('should display 404 error code prominently', () => {
    renderWithRouter();
    const errorCode = screen.getByText('404');
    expect(errorCode).toBeInTheDocument();
    expect(errorCode).toHaveClass('error-code');
  });

  it('should display page not found message', () => {
    renderWithRouter();
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('should display helpful error message', () => {
    renderWithRouter();
    expect(
      screen.getByText(/The page you are looking for doesn't exist/)
    ).toBeInTheDocument();
  });

  it('should render go home button', () => {
    renderWithRouter();
    const homeButton = screen.getByRole('button', { name: /go home/i });
    expect(homeButton).toBeInTheDocument();
  });

  it('should navigate to home when go home button is clicked', () => {
    renderWithRouter();
    const homeButton = screen.getByRole('button', { name: /go home/i });
    
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should render go back button', () => {
    renderWithRouter();
    const backButton = screen.getByRole('button', { name: /go back/i });
    expect(backButton).toBeInTheDocument();
  });

  it('should navigate back when go back button is clicked', () => {
    renderWithRouter();
    const backButton = screen.getByRole('button', { name: /go back/i });
    
    fireEvent.click(backButton);
    
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('should display the attempted path', () => {
    renderWithRouter('/non-existent/path');
    expect(screen.getByText(/\/non-existent\/path/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithRouter();
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Page Not Found');
  });

  it('should have proper styling classes', () => {
    const { container } = renderWithRouter();
    
    expect(container.querySelector('.not-found-page')).toBeInTheDocument();
    expect(container.querySelector('.error-container')).toBeInTheDocument();
  });

  it('should display contact support link', () => {
    renderWithRouter();
    
    const supportLink = screen.getByRole('link', { name: /contact support/i });
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute('href', '/contact');
  });

  it('should render icon or illustration', () => {
    const { container } = renderWithRouter();
    
    const illustration = container.querySelector('.error-illustration');
    expect(illustration).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    renderWithRouter();
    
    const homeButton = screen.getByRole('button', { name: /go home/i });
    const backButton = screen.getByRole('button', { name: /go back/i });
    const supportLink = screen.getByRole('link', { name: /contact support/i });
    
    // Check tab order
    homeButton.focus();
    expect(document.activeElement).toBe(homeButton);
    
    // Tab to next element
    userEvent.tab();
    expect(document.activeElement).toBe(backButton);
    
    // Tab to next element
    userEvent.tab();
    expect(document.activeElement).toBe(supportLink);
  });

  it('should have document title set', () => {
    renderWithRouter();
    // Note: In a real app, you'd use react-helmet or similar
    // This is a placeholder for the expected behavior
    expect(document.title).toContain('404');
  });
});

// Additional test for userEvent import
import userEvent from '@testing-library/user-event';
