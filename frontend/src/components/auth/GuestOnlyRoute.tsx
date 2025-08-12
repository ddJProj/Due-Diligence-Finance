// frontend/src/components/auth/GuestOnlyRoute.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth.types';

interface GuestOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Default redirect paths based on user role
const DEFAULT_REDIRECTS: Record<Role, string> = {
  [Role.ADMIN]: '/dashboard/admin',
  [Role.EMPLOYEE]: '/dashboard/employee',
  [Role.CLIENT]: '/dashboard/client',
  [Role.GUEST]: '/',
};

/**
 * GuestOnlyRoute component that redirects authenticated users
 * Used for pages like login, register, forgot password
 * Redirects to role-specific dashboards or custom path
 */
export const GuestOnlyRoute: React.FC<GuestOnlyRouteProps> = ({
  children,
  redirectTo,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Check if user is authenticated and has valid user object
  if (isAuthenticated && user?.isActive) {
    // Use custom redirect if provided, otherwise use role-based default
    const destination = redirectTo || DEFAULT_REDIRECTS[user.role] || '/';
    return <Navigate to={destination} replace />;
  }

  // User is not authenticated or inactive, render guest content
  return <>{children}</>;
};
