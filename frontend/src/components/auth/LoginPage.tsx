// frontend/src/pages/auth/LoginPage.tsx
import { GuestOnlyRoute, LoginForm } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import './LoginPage.css';

export const LoginPage = () => {
  return (
    <GuestOnlyRoute>
      <MainLayout hideSidebar>
        <div className="auth-page" data-testid="auth-page">
          <div className="auth-container" data-testid="auth-container">
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your Due Diligence Finance account</p>
            </div>
            <div className="form-wrapper" data-testid="form-wrapper">
              <LoginForm />
            </div>
          </div>
        </div>
      </MainLayout>
    </GuestOnlyRoute>
  );
};
