import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import StoreCard from "../components/cards/StoreCard";
import EmptyState from "../components/common/EmptyState";
import HomeImage from "../components/common/HomeImage";
import { HOME_IMAGES, imageForCategory } from "../assets/homeImages";
import { currency } from "../utils/format";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { categories, stores, savedStores, toggleSavedStore, bestPrice, loading, search, setSearch, handleUseLocation, location } = useData();
  const [homeSearch, setHomeSearch] = useState(search);
  const savedIds = new Set(savedStores.map((store) => store.id));
  const featuredStores = stores.slice().sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 4);

  const submitSearch = (event) => {
    event.preventDefault();
    setSearch(homeSearch);
    navigate("/search");
  };

  return (
    <div className="content-grid single-column-layout home-layout">
      <div className="results-column">
        <section className="home-hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="home-trust">{location ? "Location enabled" : "Built for your local market"}</p>
              <p className="eyebrow">Welcome{user ? `, ${user.name}` : ""}</p>
              <h1>Find nearby stores, compare prices, decide smarter.</h1>
              <p className="hero-description">Discover trusted local retailers, compare real listings, and choose the value that works for you.</p>
              <form className="home-search" onSubmit={submitSearch}>
                <input value={homeSearch} onChange={(event) => setHomeSearch(event.target.value)} placeholder="Search products, stores, or categories" aria-label="Search BazaarHub" />
                <button className="primary-action" type="submit">Search</button>
              </form>
              <div className="hero-actions">
                <button className="home-location-action" type="button" onClick={handleUseLocation}>Use my location</button>
                {!user ? <Link className="text-action" to="/register">Create free account</Link> : null}
              </div>
            </div>
            <div className="home-hero-visual">
              <HomeImage className="home-hero-image" src={HOME_IMAGES.hero} alt="Fresh produce outside a neighborhood grocery store" />
              <div className="hero-deal-card"><span>Best listed price</span><strong>{bestPrice !== null ? `From ${currency(bestPrice)}` : "Browse local deals"}</strong><small>Based on available BazaarHub listings</small></div>
              <div className="hero-location-card"><span>{categories.length} categories to explore</span></div>
            </div>
          </div>
          <div className="hero-stats"><span><strong>{stores.length}</strong> local listings</span><span><strong>{categories.length}</strong> categories to explore</span><span><strong>Simple</strong> price comparisons</span></div>
        </section>

        <section className="home-section">
          <div className="panel-heading compact"><div><p className="eyebrow">Browse</p><h2>Shop by category</h2></div><Link className="ghost-action" to="/categories">View all</Link></div>
          <div className="home-category-grid">
            {loading ? Array.from({ length: 5 }).map((_, index) => <div className="home-skeleton category-skeleton" key={index} />) : categories.slice(0, 5).map((category) => (
              <Link key={category.id} className="home-category-card" to={`/search?category=${encodeURIComponent(category.categoryName)}`}>
                <HomeImage className="home-category-image" src={imageForCategory(category.categoryName)} alt={`${category.categoryName} products`} lazy />
                <span className="home-category-overlay" /><span className="home-category-content"><strong>{category.categoryName}</strong><small>{stores.filter((store) => store.category === category.categoryName).length} stores</small></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="home-value-banner"><div><p className="eyebrow">Shop local, with clarity</p><h2>One place to discover stores, compare listings, and make better choices.</h2></div><Link className="ghost-action" to="/search">Explore stores</Link></section>

        <section className="home-section">
          <div className="panel-heading compact"><div><p className="eyebrow">Top rated</p><h2>Featured stores</h2></div></div>
          <div className="store-grid">
            {loading ? Array.from({ length: 4 }).map((_, index) => <div className="home-skeleton store-skeleton" key={index} />) : featuredStores.length ? featuredStores.map((store) => (
              <StoreCard key={store.id} store={store} distance={null} bestDeal={bestPrice !== null && Number(store.price || 0) === bestPrice} saved={savedIds.has(store.id)} onSave={toggleSavedStore} visual />
            )) : <EmptyState>No stores available yet. Try again shortly.</EmptyState>}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
