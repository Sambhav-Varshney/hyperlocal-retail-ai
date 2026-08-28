import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useUI } from "../context/UIContext";
import { formatDistance } from "../utils/distanceUtils";
import { currency } from "../utils/format";
import { calculateProfileInsights } from "../utils/savingsUtils";

function ProfilePage() {
  const { user, logout } = useAuth();
  const { openAuthModal } = useUI();
  const { savedStores, compareItems, recentSearches, handleSearch, removeSavedStore, stores } = useData();
  const { shoppingLists, toggleListItem, removeListItem, deleteShoppingList, cartItemCount, cartSubtotal, openCart } = useCart();
  const { getOrdersForRole, reorder } = useOrders();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders"); // 'orders' | 'lists' | 'insights' | 'info' | 'history' | 'saved' | 'settings'

  const userRole = user?.role || "customer";
  const myStore = stores.find(
    (s) => String(s.ownerId || s.owner_id) === String(user?.id) || s.ownerName?.toLowerCase().includes(user?.name?.toLowerCase())
  ) || stores[0];

  const customerOrders = getOrdersForRole("customer", user?.id);
  const profileInsights = calculateProfileInsights(user, savedStores, recentSearches, compareItems);

  const handleLogout = () => {
    if (logout()) navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "G";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const executeSearchFromHistory = (keyword) => {
    handleSearch(keyword);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleProtectedAction = (message) => {
    openAuthModal("/login", message);
  };

  const handleShopAgainOrder = (orderId) => {
    if (reorder(orderId)) {
      navigate("/search");
    }
  };

  const getRoleBadgeLabel = () => {
    if (!user) return "Guest Mode";
    if (userRole === "admin") return "Administrator";
    if (userRole === "shop_owner") return "Shop Owner";
    return "Customer";
  };

  return (
    <div className="content-grid single-column-layout profile-page-layout">
      <div className="results-column">
        {/* User / Guest Hero Avatar Card */}
        <section className="panel profile-hero-panel">
          <div className="profile-hero-content">
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div className="profile-hero-info">
              <div className="profile-name-row">
                <h1>{user?.name || "Guest Shopper"}</h1>
                <span className="profile-badge blue-verified-badge">
                  {getRoleBadgeLabel()}
                </span>
              </div>
              <p className="profile-email">✉️ {user?.email || "guest@bazaarhub.com"}</p>
            </div>
            {user ? (
              <button type="button" className="danger-action logout-btn red-logout-btn" onClick={handleLogout}>
                Logout 🚪
              </button>
            ) : (
              <Link to="/login" className="primary-action signin-profile-btn">
                Sign In ➔
              </Link>
            )}
          </div>

          {/* Premium Centered Dark Metric Cards with Stage 9 Orders & Savings Summary */}
          <div className="profile-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <div className="profile-metric-card" onClick={() => setActiveTab("orders")} role="button" tabIndex={0} style={{ borderColor: "rgba(34, 197, 94, 0.4)" }}>
              <span className="metric-large-icon">🛍️</span>
              <div className="metric-content">
                <strong className="metric-number" style={{ color: "#22C55E" }}>{customerOrders.length} Orders</strong>
                <span className="metric-label">Order History</span>
              </div>
            </div>

            <div className="profile-metric-card" onClick={openCart} role="button" tabIndex={0} style={{ borderColor: "rgba(59, 130, 246, 0.4)" }}>
              <span className="metric-large-icon">🛒</span>
              <div className="metric-content">
                <strong className="metric-number" style={{ color: "var(--primary)" }}>{cartItemCount} Items</strong>
                <span className="metric-label">Active Cart ({currency(cartSubtotal)})</span>
              </div>
            </div>

            <div className="profile-metric-card" style={{ borderColor: "rgba(34, 197, 94, 0.3)" }}>
              <span className="metric-large-icon">💰</span>
              <div className="metric-content">
                <strong className="metric-number" style={{ color: "#22C55E" }}>{currency(profileInsights.estimatedSavings)}</strong>
                <span className="metric-label">Estimated Savings</span>
              </div>
            </div>

            <div className="profile-metric-card" onClick={() => setActiveTab("saved")} role="button" tabIndex={0}>
              <span className="metric-large-icon">⭐</span>
              <div className="metric-content">
                <strong className="metric-number">{savedStores.length}</strong>
                <span className="metric-label">Saved Stores</span>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Navigation Tabs & Content */}
        <section className="panel profile-tab-panel">
          <div className="profile-nav-tabs">
            <button
              type="button"
              className={activeTab === "orders" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("orders")}
            >
              🛍️ My Orders ({customerOrders.length})
            </button>
            <button
              type="button"
              className={activeTab === "lists" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("lists")}
            >
              📋 Shopping Lists ({shoppingLists.length})
            </button>
            <button
              type="button"
              className={activeTab === "insights" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("insights")}
            >
              💡 Shopping Insights
            </button>
            <button
              type="button"
              className={activeTab === "info" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("info")}
            >
              👤 Personal Info
            </button>
            <button
              type="button"
              className={activeTab === "history" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("history")}
            >
              🔍 Search History ({recentSearches.length})
            </button>
            <button
              type="button"
              className={activeTab === "saved" ? "tab-btn active" : "tab-btn"}
              onClick={() => setActiveTab("saved")}
            >
              ⭐ Saved Stores ({savedStores.length})
            </button>
            <button
              type="button"
              className={activeTab === "settings" ? "tab-btn active" : "tab-btn"}
              onClick={() => {
                if (!user) {
                  handleProtectedAction("Sign in to edit preferences and sync profile settings.");
                } else {
                  setActiveTab("settings");
                }
              }}
            >
              ⚙️ Settings
            </button>
          </div>

          <div className="profile-tab-content">
            {/* Tab 0: Stage 9 Customer Orders & Shop Again */}
            {activeTab === "orders" ? (
              <div className="tab-pane orders-pane">
                <div className="pane-header">
                  <h3>My Orders & Pickup Status ({customerOrders.length})</h3>
                </div>

                {customerOrders.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {customerOrders.map((ord) => (
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
                              🏬 Store: {ord.storeName}
                            </span>
                          </div>
                          <span className="insight-badge" style={{ background: "rgba(34, 197, 94, 0.15)", color: "#22C55E", borderColor: "rgba(34, 197, 94, 0.3)" }}>
                            {ord.orderStatus.replace(/_/g, " ")}
                          </span>
                        </div>

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
                            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Total Paid: </span>
                            <strong style={{ color: "#22C55E", fontSize: "1.05rem" }}>{currency(ord.total)}</strong>
                          </div>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <Link
                              to={`/order-confirmation/${ord.id}`}
                              className="ghost-action"
                              style={{ padding: "6px 12px", fontSize: "0.82rem", background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-main)" }}
                            >
                              Details ➔
                            </Link>
                            <button
                              type="button"
                              className="primary-action"
                              style={{ padding: "6px 14px", fontSize: "0.82rem" }}
                              onClick={() => handleShopAgainOrder(ord.id)}
                            >
                              Shop Again 🛍️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No active or previous orders found.</p>
                )}
              </div>
            ) : null}

            {/* Tab 1: Stage 8 Shopping Lists */}
            {activeTab === "lists" ? (
              <div className="tab-pane lists-pane">
                <div className="pane-header">
                  <h3>Stage 8 — Smart Shopping Lists</h3>
                </div>

                {shoppingLists.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {shoppingLists.map((list) => (
                      <div
                        key={list.id}
                        style={{
                          padding: "20px",
                          borderRadius: "16px",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <strong style={{ fontSize: "1.1rem", color: "var(--text-main)" }}>
                            📋 {list.name}
                          </strong>
                          <button
                            type="button"
                            style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "0.85rem" }}
                            onClick={() => deleteShoppingList(list.id)}
                          >
                            Delete List
                          </button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {list.items.map((item) => (
                            <div
                              key={item.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                background: "var(--bg-card)",
                                border: "1px solid var(--border)",
                              }}
                            >
                              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", color: item.completed ? "var(--text-muted)" : "var(--text-main)", textDecoration: item.completed ? "line-through" : "none" }}>
                                <input
                                  type="checkbox"
                                  checked={item.completed}
                                  onChange={() => toggleListItem(list.id, item.id)}
                                />
                                <span>{item.text}</span>
                              </label>
                              <button
                                type="button"
                                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                                onClick={() => removeListItem(list.id, item.id)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No active shopping lists found.</p>
                )}
              </div>
            ) : null}

            {/* Tab 2: Stage 6 Shopping Insights */}
            {activeTab === "insights" ? (
              <div className="tab-pane insights-pane">
                <div className="pane-header">
                  <h3>Stage 6 — Smart Savings & Shopping Insights</h3>
                </div>
                <div className="info-fields-grid" style={{ marginBottom: "20px" }}>
                  <div className="info-field">
                    <label>Estimated Total Savings</label>
                    <div style={{ color: "#22C55E", fontWeight: 800, fontSize: "1.2rem" }}>
                      {currency(profileInsights.estimatedSavings)}
                    </div>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                      Estimated from your product comparison and store search activity
                    </span>
                  </div>
                  <div className="info-field">
                    <label>Recent Searches Analyzed</label>
                    <div>{recentSearches.length} Search Queries</div>
                  </div>
                  <div className="info-field">
                    <label>Items in Comparison</label>
                    <div>{compareItems.length} Products</div>
                  </div>
                  <div className="info-field">
                    <label>Favorite Local Stores</label>
                    <div>{savedStores.length} Saved Retailers</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "20px",
                    borderRadius: "16px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <strong style={{ color: "var(--text-main)", fontSize: "1rem", display: "block", marginBottom: "8px" }}>
                    💡 Intelligent Shopping Summary
                  </strong>
                  <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.5 }}>
                    BazaarHub monitors product price variance across local stores. Based on your recent activity, choosing the lowest price retailer for your searched items saves an average of <strong>20-25%</strong> per grocery basket.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Tab 3: Personal Info */}
            {activeTab === "info" ? (
              <div className="tab-pane info-pane">
                <div className="pane-header">
                  <h3>Account Information</h3>
                  {!user ? (
                    <button
                      type="button"
                      className="primary-action profile-sync-btn"
                      onClick={() => handleProtectedAction("Sign in to create a permanent account and sync profile data.")}
                    >
                      Sign In to Sync Profile ➔
                    </button>
                  ) : null}
                </div>
                <div className="info-fields-grid">
                  <div className="info-field">
                    <label>Full Name</label>
                    <div>{user?.name || "Guest Shopper"}</div>
                  </div>
                  <div className="info-field">
                    <label>Email Address</label>
                    <div>{user?.email || "guest@bazaarhub.com"}</div>
                  </div>
                  <div className="info-field">
                    <label>Account Role</label>
                    <div style={{ fontWeight: 750, color: userRole === "admin" ? "#A78BFA" : userRole === "shop_owner" ? "var(--primary)" : "var(--text-main)" }}>
                      {getRoleBadgeLabel()}
                    </div>
                  </div>

                  {userRole === "admin" ? (
                    <div className="info-field">
                      <label>Access Level</label>
                      <div style={{ color: "#A78BFA", fontWeight: 750 }}>
                        🛡️ Full Platform Access
                      </div>
                    </div>
                  ) : userRole === "shop_owner" ? (
                    <div className="info-field">
                      <label>My Store</label>
                      <div style={{ color: "var(--primary)", fontWeight: 750 }}>
                        🏪 {myStore?.storeName || "D-Mart"} ({myStore?.marketArea || myStore?.city || "Nearby"})
                      </div>
                    </div>
                  ) : (
                    <div className="info-field">
                      <label>Default Market Location</label>
                      <div>Connaught Place, New Delhi (28.6139, 77.2090)</div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Tab 4: Search History */}
            {activeTab === "history" ? (
              <div className="tab-pane history-pane">
                <h3>Recent Searches ({recentSearches.length})</h3>
                {recentSearches.length > 0 ? (
                  <div className="history-tags-list">
                    {recentSearches.map((keyword, index) => (
                      <div key={index} className="history-tag-card">
                        <span>🔍 {keyword}</span>
                        <button
                          type="button"
                          className="history-search-btn"
                          onClick={() => executeSearchFromHistory(keyword)}
                        >
                          Search Again ↗
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No recent search history found.</p>
                )}
              </div>
            ) : null}

            {/* Tab 5: Saved Stores */}
            {activeTab === "saved" ? (
              <div className="tab-pane saved-pane">
                <div className="pane-header">
                  <h3>Saved Stores ({savedStores.length})</h3>
                  <Link to="/saved" className="ghost-action">View All Saved Page ↗</Link>
                </div>
                {savedStores.length > 0 ? (
                  <div className="profile-saved-list">
                    {savedStores.map((store) => (
                      <div key={store.id} className="profile-saved-item">
                        <div>
                          <strong>{store.storeName}</strong>
                          <p>{store.category || "Store"} • ⭐ {Number(store.rating || 0).toFixed(1)} {store.distance ? `• ${formatDistance(store.distance)}` : ""}</p>
                        </div>
                        <div className="profile-saved-actions">
                          <Link to={`/store/${store.id}`} className="primary-action">Details</Link>
                          <button type="button" className="danger-action remove-btn" onClick={() => removeSavedStore(store.id)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-profile-saved">
                    <p className="empty-text">You haven't saved any stores yet.</p>
                    {!user ? (
                      <button
                        type="button"
                        className="primary-action"
                        style={{ marginTop: "12px" }}
                        onClick={() => handleProtectedAction("Sign in to save stores across device sessions.")}
                      >
                        Sign in to Save Stores
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}

            {/* Tab 6: Settings */}
            {activeTab === "settings" && user ? (
              <div className="tab-pane settings-pane">
                <h3>Preferences & Settings</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <div>
                      <strong>Price Alert Notifications</strong>
                      <p>Receive notifications when saved items drop in price nearby.</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>

                  <div className="setting-item">
                    <div>
                      <strong>Automatic Geolocation</strong>
                      <p>Automatically compute store distances using your device location.</p>
                    </div>
                    <input type="checkbox" defaultChecked />
                  </div>

                  <div className="setting-item">
                    <div>
                      <strong>Compact Layout View</strong>
                      <p>Use compact grid density for search result cards.</p>
                    </div>
                    <input type="checkbox" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;
