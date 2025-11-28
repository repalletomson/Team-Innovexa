import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* Animated Background */}
      <div className="landing__bg">
        <div className="landing__bg-gradient"></div>
        <div className="landing__bg-grid"></div>
        <div className="landing__bg-glow landing__bg-glow--1"></div>
        <div className="landing__bg-glow landing__bg-glow--2"></div>
        <div className="landing__bg-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="landing__particle" style={{
              '--delay': `${Math.random() * 5}s`,
              '--duration': `${15 + Math.random() * 10}s`,
              '--x-start': `${Math.random() * 100}%`,
              '--x-end': `${Math.random() * 100}%`,
              '--size': `${2 + Math.random() * 4}px`
            }}></div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="hero__container">
          <div className="hero__content">
            {/* <div className="hero__badge animate-on-scroll"> */}
              {/* <span className="hero__badge-dot"></span> */}
              {/* <span>Trusted by 500+ Asset Managers</span> */}
            {/* </div> */}
            
            <h1 className="hero__title animate-on-scroll">
              Empowering <span className="hero__title-gradient">Data-Driven</span><br />
              Investment Decisions
            </h1>
            
            <p className="hero__subtitle animate-on-scroll">
              Real-time analytics, and performance dashboards 
              for risk measurement.
            </p>
            
            <div className="hero__cta animate-on-scroll">
              <Link to="/signup" className="hero__btn hero__btn--primary">
                <span>Sign Up</span>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link to="/login" className="hero__btn hero__btn--secondary">
                <span>Log In</span>
              </Link>
            </div>

            {/* <div className="hero__stats animate-on-scroll">
              <div className="hero__stat">
                <span className="hero__stat-value">$50B+</span>
                <span className="hero__stat-label">Assets Managed</span>
              </div>
              <div className="hero__stat-divider"></div>
              <div className="hero__stat">
                <span className="hero__stat-value">99.9%</span>
                <span className="hero__stat-label">Uptime</span>
              </div>
              <div className="hero__stat-divider"></div>
              <div className="hero__stat">
                <span className="hero__stat-value">150+</span>
                <span className="hero__stat-label">Countries</span>
              </div>
            </div> */}
          </div>

          <div className="hero__visual animate-on-scroll">
            <div className="hero__dashboard">
              <div className="hero__dashboard-header">
                <div className="hero__dashboard-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="hero__dashboard-title">Portfolio Analytics</span>
              </div>
              <div className="hero__dashboard-content">
                <div className="hero__chart">
                  <div className="hero__chart-header">
                    <span className="hero__chart-label">Performance</span>
                    <span className="hero__chart-value hero__chart-value--positive">+24.5%</span>
                  </div>
                  <div className="hero__chart-graph">
                    <svg viewBox="0 0 400 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path 
                        className="hero__chart-area"
                        d="M0,100 Q50,80 100,70 T200,50 T300,30 T400,20 V120 H0 Z" 
                        fill="url(#chartGradient)"
                      />
                      <path 
                        className="hero__chart-line"
                        d="M0,100 Q50,80 100,70 T200,50 T300,30 T400,20" 
                        fill="none" 
                        stroke="var(--color-primary)" 
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="hero__metrics">
                  <div className="hero__metric">
                    <div className="hero__metric-icon hero__metric-icon--1">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="hero__metric-info">
                      <span className="hero__metric-label">Total Assets</span>
                      <span className="hero__metric-value">$12.4M</span>
                    </div>
                  </div>
                  <div className="hero__metric">
                    <div className="hero__metric-icon hero__metric-icon--2">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="hero__metric-info">
                      <span className="hero__metric-label">Monthly Return</span>
                      <span className="hero__metric-value hero__metric-value--positive">+8.2%</span>
                    </div>
                  </div>
                  <div className="hero__metric">
                    <div className="hero__metric-icon hero__metric-icon--3">
                      <svg viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="hero__metric-info">
                      <span className="hero__metric-label">Active Positions</span>
                      <span className="hero__metric-value">247</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hero__floating hero__floating--1">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="hero__floating hero__floating--2">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20.24 12.24C21.3658 11.1142 21.9983 9.58722 21.9983 7.99504C21.9983 6.40285 21.3658 4.87588 20.24 3.75004C19.1142 2.62419 17.5872 1.9917 15.995 1.9917C14.4028 1.9917 12.8758 2.62419 11.75 3.75004L5 10.5V19H13.5L20.24 12.24Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 8L2 22M17.5 15H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="hero__floating hero__floating--3">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="solutions" ref={featuresRef}>
        <div className="features__container">
          <div className="features__header animate-on-scroll">
            <span className="features__label">Solutions</span>
            <h2 className="features__title">Comprehensive Investment Tools</h2>
            <p className="features__subtitle">
              Everything you need to make informed decisions and manage portfolios effectively.
            </p>
          </div>

          <div className="features__grid">
            <div className="feature-card animate-on-scroll">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Real-Time Analytics</h3>
              <p className="feature-card__desc">
                Live market data and portfolio performance metrics updated in milliseconds.
              </p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.998 12 21.998C12.3511 21.998 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3.27 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Portfolio Management</h3>
              <p className="feature-card__desc">
                Comprehensive tools to track, analyze, and optimize your investment portfolio.
              </p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Risk Assessment</h3>
              <p className="feature-card__desc">
                Advanced risk modeling and scenario analysis to protect your investments.
              </p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Custom Reports</h3>
              <p className="feature-card__desc">
                Generate detailed reports with customizable metrics and visualizations.
              </p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Bank-Grade Security</h3>
              <p className="feature-card__desc">
                Enterprise-level encryption and compliance with financial regulations.
              </p>
            </div>

            <div className="feature-card animate-on-scroll">
              <div className="feature-card__icon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="feature-card__title">Team Collaboration</h3>
              <p className="feature-card__desc">
                Share insights and collaborate with your team in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <div className="about__container">
          <div className="about__content animate-on-scroll">
            <span className="about__label">About Apex</span>
            <h2 className="about__title">Transforming Asset Management</h2>
            <p className="about__text">
              Founded by industry veterans, Apex combines cutting-edge technology 
              with deep financial expertise. Our platform empowers asset managers 
              to make smarter, faster, and more confident investment decisions.
            </p>
            <p className="about__text">
              We serve over 500 institutional clients across 150 countries, 
              managing more than $50 billion in assets through our platform.
            </p>
            <div className="about__badges">
              <div className="about__badge">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>SOC 2 Certified</span>
              </div>
              <div className="about__badge">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>ISO 27001</span>
              </div>
              <div className="about__badge">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>5-Star Rating</span>
              </div>
            </div>
          </div>
          <div className="about__visual animate-on-scroll">
            <div className="about__globe">
              <div className="about__globe-ring about__globe-ring--1"></div>
              <div className="about__globe-ring about__globe-ring--2"></div>
              <div className="about__globe-ring about__globe-ring--3"></div>
              <div className="about__globe-core"></div>
              <div className="about__globe-dot about__globe-dot--1"></div>
              <div className="about__globe-dot about__globe-dot--2"></div>
              <div className="about__globe-dot about__globe-dot--3"></div>
              <div className="about__globe-dot about__globe-dot--4"></div>
              <div className="about__globe-dot about__globe-dot--5"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact" id="contact">
        <div className="contact__container">
          <div className="contact__content animate-on-scroll">
            <span className="contact__label">Get Started</span>
            <h2 className="contact__title">Ready to Transform Your Investment Strategy?</h2>
            <p className="contact__text">
              Join thousands of asset managers who trust Apex for their investment decisions.
            </p>
            <div className="contact__cta">
              <Link to="/signup" className="contact__btn contact__btn--primary">
                Start Free Trial
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <a href="mailto:contact@apex-asset.com" className="contact__btn contact__btn--secondary">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer__container">
          <div className="footer__top">
            <div className="footer__brand">
              <div className="footer__logo">
                <div className="footer__logo-icon">
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2L38 12V28L20 38L2 28V12L20 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="M20 14L28 18V26L20 30L12 26V18L20 14Z" fill="currentColor"/>
                    <path d="M20 2V14M38 12L28 18M2 12L12 18M20 38V30M38 28L28 26M2 28L12 26" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </div>
                <span>APEX</span>
              </div>
              <p className="footer__tagline">Empowering Data-Driven Investment Decisions</p>
            </div>
            <div className="footer__links">
              <div className="footer__column">
                <h4>Product</h4>
                <a href="#solutions">Solutions</a>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
              </div>
              <div className="footer__column">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#careers">Careers</a>
                <a href="#contact">Contact</a>
              </div>
              <div className="footer__column">
                <h4>Legal</h4>
                <a href="#privacy">Privacy</a>
                <a href="#terms">Terms</a>
                <a href="#compliance">Compliance</a>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <p>&copy; 2025 Apex Asset Management. All rights reserved.</p>
            <div className="footer__social">
              <a href="#linkedin" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 9H2V21H6V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              <a href="#twitter" aria-label="Twitter">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34669 17.567 3.12393C16.6767 2.90116 15.7395 2.9572 14.8821 3.28445C14.0247 3.61171 13.2884 4.1944 12.773 4.95372C12.2575 5.71303 11.9877 6.61234 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

