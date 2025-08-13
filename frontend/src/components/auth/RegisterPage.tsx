// frontend/src/pages/auth/RegisterPage.tsx
import { GuestOnlyRoute, RegisterForm } from '@/components/auth';
import { MainLayout } from '@/components/layout';
import './RegisterPage.css';

export const RegisterPage = () => {
  return (
    <GuestOnlyRoute>
      <MainLayout hideSidebar>
        <div className="auth-page" data-testid="auth-page">
          <div className="auth-container auth-container--wide" data-testid="auth-container">
            <div className="register-content">
              <div className="register-main">
                <div className="auth-header">
                  <h1>Create Your Account</h1>
                  <p>Join Due Diligence Finance to start investing</p>
                </div>
                <div className="form-wrapper" data-testid="form-wrapper">
                  <RegisterForm />
                </div>
              </div>
              
              <div className="register-benefits">
                <h2>Why Choose Due Diligence Finance?</h2>
                <ul className="benefits-list">
                  <li>
                    <div className="benefit-icon">📊</div>
                    <div className="benefit-content">
                      <h3>Professional Portfolio Management</h3>
                      <p>Expert guidance to help you make informed investment decisions</p>
                    </div>
                  </li>
                  <li>
                    <div className="benefit-icon">📈</div>
                    <div className="benefit-content">
                      <h3>Real-time Market Data</h3>
                      <p>Stay updated with live stock prices and market trends</p>
                    </div>
                  </li>
                  <li>
                    <div className="benefit-icon">🔒</div>
                    <div className="benefit-content">
                      <h3>Secure & Compliant</h3>
                      <p>Bank-level security with full regulatory compliance</p>
                    </div>
                  </li>
                  <li>
                    <div className="benefit-icon">💬</div>
                    <div className="benefit-content">
                      <h3>Expert Support</h3>
                      <p>Dedicated advisors ready to assist you 24/7</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </GuestOnlyRoute>
  );
};
