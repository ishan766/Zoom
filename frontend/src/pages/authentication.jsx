import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function Authentication() {
  const [formState, setFormState] = useState(0);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleLogin, handleRegister } = useContext(AuthContext);

  const handleAuth = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    if (formState === 1 && !name.trim()) {
      setError("Full name is required to create an account.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (formState === 0) {
        await handleLogin(username.trim(), password.trim());
      } else {
        const result = await handleRegister(name.trim(), username.trim(), password.trim());
        setMessage(result || "Account created successfully.");
        setFormState(0);
        setName("");
        setPassword("");
      }
    } catch (err) {
      // map normalized errors from AuthContext
      const status = err?.status || err?.response?.status;
      const backendMessage = err?.message || err?.response?.data?.message || "Something went wrong. Please try again.";

      if (status === 400) setError("Username and password are required.");
      else if (status === 401 || status === 404) setError("Invalid username or password.");
      else if (status >= 500) setError("Unable to connect to the server. Please try again.");
      else setError(backendMessage);
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setUsername("");
    setPassword("");
    setError("");
    setMessage("");
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <div className="auth-grid">
          <aside className="auth-visual" aria-label="ZOOMOOM product overview">
            <div className="auth-visual-content">
              <div className="auth-badge">Live collaboration</div>
              <div className="auth-copy">
                <h2>Connect. Collaborate. Anywhere.</h2>
                <p>
                  Simple, reliable video meetings built for teams that want to stay connected, move fast,
                  and turn every conversation into action.
                </p>
              </div>

              <div className="auth-showcase" aria-label="Abstract communication preview">
                <div className="showcase-window">
                  <div className="showcase-topbar">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="showcase-grid">
                    <div className="showcase-card showcase-main">
                      <div className="showcase-avatar-group">
                        <span>A</span>
                        <span>N</span>
                        <span>J</span>
                      </div>
                      <div className="showcase-pill">12 live</div>
                    </div>

                    <div className="showcase-card subtle">
                      <small>Product sync</small>
                      <strong>94%</strong>
                    </div>

                    <div className="showcase-card subtle">
                      <small>Focus mode</small>
                      <strong>4.8h</strong>
                    </div>

                    <div className="showcase-card accent">
                      <small>Launch</small>
                      <strong>Today</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="auth-card" aria-label="Authentication form">
            <div className="auth-header">
              <div className="brand-mark" aria-label="ZOOMOOM logo">
                <span className="brand-mark__icon" aria-hidden="true" />
                ZOOMOOM
              </div>
            </div>

            <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
              <button
                type="button"
                className={`auth-tab ${formState === 0 ? "active" : ""}`}
                onClick={() => {
                  setFormState(0);
                  resetForm();
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${formState === 1 ? "active" : ""}`}
                onClick={() => {
                  setFormState(1);
                  resetForm();
                }}
              >
                Sign Up
              </button>
            </div>

            <div className="auth-form-block">
              {formState === 1 && (
                <label className="field-block">
                  <span>Full name</span>
                  <input
                    className="text-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    aria-label="Full name"
                  />
                </label>
              )}

              <label className="field-block">
                <span>Username</span>
                <input
                  className="text-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  aria-label="Username"
                />
              </label>

              <label className="field-block">
                <span>Password</span>
                <input
                  className="text-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  aria-label="Password"
                />
              </label>

              {error && <p className="auth-error">{error}</p>}
              {message && <p className="auth-success">{message}</p>}

              <button type="button" className="primary-button auth-submit" onClick={handleAuth} disabled={loading}>
                {loading ? (formState === 0 ? "Signing in..." : "Creating account...") : formState === 0 ? "Sign In" : "Create account"}
              </button>

              <div className="divider"><span>or</span></div>

              <button type="button" className="secondary-button auth-secondary" onClick={() => setFormState((state) => (state === 0 ? 1 : 0))}>
                {formState === 0 ? "Create account" : "Already have an account?"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
