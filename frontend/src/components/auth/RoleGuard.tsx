// frontend/src/components/auth/RoleGuard.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { Role } from '@/types/auth.types';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  allowedRoles?: Role[];
  minimumRole?: Role;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * RoleGuard component for role-based access control
 * Supports single role, multiple roles, or minimum role requirements
 * Can redirect or render fallback content for unauthorized access
 */
export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  allowedRoles,
  minimumRole,
  fallback,
  redirectTo = '/unauthorized',
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const { hasAnyRole, hasMinimumRole } = useRole();

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  // Check if user is authenticated and active
  if (!isAuthenticated || !user?.isActive) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  let isAuthorized = true;

  // Check required role (exact match)
  if (requiredRole && user.role !== requiredRole) {
    isAuthorized = false;
  }

  // Check allowed roles (any match)
  if (isAuthorized && allowedRoles && allowedRoles.length > 0) {
    isAuthorized = hasAnyRole(allowedRoles);
  }

  // Check minimum role (hierarchical)
  if (isAuthorized && minimumRole && !requiredRole) {
    isAuthorized = hasMinimumRole(minimumRole);
  }

  // Render based on authorization
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
