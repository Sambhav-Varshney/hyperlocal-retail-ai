import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useUI } from "../../context/UIContext";
import { currency, getBudgetType } from "../../utils/format";
import { getProductDisplayName } from "../../utils/productMatcher";
import HomeImage from "../common/HomeImage";
import { imageForCategory } from "../../assets/homeImages";

function CompareDrawer() {
  const { compareItems, removeFromCompare, clearCompare } = useData();
  const { compareDrawerOpen, closeCompareDrawer } = useUI();

  // Active product family display name
  const activeProductName = useMemo(() => {
    if (!compareItems.length) return "Product";
    return getProductDisplayName(compareItems[0]);
  }, [compareItems]);

  // Calculate automated highlights: Lowest Price & Highest Rating
  const { lowestPrice, highestRating } = useMemo(() => {
    if (!compareItems.length) return { lowestPrice: null, highestRating: null };
    const prices = compareItems.map((item) => Number(item.price || Infinity)).filter(Boolean);
    const ratings = compareItems.map((item) => Number(item.rating || -Infinity)).filter(Boolean);
    return {
      lowestPrice: prices.length ? Math.min(...prices) : null,
      highestRating: ratings.length ? Math.max(...ratings) : null,
    };
  }, [compareItems]);

  if (!compareDrawerOpen || compareItems.length === 0) return null;

  return (
    <div className="compare-drawer-overlay" onClick={closeCompareDrawer}>
      <aside className="compare-drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div className="compare-drawer-header">
          <div>
            <p className="eyebrow">Hyperlocal Price Comparison</p>
            <h2>
              Comparing {activeProductName} Across {compareItems.length} Nearby{" "}
              {compareItems.length === 1 ? "Store" : "Stores"}
            </h2>
            <p className="compare-drawer-subtitle">
              Side-by-side price, stock availability, and rating comparison for {activeProductName}.
            </p>
          </div>
          <div className="compare-drawer-header-actions">
            <button type="button" className="ghost-action" onClick={clearCompare}>
              Clear All
            </button>
            <button
              type="button"
              className="compare-drawer-close"
              onClick={closeCompareDrawer}
              aria-label="Close Comparison Drawer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Grid */}
        <div className="compare-drawer-grid">
          {compareItems.map((item) => {
            const itemId = item.id ?? item.productId;
            const price = Number(item.price || 0);
            const rating = Number(item.rating || 0);
            const isLowestPrice = lowestPrice !== null && price === lowestPrice;
            const isHighestRating = highestRating !== null && rating === highestRating && rating > 0;
            const isOpen = item.isOpen !== false;

            return (
              <div
                key={itemId}
                className={`compare-col-card ${isLowestPrice ? "highlight-price" : ""} ${isHighestRating ? "highlight-rating" : ""}`}
              >
                {/* Automated Highlights Badges */}
                <div className="compare-badges-wrap">
                  {isLowestPrice ? <span className="compare-badge lowest-price">🏆 Lowest Price</span> : null}
                  {isHighestRating ? <span className="compare-badge top-rated">⭐ Top Rated</span> : null}
                </div>

                {/* Product Image & Stock */}
                <div className="compare-card-img-wrap">
                  <HomeImage
                    className="compare-card-img"
                    src={item.image || imageForCategory(item.category)}
                    alt={item.productName || "Product"}
                  />
                  <span className="compare-card-stock">In Stock ({item.quantity || 50})</span>
                </div>

                {/* Product & Store Info */}
                <div className="compare-card-body">
                  <span className="compare-card-brand">{item.brand || "Brand"}</span>
                  <h3 className="compare-card-title">{item.productName || "Product Name"}</h3>
                  <p className="compare-card-store">🏬 {item.storeName || "Local Retailer"}</p>
                </div>

                {/* Attribute Comparison Rows */}
                <div className="compare-attrs-list">
                  <div className="compare-attr-row">
                    <span className="compare-attr-label">Price</span>
                    <strong className="compare-attr-value price-val">{currency(price)}</strong>
                  </div>

                  <div className="compare-attr-row">
                    <span className="compare-attr-label">Rating</span>
                    <span className="compare-attr-value">⭐ {rating.toFixed(1)} / 5.0</span>
                  </div>

                  <div className="compare-attr-row">
                    <span className="compare-attr-label">Distance</span>
                    <span className="compare-attr-value">
                      {item.distance ? `${item.distance.toFixed(1)} km` : "Distance N/A"}
                    </span>
                  </div>

                  <div className="compare-attr-row">
                    <span className="compare-attr-label">Status</span>
                    <span className={`compare-attr-value ${isOpen ? "status-open" : "status-closed"}`}>
                      {isOpen ? "Open now" : "Closed"}
                    </span>
                  </div>

                  <div className="compare-attr-row">
                    <span className="compare-attr-label">Budget Tier</span>
                    <span className="compare-attr-value">{getBudgetType(price)}</span>
                  </div>

                  <div className="compare-attr-row">
                    <span className="compare-attr-label">Category</span>
                    <span className="compare-attr-value">{item.category || "General"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="compare-card-actions">
                  <Link
                    to={`/store/${item.id}`}
                    className="primary-action compare-view-btn"
                    onClick={closeCompareDrawer}
                  >
                    View Store
                  </Link>
                  <button
                    type="button"
                    className="danger-action compare-remove-btn"
                    onClick={() => removeFromCompare(itemId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}

export default CompareDrawer;
