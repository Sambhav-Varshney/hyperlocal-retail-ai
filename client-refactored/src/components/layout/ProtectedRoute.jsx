import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function UnauthorizedView() {
  return (
    <div className="content-grid single-column-layout" style={{ margin: "40px auto", maxWidth: "560px", padding: "40px 32px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", textAlign: "center" }}>
      <span style={{ fontSize: "3rem", display: "block", marginBottom: "12px" }}>🔒</span>
      <h1 style={{ margin: "0 0 8px", fontSize: "1.8rem", color: "var(--text-main)" }}>Access Restricted</h1>
      <p style={{ margin: "0 0 24px", color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.5 }}>
        You don't have permission to view this page. Please log in with an authorized account or return home.
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <Link to="/" className="primary-action" style={{ padding: "10px 24px", background: "var(--primary)", color: "#fff", borderRadius: "12px", textDecoration: "none", fontWeight: 750 }}>
          Go Home
        </Link>
        <button type="button" className="ghost-action" onClick={() => window.history.back()} style={{ padding: "10px 24px", border: "1px solid var(--border)", background: "var(--bg-section)", color: "var(--text-main)", borderRadius: "12px", cursor: "pointer", fontWeight: 750 }}>
          Go Back
        </button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isGuest } = useAuth();

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  // If user is guest or logged in user role is not in allowedRoles (when allowedRoles is specified)
  if (allowedRoles.length > 0) {
    const userRole = user?.role || "customer";
    if (!allowedRoles.includes(userRole)) {
      return <UnauthorizedView />;
    }
  }

  return children;
}

export default ProtectedRoute;
