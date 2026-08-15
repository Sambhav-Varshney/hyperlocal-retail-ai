import { useSearchParams } from "react-router-dom";
import { useData } from "../context/DataContext";

function AdminDashboardPage() {
  const { users, categories, stores } = useData();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "dashboard";
  const setActiveTab = (tab) => {
    if (tab === "dashboard") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const topStores = [
    { name: "D-Mart", rating: 4.7, views: "3,245" },
    { name: "Reliance Smart", rating: 4.5, views: "2,987" },
    { name: "V-Mart", rating: 4.2, views: "2,123" },
    { name: "Easy Day", rating: 4.1, views: "1,876" },
  ];

  return (
    <div className="content-grid two-column-layout" style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", minHeight: "80vh" }}>
      {/* Left Sidebar Menu for Admin */}
      <aside className="panel sidebar-panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "20px" }}>
        <p className="eyebrow" style={{ margin: "0 0 16px", paddingLeft: "8px" }}>Admin Control</p>
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
            className={activeTab === "users" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("users")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            👥 Users ({users.length})
          </button>
          <button
            type="button"
            className={activeTab === "stores" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("stores")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            🏬 Stores ({stores.length})
          </button>
          <button
            type="button"
            className={activeTab === "products" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("products")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            📦 Products
          </button>
          <button
            type="button"
            className={activeTab === "categories" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("categories")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            🏷️ Categories ({categories.length})
          </button>
          <button
            type="button"
            className={activeTab === "analytics" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("analytics")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            🔍 Search Analytics
          </button>
          <button
            type="button"
            className={activeTab === "reports" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("reports")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            📈 Reports
          </button>
          <button
            type="button"
            className={activeTab === "settings" ? "nav-link active" : "nav-link"}
            onClick={() => setActiveTab("settings")}
            style={{ width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: "10px", border: "none", cursor: "pointer" }}
          >
            ⚙️ Settings
          </button>
        </nav>
      </aside>

      {/* Main Admin Content View */}
      <main className="results-column">
        {/* Header */}
        <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "1.8rem" }}>🛡️</span>
                <h1 style={{ margin: 0, fontSize: "1.75rem", color: "var(--text-main)" }}>
                  Admin Dashboard
                </h1>
              </div>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.92rem" }}>
                Platform overview, user management, and system analytics
              </p>
            </div>
          </div>
        </section>

        {/* 4 KPI Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Users</span>
              <span style={{ fontSize: "1.3rem" }}>👥</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              {users.length ? (users.length * 800 + 143).toLocaleString() : "2,543"}
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Total users</span>
          </div>

          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Stores</span>
              <span style={{ fontSize: "1.3rem" }}>🏬</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              {stores.length ? stores.length * 15 + 3 : 78}
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Total stores</span>
          </div>

          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Products</span>
              <span style={{ fontSize: "1.3rem" }}>📦</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              5,432
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Total products</span>
          </div>

          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Searches</span>
              <span style={{ fontSize: "1.3rem" }}>🔍</span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text-main)", display: "block", margin: "8px 0 2px" }}>
              24,876
            </strong>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>This month</span>
          </div>
        </div>

        {/* Dynamic Section based on activeTab */}
        {activeTab === "users" ? (
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.2rem", color: "var(--text-main)" }}>Registered Users ({users.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {users.map((u) => (
                <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  <div>
                    <strong style={{ color: "var(--text-main)" }}>{u.name}</strong>
                    <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>{u.email}</p>
                  </div>
                  <span className="insight-badge" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", borderColor: "rgba(59, 130, 246, 0.3)" }}>
                    {u.role || "customer"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : activeTab === "stores" ? (
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.2rem", color: "var(--text-main)" }}>Platform Stores ({stores.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {stores.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                  <div>
                    <strong style={{ color: "var(--text-main)" }}>{s.storeName}</strong>
                    <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>{s.category || "Retail"} • {s.marketArea || s.city || "Nearby"}</p>
                  </div>
                  <span style={{ color: "#F59E0B", fontWeight: 700 }}>{Number(s.rating || 4.5).toFixed(1)} ⭐</span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          /* Default Dashboard View: 2-Column Panels */
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            {/* Top Performing Stores Panel */}
            <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>Top Performing Stores</h2>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>This month</span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {topStores.map((store, index) => (
                  <div
                    key={index}
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
                      <span style={{ fontSize: "1.3rem" }}>🏬</span>
                      <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{store.name}</strong>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: "0.88rem" }}>{store.rating} ⭐</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{store.views} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Search Trends Graph Panel */}
            <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--text-main)" }}>Search Trends</h2>
                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Jul 2026</span>
              </div>

              <div style={{ height: "180px", width: "100%", position: "relative", marginTop: "10px" }}>
                <svg viewBox="0 0 500 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                  <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                  <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                  {/* Trend Path */}
                  <path
                    d="M 0,90 Q 60,110 120,60 T 240,40 T 360,80 T 500,20 L 500,150 L 0,150 Z"
                    fill="url(#blueGradient)"
                  />
                  <path
                    d="M 0,90 Q 60,110 120,60 T 240,40 T 360,80 T 500,20"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                  />
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "8px" }}>
                  <span>1 Jul</span>
                  <span>8 Jul</span>
                  <span>15 Jul</span>
                  <span>22 Jul</span>
                  <span>29 Jul</span>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboardPage;
