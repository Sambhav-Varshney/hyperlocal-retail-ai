import { Link } from "react-router-dom";

function AuthRequiredModal({ open, target, message, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Sign in required</h3>
          <button className="ghost-action" onClick={onClose}>
            Close
          </button>
        </div>
        <p>{message}</p>
        <div className="modal-actions">
          <Link to={target} className="primary-action" onClick={onClose}>
            Login to continue
          </Link>
          <button className="ghost-action" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthRequiredModal;
