import { Link } from "react-router-dom";

function EmptyState({ title = "No products found", children, onClearFilters }) {
  return (
    <div className="empty-state-panel">
      <div className="empty-state-icon" aria-hidden="true">🔍</div>
      <h3 className="empty-state-title">{title}</h3>
      {children ? <p className="empty-state-desc">{children}</p> : null}
      <div className="empty-state-actions">
        {onClearFilters ? (
          <button type="button" className="primary-action" onClick={onClearFilters}>
            Clear Filters
          </button>
        ) : null}
        <Link to="/categories" className="ghost-action">
          Browse Categories →
        </Link>
      </div>
    </div>
  );
}

export default EmptyState;
