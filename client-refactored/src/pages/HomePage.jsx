import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import StoreCard from "../components/cards/StoreCard";
import EmptyState from "../components/common/EmptyState";
import AIShoppingAgent from "../components/ui/AIShoppingAgent";

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
  const { categories, stores, savedStores, toggleSavedStore, loading, search, handleSearch } = useData();
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
              Find nearby stores, compare prices, and shop smarter with AI.
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

        {/* Stage 7: AI Shopping Agent Panel */}
        <AIShoppingAgent />

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

          <h2 className="hero-title font-heading">
            Find the Best Local Deals <span className="text-gradient blue-gradient">Near You</span>
          </h2>
          <p className="hero-subtitle">
            Compare prices across neighborhood stores, discover nearby products, and make smarter shopping decisions in real-time.
          </p>

          <form className="hero-search-box shadow-glow" onSubmit={submitSearch}>
            <div className="search-input-wrapper">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Find milk, bread, maggi, coffee, or search stores near you..."
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                aria-label="Search products or stores"
              />
            </div>
            <button type="submit" className="hero-search-btn primary-btn">
              Search ➔
            </button>
          </form>
        </section>

        {/* Top Product Categories Grid */}
        <section className="panel category-section">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Explore Markets</p>
              <h2>Top Product Categories</h2>
            </div>
            <Link to="/categories" className="ghost-action">
              View All Categories ➔
            </Link>
          </div>

          {categories.length ? (
            <div className="category-card-grid">
              {categories.map((category) => {
                const slug = categorySlug(category);
                const storeCount = categoryStoreCount(category.categoryName);
                const icon = categoryIcons[slug] || "📦";

                return (
                  <Link
                    key={category.id}
                    to={`/search?category=${encodeURIComponent(slug)}`}
                    className="category-card hover-glow"
                  >
                    <span className="category-emoji" aria-hidden="true">{icon}</span>
                    <div className="category-info">
                      <h3>{category.categoryName}</h3>
                      <p>{storeCount} {storeCount === 1 ? "store" : "stores"} available</p>
                    </div>
                    <span className="category-arrow" aria-hidden="true">➔</span>
                  </Link>
                );
              })}
            </div>
          ) : categoriesUnavailable ? (
            <EmptyState>No categories available right now.</EmptyState>
          ) : (
            <div className="loading-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="skeleton-card" key={index} />
              ))}
            </div>
          )}
        </section>

        {/* Featured Top-Rated Stores Grid */}
        <section className="panel featured-stores-section">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Top Recommendations</p>
              <h2>Featured Local Stores</h2>
            </div>
            <Link to="/search" className="ghost-action">
              View All Stores ➔
            </Link>
          </div>

          {featuredStores.length ? (
            <div className="store-grid">
              {featuredStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  isSaved={savedIds.has(store.id)}
                  onToggleSave={toggleSavedStore}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No featured stores found.</EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
