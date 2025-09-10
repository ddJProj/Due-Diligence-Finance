// frontend/src/pages/auth/ForgotPasswordPage.tsx
import { GuestOnlyRoute, ForgotPasswordForm } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import './ForgotPasswordPage.css';

export const ForgotPasswordPage = () => {
  return (
    <GuestOnlyRoute>
      <MainLayout hideSidebar>
        <div className="auth-page" data-testid="auth-page">
          <div className="auth-container" data-testid="auth-container">
            <div className="auth-header">
              <div className="security-icon" data-testid="security-icon">
                🔐
              </div>
              <h1>Reset Your Password</h1>
              <p>We'll help you get back into your account</p>
            </div>
            <div className="form-wrapper" data-testid="form-wrapper">
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </MainLayout>
    </GuestOnlyRoute>
  );
};
