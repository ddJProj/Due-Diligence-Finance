// frontend/src/pages/public/AboutPage.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import './AboutPage.css';

interface TeamMember {
  name: string;
  position: string;
  bio: string;
  image: string;
}

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
}

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  const teamMembers: TeamMember[] = [
    {
      name: 'John Smith',
      position: 'Chief Executive Officer',
      bio: 'With over 25 years of experience in financial services, John leads our mission to democratize wealth management.',
      image: '/images/team/ceo.jpg'
    },
    {
      name: 'Sarah Johnson',
      position: 'Chief Technology Officer',
      bio: 'Sarah brings 20 years of fintech innovation, driving our digital transformation and platform development.',
      image: '/images/team/cto.jpg'
    },
    {
      name: 'Michael Chen',
      position: 'Chief Financial Officer',
      bio: 'Michael oversees our financial operations with 18 years of expertise in investment banking and corporate finance.',
      image: '/images/team/cfo.jpg'
    },
    {
      name: 'Emily Rodriguez',
      position: 'Head of Advisory Services',
      bio: 'Emily leads our advisory team, ensuring clients receive personalized, expert financial guidance.',
      image: '/images/team/head-advisory.jpg'
    }
  ];

  const timelineEvents: TimelineEvent[] = [
    {
      year: '2009',
      title: 'Company Founded',
      description: 'Due Diligence Finance established with a vision to transform wealth management'
    },
    {
      year: '2012',
      title: '$100M AUM',
      description: 'Reached first major milestone in assets under management'
    },
    {
      year: '2015',
      title: 'Digital Platform Launch',
      description: 'Introduced our revolutionary digital wealth management platform'
    },
    {
      year: '2018',
      title: '$1B AUM Milestone',
      description: 'Exceeded $1 billion in assets under management'
    },
    {
      year: '2021',
      title: 'AI-Powered Analytics',
      description: 'Launched advanced AI-driven portfolio analytics and recommendations'
    },
    {
      year: '2024',
      title: '$5B AUM',
      description: 'Managing over $5 billion in client assets with 10,000+ satisfied clients'
    }
  ];

  const awards = [
    'Best Digital Wealth Platform 2023',
    'Top Financial Advisory Firm',
    'Excellence in Client Service',
    'Innovation in FinTech Award'
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <main className="about-page" aria-label="about page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate('/')} className="breadcrumb-link">
          Home
        </span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">About</span>
      </div>

      {/* Company Overview */}
      <section className="overview-section" data-testid="overview-section">
        <div className="container">
          <h1>About Due Diligence Finance</h1>
          <p className="lead">
            Founded in 2009, Due Diligence Finance has been a trusted partner in wealth management 
            for over 15 years. We combine cutting-edge technology with personalized financial advice 
            to help our clients achieve their financial goals.
          </p>
          
          <div className="company-stats" data-testid="company-stats">
            <div className="stat">
              <div className="stat-value">15+ Years</div>
              <div className="stat-label">Of Excellence</div>
            </div>
            <div className="stat">
              <div className="stat-value">50+ Advisors</div>
              <div className="stat-label">Expert Team</div>
            </div>
            <div className="stat">
              <div className="stat-value">10K+ Clients</div>
              <div className="stat-label">Trust Us</div>
            </div>
            <div className="stat">
              <div className="stat-value">$5B+ AUM</div>
              <div className="stat-label">Assets Managed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section" data-testid="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-card">
              <h2>Our Mission</h2>
              <p>
                To democratize access to professional wealth management by combining 
                innovative technology with personalized financial expertise, empowering 
                individuals and families to achieve their financial dreams.
              </p>
            </div>
            <div className="mission-card">
              <h2>Our Vision</h2>
              <p>
                To be the leading digital wealth management platform that transforms 
                how people invest, grow, and protect their wealth for generations to come.
              </p>
            </div>
          </div>
          
          <div className="values-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🎯</div>
                <h3>Integrity</h3>
                <p>We act with honesty and transparency in all our dealings</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💡</div>
                <h3>Innovation</h3>
                <p>We embrace technology to deliver better financial outcomes</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⭐</div>
                <h3>Excellence</h3>
                <p>We strive for the highest standards in everything we do</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Client-First</h3>
                <p>Your success is our primary measure of achievement</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section" data-testid="team-section">
        <div className="container">
          <h2>Our Leadership Team</h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member-card" data-testid="team-member-card">
                <img 
                  src={member.image} 
                  alt={`${member.name} - ${member.position}`}
                  className="member-photo"
                />
                <h3>{member.name}</h3>
                <p className="member-position">{member.position}</p>
                <p className="member-bio">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section" data-testid="timeline-section">
        <div className="container">
          <h2>Our Journey</h2>
          <div className="timeline">
            {timelineEvents.map((event, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h3>{event.year}</h3>
                  <h4>{event.title}</h4>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="awards-section" data-testid="awards-section">
        <div className="container">
          <h2>Awards & Recognition</h2>
          <div className="awards-grid">
            {awards.map((award, index) => (
              <div key={index} className="award-card">
                <div className="award-icon">🏆</div>
                <p>{award}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of clients who trust us with their financial future</p>
          <div className="cta-buttons">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleGetStarted}
            >
              {isAuthenticated ? 'View Dashboard' : 'Get Started'}
            </button>
            <button 
              className="btn btn-secondary btn-lg" 
              onClick={() => navigate('/contact')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
