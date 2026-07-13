import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthForm from "../components/forms/AuthForm";

function AuthPageShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, register, authLoading } = useAuth();
  const [mode, setMode] = useState(location.pathname === "/register" ? "register" : "login");

  // Already logged in — redirect away from auth pages
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (payload) => {
    const result = await login(payload);
    if (result.success) navigate("/dashboard");
    return result;
  };

  const handleRegister = async (payload) => {
    const result = await register(payload);
    if (result.success) navigate("/dashboard");
    return result;
  };

  return (
    <section className="panel auth-page">
      <div className="auth-inner">
        <div className="auth-brand">
          <div className="brand-mark small">BH</div>
          <div>
            <strong>BazaarHub</strong>
            <p className="eyebrow">{mode === "login" ? "Welcome back" : "Create your account"}</p>
          </div>
        </div>

        <div className="segmented">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
            Register
          </button>
        </div>

        <AuthForm mode={mode} onLogin={handleLogin} onRegister={handleRegister} loading={authLoading} />

        {mode === "login" ? (
          <Link className="ghost-action" to="/forgot-password">
            Forgot password?
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default AuthPageShell;
