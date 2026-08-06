import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { NAV_ITEMS } from "../../utils/constants";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.auth === "public") return true;
    if (item.auth === "guest") return !user;
    if (item.auth === "user") return Boolean(user);
    if (item.auth === "admin") return isAdmin;
    return false;
  });

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

  return (
    <header className="topbar sticky-navbar">
      {/* Brand Logo */}
      <NavLink to="/" className="brand-block">
        <div className="brand-mark">BH</div>
        <div>
          <strong>BazaarHub</strong>
          <span>Hyperlocal retail intelligence</span>
        </div>
      </NavLink>

      {/* Central Navigation Items */}
      <nav className="nav-tabs" aria-label="Primary navigation">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Right Controls: Animated Theme Slider Toggle & User Avatar */}
      <div className="session-box">
        <div className="theme-toggle-wrap">
          <button
            type="button"
            className={`theme-slider-switch ${isDark ? "dark" : "light"}`}
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Light/Dark Theme"
          >
            <span className="slider-track">
              <span className="slider-icon light-icon" aria-hidden="true">☀️</span>
              <span className="slider-icon dark-icon" aria-hidden="true">🌙</span>
              <span className="slider-thumb" />
            </span>
          </button>
        </div>

        <NavLink to="/profile" className="profile-nav-link" title="User Profile">
          <span className="profile-avatar-badge">{user ? getInitials(user.name) : "👤"}</span>
          <span className="profile-name-text">{user ? user.name : "Guest"}</span>
        </NavLink>

        {user ? (
          <button type="button" className="ghost-action logout-nav-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
