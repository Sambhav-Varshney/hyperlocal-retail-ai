import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import "./theme.css";
import { API_BASE_URL, api } from "./services/api";
import PageLayout from "./components/layout/PageLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import CategoriesPage from "./pages/CategoriesPage";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AuthPageShell from "./pages/AuthPageShell";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import StoreDetailsPage from "./pages/StoreDetailsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ComparePage from "./pages/ComparePage";

const budgetOptions = ["All", "Budget", "Mid Range", "Premium"];
const sortOptions = ["Best Match", "Price Low", "Rating High", "Nearby"];
const searchTypes = ["All", "Products", "Stores", "Categories"];
const ratingOptions = [0, 3, 4, 4.5, 5];

function safeJSONParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function currency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getBudgetType(price) {
  const amount = Number(price || 0);
  if (amount <= 250) return "Budget";
  if (amount <= 1000) return "Mid Range";
  return "Premium";
}

function hasOffer(store) {
  if (!store.price) return false;
  return Number(store.price) <= 550 || Number(store.rating || 0) >= 4.3;
}

function getAIMetrics(store, bestPrice) {
  const price = Number(store.price || 0);
  const saving = bestPrice && price > bestPrice ? price - bestPrice : 0;

  return {
    recommendation: price <= 500 && store.rating >= 4.2 ? 'Smart Match' : 'Best Value',
    saveEstimate: saving ? `₹${saving.toFixed(0)} estimated savings` : 'No savings',
    matchScore: Math.min(100, Math.round((store.rating || 0) * 18 + (550 - price) / 10)),
  };
}

