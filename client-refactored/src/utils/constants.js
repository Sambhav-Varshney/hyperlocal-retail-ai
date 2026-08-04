export const BUDGET_OPTIONS = ["All", "Budget", "Mid Range", "Premium"];
export const SORT_OPTIONS = ["Best Match", "Lowest Price", "Highest Price", "Highest Rating", "Nearest Store"];
export const SEARCH_TYPES = ["All", "Products", "Stores", "Categories"];
export const RATING_OPTIONS = [0, 3, 4, 4.5, 5];

// Central nav definition used by the Navbar. `auth` controls visibility:
// "public"  -> always visible
// "guest"   -> only visible when logged out
// "user"    -> only visible when logged in
// "admin"   -> only visible for admin users
export const NAV_ITEMS = [
  { label: "Home", path: "/", auth: "public" },
  { label: "Search", path: "/search", auth: "public" },
  { label: "Categories", path: "/categories", auth: "public" },
  { label: "Saved", path: "/saved", auth: "public" },
  { label: "Profile", path: "/profile", auth: "public" },
  { label: "Dashboard", path: "/dashboard", auth: "user" },
  { label: "Admin", path: "/admin", auth: "admin" },
  { label: "Login", path: "/login", auth: "guest" },
];
