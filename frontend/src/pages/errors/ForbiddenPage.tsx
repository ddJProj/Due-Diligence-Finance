// frontend/src/pages/errors/ForbiddenPage.tsx

import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import './ForbiddenPage.css';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { userRole } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    document.title = '403 - Access Forbidden | Due Diligence Finance';
  }, []);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleRequestAccess = () => {
    navigate('/contact', { 
      state: { 
        subject: 'Access Request',
        message: `Requesting access to: ${location.pathname}`
      } 
    });
  };

  return (
    <div className="forbidden-page">
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
              <rect x="70" y="60" width="60" height="80" rx="8" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.5" />
              <circle cx="100" cy="85" r="8" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
              <path d="M100 95 L100 115" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
              <path d="M85 125 L115 125" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              <text
                x="100"
                y="165"
                textAnchor="middle"
                fontSize="36"
                fontWeight="bold"
                fill="currentColor"
                opacity="0.1"
              >
                403
              </text>
            </svg>
          </div>
          
          <div className="error-code">403</div>
          
          <h1 className="error-title">Access Forbidden</h1>
          
          <p className="error-message">
            You don't have permission to access this resource.
          </p>

          <p className="error-details">
            This area requires special privileges. Please ensure you're logged in with the correct account.
          </p>
          
          <p className="error-path">
            Attempted path: <code>{location.pathname}</code>
          </p>
          
          <div className="error-actions">
            <button
              onClick={handleGoToDashboard}
              className="error-button error-button--primary"
              aria-label="Go to Dashboard"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={handleLogout}
              className="error-button error-button--secondary"
              aria-label="Logout"
            >
              Logout
            </button>

            {userRole === 'GUEST' && (
              <button
                onClick={handleRequestAccess}
                className="error-button error-button--tertiary"
                aria-label="Request Access"
              >
                Request Access
              </button>
            )}
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
