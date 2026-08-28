import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useOrders } from "../context/OrderContext";
import { currency } from "../utils/format";

function ShopDashboardPage() {
  const { user } = useAuth();
  const { stores } = useData();
  const { getOrdersForRole, updateOrderStatus } = useOrders();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "dashboard";
  const setActiveTab = (tab) => {
    if (tab === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  // Find store owned by current user (or fallback to D-Mart demo store)
  const myStore =
    stores.find(
      (s) =>
        String(s.ownerId || s.owner_id) === String(user?.id) ||
        s.ownerName?.toLowerCase().includes(user?.name?.toLowerCase())
    ) || stores[0];

  const storeName = myStore?.storeName || "D-Mart";

  // Store-specific Orders (Strictly isolated by store ownership)
  const shopOrders = getOrdersForRole("shop_owner", user?.id, storeName);

  // Store Products
  const storeProducts = stores.filter(
    (s) => s.storeName === storeName || String(s.id) === String(myStore?.id)
  );

  const topKeywords = [
    { keyword: "milk", count: 1245 },
    { keyword: "atta", count: 876 },
    { keyword: "bread", count: 654 },
    { keyword: "eggs", count: 543 },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return { label: "🟢 Completed", color: "#22C55E" };
      case "READY_FOR_PICKUP":
        return { label: "🛍️ Ready for Pickup", color: "var(--primary)" };
      case "PREPARING":
        return { label: "📦 Preparing", color: "#F59E0B" };
      case "ACCEPTED":
        return { label: "✓ Accepted", color: "#3B82F6" };
      case "CANCELLED":
        return { label: "🔴 Cancelled", color: "#EF4444" };
      default:
        return { label: "⏳ Placed", color: "var(--primary)" };
    }
  };

  return (
    <div className="content-grid two-column-layout" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", minHeight: "80vh" }}>
      {/* Left Sidebar Menu for Shop Owner */}
      <aside className="panel sidebar-panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px" }}>
        <p className="eyebrow" style={{ margin: "0 0 16px", paddingLeft: "8px" }}>Shop Owner Menu</p>
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <button
            type="button"
            className={activeTab === "dashboard" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("dashboard")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            📊 Dashboard
          </button>
          <button
            type="button"
            className={activeTab === "orders" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("orders")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            🛍️ Store Orders ({shopOrders.length})
          </button>
          <button
            type="button"
            className={activeTab === "products" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("products")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            📦 My Products
          </button>
          <button
            type="button"
            className={activeTab === "inventory" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("inventory")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            🏷️ Price & Stock
          </button>
          <button
            type="button"
            className={activeTab === "analytics" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("analytics")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            📈 Analytics
          </button>
          <button
            type="button"
            className={activeTab === "settings" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("settings")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            ⚙️ Store Settings
          </button>
        </nav>
      </aside>

      {/* Main Content View */}
      <main className="results-column">
        {/* Header */}
        <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.8rem" }}>🏬</span>
                <h1 style={{ margin: 0, fontSize: "1.75rem", color: "var(--text-main)" }}>
                  {storeName} Portal
                </h1>
              </div>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Manage store orders, products, inventory, and fulfillment
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span style={{ padding: "6px 14px", borderRadius: "999px", background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", border: "1px solid rgba(34, 197, 94, 0.3)", fontSize: "0.85rem", fontWeight: 750 }}>
                🟢 Store Open
              </span>
            </div>
          </div>
        </section>

        {/* KPI Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Active Store Orders</span>
              <span style={{ fontSize: "1.3rem" }}>🛍️</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              {shopOrders.length}
            </strong>
            <span style={{ color: "#22C55E", fontSize: "0.8rem", fontWeight: 650 }}>Store Fulfillment Active</span>
          </div>

          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Products</span>
              <span style={{ fontSize: "1.3rem" }}>📦</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              {storeProducts.length ? storeProducts.length * 32 : 128}
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Active products</span>
          </div>

          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Store Rating</span>
              <span style={{ fontSize: "1.3rem" }}>⭐</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              {Number(myStore?.rating || 4.6).toFixed(1)}
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Total 230 ratings</span>
          </div>

          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Store Views</span>
              <span style={{ fontSize: "1.3rem" }}>👁️</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              3,245
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>This month</span>
          </div>
        </div>

        {/* Dynamic Section based on activeTab */}
        {activeTab === "orders" ? (
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <p className="eyebrow">Store Orders Management</p>
                <h2 style={{ margin: 0, fontSize: "1.3rem", color: "var(--text-main)" }}>
                  Fulfillment Orders for {storeName} ({shopOrders.length})
                </h2>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {shopOrders.map((ord) => {
                const badge = getStatusBadge(ord.orderStatus);
                return (
                  <div
                    key={ord.id}
                    style={{
                      padding: "20px",
                      borderRadius: "16px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                      <div>
                        <strong style={{ color: "var(--text-main)", fontSize: "1.05rem" }}>{ord.id}</strong>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "10px" }}>
                          Customer: {ord.customerName} ({ord.customerEmail})
                        </span>
                      </div>
                      <span style={{ fontWeight: 800, color: badge.color, fontSize: "0.88rem" }}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Order items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                      {ord.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", color: "var(--text-main)" }}>
                          <span>• {item.productName} (×{item.quantity})</span>
                          <strong>{currency(item.unitPrice * item.quantity)}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                      <div>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Total Order Value: </span>
                        <strong style={{ color: "#22C55E", fontSize: "1.05rem" }}>{currency(ord.total)}</strong>
                      </div>

                      {/* Merchant Lifecycle Actions */}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {ord.orderStatus === "PLACED" ? (
                          <button
                            type="button"
                            className="primary-action"
                            style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                            onClick={() => updateOrderStatus(ord.id, "ACCEPTED")}
                          >
                            Accept Order ✓
                          </button>
                        ) : null}

                        {ord.orderStatus === "ACCEPTED" ? (
                          <button
                            type="button"
                            className="primary-action"
                            style={{ padding: "6px 12px", fontSize: "0.82rem", background: "#F59E0B" }}
                            onClick={() => updateOrderStatus(ord.id, "PREPARING")}
                          >
                            Mark Preparing 📦
                          </button>
                        ) : null}

                        {ord.orderStatus === "PREPARING" ? (
                          <button
                            type="button"
                            className="primary-action"
                            style={{ padding: "6px 12px", fontSize: "0.82rem", background: "var(--primary)" }}
                            onClick={() => updateOrderStatus(ord.id, "READY_FOR_PICKUP")}
                          >
                            Mark Ready for Pickup 🛍️
                          </button>
                        ) : null}

                        {ord.orderStatus === "READY_FOR_PICKUP" ? (
                          <button
                            type="button"
                            className="primary-action"
                            style={{ padding: "6px 12px", fontSize: "0.82rem", background: "#22C55E" }}
                            onClick={() => updateOrderStatus(ord.id, "COMPLETED")}
                          >
                            Mark Completed 🟢
                          </button>
                        ) : null}

                        {ord.orderStatus !== "COMPLETED" && ord.orderStatus !== "CANCELLED" ? (
                          <button
                            type="button"
                            className="danger-action"
                            style={{ padding: "6px 12px", fontSize: "0.82rem" }}
                            onClick={() => updateOrderStatus(ord.id, "CANCELLED")}
                          >
                            Cancel Order
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : activeTab === "products" || activeTab === "inventory" ? (
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <p className="eyebrow">Inventory Management</p>
                <h2 style={{ margin: 0, fontSize: "1.3rem", color: "var(--text-main)" }}>
                  {activeTab === "inventory" ? "Price & Stock Management" : "My Products List"}
                </h2>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {storeProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 20px",
                    borderRadius: "14px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "1.02rem" }}>{product.productName}</strong>
                    <p style={{ margin: "3px 0 0", color: "var(--text-muted)", fontSize: "0.86rem" }}>
                      Category: {product.category || "General"} • Brand: {product.brand || "Local"}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <span style={{ fontSize: "1.15rem", fontWeight: 850, color: "var(--text-main)" }}>
                      {currency(product.price)}
                    </span>
                    <span className="insight-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", borderColor: "rgba(34, 197, 94, 0.3)" }}>
                      In Stock ({product.quantity || 24} units)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* Default Dashboard View: 2-Column Panels */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Recent Store Orders Panel */}
            <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>Recent Store Orders</h2>
                <span style={{ color: "var(--primary)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 650 }} onClick={() => setActiveTab("orders")}>
                  View all ({shopOrders.length})
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {shopOrders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{ord.id}</strong>
                      <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        {ord.customerName} • {currency(ord.total)}
                      </p>
                    </div>
                    <span className="insight-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", borderColor: "rgba(34, 197, 94, 0.3)" }}>
                      {ord.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Top Search Keywords Panel */}
            <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>Top Search Keywords</h2>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>This month</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {topKeywords.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ color: "var(--text-main)", fontWeight: 650 }}>{item.keyword}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default ShopDashboardPage;
