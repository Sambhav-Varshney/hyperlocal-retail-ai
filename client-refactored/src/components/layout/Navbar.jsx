import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { CUSTOMER_NAV_ITEMS, SHOP_OWNER_NAV_ITEMS, ADMIN_NAV_ITEMS } from "../../utils/constants";
import CartButton from "../ui/CartButton";

function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role || "customer";

  // Select dedicated portal navigation list based on user role
  let navItems = CUSTOMER_NAV_ITEMS;
  let portalTitle = "Hyperlocal retail intelligence";

  if (userRole === "admin") {
    navItems = ADMIN_NAV_ITEMS;
    portalTitle = "Admin Management Portal";
  } else if (userRole === "shop_owner") {
    navItems = SHOP_OWNER_NAV_ITEMS;
    portalTitle = "Shop Owner Portal";
  }

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

  // Determine active item for sub-query tabs (e.g. /shop/dashboard?tab=products)
  const isItemActive = (itemPath) => {
    const currentFull = `${location.pathname}${location.search}`;
    if (itemPath.includes("?")) {
      return currentFull === itemPath;
    }
    return location.pathname === itemPath && !location.search;
  };

  return (
    <header className="topbar sticky-navbar">
      {/* Brand Logo */}
      <NavLink to={userRole === "admin" ? "/admin/dashboard" : userRole === "shop_owner" ? "/shop/dashboard" : "/"} className="brand-block">
        <div className="brand-mark">BH</div>
        <div>
          <strong>BazaarHub</strong>
          <span style={{ fontSize: "0.72rem", color: userRole !== "customer" ? "var(--primary)" : "var(--text-muted)", fontWeight: userRole !== "customer" ? 650 : 400 }}>
            {portalTitle}
          </span>
        </div>
      </NavLink>

      {/* Role-Specific Portal Navigation Items */}
      <nav className="nav-tabs" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={() => (isItemActive(item.path) ? "nav-link active" : "nav-link")}
          >
            {item.label}
          </NavLink>
        ))}

        {!user ? (
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
          >
            Login
          </NavLink>
        ) : null}
      </nav>

      {/* Right Controls: Cart Button, Animated Theme Slider Toggle & User Avatar */}
      <div className="session-box">
        {userRole === "customer" || !user ? <CartButton /> : null}

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