function distanceKm(store, location) {
  if (!location || !store.latitude || !store.longitude) return null;

  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const lat1 = toRad(location.lat);
  const deltaLat = toRad(Number(store.latitude) - location.lat);
  const deltaLon = toRad(Number(store.longitude) - location.lon);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(toRad(store.latitude)) * Math.sin(deltaLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Toast({ toast, onClose }) {
  if (!toast) return null;

  return (
    <button className={`toast toast-${toast.type}`} onClick={onClose}>
      {toast.message}
    </button>
  );
}

function AuthRequiredModal({ open, target, message, onClose }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <h3>Sign in required</h3>
          <button className="ghost-action" onClick={onClose}>Close</button>
        </div>
        <p>{message}</p>
        <div className="modal-actions">
          <a href={target} className="primary-action">Login to continue</a>
          <button className="ghost-action" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function TopBar({ activeView, setActiveView, user, onLogout, navItems }) {
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
        {navItems.map((item) => (
          <button
            key={item}
            className={activeView === item ? "active" : ""}
            onClick={() => setActiveView(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="session-box">
        <span>{user ? user.name : "Guest"}</span>
        {user ? <button onClick={onLogout}>Logout</button> : null}
      </div>
    </header>
  );
}

function AuthPanel({ user, onLogin, onRegister, loading }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    if (mode === "login") {
      onLogin({ email: form.email, password: form.password });
      return;
    }
    onRegister(form);
  };

  if (user) {
    return (
      <section className="panel auth-panel">
        <div>
          <p className="eyebrow">Signed in</p>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
        <div className="trust-list">
          <span>JWT session ready</span>
          <span>Saved stores enabled</span>
          <span>Recent searches tracked</span>
        </div>
      </section>
    );
  }

  return (
    <section className="panel auth-panel">
      <div>
        <p className="eyebrow">Authentication</p>
        <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>
      </div>
      <div className="segmented">
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
          Login
        </button>
        <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>
          Register
        </button>
      </div>
      <form className="form-grid" onSubmit={submit}>
        {mode === "register" ? (
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Full name"
            required
          />
        ) : null}
        <input
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          placeholder="Email address"
          type="email"
          required
        />
        <input
          value={form.password}
          onChange={(event) => update("password", event.target.value)}
          placeholder="Password"
          type="password"
          required
        />
        {mode === "register" ? (
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            placeholder="Phone number"
          />
        ) : null}
        <button className="primary-action" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>
      </form>
    </section>
  );
}

function SearchPanel({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  budget,
  setBudget,
  sortBy,
  setSortBy,
  categories,
  onSearch,
  onUseLocation,
  location,
  loading,
}) {
  return (
    <section className="panel search-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Discovery</p>
          <h1>Find nearby stores, compare prices, decide faster.</h1>
        </div>
        <button className="ghost-action" onClick={onUseLocation}>
          {location ? "Location active" : "Use my location"}
        </button>
      </div>

      <div className="search-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch();
          }}
          placeholder="Search products, stores, or categories"
        />
        <button className="primary-action" onClick={onSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="filter-grid">
        <label>
          Category
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="All">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Budget
          <select value={budget} onChange={(event) => setBudget(event.target.value)}>
            {budgetOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

function StoreCard({ store, distance, bestDeal, saved, onSave, onSelect }) {
  return (
    <article className="store-card">
      <div className="store-card-top">
        <div>
          <p className="store-category">{store.category || "Local Store"}</p>
          <h3>{store.storeName}</h3>
          <span>{store.productName}</span>
        </div>
        <button className={saved ? "save-button saved" : "save-button"} onClick={() => onSave(store)}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="price-line">
        <strong>{currency(store.price)}</strong>
        {bestDeal ? <span>Best deal</span> : null}
      </div>
      <div className="meta-grid">
        <span>Rating {Number(store.rating || 0).toFixed(1)}</span>
        <span>{getBudgetType(store.price)}</span>
        <span>{distance ? `${distance.toFixed(1)} km` : "Distance N/A"}</span>
      </div>
      <p className="address-line">{store.fullAddress || [store.marketArea, store.city, store.state].filter(Boolean).join(", ")}</p>
      <div className="card-actions">
        <button onClick={() => onSelect(store)}>Details</button>
        {store.latitude && store.longitude ? (
          <a href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`} target="_blank" rel="noreferrer">
            Map
          </a>
        ) : null}
      </div>
    </article>
  );
}

function StoreDetails({ store, onClose }) {
  if (!store) return null;

  return (
    <aside className="details-panel">
      <div className="details-header">
        <div>
          <p className="eyebrow">Store details</p>
          <h2>{store.storeName}</h2>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
      <dl>
        <div>
          <dt>Product</dt>
          <dd>{store.productName}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>{currency(store.price)}</dd>
        </div>
        <div>
          <dt>Rating</dt>
          <dd>{Number(store.rating || 0).toFixed(1)} from {store.totalReviews || 0} reviews</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>{store.phone || "Not available"}</dd>
        </div>
        <div>
          <dt>Address</dt>
          <dd>{store.fullAddress || [store.shopNumber, store.street, store.marketArea, store.city].filter(Boolean).join(", ")}</dd>
        </div>
      </dl>
    </aside>
  );
}

function MapPanel({ stores, location }) {
  const visibleStores = stores.slice(0, 8);

  return (
    <section className="panel map-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Nearby map</p>
          <h2>Store coverage</h2>
        </div>
        <span>{location ? "GPS enabled" : "Manual discovery"}</span>
      </div>
      <div className="map-canvas">
        {visibleStores.map((store, index) => (
          <button
            key={store.id}
            className="map-pin"
            style={{
              left: `${18 + ((index * 17) % 64)}%`,
              top: `${22 + ((index * 23) % 54)}%`,
            }}
            title={store.storeName}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <p className="map-note">Open each store card's Map link for Google Maps navigation.</p>
    </section>
  );
}

function RecommendationPanel({ stores }) {
  const recommendations = stores
    .slice()
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))
    .slice(0, 3);

  return (
    <section className="panel recommendations">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">AI recommendation UI</p>
          <h2>Smart picks</h2>
        </div>
      </div>
      {recommendations.length ? (
        recommendations.map((store) => (
          <div className="recommendation-item" key={store.id}>
            <strong>{store.storeName}</strong>
            <span>{currency(store.price)} | {Number(store.rating || 0).toFixed(1)} rating</span>
          </div>
        ))
      ) : (
        <p className="empty-text">Search stores to generate recommendations.</p>
      )}
    </section>
  );
}

function Metrics({ stores, categories, users, searchLogs }) {
  const items = [
    ["Stores", stores.length],
    ["Categories", categories.length],
    ["Users", users.length],
    ["Searches", searchLogs.length],
  ];

  return (
    <section className="metrics-grid">
      {items.map(([label, value]) => (
        <div className="metric-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function AdminPage({ users, searchLogs, apiBaseUrl }) {
  return (
    <section className="two-column">
      <div className="panel">
        <p className="eyebrow">Admin dashboard</p>
        <h2>System overview</h2>
        <div className="profile-list">
          <span>API: {apiBaseUrl}</span>
          <span>Total users: {users.length}</span>
          <span>Total logged searches: {searchLogs.length}</span>
        </div>
      </div>
      <div className="panel table-panel">
        <p className="eyebrow">Latest search logs</p>
        <table>
          <thead>
            <tr>
              <th>Keyword</th>
              <th>City</th>
              <th>Results</th>
            </tr>
          </thead>
          <tbody>
            {searchLogs.slice(0, 8).map((log) => (
              <tr key={log.id}>
                <td>{log.keyword}</td>
                <td>{log.city || "-"}</td>
                <td>{log.resultsFound}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function App() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchLogs, setSearchLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [budget, setBudget] = useState("All");
  const [sortBy, setSortBy] = useState("Best Match");
  const [showOpenNow, setShowOpenNow] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [compareStores, setCompareStores] = useState(() => safeJSONParse(localStorage.getItem("compareStores")) || []);
  const [savedStores, setSavedStores] = useState(() => safeJSONParse(localStorage.getItem("savedStores")) || []);
  const [savedProducts, setSavedProducts] = useState(() => safeJSONParse(localStorage.getItem("savedProducts")) || []);
  const [savedComparisons, setSavedComparisons] = useState(() => safeJSONParse(localStorage.getItem("savedComparisons")) || []);
  const [recentSearches, setRecentSearches] = useState(() => safeJSONParse(localStorage.getItem("recentSearches")) || []);
  const [recentViews, setRecentViews] = useState(() => safeJSONParse(localStorage.getItem("recentViews")) || []);
  const [user, setUser] = useState(() => safeJSONParse(localStorage.getItem("authUser")) || null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTarget, setAuthModalTarget] = useState("/login");
  const [authModalMessage, setAuthModalMessage] = useState("Please sign in to continue.");
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const openAuthModal = (target = "/login", message = "Please sign in to continue.") => {
    setAuthModalTarget(target);
    setAuthModalMessage(message);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryData, storeData, userData, logData] = await Promise.all([
        api.getCategories(),
        api.getStores(),
        api.getUsers(),
        api.getSearchLogs(),
      ]);
      setCategories(categoryData || []);
      setStores(storeData || []);
      setUsers(userData || []);
      setSearchLogs(logData || []);
    } catch (error) {
      showToast(error.message || "Unable to load dashboard data", "error");
      // leave empty; frontend will show empty states when backend data is not available
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const isAdmin = user?.role === "admin";
  const navItems = ["Dashboard", "Search"];
  if (user) {
    navItems.push('Saved', 'Profile');
  } else {
    navItems.push('Login');
  }
  if (isAdmin) navItems.push('Admin');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      showToast('Session expired. Please login again.', 'error');
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  useEffect(() => {
    localStorage.setItem("savedStores", JSON.stringify(savedStores));
  }, [savedStores]);

  useEffect(() => {
    localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
  }, [savedProducts]);

  useEffect(() => {
    localStorage.setItem("savedComparisons", JSON.stringify(savedComparisons));
  }, [savedComparisons]);

  useEffect(() => {
    localStorage.setItem("compareStores", JSON.stringify(compareStores));
  }, [compareStores]);

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem("recentViews", JSON.stringify(recentViews));
  }, [recentViews]);

  const filteredStores = useMemo(() => {
    const withDistance = stores.map((store) => ({
      ...store,
      distance: distanceKm(store, location),
      hasOffer: hasOffer(store),
    }));

    const term = search.trim().toLowerCase();
    const matched = withDistance
      .filter((store) => selectedCategory === "All" || store.category === selectedCategory)
      .filter((store) => budget === "All" || getBudgetType(store.price) === budget)
      .filter((store) => minRating === 0 || Number(store.rating || 0) >= minRating)
      .filter((store) => !showOpenNow || store.isOpen)
      .filter((store) => !showOffers || store.hasOffer)
      .filter((store) => {
        if (!term) return true;
        if (searchType === "Products") return store.productName?.toLowerCase().includes(term);
        if (searchType === "Stores") return store.storeName?.toLowerCase().includes(term);
        if (searchType === "Categories") return store.category?.toLowerCase().includes(term);
        return (
          store.productName?.toLowerCase().includes(term) ||
          store.storeName?.toLowerCase().includes(term) ||
          store.category?.toLowerCase().includes(term)
        );
      })
      .map((store) => {
        if (!term) return { ...store, matchReason: null };
        const p = store.productName?.toLowerCase() || '';
        const c = store.category?.toLowerCase() || '';
        const s = store.storeName?.toLowerCase() || '';
        if (p.includes(term)) return { ...store, matchReason: 'Matched Product' };
        if (c.includes(term)) return { ...store, matchReason: 'Matched Category' };
        if (s.includes(term)) return { ...store, matchReason: 'Matched Store' };
        return { ...store, matchReason: 'Partial Match' };
      })
      .sort((a, b) => {
        if (sortBy === "Price Low") return Number(a.price || 0) - Number(b.price || 0);
        if (sortBy === "Rating High") return Number(b.rating || 0) - Number(a.rating || 0);
        if (sortBy === "Nearby") return (a.distance ?? 99999) - (b.distance ?? 99999);
        return Number(a.price || 0) - Number(b.price || 0);
      });
  }, [stores, selectedCategory, budget, sortBy, location, search, searchType, showOpenNow, showOffers, minRating]);

  const bestPrice = filteredStores.length ? Math.min(...filteredStores.map((store) => Number(store.price || 0))) : null;

  const handleSearch = async () => {
    setLoading(true);
    try {
      const storeData = await api.getStores(search.trim());
      setStores(storeData || []);

      if (search.trim()) {
        setRecentSearches((current) => [search.trim(), ...current.filter((item) => item !== search.trim())].slice(0, 8));
        await api.createSearchLog({
          userId: user?.id,
          keyword: search.trim(),
          city: location?.city || "",
          state: location?.state || "",
          latitude: location?.lat,
          longitude: location?.lon,
          resultsFound: storeData?.length || 0,
        });
      }

      showToast(`Found ${storeData?.length || 0} matching stores`);
    } catch (error) {
      showToast(error.message || "Search failed", "error");
      // on search failure keep previous stores or empty
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCompare = (store) => {
    setCompareStores((current) => {
      if (current.some((item) => item.id === store.id)) return current;
      if (current.length >= 4) {
        showToast('You can compare up to 4 stores only', 'error');
        return current;
      }
      return [...current, store];
    });
  };

  const removeFromCompare = (storeId) => {
    setCompareStores((current) => current.filter((item) => item.id !== storeId));
  };

  const toggleSavedStore = (store) => {
    setSavedStores((current) => {
      const exists = current.some((item) => item.id === store.id);
      if (exists) return current.filter((item) => item.id !== store.id);
      return [store, ...current];
    });
  };

  const saveComparison = (comparison) => {
    if (!user) {
      openAuthModal('/login', 'Login to save this comparison and continue.');
      return;
    }
    setSavedComparisons((current) => [comparison, ...current]);
    showToast('Comparison saved');
  };

  const saveProduct = (product) => {
    setSavedProducts((current) => {
      if (current.some((item) => item.id === product.id)) return current;
      return [product, ...current];
    });
    showToast('Product saved');
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported in this browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setSortBy("Nearby");
        showToast("Location enabled");
      },
      () => showToast("Location permission was not granted", "error")
    );
  };

  const handleLogin = async (payload) => {
    setAuthLoading(true);
    try {
      const auth = await api.login(payload);
      setUser(auth.user);
      localStorage.setItem("authUser", JSON.stringify(auth.user));
      localStorage.setItem("authToken", auth.token);
      showToast("Logged in successfully");
      setActiveView('Dashboard');
    } catch (error) {
      showToast(error.message || "Login failed", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setAuthLoading(true);
    try {
      await api.register(payload);
      const auth = await api.login({ email: payload.email, password: payload.password });
      setUser(auth.user);
      localStorage.setItem("authUser", JSON.stringify(auth.user));
      localStorage.setItem("authToken", auth.token);
      showToast("Account created and logged in");
      setActiveView('Dashboard');
    } catch (error) {
      showToast(error.message || "Registration failed", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    showToast("Logged out");

    if (activeView === "Saved" || activeView === "Profile" || activeView === "Admin") {
      setActiveView("Dashboard");
    }
  };

  const handleSetActiveView = (view) => {
    if (view === 'Login') view = 'Profile';
    if (!user && (view === "Saved" || view === "Profile" || view === "Admin")) {
      showToast("Please login to access this section", "error");
      setActiveView("Profile");
      return;
    }

    if (view === "Admin" && !isAdmin) {
      showToast("Admin access is restricted", "error");
      setActiveView("Dashboard");
      return;
    }

    setActiveView(view);
  };

  const savedIds = new Set(savedStores.map((store) => store.id));
  const visibleStores = activeView === "Saved" ? savedStores : filteredStores;

  return (
    <Router>
      <PageLayout user={user} onLogout={handleLogout} isAdmin={isAdmin} onAuthRequired={openAuthModal}>
        <Toast toast={toast} onClose={() => setToast(null)} />
        <AuthRequiredModal open={authModalOpen} target={authModalTarget} message={authModalMessage} onClose={closeAuthModal} />
        <Routes>
              <Route path="/" element={user ? <HomePage categories={categories} stores={stores} user={user} /> : <Navigate to="/login" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user}>
                <DashboardPage
                  search={search}
                  setSearch={setSearch}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  budget={budget}
                  setBudget={setBudget}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  categories={categories}
                  onSearch={handleSearch}
                  onUseLocation={handleUseLocation}
                  location={location}
                  loading={loading}
                  stores={stores}
                  categories={categories}
                  users={users}
                  searchLogs={searchLogs}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={<SearchPage
              search={search}
              setSearch={setSearch}
              searchType={searchType}
              setSearchType={setSearchType}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              budget={budget}
              setBudget={setBudget}
              sortBy={sortBy}
              setSortBy={setSortBy}
              categories={categories}
              onSearch={handleSearch}
              onUseLocation={handleUseLocation}
              location={location}
              loading={loading}
              stores={filteredStores}
              savedStores={savedStores}
              onSave={toggleSavedStore}
              user={user}
              onAuthRequired={openAuthModal}
              addToCompare={addToCompare}
              compareStores={compareStores}
              showOpenNow={showOpenNow}
              setShowOpenNow={setShowOpenNow}
              showOffers={showOffers}
              setShowOffers={setShowOffers}
              minRating={minRating}
              setMinRating={setMinRating}
            />}
          />
          <Route
            path="/categories"
            element={<CategoriesPage categories={categories} user={user} onAuthRequired={openAuthModal} />}
          />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPageShell user={user} onLogin={handleLogin} onRegister={handleRegister} authLoading={authLoading} />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <AuthPageShell user={user} onLogin={handleLogin} onRegister={handleRegister} authLoading={authLoading} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <ProfilePage user={user} savedStores={savedStores} recentSearches={recentSearches} authLoading={authLoading} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute user={user}>
                <SavedPage savedStores={savedStores} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute user={user}>
                <ComparePage savedStores={savedStores} stores={filteredStores} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user}>
                {isAdmin ? <AdminDashboardPage users={users} searchLogs={searchLogs} categories={categories} /> : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            }
          />
          <Route path="/store/:id" element={<StoreDetailsPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageLayout>
    </Router>
  );
}

export default App;
