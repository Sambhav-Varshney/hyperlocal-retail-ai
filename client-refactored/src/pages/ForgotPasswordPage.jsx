import { useState } from "react";
import { Link } from "react-router-dom";
import { useUI } from "../context/UIContext";

function ForgotPasswordPage() {
  const { showToast } = useUI();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      showToast("Please enter your email address", "error");
      return;
    }
    setSent(true);
    showToast("If an account exists for that email, reset instructions were sent.");
  };

  return (
    <section className="panel auth-page">
      <div className="auth-inner">
        <div className="auth-brand">
          <div className="brand-mark small">BH</div>
          <div>
            <strong>BazaarHub</strong>
            <p className="eyebrow">Reset your password</p>
          </div>
        </div>

        {sent ? (
          <p className="empty-text">Check your inbox for further instructions.</p>
        ) : (
          <form className="form-auth" onSubmit={submit}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              type="email"
              required
            />
            <button className="primary-action">Send reset link</button>
          </form>
        )}

        <Link className="ghost-action" to="/login">
          Back to login
        </Link>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
