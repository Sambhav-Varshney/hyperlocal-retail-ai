import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { currency } from "../utils/format";

function ShopDashboardPage() {
  const { user } = useAuth();
  const { stores } = useData();
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

  // Store Products
  const storeProducts = stores.filter(
    (s) => s.storeName === myStore?.storeName || String(s.id) === String(myStore?.id)
  );

  const topKeywords = [
    { keyword: "milk", count: 1245 },
    { keyword: "atta", count: 876 },
    { keyword: "bread", count: 654 },
    { keyword: "eggs", count: 543 },
  ];

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
            className={activeTab === "products" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("products")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            📦 My Products
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", opacity: 0.6 }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>🛍️ My Orders</span>
            <span className="insight-badge" style={{ fontSize: "0.7rem", padding: "2px 6px" }}>Soon</span>
          </div>
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
                  {myStore?.storeName || "D-Mart"} Portal
                </h1>
              </div>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Manage your store products, inventory, and business performance
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
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Total Products</span>
              <span style={{ fontSize: "1.3rem" }}>📦</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              {storeProducts.length ? storeProducts.length * 32 : 128}
            </strong>
            <span style={{ color: "#22C55E", fontSize: "0.8rem", fontWeight: 650 }}>Active products</span>
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

          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Searches</span>
              <span style={{ fontSize: "1.3rem" }}>🔍</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              1,876
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>This month</span>
          </div>
        </div>

        {/* Dynamic Section based on activeTab */}
        {activeTab === "products" || activeTab === "inventory" ? (
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
            {/* Recent Products Panel */}
            <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>Recent Products</h2>
                <span style={{ color: "var(--primary)", fontSize: "0.85rem", cursor: "pointer", fontWeight: 650 }} onClick={() => setActiveTab("products")}>
                  View all
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {storeProducts.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
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
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "1.4rem" }}>🥛</span>
                      <div>
                        <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{product.productName}</strong>
                        <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                          {currency(product.price)}
                        </p>
                      </div>
                    </div>
                    <span className="insight-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", borderColor: "rgba(34, 197, 94, 0.3)" }}>
                      In Stock
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
