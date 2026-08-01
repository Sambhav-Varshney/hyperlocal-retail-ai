import { useData } from "../../context/DataContext";
import { useUI } from "../../context/UIContext";

function CompareBar() {
  const { compareItems, clearCompare } = useData();
  const { openCompareDrawer } = useUI();
  const count = compareItems.length;

  if (count === 0) return null;

  return (
    <aside
      className="floating-compare-bar"
      aria-label="Active product comparison bar"
      onClick={openCompareDrawer}
    >
      <div className="compare-bar-content">
        <div className="compare-bar-info">
          <span className="compare-bar-icon" aria-hidden="true">⚖️</span>
          <strong className="compare-bar-count">Compare ({count})</strong>
          <span className="compare-bar-subtitle">Max 4 items</span>
        </div>
        <div className="compare-bar-actions">
          <button
            type="button"
            className="compare-bar-open"
            onClick={(e) => { e.stopPropagation(); openCompareDrawer(); }}
          >
            View Drawer ↗
          </button>
          <button
            type="button"
            className="compare-bar-clear"
            onClick={(e) => { e.stopPropagation(); clearCompare(); }}
            title="Clear all compared items"
          >
            Clear all
          </button>
        </div>
      </div>
    </aside>
  );
}

export default CompareBar;
