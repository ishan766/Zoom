import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history || []);
      } catch (error) {
        setMeetings([]);
      }
    };

    fetchHistory();
  }, [getHistoryOfUser]);

  const formatDate = (dateString) => {
    const date = new Date(dateString || Date.now());
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="history-shell">
      <header className="history-header">
        <div className="brand-mark" aria-label="ZOOMOOM history">
          <span className="brand-mark__icon" aria-hidden="true" />
          ZOOMOOM
        </div>

        <button type="button" className="secondary-button" onClick={() => routeTo('/home')}>
          Back to dashboard
        </button>
      </header>

      {meetings.length > 0 ? (
        <div className="history-list">
          {meetings.map((meeting, index) => (
            <div className="history-card" key={`${meeting.meetingCode || 'history'}-${index}`}>
              <div className="history-card__meta">
                <strong>{meeting.meetingCode || 'Meeting room'}</strong>
                <small>{formatDate(meeting.date)}</small>
                <span>Hosted with {meeting.participants || 'team members'}</span>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={() => routeTo(`/${meeting.meetingCode}`)}
                style={{ minHeight: '42px', padding: '0.75rem 1rem' }}
              >
                Rejoin
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="history-empty">
          <div className="empty-state">
            <h3>No meeting history yet</h3>
            <p>Your recent rooms will show up here when you start collaborating.</p>
            <div style={{ marginTop: '18px' }}>
              <button type="button" className="primary-button" onClick={() => routeTo('/home')}>
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
