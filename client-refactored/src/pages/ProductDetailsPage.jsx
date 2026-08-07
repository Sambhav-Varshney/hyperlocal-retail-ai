import { Link, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { currency, getBudgetType } from "../utils/format";
import { isSameProductFamily } from "../utils/productMatcher";
import StoreCard from "../components/cards/StoreCard";
import SmartRecommendations from "../components/SmartRecommendations";

function ProductDetailsPage() {
  const { id } = useParams();
  const { stores, savedProducts, saveProduct, savedStores, toggleSavedStore, addToCompare, isCompared } = useData();

  // Find target product/store item by productId or store id
  const targetItem = stores.find(
    (s) => String(s.productId ?? s.id) === String(id) || String(s.id) === String(id)
  ) || stores[0];

  const isSaved = savedProducts.some(
    (p) => String(p.id ?? p.productId) === String(targetItem?.id ?? targetItem?.productId)
  );

  if (!targetItem) {
    return (
      <section className="panel">
        <p className="empty-text">Product details unavailable.</p>
        <Link className="ghost-action" to="/search">
          ← Back to search
        </Link>
      </section>
    );
  }

  // Find price comparison across other retailers selling the same or similar product
  const comparisonStores = stores.filter(
    (s) =>
      s.id !== targetItem.id &&
      (isSameProductFamily(s, targetItem) ||
        s.productName?.toLowerCase() === targetItem.productName?.toLowerCase() ||
        s.brand?.toLowerCase() === targetItem.brand?.toLowerCase())
  );

  // Find similar products in the same category
  const similarProducts = stores.filter(
    (s) =>
      s.id !== targetItem.id &&
      s.category?.toLowerCase() === targetItem.category?.toLowerCase()
  ).slice(0, 3);

  const allPrices = [targetItem, ...comparisonStores].map((s) => Number(s.price || 0));
  const minPrice = Math.min(...allPrices);
  const avgPrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length);
  const savings = Math.max(0, avgPrice - Number(targetItem.price || 0));
  const isBestPrice = Number(targetItem.price || 0) === minPrice;
  const savedIds = new Set(savedStores.map((s) => s.id));

  return (
    <div className="content-grid single-column-layout product-details-layout" style={{ gap: "24px" }}>
      <div className="results-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {/* Main Product Hero Panel */}
        <section className="panel product-hero-panel">
          <div className="panel-heading" style={{ alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <span className="category-store-badge" style={{ textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--accent)" }}>
                {targetItem.category || "General"} • {targetItem.brand || "Local Retail"}
              </span>
              <h1 style={{ margin: "6px 0 4px", fontSize: "1.85rem", color: "var(--text-main)" }}>
                {targetItem.productName}
              </h1>
              <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem" }}>
                Available at <strong>{targetItem.storeName}</strong> ({targetItem.marketArea || targetItem.city || "Nearby"})
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className={isSaved ? "primary-action saved" : "ghost-action"}
                onClick={() =>
                  saveProduct({
                    id: targetItem.id,
                    productId: targetItem.productId,
                    productName: targetItem.productName,
                    price: targetItem.price,
                  })
                }
              >
                {isSaved ? "❤️ Saved Product" : "🤍 Save Product"}
              </button>
            </div>
          </div>

          {/* AI Intelligence Card */}
          <div className="ai-insight-card" style={{ marginBottom: "24px", padding: "18px 22px", borderRadius: "16px", background: "rgba(59, 130, 246, 0.06)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
              <span style={{ fontSize: "1.4rem" }}>🤖</span>
              <div>
                <strong style={{ color: "#F8FAFC", fontSize: "0.98rem" }}>AI Shopping Intelligence Verdict</strong>
                <p style={{ margin: 0, color: "#94A3B8", fontSize: "0.86rem" }}>
                  {isBestPrice
                    ? `Lowest price guaranteed! You save ₹${savings} compared to average local market rate.`
                    : `Available for ${currency(targetItem.price)}. Market average is ${currency(avgPrice)}.`}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", paddingTop: "10px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <span className="insight-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", borderColor: "rgba(34, 197, 94, 0.3)" }}>
                {isBestPrice ? "⚡ Best Deal in Town" : "Market Standard"}
              </span>
              <span className="insight-badge">
                📦 Stock: {targetItem.quantity ? `${targetItem.quantity} units` : "In Stock"}
              </span>
              <span className="insight-badge">
                ⭐ {Number(targetItem.rating || 4.8).toFixed(1)} Rating
              </span>
            </div>
          </div>

          {/* Price & Primary Action Line */}
          <div className="price-line" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <strong style={{ fontSize: "2rem", color: "var(--text-main)" }}>{currency(targetItem.price)}</strong>
              <span style={{ marginLeft: "10px", color: "var(--text-muted)", fontSize: "0.9rem" }}>{getBudgetType(targetItem.price)}</span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="primary-action"
                onClick={() => addToCompare(targetItem)}
              >
                {isCompared(targetItem.id ?? targetItem.productId) ? "Added to Compare ✓" : "⚖️ Compare Prices"}
              </button>
              <Link to={`/store/${targetItem.storeId || targetItem.id}`} className="ghost-action">
                View Store Details ↗
              </Link>
            </div>
          </div>

          {/* Store Info Definitions */}
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", margin: 0, padding: "18px", background: "var(--bg-section)", borderRadius: "14px", border: "1px solid var(--border)" }}>
            <div>
              <dt style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Retail Store</dt>
              <dd style={{ margin: "4px 0 0", color: "var(--text-main)", fontWeight: 700 }}>
                <Link to={`/store/${targetItem.storeId || targetItem.id}`} style={{ color: "var(--accent)" }}>{targetItem.storeName}</Link>
              </dd>
            </div>
            <div>
              <dt style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Location / Area</dt>
              <dd style={{ margin: "4px 0 0", color: "var(--text-main)", fontWeight: 600 }}>
                {targetItem.fullAddress || [targetItem.marketArea, targetItem.city].filter(Boolean).join(", ")}
              </dd>
            </div>
            <div>
              <dt style={{ color: "var(--text-muted)", fontSize: "0.8rem", textTransform: "uppercase" }}>Store Status</dt>
              <dd style={{ margin: "4px 0 0", color: "var(--success)", fontWeight: 700 }}>
                {targetItem.isOpen !== false ? "🟢 Open Now" : "🔴 Closed"}
              </dd>
            </div>
          </dl>
        </section>

        {/* Real-time Side-by-Side Price Comparison Across Retailers */}
        <section className="panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Price Intelligence</p>
              <h2>Compare Prices Across Nearby Stores</h2>
            </div>
          </div>
          {comparisonStores.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
              {comparisonStores.map((compStore) => {
                const diff = Number(compStore.price || 0) - Number(targetItem.price || 0);
                return (
                  <div
                    key={compStore.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 18px",
                      borderRadius: "14px",
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--text-main)", fontSize: "0.98rem" }}>{compStore.storeName}</strong>
                      <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.84rem" }}>
                        {compStore.marketArea || compStore.city} • ⭐ {Number(compStore.rating || 4.8).toFixed(1)}
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-main)" }}>
                        {currency(compStore.price)}
                      </span>
                      <span
                        className="insight-badge"
                        style={{
                          background: diff <= 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: diff <= 0 ? "#22C55E" : "#EF4444",
                          borderColor: diff <= 0 ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        {diff === 0 ? "Same Price" : diff < 0 ? `₹${Math.abs(diff)} cheaper` : `+₹${diff}`}
                      </span>
                      <Link to={`/store/${compStore.id}`} className="ghost-action" style={{ padding: "6px 12px" }}>
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", margin: "14px 0 0" }}>
              Currently the only local store offering this specific product listing in your area.
            </p>
          )}
        </section>

        {/* Smart Recommendations Engine (People Also Bought, Trending Nearby, Smart Tip) */}
        <SmartRecommendations product={targetItem} />

        {/* Similar Products Grid */}
        <section className="panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Recommendations</p>
              <h2>Similar Products in {targetItem.category || "Category"}</h2>
            </div>
          </div>
          <div className="store-grid" style={{ marginTop: "16px" }}>
            {similarProducts.map((prod) => (
              <StoreCard
                key={prod.productId ? `p-${prod.productId}` : `s-${prod.id}`}
                store={prod}
                saved={savedIds.has(prod.id)}
                onSave={toggleSavedStore}
                visual
              />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

export default ProductDetailsPage;
