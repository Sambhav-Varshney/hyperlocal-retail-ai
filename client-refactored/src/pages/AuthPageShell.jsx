import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/forms/AuthForm";

function AuthPageShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, authLoading, continueAsGuest } = useAuth();
  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");

  // Already logged in — redirect to Home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (payload) => {
    const result = await login(payload);
    if (result.success) navigate("/");
    return result;
  };

  const handleRegister = async (payload) => {
    const result = await register(payload);
    if (result.success) navigate("/");
    return result;
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate("/");
  };

  return (
    <section className="panel auth-page-container">
      <div className="auth-hero-split">
        {/* Left Hero Banner */}
        <div className="auth-hero-copy">
          <h1>
            Welcome to <span className="accent-text">BazaarHub</span>
          </h1>
          <p className="auth-hero-subtitle">
            Discover nearby stores, compare prices, and shop smarter with AI.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="feature-icon" aria-hidden="true">🤖</span>
              <span>AI Powered Search</span>
            </div>
            <div className="auth-feature-item">
              <span className="feature-icon" aria-hidden="true">📊</span>
              <span>Real-time Price Compare</span>
            </div>
            <div className="auth-feature-item">
              <span className="feature-icon" aria-hidden="true">📍</span>
              <span>Nearby Store Discovery</span>
            </div>
          </div>
        </div>

        {/* Right Auth Card */}
        <div className="auth-card-panel">
          <div className="auth-tabs-row">
            <button
              type="button"
              className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <AuthForm mode={mode} onLogin={handleLogin} onRegister={handleRegister} loading={authLoading} />

          <div className="auth-extras-row">
            <label className="remember-label">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <Link className="forgot-link accent-text" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="auth-divider">
            <span>or explore without login</span>
          </div>

          {/* Continue as Guest Button */}
          <button
            type="button"
            className="ghost-action guest-continue-btn"
            onClick={handleGuestAccess}
          >
            Continue as Guest ➔
          </button>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-auth-grid">
            <button type="button" className="social-auth-btn" onClick={() => alert("Google Login Demo")}>
              <span>🌐</span> Google
            </button>
            <button type="button" className="social-auth-btn" onClick={() => alert("GitHub Login Demo")}>
              <span>🐙</span> GitHub
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthPageShell;
