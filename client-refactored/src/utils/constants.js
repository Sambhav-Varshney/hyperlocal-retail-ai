export const BUDGET_OPTIONS = ["All", "Budget", "Mid Range", "Premium"];
export const SORT_OPTIONS = ["Best Match", "Lowest Price", "Highest Price", "Highest Rating", "Nearest Store"];
export const SEARCH_TYPES = ["All", "Products", "Stores", "Categories"];
export const RATING_OPTIONS = [0, 3, 4, 4.5, 5];

export const CUSTOMER_NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Search", path: "/search" },
  { label: "Categories", path: "/categories" },
  { label: "Saved", path: "/saved" },
  { label: "Profile", path: "/profile" },
];

export const SHOP_OWNER_NAV_ITEMS = [
  { label: "Dashboard", path: "/shop/dashboard" },
  { label: "Products", path: "/shop/dashboard?tab=products" },
  { label: "Inventory", path: "/shop/dashboard?tab=inventory" },
  { label: "Analytics", path: "/shop/dashboard?tab=analytics" },
  { label: "Store Settings", path: "/shop/dashboard?tab=settings" },
  { label: "Profile", path: "/profile" },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Users", path: "/admin/dashboard?tab=users" },
  { label: "Stores", path: "/admin/dashboard?tab=stores" },
  { label: "Products", path: "/admin/dashboard?tab=products" },
  { label: "Categories", path: "/admin/dashboard?tab=categories" },
  { label: "Analytics", path: "/admin/dashboard?tab=analytics" },
  { label: "Reports", path: "/admin/dashboard?tab=reports" },
  { label: "Settings", path: "/admin/dashboard?tab=settings" },
  { label: "Profile", path: "/profile" },
];
