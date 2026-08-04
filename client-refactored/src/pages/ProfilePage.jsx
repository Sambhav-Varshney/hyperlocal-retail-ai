import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { formatDistance } from "../utils/distanceUtils";

function ProfilePage() {
  const { user, logout } = useAuth();
  const { savedStores, compareItems, recentSearches, handleSearch, removeSavedStore } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'history' | 'saved' | 'settings'

  const handleLogout = () => {
    if (logout()) navigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
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

  return (
    <div className="content-grid single-column-layout profile-page-layout">
      <div className="results-column">
        {/* User Hero Avatar Card */}
        <section className="panel profile-hero-panel">
          <div className="profile-hero-content">
            <div className="profile-avatar">{getInitials(user?.name)}</div>
            <div className="profile-hero-info">
              <div className="profile-name-row">
                <h1>{user?.name || "Guest User"}</h1>
                <span className="profile-badge">{user?.role === "admin" ? "Admin Account" : "Verified Shopper"}</span>
              </div>
              <p className="profile-email">✉️ {user?.email || "guest@bazaarhub.com"}</p>
            </div>
            <button type="button" className="ghost-action logout-btn" onClick={handleLogout}>
              Logout 🚪
            </button>
          </div>

          {/* Quick Metrics Cards */}
          <div className="profile-stats-grid">
            <div className="stat-card" onClick={() => setActiveTab("saved")} style={{ cursor: "pointer" }}>
              <span className="stat-icon">⭐</span>
              <div className="stat-copy">
                <strong>{savedStores.length}</strong>
                <span>Saved Stores</span>
              </div>
            </div>

            <div className="stat-card" onClick={() => setActiveTab("history")} style={{ cursor: "pointer" }}>
              <span className="stat-icon">🔍</span>
              <div className="stat-copy">
                <strong>{recentSearches.length}</strong>
                <span>Recent Searches</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">⚖️</span>
              <div className="stat-copy">
                <strong>{compareItems.length}</strong>
                <span>Items in Compare</span>
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
              onClick={() => setActiveTab("settings")}
            >
              ⚙️ Settings
            </button>
          </div>

          <div className="profile-tab-content">
            {/* Tab 1: Personal Info */}
            {activeTab === "info" ? (
              <div className="tab-pane info-pane">
                <h3>Account Information</h3>
                <div className="info-fields-grid">
                  <div className="info-field">
                    <label>Full Name</label>
                    <div>{user?.name || "Guest User"}</div>
                  </div>
                  <div className="info-field">
                    <label>Email Address</label>
                    <div>{user?.email || "guest@bazaarhub.com"}</div>
                  </div>
                  <div className="info-field">
                    <label>Account Type</label>
                    <div>{user?.role === "admin" ? "Administrator" : "Standard Shopper"}</div>
                  </div>
                  <div className="info-field">
                    <label>Default Market Location</label>
                    <div>Connaught Place, New Delhi (28.6139, 77.2090)</div>
                  </div>
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
                          <button type="button" className="ghost-action" onClick={() => removeSavedStore(store.id)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">You haven't saved any stores yet.</p>
                )}
              </div>
            ) : null}

            {/* Tab 4: Settings */}
            {activeTab === "settings" ? (
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
