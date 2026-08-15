import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { useUI } from "../context/UIContext";
import { formatDistance } from "../utils/distanceUtils";

function ProfilePage() {
  const { user, logout } = useAuth();
  const { openAuthModal } = useUI();
  const { savedStores, compareItems, recentSearches, handleSearch, removeSavedStore, stores } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'history' | 'saved' | 'settings'

  const userRole = user?.role || "customer";
  const myStore = stores.find(
    (s) => String(s.ownerId || s.owner_id) === String(user?.id) || s.ownerName?.toLowerCase().includes(user?.name?.toLowerCase())
  ) || stores[0];

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

          {/* Premium Centered Dark Metric Cards */}
          <div className="profile-stats-grid">
            <div className="profile-metric-card" onClick={() => setActiveTab("saved")} role="button" tabIndex={0}>
              <span className="metric-large-icon">⭐</span>
              <div className="metric-content">
                <strong className="metric-number">{savedStores.length}</strong>
                <span className="metric-label">Saved Stores</span>
              </div>
            </div>

            <div className="profile-metric-card" onClick={() => setActiveTab("history")} role="button" tabIndex={0}>
              <span className="metric-large-icon">🔍</span>
              <div className="metric-content">
                <strong className="metric-number">{recentSearches.length}</strong>
                <span className="metric-label">Recent Searches</span>
              </div>
            </div>

            <div className="profile-metric-card">
              <span className="metric-large-icon">⚖️</span>
              <div className="metric-content">
                <strong className="metric-number">{compareItems.length}</strong>
                <span className="metric-label">Items in Compare</span>
              </div>
            </div>
          </div>
        </section>

        {/* Profile Navigation Tabs & Content */}
        <section className="panel profile-tab-panel">
          <div className="profile-nav-tabs">
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
            {/* Tab 1: Personal Info */}
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

            {/* Tab 2: Search History */}
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

            {/* Tab 3: Saved Stores */}
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

            {/* Tab 4: Settings */}
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
