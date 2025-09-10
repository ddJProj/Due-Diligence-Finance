// frontend/src/pages/public/ContactPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import './ContactPage.css';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  subject: string;
  message: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

interface Office {
  name: string;
  address: string[];
  phone: string;
  email: string;
}

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'general',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Pre-fill form for authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user]);

  const offices: Office[] = [
    {
      name: 'New York Headquarters',
      address: ['123 Financial District', 'New York, NY 10004', 'United States'],
      phone: '+1 (212) 555-0100',
      email: 'ny@duediligencefinance.com'
    },
    {
      name: 'San Francisco Office',
      address: ['456 Market Street', 'San Francisco, CA 94105', 'United States'],
      phone: '+1 (415) 555-0200',
      email: 'sf@duediligencefinance.com'
    },
    {
      name: 'London Office',
      address: ['789 Canary Wharf', 'London E14 5AB', 'United Kingdom'],
      phone: '+44 20 7555 0300',
      email: 'london@duediligencefinance.com'
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        firstName: isAuthenticated && user?.firstName ? user.firstName : '',
        lastName: isAuthenticated && user?.lastName ? user.lastName : '',
        email: isAuthenticated && user?.email ? user.email : '',
        phone: isAuthenticated && user?.phone ? user.phone : '',
        department: 'general',
        subject: '',
        message: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <main className="contact-page" aria-label="contact page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <div className="container">
          <span onClick={() => navigate('/')} className="breadcrumb-link">
            Home
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Contact</span>
        </div>
      </div>

      {/* Page Header */}
      <section className="contact-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p className="lead">
            Get in touch with our team. We're here to help with any questions about our services.
          </p>
        </div>
      </section>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Form */}
            <section className="contact-form-section" data-testid="contact-form-section">
              <h2>Send us a Message</h2>
              {submitSuccess && (
                <div className="success-message">
                  Thank you for contacting us! We'll get back to you within 24 hours.
                </div>
              )}
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-text">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="sales">Sales</option>
                      <option value="support">Support</option>
                      <option value="advisory">Advisory Services</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    className={errors.message ? 'error' : ''}
                  />
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </section>

            {/* Contact Information */}
            <aside className="contact-info-section" data-testid="contact-info-section">
              <h2>Office Locations</h2>
              <div className="offices">
                {offices.map((office, index) => (
                  <div key={index} className="office-card">
                    <h3>{office.name}</h3>
                    <div className="office-details">
                      <div className="address">
                        {office.address.map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                      <p>
                        <strong>Phone:</strong>{' '}
                        <a href={`tel:${office.phone.replace(/\s/g, '')}`}>{office.phone}</a>
                      </p>
                      <p>
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${office.email}`}>{office.email}</a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="support-section" data-testid="support-section">
                <h3>Support Hours</h3>
                <div className="support-info">
                  <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM EST</p>
                  <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM EST</p>
                  <p><strong>Sunday:</strong> Closed</p>
                  <p className="emergency">24/7 Emergency Support for Premium Clients</p>
                </div>

                <h3>Support Contact</h3>
                <div className="support-contact">
                  <p>
                    <strong>Email Support:</strong>{' '}
                    <a href="mailto:support@duediligencefinance.com">
                      support@duediligencefinance.com
                    </a>
                  </p>
                  <p>
                    <strong>Phone Support:</strong>{' '}
                    <a href="tel:1-800-FINANCE">1-800-FINANCE</a>
                  </p>
                </div>
              </div>

              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <p>Find answers to common questions about our services.</p>
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/faq')}
                >
                  View FAQ
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <section className="map-section">
        <div className="container">
          <h2>Our Global Presence</h2>
          <div className="office-map" data-testid="office-map">
            <div className="map-placeholder">
              <p>Interactive map showing our office locations</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;
