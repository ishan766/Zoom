import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [navActive, setNavActive] = useState('dashboard');
  const dashboardRef = useRef(null);
  const recentMeetingsRef = useRef(null);
  const { addToUserHistory, getHistoryOfUser, logoutUser, userData } = useContext(AuthContext);

  const userName = useMemo(() => {
    const storedName = localStorage.getItem('ZOOMOOM_NAME');
    const storedUser = localStorage.getItem('ZOOMOOM_USER');
    return userData?.name || storedName || userData?.username || storedUser || 'Guest';
  }, [userData]);

  const initials = useMemo(() => {
    const cleanName = (userName || '').trim();
    if (!cleanName) return 'G';
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }, [userName]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setRecentMeetings(history || []);
      } catch (error) {
        setRecentMeetings([]);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  useEffect(() => {
    const dashboardNode = dashboardRef.current;
    const recentNode = recentMeetingsRef.current;
    if (!dashboardNode || !recentNode) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visibleEntry) return;

        if (visibleEntry.target.id === 'dashboard-hero') {
          setNavActive('dashboard');
        }

        if (visibleEntry.target.id === 'recent-meetings') {
          setNavActive('meetings');
        }
      },
      { threshold: [0.2, 0.5, 0.8] },
    );

    observer.observe(dashboardNode);
    observer.observe(recentNode);

    return () => observer.disconnect();
  }, []);

  const handleDashboardNav = () => {
    setNavActive('dashboard');
    if (dashboardRef.current) {
      dashboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMeetingsNav = () => {
    setNavActive('meetings');
    const meetingSection = document.getElementById('recent-meetings');
    if (meetingSection) {
      meetingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const createMeeting = async () => {
    const code = `ZOOM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    try {
      await addToUserHistory(code);
      navigate(`/${code}`);
    } catch (error) {
      navigate(`/${code}`);
    }
  };

  const handleJoinVideoCall = async () => {
    const normalizedCode = meetingCode.trim().toUpperCase().replace(/^\/+|\/+$/g, '').replace(/\s+/g, '');

    if (!normalizedCode || normalizedCode.length < 4 || !/^[A-Z0-9-]+$/.test(normalizedCode)) {
      setNotificationMessage('Enter a valid meeting code to join a room.');
      return;
    }

    setMeetingCode(normalizedCode);

    try {
      await addToUserHistory(normalizedCode);
      navigate(`/${normalizedCode}`);
    } catch (error) {
      navigate(`/${normalizedCode}`);
    }
  };

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="dashboard-shell">
      <header className="topbar" aria-label="Dashboard navigation">
        <div className="brand-mark" aria-label="ZOOMOOM logo">
          <span className="brand-mark__icon" aria-hidden="true" />
          ZOOMOOM
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          <button type="button" className={`nav-link-button ${navActive === 'dashboard' ? 'active' : ''}`} onClick={handleDashboardNav}>Dashboard</button>
          <button type="button" className={`nav-link-button ${navActive === 'meetings' ? 'active' : ''}`} onClick={handleMeetingsNav}>Meetings</button>
          <button type="button" className="nav-link-button" onClick={() => navigate('/history')}>History</button>
          <button type="button" className="nav-link-button" onClick={() => navigate('/settings')}>Settings</button>
        </nav>

        <div className="topbar-actions">
          <button type="button" className="icon-button" aria-label="Notifications" onClick={() => setNotificationMessage('No new notifications.')}>🔔</button>
          <div className="profile-menu-wrap">
            <button
              type="button"
              className="user-pill"
              onClick={() => setProfileMenuOpen((state) => !state)}
              aria-label="Profile menu"
            >
              <span className="user-pill__avatar">{initials}</span>
              <span className="user-pill__name">{userName}</span>
              <span className="user-pill__chevron" aria-hidden="true">▾</span>
            </button>

            {profileMenuOpen && (
              <div className="profile-menu">
                <div className="profile-menu__header">
                  <span className="profile-menu__avatar">{initials}</span>
                  <div>
                    <strong>{userName}</strong>
                    <small>Signed in</small>
                  </div>
                </div>
                <button type="button" className="profile-menu-item" onClick={() => setNotificationMessage(`Signed in as ${userName}.`)}>👤 Profile</button>
                <button type="button" className="profile-menu-item" onClick={() => navigate('/settings')}>⚙ Settings</button>
                <button type="button" className="profile-menu-item danger" onClick={handleLogout}>🚪 Log out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {notificationMessage && (
        <div className="toast-banner" role="status" aria-live="polite">
          <span>{notificationMessage}</span>
          <button type="button" onClick={() => setNotificationMessage('')}>Close</button>
        </div>
      )}

      <main className="dashboard-content">
        <section className="hero-panel dashboard-hero" id="dashboard-hero" ref={dashboardRef}>
          <div className="dashboard-heading">
            <p className="eyebrow">Good morning, {userName} 👋</p>
            <h1>Ready to connect with your team?</h1>
            <p>Jump into a meeting, start a quick sync, or revisit your recent rooms.</p>

            <div className="dashboard-actions">
              <button type="button" className="primary-button" onClick={createMeeting}>New Meeting</button>
              <button type="button" className="secondary-button" onClick={() => navigate('/history')}>Recent history</button>
            </div>

            <div className="join-row">
              <input
                className="text-input"
                aria-label="Meeting code"
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Enter meeting code"
              />
              <button type="button" className="join-button" onClick={handleJoinVideoCall}>Join Meeting</button>
            </div>
          </div>

          <div className="dashboard-summary">
            <div className="summary-card">
              <p>Meetings this week</p>
              <strong>08</strong>
            </div>
            <div className="summary-card">
              <p>Active rooms</p>
              <strong>04</strong>
            </div>
            <div className="summary-card">
              <p>Current status</p>
              <strong className="status-online">Online</strong>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <div className="section-heading">
            <div className="section-accent" aria-hidden="true" />
            <div>
              <h2>Quick actions</h2>
              <p className="section-sub">Jump into your most-used meeting tools.</p>
            </div>
          </div>

          <div className="action-grid">
            <button type="button" className="action-card action-card--primary" onClick={createMeeting}>
              <div className="action-icon action-icon--blue">＋</div>
              <div className="action-copy">
                <h3>New Meeting</h3>
                <p>Launch a fresh room in seconds.</p>
                <span className="action-cta">Start now →</span>
              </div>
            </button>

            <button type="button" className="action-card action-card--indigo" onClick={() => navigate('/history')}>
              <div className="action-icon action-icon--indigo">↗</div>
              <div className="action-copy">
                <h3>Recent History</h3>
                <p>Reopen prior team sessions.</p>
                <span className="action-cta">View history →</span>
              </div>
            </button>

            <button type="button" className="action-card action-card--teal" onClick={() => navigate('/settings')}>
              <div className="action-icon action-icon--teal">⚙</div>
              <div className="action-copy">
                <h3>Settings</h3>
                <p>Adjust audio, video, and preferences.</p>
                <span className="action-cta">Configure →</span>
              </div>
            </button>

            <button type="button" className="action-card action-card--violet" onClick={() => setNotificationMessage('Joining by code is available in the form above.') }>
              <div className="action-icon action-icon--violet">⌁</div>
              <div className="action-copy">
                <h3>Quick Join</h3>
                <p>Use an invite code to join instantly.</p>
                <span className="action-cta">Join meeting →</span>
              </div>
            </button>
          </div>
        </section>

        <section className="meeting-list" id="recent-meetings" ref={recentMeetingsRef}>
          <div className="section-heading">
            <h2>Recent meetings</h2>
            <button type="button" className="ghost-button" onClick={() => navigate('/history')}>View all</button>
          </div>

          {recentMeetings.length > 0 ? (
            recentMeetings.slice(0, 3).map((meeting, index) => (
              <div className="meeting-card" key={`${meeting.meetingCode || 'meeting'}-${index}`}>
                <div className="meeting-card__meta">
                  <strong>{meeting.meetingCode || 'Team sync'}</strong>
                  <div className="meta-row">
                    <span>{new Date(meeting.date || Date.now()).toLocaleDateString()}</span>
                    <span>{new Date(meeting.date || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="meta-row">
                  <span>{meeting.participants || 'Team room'}</span>
                </div>

                <span className="status-pill">Live</span>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => navigate(`/${meeting.meetingCode || meetingCode}`)}
                  style={{ minHeight: '42px', padding: '0.75rem 1rem' }}
                >
                  Join
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No upcoming meetings</h3>
              <p>Create your first room to begin collaborating.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default withAuth(HomeComponent);