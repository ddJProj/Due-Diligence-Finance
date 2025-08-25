// frontend/src/pages/errors/ServerErrorPage.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { ServerErrorPage } from './ServerErrorPage';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const renderWithRouter = (initialRoute = '/error') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <ServerErrorPage />
    </MemoryRouter>
  );
};

describe('ServerErrorPage', () => {
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
    expect(screen.getByText('500')).toBeInTheDocument();
  });

  it('should display 500 error code prominently', () => {
    renderWithRouter();
    const errorCode = screen.getByText('500');
    expect(errorCode).toBeInTheDocument();
    expect(errorCode).toHaveClass('error-code');
  });

  it('should display server error message', () => {
    renderWithRouter();
    expect(screen.getByText('Server Error')).toBeInTheDocument();
  });

  it('should display technical error message', () => {
    renderWithRouter();
    expect(
      screen.getByText(/Something went wrong on our servers/)
    ).toBeInTheDocument();
  });

  it('should render try again button', () => {
    renderWithRouter();
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    expect(tryAgainButton).toBeInTheDocument();
  });

  it('should reload page when try again is clicked', () => {
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    renderWithRouter();
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    
    fireEvent.click(tryAgainButton);
    
    expect(mockReload).toHaveBeenCalled();
  });

  it('should render go home button', () => {
    renderWithRouter();
    const homeButton = screen.getByRole('button', { name: /go home/i });
    expect(homeButton).toBeInTheDocument();
  });

  it('should navigate home when go home is clicked', () => {
    renderWithRouter();
    const homeButton = screen.getByRole('button', { name: /go home/i });
    
    fireEvent.click(homeButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('should display error timestamp', () => {
    renderWithRouter();
    expect(screen.getByText(/Error occurred at:/)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    renderWithRouter();
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('Server Error');
  });

  it('should have proper styling classes', () => {
    const { container } = renderWithRouter();
    
    expect(container.querySelector('.server-error-page')).toBeInTheDocument();
    expect(container.querySelector('.error-container')).toBeInTheDocument();
  });

  it('should display contact support link', () => {
    renderWithRouter();
    
    const supportLink = screen.getByRole('link', { name: /contact support/i });
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute('href', '/contact');
  });

  it('should render server/database icon illustration', () => {
    const { container } = renderWithRouter();
    
    const illustration = container.querySelector('.error-illustration');
    expect(illustration).toBeInTheDocument();
  });

  it('should show error reference code', () => {
    renderWithRouter();
    
    const referenceCode = screen.getByText(/Reference Code:/);
    expect(referenceCode).toBeInTheDocument();
  });

  it('should show reassuring message about data', () => {
    renderWithRouter();
    expect(
      screen.getByText(/Your data is safe/)
    ).toBeInTheDocument();
  });

  it('should be keyboard accessible', () => {
    renderWithRouter();
    
    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    const homeButton = screen.getByRole('button', { name: /go home/i });
    const supportLink = screen.getByRole('link', { name: /contact support/i });
    
    // Check tab order
    tryAgainButton.focus();
    expect(document.activeElement).toBe(tryAgainButton);
    
    // Tab to next element
    userEvent.tab();
    expect(document.activeElement).toBe(homeButton);
    
    // Tab to next element
    userEvent.tab();
    expect(document.activeElement).toBe(supportLink);
  });

  it('should have document title set', () => {
    renderWithRouter();
    expect(document.title).toContain('500');
  });

  it('should copy error code when copy button is clicked', () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    renderWithRouter();
    
    const copyButton = screen.getByRole('button', { name: /copy error code/i });
    fireEvent.click(copyButton);
    
    expect(mockClipboard.writeText).toHaveBeenCalled();
  });
});

// Additional test for userEvent import
import userEvent from '@testing-library/user-event';
