import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [cameraPreview, setCameraPreview] = useState(true);

  return (
    <div className="settings-shell">
      <div className="settings-card">
        <div className="settings-header">
          <div>
            <div className="brand-mark" aria-label="ZOOMOOM settings">
              <span className="brand-mark__icon" aria-hidden="true" />
              ZOOMOOM
            </div>
            <h2 style={{ marginTop: '12px' }}>Settings</h2>
          </div>

          <button type="button" className="secondary-button" onClick={() => navigate('/home')}>
            Back to dashboard
          </button>
        </div>

        <div className="settings-grid">
          <section className="settings-block">
            <h3>Audio & Video</h3>

            <div className="setting-row">
              <label>Microphone</label>
              <button
                type="button"
                className={`toggle ${audioEnabled ? 'on' : ''}`}
                onClick={() => setAudioEnabled((value) => !value)}
                aria-label="Toggle microphone"
              />
            </div>

            <div className="setting-row">
              <label>Camera</label>
              <button
                type="button"
                className={`toggle ${videoEnabled ? 'on' : ''}`}
                onClick={() => setVideoEnabled((value) => !value)}
                aria-label="Toggle camera"
              />
            </div>

            <div className="setting-row">
              <label>Camera preview</label>
              <button
                type="button"
                className={`toggle ${cameraPreview ? 'on' : ''}`}
                onClick={() => setCameraPreview((value) => !value)}
                aria-label="Toggle camera preview"
              />
            </div>
          </section>

          <section className="settings-block">
            <h3>Meeting preferences</h3>

            <div className="setting-row">
              <label>Notifications</label>
              <button
                type="button"
                className={`toggle ${notificationsEnabled ? 'on' : ''}`}
                onClick={() => setNotificationsEnabled((value) => !value)}
                aria-label="Toggle notifications"
              />
            </div>

            <div className="setting-row">
              <label>Default layout</label>
              <span>Speaker view</span>
            </div>

            <div className="setting-row">
              <label>Auto join</label>
              <span>Enabled</span>
            </div>
          </section>
        </div>

        <div className="settings-actions">
          <button type="button" className="ghost-button" onClick={() => navigate('/home')}>Cancel</button>
          <button type="button" className="primary-button" onClick={() => navigate('/home')}>Save changes</button>
        </div>
      </div>
    </div>
  );
}
