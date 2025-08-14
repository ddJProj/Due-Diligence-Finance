// frontend/src/routes/routeConfig.ts

import { Role } from '../types';

export interface RouteConfig {
  path: string;
  name: string;
  requiredRoles?: Role[];
  isPublic?: boolean;
  redirectTo?: string;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    name: 'Login',
    isPublic: true,
  },
  {
    path: '/register',
    name: 'Register',
    isPublic: true,
  },
  {
    path: '/forgot-password',
    name: 'Forgot Password',
    isPublic: true,
  },
  {
    path: '/reset-password/:token',
    name: 'Reset Password',
    isPublic: true,
  },
];

export const protectedRoutes: RouteConfig[] = [
  // Dashboard - accessible by all authenticated users including guests
  {
    path: '/dashboard',
    name: 'Dashboard',
    requiredRoles: [Role.GUEST, Role.CLIENT, Role.EMPLOYEE, Role.ADMIN],
  },
  
  // Client Routes
  {
    path: '/portfolio',
    name: 'Portfolio',
    requiredRoles: [Role.CLIENT],
  },
  {
    path: '/investments',
    name: 'Investments',
    requiredRoles: [Role.CLIENT],
  },
  {
    path: '/investments/:id',
    name: 'Investment Details',
    requiredRoles: [Role.CLIENT],
  },
  {
    path: '/investments/new',
    name: 'New Investment',
    requiredRoles: [Role.CLIENT],
  },
  {
    path: '/transactions',
    name: 'Transactions',
    requiredRoles: [Role.CLIENT],
  },
  {
    path: '/messages',
    name: 'Messages',
    requiredRoles: [Role.CLIENT, Role.EMPLOYEE],
  },
  
  // Employee Routes
  {
    path: '/clients',
    name: 'Clients',
    requiredRoles: [Role.EMPLOYEE],
  },
  {
    path: '/clients/:id',
    name: 'Client Details',
    requiredRoles: [Role.EMPLOYEE],
  },
  {
    path: '/approvals',
    name: 'Approvals',
    requiredRoles: [Role.EMPLOYEE],
  },
  {
    path: '/reports',
    name: 'Reports',
    requiredRoles: [Role.EMPLOYEE, Role.ADMIN],
  },
  
  // Admin Routes
  {
    path: '/admin/users',
    name: 'User Management',
    requiredRoles: [Role.ADMIN],
  },
  {
    path: '/admin/users/:id',
    name: 'User Details',
    requiredRoles: [Role.ADMIN],
  },
  {
    path: '/admin/config',
    name: 'System Configuration',
    requiredRoles: [Role.ADMIN],
  },
  {
    path: '/admin/logs',
    name: 'Activity Logs',
    requiredRoles: [Role.ADMIN],
  },
  {
    path: '/admin/reports',
    name: 'Admin Reports',
    requiredRoles: [Role.ADMIN],
  },
  {
    path: '/admin/backup',
    name: 'Backup & Restore',
    requiredRoles: [Role.ADMIN],
  },
  
  // Profile Routes - accessible by all authenticated users
  {
    path: '/profile',
    name: 'Profile',
    requiredRoles: [Role.CLIENT, Role.EMPLOYEE, Role.ADMIN],
  },
  {
    path: '/settings',
    name: 'Settings',
    requiredRoles: [Role.CLIENT, Role.EMPLOYEE, Role.ADMIN],
  },
];

// Helper functions
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return [...publicRoutes, ...protectedRoutes].find(route => route.path === path);
};

export const getRoutesForRole = (role: Role): RouteConfig[] => {
  return protectedRoutes.filter(route => 
    route.requiredRoles?.includes(role)
  );
};

export const isRouteAccessible = (path: string, userRole: Role | null): boolean => {
  const route = getRouteByPath(path);
  
  if (!route) return false;
  if (route.isPublic) return true;
  if (!userRole) return false;
  
  return route.requiredRoles?.includes(userRole) || false;
};

export const getDefaultRouteForRole = (role: Role): string => {
  switch (role) {
    case Role.GUEST:
      return '/dashboard';
    case Role.CLIENT:
      return '/dashboard';
    case Role.EMPLOYEE:
      return '/dashboard';
    case Role.ADMIN:
      return '/dashboard';
    default:
      return '/login';
  }
};

export const getDashboardRouteForRole = (role: Role): string => {
  switch (role) {
    case Role.GUEST:
      return '/dashboard';
    case Role.CLIENT:
      return '/dashboard';
    case Role.EMPLOYEE:
      return '/dashboard';
    case Role.ADMIN:
      return '/dashboard';
    default:
      return '/login';
  }
};
