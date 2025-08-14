// frontend/src/routes/AppRoutes.tsx

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import GuestOnlyRoute from '../components/auth/GuestOnlyRoute';
import MainLayout from '../components/layout/MainLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Role } from '../types';
import './AppRoutes.css';

// Lazy load pages for better performance
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage'));

// Lazy load dashboards
const ClientDashboard = lazy(() => import('../pages/dashboards/ClientDashboard').then(module => ({ default: module.ClientDashboard })));
const EmployeeDashboard = lazy(() => import('../pages/dashboards/EmployeeDashboard').then(module => ({ default: module.EmployeeDashboard })));
const AdminDashboard = lazy(() => import('../pages/dashboards/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const GuestDashboard = lazy(() => import('../pages/dashboards/GuestDashboard').then(module => ({ default: module.GuestDashboard })));

// Lazy load error pages (to be implemented)
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage').catch(() => ({
  default: () => <div className="error-page"><h1>404 - Page Not Found</h1></div>
})));

const ForbiddenPage = lazy(() => import('../pages/errors/ForbiddenPage').catch(() => ({
  default: () => <div className="error-page"><h1>403 - Forbidden</h1></div>
})));

// Loading component for lazy loading
const PageLoader = () => (
  <div className="page-loader">
    <LoadingSpinner message="Loading page..." />
  </div>
);

// Dashboard router component to render correct dashboard based on role
const DashboardRouter: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case Role.GUEST:
      return <GuestDashboard />;
    case Role.CLIENT:
      return <ClientDashboard />;
    case Role.EMPLOYEE:
      return <EmployeeDashboard />;
    case Role.ADMIN:
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <GuestOnlyRoute>
              <LoginPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestOnlyRoute>
              <RegisterPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <GuestOnlyRoute>
              <ForgotPasswordPage />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <GuestOnlyRoute>
              <ResetPasswordPage />
            </GuestOnlyRoute>
          }
        />

        {/* Protected Routes with Layout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard - Role-based */}
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* Client Routes */}
          <Route
            path="/portfolio"
            element={
              <RoleGuard allowedRoles={[Role.CLIENT]}>
                <div>Portfolio Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/investments"
            element={
              <RoleGuard allowedRoles={[Role.CLIENT]}>
                <div>Investments Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/investments/:id"
            element={
              <RoleGuard allowedRoles={[Role.CLIENT]}>
                <div>Investment Details Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/transactions"
            element={
              <RoleGuard allowedRoles={[Role.CLIENT]}>
                <div>Transactions Page (To be implemented)</div>
              </RoleGuard>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/clients"
            element={
              <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
                <div>Clients Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
                <div>Client Details Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/approvals"
            element={
              <RoleGuard allowedRoles={[Role.EMPLOYEE]}>
                <div>Approvals Page (To be implemented)</div>
              </RoleGuard>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN]}>
                <div>User Management Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN]}>
                <div>User Details Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/config"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN]}>
                <div>System Configuration Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/logs"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN]}>
                <div>Activity Logs Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN]}>
                <div>Admin Reports Page (To be implemented)</div>
              </RoleGuard>
            }
          />

          {/* Shared Routes */}
          <Route
            path="/messages"
            element={
              <RoleGuard allowedRoles={[Role.CLIENT, Role.EMPLOYEE]}>
                <div>Messages Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleGuard allowedRoles={[Role.EMPLOYEE, Role.ADMIN]}>
                <div>Reports Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <RoleGuard allowedRoles={[Role.CLIENT, Role.EMPLOYEE, Role.ADMIN]}>
                <div>Profile Page (To be implemented)</div>
              </RoleGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <RoleGuard allowedRoles={[Role.CLIENT, Role.EMPLOYEE, Role.ADMIN]}>
                <div>Settings Page (To be implemented)</div>
              </RoleGuard>
            }
          />

          {/* Error Routes */}
          <Route path="/403" element={<ForbiddenPage />} />
        </Route>

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 - Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
