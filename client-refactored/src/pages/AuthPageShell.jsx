import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/forms/AuthForm";

function AuthPageShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, authLoading, continueAsGuest } = useAuth();
  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");

  const getRedirectPath = (userRole) => {
    if (userRole === "admin") return "/admin/dashboard";
    if (userRole === "shop_owner") return "/shop/dashboard";
    return "/";
  };

  // Already logged in — redirect to role-specific route
  if (user) {
    return <Navigate to={getRedirectPath(user.role)} replace />;
  }

  const handleLogin = async (payload) => {
    const result = await login(payload);
    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem("authUser") || "{}");
      const targetRole = savedUser?.role || "customer";
      navigate(getRedirectPath(targetRole));
    }
    return result;
  };

  const handleRegister = async (payload) => {
    const result = await register(payload);
    if (result.success) {
      navigate("/");
    }
    return result;
  };

  const handleGuestAccess = () => {
    continueAsGuest();
    navigate("/");
  };

  const handleDemoLogin = async (demoRole) => {
    let email = "customer@bazaarhub.com";
    if (demoRole === "shop_owner") email = "shopowner@bazaarhub.com";
    if (demoRole === "admin") email = "admin@bazaarhub.com";

    await handleLogin({ email, password: "password123" });
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

          {/* Quick Demo Login Pills for Testing Roles */}
          <div style={{ marginTop: "28px", padding: "18px", borderRadius: "16px", background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <span style={{ display: "block", fontSize: "0.8rem", fontWeight: 750, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
              🔑 Quick Demo Login by Role
            </span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="ghost-action"
                style={{ padding: "6px 12px", fontSize: "0.82rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-main)" }}
                onClick={() => handleDemoLogin("customer")}
              >
                👤 Customer
              </button>
              <button
                type="button"
                className="ghost-action"
                style={{ padding: "6px 12px", fontSize: "0.82rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--primary)" }}
                onClick={() => handleDemoLogin("shop_owner")}
              >
                🏪 Shop Owner
              </button>
              <button
                type="button"
                className="ghost-action"
                style={{ padding: "6px 12px", fontSize: "0.82rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "#A78BFA" }}
                onClick={() => handleDemoLogin("admin")}
              >
                🛡️ Admin
              </button>
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
        </div>
      </div>
    </section>
  );
}

export default AuthPageShell;
