// frontend/src/hooks/useRole.ts

import { useCallback, useMemo } from 'react';
import { useAppSelector } from './redux';
import { selectUserRole, selectIsAuthenticated } from '@/store/slices/authSlice';
import { Role } from '@/types/auth.types';

// Role hierarchy levels for permission checking
const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.ADMIN]: 3,
  [Role.EMPLOYEE]: 2,
  [Role.CLIENT]: 1,
  [Role.GUEST]: 0,
};

// Section access mapping
const SECTION_ACCESS: Record<string, Role[]> = {
  admin: [Role.ADMIN],
  employee: [Role.ADMIN, Role.EMPLOYEE],
  client: [Role.ADMIN, Role.EMPLOYEE, Role.CLIENT],
  public: [Role.ADMIN, Role.EMPLOYEE, Role.CLIENT, Role.GUEST],
};

/**
 * Custom hook for role-based access control
 * Provides utilities for checking user roles and permissions
 * 
 * @example
 * const { role, isAdmin, canAccess, hasMinimumRole } = useRole();
 */
export const useRole = () => {
  const role = useAppSelector(selectUserRole);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Check if user has a specific role
  const isRole = useCallback(
    (checkRole: Role): boolean => {
      return role === checkRole;
    },
    [role]
  );

  // Check if user has minimum role level (hierarchical check)
  const hasMinimumRole = useCallback(
    (minimumRole: Role): boolean => {
      if (!role) return false;
      
      const userLevel = ROLE_HIERARCHY[role];
      const requiredLevel = ROLE_HIERARCHY[minimumRole];
      
      return userLevel >= requiredLevel;
    },
    [role]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      if (!role || roles.length === 0) return false;
      return roles.includes(role);
    },
    [role]
  );

  // Check if user can access a specific section
  const canAccess = useCallback(
    (section: string): boolean => {
      const allowedRoles = SECTION_ACCESS[section];
      if (!allowedRoles) return false;
      
      // If not authenticated, check if GUEST is allowed
      if (!isAuthenticated) {
        return allowedRoles.includes(Role.GUEST);
      }
      
      // If authenticated, check user's role
      return role ? allowedRoles.includes(role) : false;
    },
    [role, isAuthenticated]
  );

  // Convenience role checks
  const isAdmin = useMemo(() => role === Role.ADMIN, [role]);
  const isEmployee = useMemo(() => role === Role.EMPLOYEE, [role]);
  const isClient = useMemo(() => role === Role.CLIENT, [role]);
  const isGuest = useMemo(() => !isAuthenticated, [isAuthenticated]);

  // Get role hierarchy level
  const roleLevel = useMemo(() => {
    if (!role) return 0;
    return ROLE_HIERARCHY[role] || 0;
  }, [role]);

  return {
    // Current role
    role,
    
    // Role checking methods
    isRole,
    hasMinimumRole,
    hasAnyRole,
    canAccess,
    
    // Convenience properties
    isAdmin,
    isEmployee,
    isClient,
    isGuest,
    
    // Role hierarchy level
    roleLevel,
  };
};
