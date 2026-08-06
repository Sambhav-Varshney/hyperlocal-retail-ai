import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import StoreCard from "../components/cards/StoreCard";
import EmptyState from "../components/common/EmptyState";

const categoryIcons = {
  beverages: "🥤",
  dairy: "🥛",
  groceries: "🛒",
  snacks: "🍿",
  "personal-care": "🧴",
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  return "Good Evening";
};

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, stores, savedStores, toggleSavedStore, bestPrice, loading, search, handleSearch } = useData();
  const [homeSearch, setHomeSearch] = useState(search);
  const savedIds = new Set(savedStores.map((store) => store.id));
  const featuredStores = stores.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 4);
  const categorySlug = (category) => category.slug || category.categoryName.toLowerCase().replace(/\s+/g, "-");
  const categoryStoreCount = (categoryName) => stores.filter((store) => store.category === categoryName).length;
  const categoriesUnavailable = !loading && categories.length === 0;

  const displayName = user?.name ? user.name.split(" ")[0] : "Guest";
  const greetingText = `👋 ${getGreeting()}, ${displayName}`;

  const cheapestStoreItem = stores.length
    ? stores.slice().sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity))[0]
    : null;

  const cheapestProductName = cheapestStoreItem
    ? `${cheapestStoreItem.productName || "Maggi Noodles"} (₹${cheapestStoreItem.price})`
    : "Maggi Masala (₹13)";

  const trendingCategoryName = categories.length > 0 ? categories[0].categoryName : "Groceries & Dairy";
  const totalStoresExplored = stores.length || 5;

  const submitSearch = (event) => {
    event.preventDefault();
    const keyword = homeSearch.trim();
    if (!keyword) return;
    handleSearch(keyword);
    navigate(`/search?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="content-grid single-column-layout home-layout">
      <div className="results-column">
        {/* Personalized Welcome Card Section */}
        <section className="personalized-welcome-banner">
          <div className="welcome-header">
            <h1 className="welcome-greeting">{greetingText}</h1>
            <p className="welcome-subtitle">
              Discover nearby stores, compare prices, and shop smarter with AI.
            </p>
          </div>

          {/* AI Insights Card Grid */}
          <div className="ai-insights-grid">
            <div className="ai-insight-card">
              <div className="insight-icon-box" aria-hidden="true">🏷️</div>
              <div className="insight-details">
                <span className="insight-label">Cheapest Product Nearby</span>
                <strong className="insight-value" title={cheapestProductName}>{cheapestProductName}</strong>
              </div>
              <span className="insight-badge">Best Deal</span>
            </div>

            <div className="ai-insight-card">
              <div className="insight-icon-box" aria-hidden="true">🔥</div>
              <div className="insight-details">
                <span className="insight-label">Trending Category</span>
                <strong className="insight-value">{trendingCategoryName}</strong>
              </div>
              <span className="insight-badge">Popular</span>
            </div>

            <div className="ai-insight-card">
              <div className="insight-icon-box" aria-hidden="true">🏬</div>
              <div className="insight-details">
                <span className="insight-label">Stores Explored</span>
                <strong className="insight-value">{totalStoresExplored} Local Shops Active</strong>
              </div>
              <span className="insight-badge">Nearby</span>
            </div>
          </div>
        </section>

        {/* Minimal Dark SaaS Hero Section (Linear / Vercel Style) */}
        <section className="home-hero minimal-hero polished-hero">
          <div className="hero-grid-overlay" aria-hidden="true" />
          <div className="hero-glow-effect radial-blue-glow" aria-hidden="true" />

          {/* Feature Badges Line */}
          <div className="hero-badges-row">
            <span className="hero-badge">✨ AI Recommendations</span>
            <span className="hero-badge">⚖️ Compare Prices</span>
            <span className="hero-badge">📍 Nearby Stores</span>
            <span className="hero-badge">🔍 Smart Search</span>
          </div>

          {/* Hero Copy */}
          <div className="hero-text-content">
            <h1 className="hero-main-heading">
              Find nearby stores, compare prices, and shop smarter with AI.
            </h1>
            <p className="hero-main-subtitle">
              Discover local products, compare prices across nearby stores, and make better shopping decisions.
            </p>

            {/* Hero Actions */}
            <div className="hero-actions-row">
              <Link to="/search" className="primary-action hero-cta-btn">
                Search Products →
              </Link>
              <Link to="/categories" className="ghost-action hero-secondary-btn">
                Explore Stores
              </Link>
            </div>
          </div>

          {/* Clean AI Search Bar */}
          <form className="home-search-bar ai-search-bar" onSubmit={submitSearch}>
            <input
              value={homeSearch}
              onChange={(event) => setHomeSearch(event.target.value)}
              placeholder="Ask BazaarHub AI... (e.g. cheapest milk near me)"
              aria-label="Search BazaarHub AI"
            />
            <button className="primary-action hero-search-submit-btn" type="submit">
              Search
            </button>
          </form>

          {/* Minimal Glass Stats Cards */}
          <div className="floating-stats-grid">
            <div className="floating-stat-card">
              <span className="stat-icon" aria-hidden="true">🏬</span>
              <div className="stat-info">
                <strong>50+</strong>
                <span>Stores</span>
              </div>
            </div>

            <div className="floating-stat-card">
              <span className="stat-icon" aria-hidden="true">📦</span>
              <div className="stat-info">
                <strong>1000+</strong>
                <span>Products</span>
              </div>
            </div>

            <div className="floating-stat-card">
              <span className="stat-icon" aria-hidden="true">⭐</span>
              <div className="stat-info">
                <strong>4.8</strong>
                <span>Rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories Section */}
        <section className="home-section">
          <div className="panel-heading compact popular-categories-heading">
            <h2>Popular Categories</h2>
            <Link className="link-view-all" to="/categories">
              View all →
            </Link>
          </div>
          <div className="home-popular-grid">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <div className="home-skeleton home-popular-skeleton" key={index} />)
            ) : categoriesUnavailable ? (
              <div className="home-category-error">
                <div>
                  <p className="eyebrow">Categories unavailable</p>
                  <h3>We couldn’t load categories right now.</h3>
                  <p>Please check your connection and try again.</p>
                </div>
                <button className="ghost-action" type="button" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : (
              categories.slice(0, 5).map((category) => {
                const storeCount = categoryStoreCount(category.categoryName);
                const slug = categorySlug(category);

                return (
                  <Link key={category.id} className="home-popular-card polished-category-card" to={`/search?category=${encodeURIComponent(slug)}`}>
                    <div className="home-popular-card-top">
                      <span className="home-popular-icon" aria-hidden="true">
                        {categoryIcons[slug] || "🛍️"}
                      </span>
                    </div>
                    <div className="home-popular-copy">
                      <h3>{category.categoryName}</h3>
                      <span className="category-store-badge">{storeCount ? `${storeCount} stores` : "Explore"}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Featured Stores Section */}
        <section className="home-section">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Top rated</p>
              <h2>Featured stores</h2>
            </div>
          </div>
          <div className="store-grid">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div className="home-skeleton store-skeleton" key={index} />)
            ) : featuredStores.length ? (
              featuredStores.map((store) => (
                <StoreCard
                  key={store.productId ? `p-${store.productId}` : `s-${store.id}-${store.productName}`}
                  store={store}
                  distance={null}
                  bestDeal={bestPrice !== null && Number(store.price || 0) === bestPrice}
                  saved={savedIds.has(store.id)}
                  onSave={toggleSavedStore}
                  visual
                  showCompare={false}
                />
              ))
            ) : (
              <EmptyState>No stores available yet. Try again shortly.</EmptyState>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
