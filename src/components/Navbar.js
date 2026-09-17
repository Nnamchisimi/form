import React, { useState } from 'react';
import { Users } from '../icons';
import translations from '../translations';
import mercedesLogo from '../merclogo.webp';

const Navbar = ({ language, setLanguage, currentPage, setCurrentPage }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = translations[language];

  const NavLink = ({ page, label, icon }) => (
    <button
      type="button"
      onClick={() => {
        setCurrentPage(page);
        setMobileOpen(false);
      }}
      className={`nav-link ${currentPage === page ? 'active' : ''}`}
    >
      {icon && <span className="nav-icon">{icon}</span>}
      {label}
    </button>
  );

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => setCurrentPage('form')}>
          <div className="brand-icon">
            <img src={mercedesLogo} alt="Mercedes" className="brand-logo" />
          </div>
          <span className="brand-text">Serhan Kombos Otomotiv</span>
        </div>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          <NavLink page="form" label={t.navHome} />
          <NavLink page="admin" label={t.navAdmin} icon={<Users size={16} />} />
        </div>

        <div className="navbar-actions">
          <div className="language-toggle-nav">
            <button
              type="button"
              className={`lang-btn-nav ${language === 'en' ? 'active' : ''}`}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`lang-btn-nav ${language === 'tr' ? 'active' : ''}`}
              onClick={() => setLanguage('tr')}
            >
              TR
            </button>
          </div>

          <button
            type="button"
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
    </nav>
  );
};

export default Navbar;
