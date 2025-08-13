// frontend/src/components/common/LoadingSpinner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner');
  });

  it('should render with default loading text', () => {
    render(<LoadingSpinner />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render with custom text', () => {
    render(<LoadingSpinner text="Saving changes..." />);
    
    expect(screen.getByText('Saving changes...')).toBeInTheDocument();
  });

  it('should render without text when showText is false', () => {
    render(<LoadingSpinner showText={false} />);
    
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('should apply small size class', () => {
    render(<LoadingSpinner size="small" />);
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--small');
  });

  it('should apply medium size class', () => {
    render(<LoadingSpinner size="medium" />);
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--medium');
  });

  it('should apply large size class', () => {
    render(<LoadingSpinner size="large" />);
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--large');
  });

  it('should render as fullscreen overlay', () => {
    render(<LoadingSpinner fullscreen />);
    
    const overlay = screen.getByTestId('spinner-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('loading-overlay');
  });

  it('should render with light variant', () => {
    render(<LoadingSpinner variant="light" />);
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--light');
  });

  it('should render with dark variant', () => {
    render(<LoadingSpinner variant="dark" />);
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--dark');
  });

  it('should render inline by default', () => {
    render(<LoadingSpinner />);
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--inline');
  });

  it('should render centered when specified', () => {
    render(<LoadingSpinner centered />);
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--centered');
  });

  it('should have proper ARIA attributes', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-live', 'polite');
  });

  it('should have accessible label', () => {
    render(<LoadingSpinner text="Processing payment..." />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Processing payment...');
  });

  it('should combine multiple props correctly', () => {
    render(
      <LoadingSpinner 
        size="large" 
        variant="light" 
        centered 
        text="Loading data..." 
      />
    );
    
    const container = screen.getByTestId('spinner-container');
    expect(container).toHaveClass('loading-spinner--large');
    expect(container).toHaveClass('loading-spinner--light');
    expect(container).toHaveClass('loading-spinner--centered');
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('should render spinner animation elements', () => {
    render(<LoadingSpinner />);
    
    const spinnerElement = screen.getByTestId('spinner-element');
    expect(spinnerElement).toBeInTheDocument();
    expect(spinnerElement).toHaveClass('spinner');
  });
});
