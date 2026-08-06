import { Link } from "react-router-dom";

function EmptyState({
  title = "No products found",
  children,
  icon = "🔍",
  onClearFilters,
  actionText = "Explore Stores",
  actionLink = "/categories",
}) {
  return (
    <div className="empty-state-panel">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {children ? <p className="empty-state-desc">{children}</p> : null}
      <div className="empty-state-actions">
        {onClearFilters ? (
          <button type="button" className="ghost-action" onClick={onClearFilters}>
            Clear Filters
          </button>
        ) : null}
        <Link to={actionLink} className="primary-action hero-cta-btn">
          {actionText}
        </Link>
      </div>
    </div>
  );
}

export default EmptyState;
