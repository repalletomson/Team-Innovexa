import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${isScrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2L38 12V28L20 38L2 28V12L20 2Z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M20 14L28 18V26L20 30L12 26V18L20 14Z" fill="currentColor"/>
              <path d="M20 2V14M38 12L28 18M2 12L12 18M20 38V30M38 28L28 26M2 28L12 26" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="navbar__logo-text">APEX</span>
        </Link>

        <div className={`navbar__links ${isMobileMenuOpen ? 'navbar__links--open' : ''}`}>
          <a href="#about" className="navbar__link">About</a>
          <a href="#solutions" className="navbar__link">Solutions</a>
          <a href="#contact" className="navbar__link">Contact</a>
          
          <div className="navbar__auth-mobile">
            <Link to="/signup" className="navbar__btn navbar__btn--primary">Sign Up</Link>
            <Link to="/login" className="navbar__btn navbar__btn--secondary">Log In</Link>
          </div>
        </div>

        <div className="navbar__actions">
          <button 
            className="navbar__theme-toggle" 
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="navbar__theme-toggle-track">
              <span className="navbar__theme-icon navbar__theme-icon--sun">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 2V4M12 20V22M2 12H4M20 12H22M4.93 4.93L6.34 6.34M17.66 17.66L19.07 19.07M4.93 19.07L6.34 17.66M17.66 6.34L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              <span className="navbar__theme-icon navbar__theme-icon--moon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className={`navbar__theme-toggle-thumb ${isDark ? 'navbar__theme-toggle-thumb--dark' : ''}`}></span>
            </div>
          </button>

          <Link to="/login" className="navbar__btn navbar__btn--secondary navbar__btn--desktop">Log In</Link>
          <Link to="/signup" className="navbar__btn navbar__btn--primary navbar__btn--desktop">Sign Up</Link>

          <button 
            className={`navbar__hamburger ${isMobileMenuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

