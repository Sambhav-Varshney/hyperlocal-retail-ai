import { useParams, Link, useNavigate } from "react-router-dom";
import { useOrders } from "../context/OrderContext";
import { currency } from "../utils/format";

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { orders, reorder } = useOrders();

  const order = orders.find((o) => String(o.id) === String(orderId)) || orders[0];

  const handleShopAgain = () => {
    if (order && reorder(order.id)) {
      navigate("/search");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return { label: "🟢 Completed", color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)" };
      case "READY_FOR_PICKUP":
        return { label: "🛍️ Ready for Pickup", color: "var(--primary)", bg: "rgba(59, 130, 246, 0.15)" };
      case "PREPARING":
        return { label: "📦 Preparing", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" };
      case "ACCEPTED":
        return { label: "✓ Accepted by Store", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" };
      case "CANCELLED":
        return { label: "🔴 Cancelled", color: "#EF4444", bg: "rgba(239, 68, 68, 0.15)" };
      default:
        return { label: "⏳ Order Placed", color: "var(--primary)", bg: "rgba(59, 130, 246, 0.15)" };
    }
  };

  if (!order) {
    return (
      <div className="content-grid single-column-layout" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <section className="panel" style={{ textAlign: "center", padding: "40px 24px" }}>
          <h1>Order Not Found</h1>
          <Link to="/profile" className="primary-action">Go to My Orders ➔</Link>
        </section>
      </div>
    );
  }

  const badge = getStatusBadge(order.orderStatus);

  return (
    <div className="content-grid single-column-layout" style={{ minHeight: "80vh", maxWidth: "720px", margin: "0 auto" }}>
      <div className="results-column">
        {/* Success Header */}
        <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "32px", textAlign: "center", marginBottom: "20px" }}>
          <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "12px" }}>🎉</span>
          <h1 style={{ margin: "0 0 6px", fontSize: "1.75rem", color: "var(--text-main)" }}>
            Demo Order Placed Successfully!
          </h1>
          <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Order ID: <strong style={{ color: "var(--text-main)" }}>{order.id}</strong> • Estimated Pickup: <strong>In 30 Mins</strong>
          </p>

          <span
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              background: badge.bg,
              color: badge.color,
              border: `1px solid ${badge.color}`,
              fontWeight: 800,
              fontSize: "0.9rem",
            }}
          >
            {badge.label}
          </span>
        </section>

        {/* Order Details Panel */}
        <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>Order Information</h2>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              🏪 Store: <strong style={{ color: "var(--text-main)" }}>{order.storeName}</strong>
            </span>
          </div>

          {/* Items List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{item.productName}</strong>
                  <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                    Qty: {item.quantity} × {currency(item.unitPrice)}
                  </p>
                </div>
                <strong style={{ color: "#22C55E" }}>
                  {currency(item.unitPrice * item.quantity)}
                </strong>
              </div>
            ))}
          </div>

          {/* Payment & Totals */}
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", display: "block" }}>Payment Method</span>
              <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{order.paymentMethod}</strong>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.82rem", display: "block" }}>Total Paid / Due</span>
              <strong style={{ color: "#22C55E", fontSize: "1.3rem" }}>{currency(order.total)}</strong>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            className="primary-action"
            style={{ flex: 1, padding: "12px", borderRadius: "12px" }}
            onClick={handleShopAgain}
          >
            Shop Again 🛍️
          </button>

          <Link
            to="/profile"
            className="ghost-action"
            style={{ flex: 1, padding: "12px", borderRadius: "12px", textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-main)" }}
          >
            Track in My Profile ➔
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;
