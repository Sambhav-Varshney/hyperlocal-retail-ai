import { Link } from "react-router-dom";

function AuthRequiredModal({ open, target = "/login", message = "Please sign in to save stores and access personalized recommendations.", onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card auth-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="modal-eyebrow">Authentication Required</span>
            <h3>Sign in to BazaarHub</h3>
          </div>
          <button type="button" className="compare-drawer-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <Link to={target} className="primary-action modal-login-btn" onClick={onClose}>
            Login / Register ➔
          </Link>
          <button type="button" className="ghost-action" onClick={onClose}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthRequiredModal;
