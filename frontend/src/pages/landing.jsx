import React, { useEffect, useRef, useState } from 'react';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';

const productItems = [
  { icon: '🎥', title: 'Meetings', description: 'Start and join video meetings.' },
  { icon: '📹', title: 'Video Calls', description: 'Connect with teammates using real-time video.' },
  { icon: '🖥', title: 'Screen Sharing', description: 'Share your screen during a meeting.' },
  { icon: '💬', title: 'Chat & Collaboration', description: 'Communicate with participants during meetings.' },
];

const solutionItems = [
  { icon: '👥', title: 'Teams', description: 'Simple meetings and collaboration for teams.' },
  { icon: '🌍', title: 'Remote Work', description: 'Stay connected wherever your team works.' },
  { icon: '🎓', title: 'Students', description: 'Connect for classes, projects and group work.' },
  { icon: '🚀', title: 'Startups', description: 'Fast, lightweight communication for growing teams.' },
];

export default function LandingPage() {
  const router = useNavigate();
  const navRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
        setPricingOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setPricingOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const toggleMenu = (menu) => {
    setPricingOpen(false);
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  const togglePricing = () => {
    setOpenMenu(null);
    setPricingOpen((current) => !current);
  };

  return (
    <div className="landing-page">
      <nav className="landing-topbar" aria-label="Main navigation" ref={navRef}>
        <div className="brand-mark" aria-label="ZOOMOOM home">
          <span className="brand-mark__icon" aria-hidden="true" />
          ZOOMOOM
        </div>

        <div className="nav-links">
          <div className="nav-menu-group">
            <button
              type="button"
              className={`nav-link nav-link--menu ${openMenu === 'product' ? 'active' : ''}`}
              onClick={() => toggleMenu('product')}
              aria-expanded={openMenu === 'product'}
            >
              Product
              <span className="nav-caret" aria-hidden="true">▾</span>
            </button>

            {openMenu === 'product' && (
              <div className="nav-dropdown nav-dropdown--product" role="menu" aria-label="Product menu">
                {productItems.map((item) => (
                  <button key={item.title} type="button" className="nav-dropdown-item" role="menuitem" onClick={() => setOpenMenu(null)}>
                    <span className="nav-dropdown-icon" aria-hidden="true">{item.icon}</span>
                    <span className="nav-dropdown-copy">
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="nav-menu-group">
            <button
              type="button"
              className={`nav-link nav-link--menu ${openMenu === 'solutions' ? 'active' : ''}`}
              onClick={() => toggleMenu('solutions')}
              aria-expanded={openMenu === 'solutions'}
            >
              Solutions
              <span className="nav-caret" aria-hidden="true">▾</span>
            </button>

            {openMenu === 'solutions' && (
              <div className="nav-dropdown nav-dropdown--solutions" role="menu" aria-label="Solutions menu">
                {solutionItems.map((item) => (
                  <button key={item.title} type="button" className="nav-dropdown-item" role="menuitem" onClick={() => setOpenMenu(null)}>
                    <span className="nav-dropdown-icon" aria-hidden="true">{item.icon}</span>
                    <span className="nav-dropdown-copy">
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="nav-menu-group nav-menu-group--pricing">
            <button type="button" className={`nav-link nav-link--menu ${pricingOpen ? 'active' : ''}`} onClick={togglePricing} aria-expanded={pricingOpen}>
              Pricing
            </button>
          </div>

          <button className="ghost-button" type="button" onClick={() => router('/auth')}>
            Log in
          </button>
          <button className="primary-button" type="button" onClick={() => router('/auth')}>
            Get started
          </button>
        </div>
      </nav>

      {pricingOpen && (
        <>
          <div className="pricing-backdrop" role="presentation" onClick={() => setPricingOpen(false)} />
          <div className="pricing-modal" role="dialog" aria-modal="true" aria-label="Pricing options">
            <div className="pricing-modal__header">
              <div>
                <span className="pricing-kicker">Simple pricing</span>
                <h3>Choose the right plan for your team</h3>
              </div>
              <button type="button" className="pricing-close" onClick={() => setPricingOpen(false)} aria-label="Close pricing">
                ×
              </button>
            </div>

            <div className="pricing-grid">
              <div className="pricing-card">
                <span className="pricing-plan">Free</span>
                <div className="pricing-price">
                  ₹0 <span>/ month</span>
                </div>
                <ul>
                  <li>Video meetings</li>
                  <li>Audio</li>
                  <li>Screen sharing</li>
                  <li>Meeting chat</li>
                </ul>
                <button type="button" className="primary-button pricing-button" onClick={() => router('/auth')}>
                  Get Started
                </button>
              </div>

              <div className="pricing-card pricing-card--featured">
                <span className="pricing-plan">Pro</span>
                <div className="pricing-price">
                  ₹499 <span>/ month</span>
                </div>
                <ul>
                  <li>Everything in Free</li>
                  <li>Advanced collaboration</li>
                  <li>Larger meetings</li>
                  <li>Priority features</li>
                </ul>
                <button type="button" className="secondary-button pricing-button pricing-button--disabled" disabled>
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <main className="landing-hero">
        <div className="hero-copy">
          <h1>
            Meet smarter.
            <br />
            Work closer.
          </h1>

          <p>
            ZOOMOOM brings your team together with faster meetings, polished collaboration,
            and a premium virtual workspace built for modern product teams.
          </p>

          <div className="hero-actions">
            <Link to="/auth" className="primary-button">
              Start free
            </Link>
            <button className="secondary-button" type="button" onClick={() => router('/auth')}>
              Explore app
            </button>
          </div>

          <div className="hero-metrics" aria-label="Key stats">
            <div className="metric">
              <strong>15k+</strong>
              <span>Meetings hosted</span>
            </div>
            <div className="metric">
              <strong>99.9%</strong>
              <span>Reliability</span>
            </div>
            <div className="metric">
              <strong>4.9/5</strong>
              <span>Team rating</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="ZOOMOOM video meeting product preview">
          <div className="meeting-preview">
            <div className="floating-badge floating-badge--left">
              <span className="floating-badge__dot" />
              12 connected
            </div>
            <div className="floating-badge floating-badge--right">
              <span className="floating-badge__icon">💬</span>
              Nice work!
            </div>
            <div className="floating-badge floating-badge--bottom">
              <span className="floating-badge__icon">🖥</span>
              Sharing screen
            </div>

            <div className="meeting-preview__header">
              <div className="brand-mark brand-mark--mini" aria-label="ZOOMOOM product preview brand">
                <span className="brand-mark__icon" aria-hidden="true" />
                ZOOMOOM
              </div>
              <div className="meeting-preview__controls" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div className="meeting-preview__status">
              <span className="live-dot" />
              Live Meeting
            </div>

            <div className="meeting-preview__grid">
              <div className="video-tile video-tile--speaker">
                <div className="video-avatar video-avatar--brand">I</div>
                <div className="video-label">Ishaan</div>
                <span className="video-status">Host</span>
              </div>

              <div className="video-tile">
                <div className="video-avatar video-avatar--alt">A</div>
                <div className="video-label">Ava</div>
                <span className="video-status">Speaking</span>
              </div>

              <div className="video-tile">
                <div className="video-avatar video-avatar--soft">R</div>
                <div className="video-label">Riya</div>
                <span className="video-status">Muted</span>
              </div>

              <div className="video-tile">
                <div className="video-avatar video-avatar--azure">S</div>
                <div className="video-label">Sam</div>
                <span className="video-status">Screen share</span>
              </div>
            </div>

            <div className="meeting-preview__toolbar" aria-label="Meeting controls">
              <button type="button" className="toolbar-button toolbar-button--muted" aria-label="Microphone">🎤</button>
              <button type="button" className="toolbar-button" aria-label="Camera">📹</button>
              <button type="button" className="toolbar-button" aria-label="Screen share">🖥</button>
              <button type="button" className="toolbar-button" aria-label="Chat">💬</button>
              <button type="button" className="toolbar-button toolbar-button--record" aria-label="Recording">🔴</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
