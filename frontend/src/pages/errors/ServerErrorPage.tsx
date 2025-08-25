// frontend/src/pages/errors/ServerErrorPage.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ServerErrorPage.css';

export const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorTime] = useState(new Date());
  const [errorCode] = useState(generateErrorCode());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = '500 - Server Error | Due Diligence Finance';
  }, []);

  function generateErrorCode(): string {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  const handleTryAgain = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleCopyErrorCode = async () => {
    try {
      await navigator.clipboard.writeText(errorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy error code:', error);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  };

  return (
    <div className="server-error-page">
      <main role="main" className="error-container">
        <div className="error-content">
          <div className="error-illustration">
            <svg
              width="200"
              height="200"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="50" y="50" width="100" height="80" rx="4" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.5" />
              <rect x="50" y="140" width="100" height="20" rx="4" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.3" />
              <circle cx="70" cy="65" r="3" fill="currentColor" opacity="0.8" />
              <circle cx="85" cy="65" r="3" fill="currentColor" opacity="0.8" />
              <circle cx="100" cy="65" r="3" fill="currentColor" opacity="0.3" />
              <path d="M65 85 L85 105 M85 85 L65 105" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              <path d="M115 85 L135 105 M135 85 L115 105" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
              <circle cx="70" cy="150" r="2" fill="currentColor" className="blink" />
              <circle cx="80" cy="150" r="2" fill="currentColor" opacity="0.3" />
              <text
                x="100"
                y="180"
                textAnchor="middle"
                fontSize="36"
                fontWeight="bold"
                fill="currentColor"
                opacity="0.1"
              >
                500
              </text>
            </svg>
          </div>
          
          <div className="error-code">500</div>
          
          <h1 className="error-title">Server Error</h1>
          
          <p className="error-message">
            Something went wrong on our servers. We're working to fix the issue.
          </p>

          <p className="error-reassurance">
            Your data is safe. This is a temporary issue that our team has been notified about.
          </p>
          
          <div className="error-details">
            <p>Error occurred at: <time>{formatTime(errorTime)}</time></p>
            <div className="error-reference">
              <span>Reference Code: <code>{errorCode}</code></span>
              <button
                onClick={handleCopyErrorCode}
                className="copy-button"
                aria-label="Copy error code"
                title={copied ? 'Copied!' : 'Copy error code'}
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
          </div>
          
          <div className="error-actions">
            <button
              onClick={handleTryAgain}
              className="error-button error-button--primary"
              aria-label="Try Again"
            >
              Try Again
            </button>
            
            <button
              onClick={handleGoHome}
              className="error-button error-button--secondary"
              aria-label="Go Home"
            >
              Go Home
            </button>
          </div>
          
          <div className="error-help">
            <p>If the problem persists, please contact support with the reference code above.</p>
            <Link to="/contact" className="error-link">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
