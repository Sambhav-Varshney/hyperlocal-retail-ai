import { currency } from "../../utils/format";

/**
 * Extensible PriceInsightCard component prepared for Stage 7 AI Shopping Agent.
 * Operates on real available market data without inventing fake historical charts.
 */
function PriceInsightCard({ product = null, store = null, items = [] }) {
  if (!product && !store && items.length === 0) return null;

  const targetItem = product || store || items[0];
  const price = Number(targetItem?.price || 0);

  if (price <= 0) return null;

  const validPrices = items.map((i) => Number(i.price)).filter((p) => p > 0);
  const minPrice = validPrices.length ? Math.min(...validPrices) : price;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : price;

  const isBestPrice = price <= minPrice;

  return (
    <div
      className="panel"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "18px 22px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
            Price Trend & Insight
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
            <strong style={{ fontSize: "1.25rem", color: "var(--text-main)" }}>
              {currency(price)}
            </strong>
            {validPrices.length > 1 ? (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                (Market Range: {currency(minPrice)} — {currency(maxPrice)})
              </span>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "999px",
              background: isBestPrice ? "rgba(34, 197, 94, 0.15)" : "rgba(59, 130, 246, 0.15)",
              color: isBestPrice ? "#22C55E" : "var(--primary)",
              border: `1px solid ${isBestPrice ? "rgba(34, 197, 94, 0.3)" : "rgba(59, 130, 246, 0.3)"}`,
              fontSize: "0.82rem",
              fontWeight: 700,
            }}
          >
            {isBestPrice ? "🟢 Best Local Price" : "🔵 Competitive Market Price"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default PriceInsightCard;
