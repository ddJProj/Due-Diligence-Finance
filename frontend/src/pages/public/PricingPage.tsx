// frontend/src/pages/public/PricingPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import './PricingPage.css';

interface PricingTier {
  name: string;
  monthlyPrice: number | 'custom';
  annualPrice: number | 'custom';
  description: string;
  features: string[];
  ctaText: string;
  ctaAction: () => void;
  recommended?: boolean;
}

interface FAQ {
  question: string;
  answer: string;
}

interface ComparisonCategory {
  name: string;
  features: {
    name: string;
    basic: boolean | string;
    professional: boolean | string;
    enterprise: boolean | string;
  }[];
}

const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const pricingTiers: PricingTier[] = [
    {
      name: 'Basic',
      monthlyPrice: 29,
      annualPrice: 279,
      description: 'Perfect for individuals getting started with investing',
      features: [
        'Portfolio tracking',
        'Basic analytics',
        'Mobile app access',
        'Email support',
        'Up to 5 portfolios',
      ],
      ctaText: isAuthenticated ? 'Upgrade Plan' : 'Get Started',
      ctaAction: () => {
        if (isAuthenticated) {
          navigate('/settings/billing');
        } else {
          navigate('/register?plan=basic');
        }
      }
    },
    {
      name: 'Professional',
      monthlyPrice: 99,
      annualPrice: 949,
      description: 'Ideal for serious investors and financial advisors',
      features: [
        'Everything in Basic',
        'Advanced analytics',
        'Tax optimization',
        'Priority support',
        'Unlimited portfolios',
        'API access',
        'Custom alerts',
      ],
      recommended: true,
      ctaText: isAuthenticated ? 'Upgrade Plan' : 'Start Free Trial',
      ctaAction: () => {
        if (isAuthenticated) {
          navigate('/settings/billing');
        } else {
          navigate('/register?plan=professional');
        }
      }
    },
    {
      name: 'Enterprise',
      monthlyPrice: 'custom',
      annualPrice: 'custom',
      description: 'Tailored solutions for organizations and institutions',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced security features',
        'SLA guarantee',
        'On-premise deployment',
        'Training & onboarding',
      ],
      ctaText: 'Contact Sales',
      ctaAction: () => navigate('/contact?plan=enterprise')
    }
  ];

  const comparisonCategories: ComparisonCategory[] = [
    {
      name: 'Core Features',
      features: [
        { name: 'Portfolio Management', basic: true, professional: true, enterprise: true },
        { name: 'Real-time Data', basic: '15-min delay', professional: true, enterprise: true },
        { name: 'Mobile Apps', basic: true, professional: true, enterprise: true },
        { name: 'Number of Portfolios', basic: '5', professional: 'Unlimited', enterprise: 'Unlimited' },
      ]
    },
    {
      name: 'Analytics & Reporting',
      features: [
        { name: 'Basic Analytics', basic: true, professional: true, enterprise: true },
        { name: 'Advanced Analytics', basic: false, professional: true, enterprise: true },
        { name: 'Custom Reports', basic: false, professional: true, enterprise: true },
        { name: 'Tax Optimization', basic: false, professional: true, enterprise: true },
      ]
    },
    {
      name: 'Support & Services',
      features: [
        { name: 'Email Support', basic: true, professional: true, enterprise: true },
        { name: 'Priority Support', basic: false, professional: true, enterprise: true },
        { name: '24/7 Phone Support', basic: false, professional: false, enterprise: true },
        { name: 'Dedicated Account Manager', basic: false, professional: false, enterprise: true },
      ]
    },
    {
      name: 'Security & Compliance',
      features: [
        { name: 'Two-Factor Authentication', basic: true, professional: true, enterprise: true },
        { name: 'SSO Integration', basic: false, professional: false, enterprise: true },
        { name: 'Audit Logs', basic: false, professional: true, enterprise: true },
        { name: 'Custom Security Policies', basic: false, professional: false, enterprise: true },
      ]
    }
  ];

  const faqs: FAQ[] = [
    {
      question: 'Can I change plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes, we offer a 14-day free trial for our Professional plan. No credit card required.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, ACH transfers, and wire transfers for Enterprise customers.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment in full.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No, there are no setup fees for any of our plans. Enterprise customers may incur fees for custom integrations.'
    }
  ];

  const formatPrice = (price: number | 'custom') => {
    if (price === 'custom') return 'Custom';
    return `$${price}`;
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <main className="pricing-page" aria-label="pricing page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <span onClick={() => navigate('/')} className="breadcrumb-link">
            Home
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Pricing</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="pricing-header">
        <div className="container">
          <h1>Pricing Plans</h1>
          <p className="lead">
            Choose the perfect plan for your financial journey
          </p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle" role="group" aria-label="Billing period">
            <button
              className={`toggle-option ${billingPeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={`toggle-option ${billingPeriod === 'annual' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('annual')}
            >
              Annual
              <span className="save-badge">Save 20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="pricing-tiers" data-testid="pricing-tiers">
        <div className="container">
          <div className="pricing-grid">
            {pricingTiers.map((tier, index) => (
              <article
                key={index}
                className={`pricing-card ${tier.recommended ? 'recommended' : ''}`}
                data-testid={`pricing-card-${tier.name.toLowerCase()}`}
                aria-label={`${tier.name} plan`}
              >
                {tier.recommended && (
                  <div className="recommended-badge">Most Popular</div>
                )}
                
                <div className="pricing-header">
                  <h3>{tier.name}</h3>
                  <p className="tier-description">{tier.description}</p>
                </div>
                
                <div className="pricing-amount">
                  <span className="price">
                    {formatPrice(billingPeriod === 'monthly' ? tier.monthlyPrice : tier.annualPrice)}
                  </span>
                  {tier.monthlyPrice !== 'custom' && (
                    <span className="period">/{billingPeriod === 'monthly' ? 'month' : 'year'}</span>
                  )}
                </div>
                
                <ul className="features-list">
                  {tier.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  className={`btn ${tier.recommended ? 'btn-primary' : 'btn-secondary'} btn-block`}
                  onClick={tier.ctaAction}
                >
                  {tier.ctaText}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Money Back Guarantee */}
      <section className="guarantee-section">
        <div className="container">
          <div className="guarantee-content">
            <h2>30-Day Money Back Guarantee</h2>
            <p>Try our platform risk-free. If you're not completely satisfied, we'll refund your payment.</p>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="comparison-section" data-testid="comparison-section">
        <div className="container">
          <h2>Detailed Feature Comparison</h2>
          <div className="comparison-wrapper">
            <table className="comparison-table" data-testid="comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Basic</th>
                  <th>Professional</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonCategories.map((category, catIdx) => (
                  <React.Fragment key={catIdx}>
                    <tr className="category-row">
                      <td colSpan={4}>{category.name}</td>
                    </tr>
                    {category.features.map((feature, featIdx) => (
                      <tr key={featIdx}>
                        <td className="feature-name">{feature.name}</td>
                        <td className="plan-value">
                          {typeof feature.basic === 'boolean' ? (
                            <span className={feature.basic ? 'check' : 'cross'}>
                              {feature.basic ? '✓' : '✗'}
                            </span>
                          ) : (
                            <span className="text-value">{feature.basic}</span>
                          )}
                        </td>
                        <td className="plan-value">
                          {typeof feature.professional === 'boolean' ? (
                            <span className={feature.professional ? 'check' : 'cross'}>
                              {feature.professional ? '✓' : '✗'}
                            </span>
                          ) : (
                            <span className="text-value">{feature.professional}</span>
                          )}
                        </td>
                        <td className="plan-value">
                          {typeof feature.enterprise === 'boolean' ? (
                            <span className={feature.enterprise ? 'check' : 'cross'}>
                              {feature.enterprise ? '✓' : '✗'}
                            </span>
                          ) : (
                            <span className="text-value">{feature.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" data-testid="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openFAQ === index}
                >
                  <span>{faq.question}</span>
                  <span className="faq-icon">{openFAQ === index ? '−' : '+'}</span>
                </button>
                <div 
                  className={`faq-answer ${openFAQ === index ? 'open' : ''}`}
                  style={{ display: openFAQ === index ? 'block' : 'none' }}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="enterprise-cta" data-testid="enterprise-cta">
        <div className="container">
          <h2>Need a Custom Solution?</h2>
          <p>Let's discuss how we can tailor our platform to meet your organization's unique needs.</p>
          <button 
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/contact?plan=enterprise')}
          >
            Contact Our Team
          </button>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
