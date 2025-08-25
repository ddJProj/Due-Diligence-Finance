// frontend/src/pages/errors/NotFoundPage.tsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './NotFoundPage.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = '404 - Page Not Found | Due Diligence Finance';
  }, []);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-page">
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
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" opacity="0.2" />
              <path
                d="M70 80 Q100 60 130 80"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
              <circle cx="75" cy="75" r="3" fill="currentColor" opacity="0.5" />
              <circle cx="125" cy="75" r="3" fill="currentColor" opacity="0.5" />
              <path
                d="M80 120 Q100 135 120 120"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
              <text
                x="100"
                y="160"
                textAnchor="middle"
                fontSize="48"
                fontWeight="bold"
                fill="currentColor"
                opacity="0.1"
              >
                404
              </text>
            </svg>
          </div>
          
          <div className="error-code">404</div>
          
          <h1 className="error-title">Page Not Found</h1>
          
          <p className="error-message">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <p className="error-path">
            Attempted path: <code>{location.pathname}</code>
          </p>
          
          <div className="error-actions">
            <button
              onClick={handleGoHome}
              className="error-button error-button--primary"
              aria-label="Go home"
            >
              Go Home
            </button>
            
            <button
              onClick={handleGoBack}
              className="error-button error-button--secondary"
              aria-label="Go back"
            >
              Go Back
            </button>
          </div>
          
          <div className="error-help">
            <p>Need help?</p>
            <Link to="/contact" className="error-link">
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
