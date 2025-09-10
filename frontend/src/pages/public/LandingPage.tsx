// frontend/src/pages/public/LandingPage.tsx

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const featuresRef = useRef<HTMLElement>(null);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLearnMore = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setSubscribeSuccess(false);

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Simulate subscription
    setTimeout(() => {
      setSubscribeSuccess(true);
      setEmail('');
      setTimeout(() => setSubscribeSuccess(false), 5000);
    }, 500);
  };

  return (
    <main className="landing-page" aria-label="landing page">
      {/* Hero Section */}
      <section className="hero" data-testid="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Due Diligence Finance</h1>
          <p className="hero-subtitle">Your trusted partner in wealth management</p>
          <div className="hero-buttons">
            <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started'}
            </button>
            <button className="btn btn-secondary btn-lg" onClick={handleLearnMore}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" data-testid="features-section" ref={featuresRef}>
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Portfolio Management</h3>
              <p>Track and manage your investments in one secure platform</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Expert Advisors</h3>
              <p>Access to certified financial advisors for personalized guidance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Platform</h3>
              <p>Bank-level security to protect your financial data</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Real-time Analytics</h3>
              <p>Monitor your portfolio performance with advanced analytics</p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="statistics" data-testid="statistics-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Active Clients</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">$5B+</div>
              <div className="stat-label">Assets Managed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">15+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Client Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials" data-testid="testimonials-section">
        <div className="container">
          <h2 className="section-title">What Our Clients Say</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card" data-testid="testimonial-card">
              <div className="star-rating" data-testid="star-rating">
                {'⭐'.repeat(5)}
              </div>
              <p className="testimonial-text">
                "Due Diligence Finance transformed how I manage my investments. 
                The platform is intuitive and my advisor is always available."
              </p>
              <div className="testimonial-author">
                <strong>Sarah Johnson</strong>
                <span>CEO, Tech Startup</span>
              </div>
            </div>
            <div className="testimonial-card" data-testid="testimonial-card">
              <div className="star-rating" data-testid="star-rating">
                {'⭐'.repeat(5)}
              </div>
              <p className="testimonial-text">
                "The level of transparency and control over my portfolio is exceptional. 
                I've seen consistent growth since switching to DDF."
              </p>
              <div className="testimonial-author">
                <strong>Michael Chen</strong>
                <span>Real Estate Developer</span>
              </div>
            </div>
            <div className="testimonial-card" data-testid="testimonial-card">
              <div className="star-rating" data-testid="star-rating">
                {'⭐'.repeat(5)}
              </div>
              <p className="testimonial-text">
                "Professional service, cutting-edge technology, and personalized attention. 
                Everything I need for my financial planning."
              </p>
              <div className="testimonial-author">
                <strong>Emily Rodriguez</strong>
                <span>Healthcare Professional</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter">
        <div className="container">
          <h2>Stay Updated</h2>
          <p>Get the latest financial insights and market updates</p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`newsletter-input ${emailError ? 'error' : ''}`}
            />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
          {emailError && <p className="error-message">{emailError}</p>}
          {subscribeSuccess && (
            <p className="success-message">Thank you for subscribing!</p>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta" data-testid="cta-section">
        <div className="container">
          <h2>Ready to Get Started?</h2>
          <p>Join thousands of satisfied clients who trust us with their wealth</p>
          <div className="cta-buttons">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            >
              Start Now
            </button>
            <button 
              className="btn btn-secondary btn-lg" 
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-links">
            <Link to="/about">About</Link>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
