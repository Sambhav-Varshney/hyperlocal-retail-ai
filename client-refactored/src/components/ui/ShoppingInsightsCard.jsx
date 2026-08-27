import { getShoppingInsights } from "../../utils/savingsUtils";

function ShoppingInsightsCard({ items = [] }) {
  const insights = getShoppingInsights(items);

  if (!insights || insights.length === 0) return null;

  return (
    <div
      className="panel"
      aria-label="Shopping Insights"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "20px 24px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <span style={{ fontSize: "1.3rem" }}>💡</span>
        <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-main)" }}>
          Shopping Insights
        </h3>
      </div>

      <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {insights.map((text, idx) => (
          <li
            key={idx}
            style={{
              color: text.includes("save") ? "#22C55E" : "var(--text-main)",
              fontSize: "0.9rem",
              lineHeight: 1.45,
              fontWeight: text.includes("save") ? 650 : 400,
            }}
          >
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShoppingInsightsCard;
