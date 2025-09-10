// frontend/src/pages/public/FeaturesPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import './FeaturesPage.css';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface Capability {
  icon: string;
  title: string;
  details: string;
}

interface ComparisonFeature {
  name: string;
  basic: boolean;
  professional: boolean;
  enterprise: boolean;
}

interface Integration {
  name: string;
  icon: string;
}

interface Screenshot {
  id: number;
  title: string;
  description: string;
  image: string;
}

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  const coreFeatures: Feature[] = [
    {
      icon: '📊',
      title: 'Portfolio Management',
      description: 'Comprehensive portfolio tracking and analysis with real-time updates'
    },
    {
      icon: '📈',
      title: 'Financial Planning',
      description: 'Personalized financial roadmaps tailored to your goals'
    },
    {
      icon: '🔍',
      title: 'Investment Analytics',
      description: 'Real-time market data and advanced analytics tools'
    },
    {
      icon: '⚖️',
      title: 'Risk Assessment',
      description: 'Sophisticated risk analysis and portfolio optimization'
    },
    {
      icon: '💰',
      title: 'Tax Optimization',
      description: 'Strategic tax planning to maximize your after-tax returns'
    },
    {
      icon: '🔄',
      title: 'Automated Rebalancing',
      description: 'Keep your portfolio aligned with your investment strategy'
    }
  ];

  const capabilities: Capability[] = [
    {
      icon: '🔒',
      title: 'Bank-Level Security',
      details: '256-bit encryption and multi-factor authentication'
    },
    {
      icon: '📱',
      title: 'Mobile Access',
      details: 'Manage your wealth on the go with our mobile apps'
    },
    {
      icon: '🔌',
      title: 'API Integration',
      details: 'Connect with your favorite tools and platforms'
    },
    {
      icon: '⚡',
      title: 'Real-Time Sync',
      details: 'Instant updates across all devices and platforms'
    }
  ];

  const comparisonFeatures: ComparisonFeature[] = [
    { name: 'Portfolio Tracking', basic: true, professional: true, enterprise: true },
    { name: 'Financial Planning', basic: true, professional: true, enterprise: true },
    { name: 'Investment Analytics', basic: false, professional: true, enterprise: true },
    { name: 'Risk Assessment', basic: false, professional: true, enterprise: true },
    { name: 'Tax Optimization', basic: false, professional: true, enterprise: true },
    { name: 'API Access', basic: false, professional: false, enterprise: true },
    { name: 'Priority Support', basic: false, professional: true, enterprise: true },
    { name: 'Custom Reports', basic: false, professional: false, enterprise: true }
  ];

  const integrations: Integration[] = [
    { name: 'Major Banks', icon: '🏦' },
    { name: 'Accounting Software', icon: '📑' },
    { name: 'Tax Platforms', icon: '📋' },
    { name: 'Trading Platforms', icon: '💹' },
    { name: 'CRM Systems', icon: '👥' },
    { name: 'Analytics Tools', icon: '📊' }
  ];

  const screenshots: Screenshot[] = [
    {
      id: 0,
      title: 'Dashboard Overview',
      description: 'Get a complete view of your portfolio at a glance',
      image: '/images/screenshots/dashboard.jpg'
    },
    {
      id: 1,
      title: 'Portfolio Analytics',
      description: 'Deep dive into your investment performance',
      image: '/images/screenshots/analytics.jpg'
    },
    {
      id: 2,
      title: 'Financial Planning',
      description: 'Plan your financial future with confidence',
      image: '/images/screenshots/planning.jpg'
    }
  ];

  const handlePreviousScreenshot = () => {
    setActiveScreenshot(prev => 
      prev === 0 ? screenshots.length - 1 : prev - 1
    );
  };

  const handleNextScreenshot = () => {
    setActiveScreenshot(prev => 
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <main className="features-page" aria-label="features page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <span onClick={() => navigate('/')} className="breadcrumb-link">
            Home
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Features</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="features-header">
        <div className="container">
          <h1>Our Features</h1>
          <p className="lead">
            Discover what makes Due Diligence Finance the premier choice for wealth management
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="core-features-section" data-testid="core-features-section">
        <div className="container">
          <h2>Core Features</h2>
          <div className="features-grid">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="feature-card" data-testid="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="capabilities-section" data-testid="capabilities-section">
        <div className="container">
          <h2>Platform Capabilities</h2>
          <div className="capabilities-grid">
            {capabilities.map((capability, index) => (
              <div key={index} className="capability-card">
                <div className="capability-icon">{capability.icon}</div>
                <h3>{capability.title}</h3>
                <p>{capability.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="comparison-section" data-testid="comparison-section">
        <div className="container">
          <h2>Feature Comparison</h2>
          <div className="comparison-wrapper">
            <table 
              className="comparison-table" 
              data-testid="comparison-table"
              aria-label="Feature comparison table"
            >
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Basic</th>
                  <th>Professional</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((feature, index) => (
                  <tr key={index}>
                    <td className="feature-name">{feature.name}</td>
                    <td className="plan-cell">
                      <span className={feature.basic ? 'check' : 'cross'}>
                        {feature.basic ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="plan-cell">
                      <span className={feature.professional ? 'check' : 'cross'}>
                        {feature.professional ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="plan-cell">
                      <span className={feature.enterprise ? 'check' : 'cross'}>
                        {feature.enterprise ? '✓' : '✗'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="integrations-section" data-testid="integrations-section">
        <div className="container">
          <h2>Seamless Integrations</h2>
          <p className="section-description">
            Connect with the tools and platforms you already use
          </p>
          <div className="integrations-grid">
            {integrations.map((integration, index) => (
              <div key={index} className="integration-card" data-testid="integration-logo">
                <div className="integration-icon">{integration.icon}</div>
                <p>{integration.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots/Demo */}
      <section className="demo-section" data-testid="demo-section">
        <div className="container">
          <h2>See It In Action</h2>
          <div className="screenshot-carousel" data-testid="screenshot-carousel">
            <button 
              className="carousel-button prev"
              onClick={handlePreviousScreenshot}
              aria-label="Previous screenshot"
            >
              ←
            </button>
            <div className="screenshots-wrapper">
              {screenshots.map((screenshot, index) => (
                <div
                  key={screenshot.id}
                  className={`screenshot-item ${index === activeScreenshot ? 'active' : ''}`}
                  data-testid="screenshot-item"
                >
                  <div className="screenshot-image">
                    <img src={screenshot.image} alt={screenshot.title} />
                  </div>
                  <h3>{screenshot.title}</h3>
                  <p>{screenshot.description}</p>
                </div>
              ))}
            </div>
            <button 
              className="carousel-button next"
              onClick={handleNextScreenshot}
              aria-label="Next screenshot"
            >
              →
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="benefits-section">
        <div className="container">
          <h2>Why Choose Our Platform</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-stat">90%</div>
              <h3>Save Time</h3>
              <p>Reduce time spent on financial management</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-stat">99.9%</div>
              <h3>Reduce Errors</h3>
              <p>Accuracy in calculations and reporting</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-stat">25%</div>
              <h3>Increase Returns</h3>
              <p>Average portfolio performance improvement</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-stat">50%</div>
              <h3>Lower Fees</h3>
              <p>Compared to traditional advisors</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="features-cta">
        <div className="container">
          <h2>Ready to Experience These Features?</h2>
          <p>Join thousands of satisfied clients who trust us with their wealth</p>
          <div className="cta-buttons">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
            >
              {isAuthenticated ? 'Explore Dashboard' : 'Start Free Trial'}
            </button>
            <button 
              className="btn btn-secondary btn-lg" 
              onClick={() => navigate('/contact')}
            >
              Request Demo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FeaturesPage;
