// frontend/src/components/common/LoadingSpinner.tsx
import { FC } from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  showText?: boolean;
  fullscreen?: boolean;
  variant?: 'primary' | 'light' | 'dark';
  centered?: boolean;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Loading...',
  showText = true,
  fullscreen = false,
  variant = 'primary',
  centered = false
}) => {
  const containerClasses = [
    'loading-spinner',
    `loading-spinner--${size}`,
    `loading-spinner--${variant}`,
    centered ? 'loading-spinner--centered' : 'loading-spinner--inline'
  ].join(' ');

  const spinnerContent = (
    <div 
      className={containerClasses} 
      data-testid="spinner-container"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="spinner" data-testid="spinner-element">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {showText && (
        <span className="loading-text">{text}</span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="loading-overlay" data-testid="spinner-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};
