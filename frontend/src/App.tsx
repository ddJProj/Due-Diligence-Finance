// frontend/src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import Toast from './components/common/Toast';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { UserRole } from './types/auth.types';

// Lazy load all pages for better performance
// Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Dashboard Pages
const ClientDashboard = lazy(() => import('./pages/dashboards/ClientDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/dashboards/EmployeeDashboard'));
const AdminDashboard = lazy(() => import('./pages/dashboards/AdminDashboard'));
const GuestDashboard = lazy(() => import('./pages/dashboards/GuestDashboard'));

// Client Pages
const PortfolioOverviewPage = lazy(() => import('./pages/client/PortfolioOverviewPage'));
const InvestmentListPage = lazy(() => import('./pages/client/InvestmentListPage'));
const InvestmentDetailsPage = lazy(() => import('./pages/client/InvestmentDetailsPage'));
const CreateInvestmentPage = lazy(() => import('./pages/client/CreateInvestmentPage'));
const EditInvestmentPage = lazy(() => import('./pages/client/EditInvestmentPage'));
const TransactionHistoryPage = lazy(() => import('./pages/client/TransactionHistoryPage'));
const TransactionDetailsPage = lazy(() => import('./pages/client/TransactionDetailsPage'));

// Employee Pages
const ClientListPage = lazy(() => import('./pages/employee/ClientListPage'));
const ClientDetailsPage = lazy(() => import('./pages/employee/ClientDetailsPage'));
const PendingApprovalsPage = lazy(() => import('./pages/employee/PendingApprovalsPage'));
const EmployeeReportsPage = lazy(() => import('./pages/employee/EmployeeReportsPage'));

// Admin Pages
const UserListPage = lazy(() => import('./pages/admin/UserListPage'));
const CreateUserPage = lazy(() => import('./pages/admin/CreateUserPage'));
const EditUserPage = lazy(() => import('./pages/admin/EditUserPage'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage'));
const ConfigurationPage = lazy(() => import('./pages/admin/ConfigurationPage'));
const FeatureTogglePage = lazy(() => import('./pages/admin/FeatureTogglePage'));
const ActivityLogsPage = lazy(() => import('./pages/admin/ActivityLogsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const BackupRestorePage = lazy(() => import('./pages/admin/BackupRestorePage'));

// Shared Pages
const ProfilePage = lazy(() => import('./pages/shared/ProfilePage'));
const EditProfilePage = lazy(() => import('./pages/shared/EditProfilePage'));
const SettingsPage = lazy(() => import('./pages/shared/SettingsPage'));
const NotificationSettingsPage = lazy(() => import('./pages/shared/NotificationSettingsPage'));
const MessagesPage = lazy(() => import('./pages/shared/MessagesPage'));
const MessageThreadPage = lazy(() => import('./pages/shared/MessageThreadPage'));
const ComposeMessagePage = lazy(() => import('./pages/shared/ComposeMessagePage'));

// Error Pages
const NotFoundPage = lazy(() => import('./pages/errors/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('./pages/auth/UnauthorizedPage'));
const ForbiddenPage = lazy(() => import('./pages/errors/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('./pages/errors/ServerErrorPage'));

// Loading component for Suspense
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <LoadingSpinner size="large" />
  </div>
);

// Role-based dashboard component
const Dashboard = () => {
  const user = store.getState().auth.user;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case UserRole.ADMIN:
      return <AdminDashboard />;
    case UserRole.EMPLOYEE:
      return <EmployeeDashboard />;
    case UserRole.CLIENT:
      return <ClientDashboard />;
    default:
      return <GuestDashboard />;
  }
};

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter>
          <Toast />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Auth Routes with AuthLayout */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
              </Route>

              {/* Protected Routes with MainLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Dashboard */}
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Client Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.CLIENT, UserRole.ADMIN]} />}>
                    <Route path="/portfolio" element={<PortfolioOverviewPage />} />
                    <Route path="/investments" element={<InvestmentListPage />} />
                    <Route path="/investments/new" element={<CreateInvestmentPage />} />
                    <Route path="/investments/:id" element={<InvestmentDetailsPage />} />
                    <Route path="/investments/:id/edit" element={<EditInvestmentPage />} />
                    <Route path="/transactions" element={<TransactionHistoryPage />} />
                    <Route path="/transactions/:id" element={<TransactionDetailsPage />} />
                  </Route>

                  {/* Employee Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.EMPLOYEE, UserRole.ADMIN]} />}>
                    <Route path="/clients" element={<ClientListPage />} />
                    <Route path="/clients/:id" element={<ClientDetailsPage />} />
                    <Route path="/approvals" element={<PendingApprovalsPage />} />
                    <Route path="/reports/employee" element={<EmployeeReportsPage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]} />}>
                    <Route path="/users" element={<UserListPage />} />
                    <Route path="/users/new" element={<CreateUserPage />} />
                    <Route path="/users/:id/edit" element={<EditUserPage />} />
                    <Route path="/system-settings" element={<SystemSettingsPage />} />
                    <Route path="/configuration" element={<ConfigurationPage />} />
                    <Route path="/feature-toggles" element={<FeatureTogglePage />} />
                    <Route path="/activity-logs" element={<ActivityLogsPage />} />
                    <Route path="/reports/admin" element={<AdminReportsPage />} />
                    <Route path="/backup-restore" element={<BackupRestorePage />} />
                  </Route>

                  {/* Shared Routes - All authenticated users */}
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/edit" element={<EditProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/messages/new" element={<ComposeMessagePage />} />
                  <Route path="/messages/:id" element={<MessageThreadPage />} />
                </Route>
              </Route>

              {/* Error Routes - No Layout */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="/forbidden" element={<ForbiddenPage />} />
              <Route path="/error" element={<ServerErrorPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
