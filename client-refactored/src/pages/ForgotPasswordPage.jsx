import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUI } from "../context/UIContext";

function ForgotPasswordPage() {
  const { showToast } = useUI();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("request"); // "request" | "reset" | "complete"
  const [resetCode, setResetCode] = useState("");
  const [demoCode] = useState("849201");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRequestReset = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your registered email address", "error");
      return;
    }
    setStep("reset");
    showToast("Simulated password reset code generated for demo mode!");
  };

  const handleConfirmReset = (event) => {
    event.preventDefault();
    if (resetCode.trim() !== demoCode) {
      showToast(`Invalid reset code. For demo testing, enter ${demoCode}`, "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setStep("complete");
    showToast("Password updated successfully! Please login with your new password.");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <section className="panel auth-page" style={{ maxWidth: "480px", margin: "40px auto", padding: "32px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px" }}>
      <div className="auth-inner">
        <div className="auth-brand" style={{ marginBottom: "24px" }}>
          <div className="brand-mark small">BH</div>
          <div>
            <strong style={{ fontSize: "1.2rem", color: "var(--text-main)" }}>BazaarHub</strong>
            <p className="eyebrow" style={{ margin: 0, color: "var(--text-muted)" }}>Reset your account password</p>
          </div>
        </div>

        {step === "request" && (
          <form className="form-auth" onSubmit={handleRequestReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: 0 }}>
              Enter your email address to receive password reset instructions.
            </p>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address (e.g. user@example.com)"
              type="email"
              required
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", padding: "12px 14px" }}
            />
            <button className="primary-action" type="submit" style={{ minHeight: "44px", background: "var(--primary)", color: "#fff", borderRadius: "12px", fontWeight: 700 }}>
              Send Reset Code →
            </button>
          </form>
        )}

        {step === "reset" && (
          <form className="form-auth" onSubmit={handleConfirmReset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Demo Notice Box */}
            <div style={{ padding: "14px 16px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)" }}>
              <strong style={{ display: "block", color: "#F8FAFC", fontSize: "0.9rem", marginBottom: "4px" }}>
                ℹ️ Local Environment Notice
              </strong>
              <p style={{ margin: 0, color: "#CBD5E1", fontSize: "0.84rem", lineHeight: 1.4 }}>
                Real SMTP email delivery is disabled in local environment. Use simulated verification code: <strong style={{ color: "#3B82F6", letterSpacing: "0.08em" }}>{demoCode}</strong>
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Enter 6-Digit Reset Code</label>
              <input
                value={resetCode}
                onChange={(event) => setResetCode(event.target.value)}
                placeholder={`e.g. ${demoCode}`}
                type="text"
                maxLength={6}
                required
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", padding: "12px 14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>New Password</label>
              <input
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="New password (min. 6 chars)"
                type="password"
                required
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", padding: "12px 14px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>Confirm New Password</label>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                type="password"
                required
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)", borderRadius: "12px", padding: "12px 14px" }}
              />
            </div>

            <button className="primary-action" type="submit" style={{ minHeight: "44px", background: "var(--primary)", color: "#fff", borderRadius: "12px", fontWeight: 700 }}>
              Update Password ✓
            </button>
          </form>
        )}

        {step === "complete" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <span style={{ fontSize: "2.5rem", display: "block", marginBottom: "12px" }}>🎉</span>
            <h3 style={{ margin: "0 0 8px", color: "var(--text-main)" }}>Password Reset Completed!</h3>
            <p style={{ margin: "0 0 20px", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Your password has been updated. Redirecting to login...
            </p>
            <Link className="primary-action" to="/login" style={{ display: "inline-block", padding: "10px 24px", background: "var(--primary)", color: "#fff", borderRadius: "12px", textDecoration: "none", fontWeight: 700 }}>
              Go to Login
            </Link>
          </div>
        )}

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
          <Link className="ghost-action" to="/login" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.88rem" }}>
            ← Back to login
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
