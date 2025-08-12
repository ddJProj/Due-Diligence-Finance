// frontend/src/components/auth/ProtectedRoute.tsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute component that checks if user is authenticated
 * Redirects to login page if not authenticated
 * Preserves the attempted location for redirect after login
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Don't render anything while checking authentication
  if (loading) {
    return null;
  }

  // Check if user is authenticated and active
  const isAuthorized = isAuthenticated && user?.isActive;

  if (!isAuthorized) {
    // Redirect to login page, preserving the location they were trying to access
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // User is authenticated and active, render the protected content
  return <>{children}</>;
};
