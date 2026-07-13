import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { NAV_ITEMS } from "../../utils/constants";

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
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

  return (
    <header className="topbar">
      <div className="brand-block">
        <div className="brand-mark">BH</div>
        <div>
          <strong>BazaarHub</strong>
          <span>Hyperlocal retail intelligence</span>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Primary navigation">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="session-box">
        <span>{user ? user.name : "Guest"}</span>
        {user ? <button onClick={handleLogout}>Logout</button> : null}
      </div>
    </header>
  );
}

export default Navbar;
