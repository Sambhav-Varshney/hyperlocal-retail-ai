import { currency } from "../../utils/format";
import { formatDistance } from "../../utils/distanceUtils";
import { calculateSavings } from "../../utils/savingsUtils";

function SmartSavingsCard({ items = [] }) {
  const summary = calculateSavings(items);

  if (!summary.hasSufficientData) {
    return (
      <div
        className="panel"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          padding: "20px 24px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.3rem" }}>💡</span>
          <div>
            <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>Smart Savings Summary</strong>
            <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.86rem" }}>
              {summary.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className="panel"
      aria-label="Smart Savings Summary"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "24px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>💰</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>Smart Savings Summary</h2>
            <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
              Compared {summary.count} store options nearby
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              padding: "6px 14px",
              borderRadius: "999px",
              background: "rgba(34, 197, 94, 0.15)",
              color: "#22C55E",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              fontWeight: 800,
              fontSize: "0.88rem",
            }}
          >
            Save {currency(summary.savings)} ({summary.savingsPercent}%)
          </span>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
        }}
      >
        {/* Cheapest Price */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Cheapest Option</span>
          <strong style={{ fontSize: "1.3rem", color: "#22C55E", display: "block", margin: "4px 0 2px" }}>
            {currency(summary.minPrice)}
          </strong>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            {summary.cheapestItem?.storeName || "Best Deal"}
          </span>
        </div>

        {/* Highest Price */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Highest Option</span>
          <strong style={{ fontSize: "1.3rem", color: "var(--text-main)", display: "block", margin: "4px 0 2px" }}>
            {currency(summary.maxPrice)}
          </strong>
          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
            {summary.highestItem?.storeName || "Highest Price"}
          </span>
        </div>

        {/* Potential Savings */}
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "14px",
            background: "rgba(59, 130, 246, 0.1)",
            border: "1px solid rgba(59, 130, 246, 0.25)",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Potential Savings</span>
          <strong style={{ fontSize: "1.3rem", color: "var(--primary)", display: "block", margin: "4px 0 2px" }}>
            {currency(summary.savings)}
          </strong>
          <span style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 650 }}>
            {summary.savingsPercent}% lower than max
          </span>
        </div>

        {/* Best Value Pick */}
        {summary.bestValueItem ? (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "14px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Best Value Pick</span>
            <strong style={{ fontSize: "0.98rem", color: "var(--text-main)", display: "block", margin: "6px 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {summary.bestValueItem.productName || summary.bestValueItem.storeName}
            </strong>
            <span style={{ color: "#F59E0B", fontSize: "0.78rem", fontWeight: 650 }}>
              ⭐ {Number(summary.bestValueItem.rating || 4.5).toFixed(1)} Rating • {currency(summary.bestValueItem.price)}
            </span>
          </div>
        ) : null}

        {/* Nearest Option */}
        {summary.nearestItem && typeof summary.nearestItem.distance === "number" ? (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "14px",
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "block" }}>Nearest Store</span>
            <strong style={{ fontSize: "0.98rem", color: "var(--text-main)", display: "block", margin: "6px 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {summary.nearestItem.storeName}
            </strong>
            <span style={{ color: "var(--primary)", fontSize: "0.78rem", fontWeight: 650 }}>
              📍 {formatDistance(summary.nearestItem.distance)} away
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default SmartSavingsCard;
