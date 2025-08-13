// frontend/src/pages/auth/ResetPasswordPage.tsx
import { GuestOnlyRoute, ResetPasswordForm } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import './ResetPasswordPage.css';

export const ResetPasswordPage = () => {
  return (
    <GuestOnlyRoute>
      <MainLayout hideSidebar>
        <div className="auth-page" data-testid="auth-page">
          <div className="auth-container" data-testid="auth-container">
            <div className="auth-header">
              <div className="key-icon" data-testid="key-icon">
                🔑
              </div>
              <h1>Create New Password</h1>
              <p>Choose a strong password to secure your account</p>
            </div>
            <div className="form-wrapper" data-testid="form-wrapper">
              <ResetPasswordForm />
            </div>
          </div>
        </div>
      </MainLayout>
    </GuestOnlyRoute>
  );
};
