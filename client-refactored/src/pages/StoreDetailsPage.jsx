import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useData } from "../context/DataContext";
import { useUI } from "../context/UIContext";
import { currency, getBudgetType } from "../utils/format";
import HomeImage from "../components/common/HomeImage";
import StoreCard from "../components/cards/StoreCard";
import { HOME_IMAGES, imageForCategory } from "../assets/homeImages";

function StoreDetailsPage() {
  const { id } = useParams();
  const { showToast } = useUI();
  const { stores, savedStores, toggleSavedStore, addToCompare, compareStores, isCompared, savedProducts, saveProduct } = useData();

  const [fetchedStore, setFetchedStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductCategory, setSelectedProductCategory] = useState("All");

  // Get all product listings for this specific store ID from DataContext stores
  const storeProducts = useMemo(() => {
    return stores.filter((s) => String(s.id) === String(id));
  }, [stores, id]);

  const isSaved = savedStores.some((s) => String(s.id) === String(id));
  const compareIds = useMemo(() => new Set(compareStores.map((s) => s.id)), [compareStores]);
  const savedProductIds = useMemo(() => new Set(savedProducts.map((p) => p.productId || p.id)), [savedProducts]);

  useEffect(() => {
    let cancelled = false;

    if (storeProducts.length > 0) {
      setFetchedStore(storeProducts[0]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fallback if stores array isn't populated yet (e.g. direct URL reload)
    api.getStores()
      .then((data) => {
        if (cancelled) return;
        const matched = Array.isArray(data) ? data.filter((s) => String(s.id) === String(id)) : [];
        if (matched.length > 0) {
          setFetchedStore(matched[0]);
        } else {
          // Dedicated API fallback
          api.getStoreById(id)
            .then((storeData) => { if (!cancelled) setFetchedStore(storeData); })
            .catch(() => { if (!cancelled) showToast("Could not load store details", "error"); });
        }
      })
      .catch(() => {
        if (!cancelled) showToast("Could not load store details", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, storeProducts, showToast]);

  const storeInfo = storeProducts[0] || fetchedStore;

  // Calculate store statistics
  const totalProducts = storeProducts.length || (storeInfo?.productName ? 1 : 0);

  const categoriesList = useMemo(() => {
    const set = new Set();
    storeProducts.forEach((p) => { if (p.category) set.add(p.category); });
    if (set.size === 0 && storeInfo?.category) set.add(storeInfo.category);
    return Array.from(set);
  }, [storeProducts, storeInfo]);

  const avgPrice = useMemo(() => {
    if (!storeProducts.length) return Number(storeInfo?.price || 0);
    const sum = storeProducts.reduce((acc, p) => acc + Number(p.price || 0), 0);
    return sum / storeProducts.length;
  }, [storeProducts, storeInfo]);

  const budgetCategory = getBudgetType(avgPrice);
  const rating = Number(storeInfo?.rating || 4.2).toFixed(1);
  const totalReviews = storeInfo?.totalReviews || 18;
  const isOpen = storeInfo?.isOpen !== false;

  // Filter products by selected category pill
  const filteredProducts = useMemo(() => {
    if (selectedProductCategory === "All") return storeProducts;
    return storeProducts.filter((p) => p.category === selectedProductCategory);
  }, [storeProducts, selectedProductCategory]);

  // Similar stores recommendation (other distinct stores in data)
  const similarStores = useMemo(() => {
    const uniqueStoresMap = new Map();
    stores.forEach((s) => {
      if (String(s.id) !== String(id) && !uniqueStoresMap.has(s.id)) {
        uniqueStoresMap.set(s.id, s);
      }
    });
    return Array.from(uniqueStoresMap.values()).slice(0, 3);
  }, [stores, id]);

  const addressText = storeInfo?.fullAddress ||
    [storeInfo?.shopNumber, storeInfo?.street, storeInfo?.marketArea, storeInfo?.city, storeInfo?.state]
      .filter(Boolean)
      .join(", ") || "Address available on request";

  const mapsUrl = storeInfo?.latitude && storeInfo?.longitude
    ? `https://www.google.com/maps?q=${storeInfo.latitude},${storeInfo.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${storeInfo?.storeName || ""} ${addressText}`)}`;

  if (loading) {
    return (
      <div className="content-grid single-column-layout store-details-page">
        <div className="panel store-hero-panel skeleton-panel">
          <div className="home-skeleton store-skeleton-banner" />
          <div className="store-skeleton-content">
            <div className="home-skeleton store-skeleton-title" />
            <div className="home-skeleton store-skeleton-text" />
          </div>
        </div>
        <div className="store-stats-grid">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="home-skeleton store-stat-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (!storeInfo) {
    return (
      <div className="content-grid single-column-layout store-details-page">
        <section className="panel empty-store-panel">
          <h2>Store Not Found</h2>
          <p>We couldn't find details for this store. It may have been removed or updated.</p>
          <Link className="primary-action" to="/search">
            ← Return to Search
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="content-grid single-column-layout store-details-page">
      {/* A. Hero Section */}
      <section className="panel store-hero-panel">
        <div className="store-cover-wrap">
          <HomeImage
            className="store-cover-image"
            src={storeInfo.image || imageForCategory(storeInfo.category) || HOME_IMAGES.hero}
            alt={`${storeInfo.storeName} storefront`}
          />
          <div className="store-cover-overlay" />
          <span className={`store-status-badge ${isOpen ? "open" : "closed"}`}>
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>

        <div className="store-hero-content">
          <div className="store-hero-top">
            <div className="store-brand-header">
              <div className="store-avatar" aria-hidden="true">
                {storeInfo.storeName ? storeInfo.storeName.charAt(0).toUpperCase() : "🏬"}
              </div>
              <div>
                <p className="eyebrow">{storeInfo.category || "Retail Store"}</p>
                <h1>{storeInfo.storeName}</h1>
                <p className="store-owner">Owner / Manager: {storeInfo.ownerName || "Local Partner"}</p>
              </div>
            </div>

            <div className="card-actions store-hero-actions">
              <button
                className={isSaved ? "save-button saved" : "save-button"}
                onClick={() => toggleSavedStore(storeInfo)}
              >
                {isSaved ? "Saved" : "Save Store"}
              </button>
              <button
                className="ghost-action"
                disabled={compareIds.has(storeInfo.id)}
                onClick={() => addToCompare(storeInfo)}
              >
                {compareIds.has(storeInfo.id) ? "In Comparison" : "Add to Compare"}
              </button>
            </div>
          </div>

          <div className="store-badges-row">
            <span className="pill badge-rating">⭐ {rating} ({totalReviews} reviews)</span>
            <span className="pill badge-budget">{budgetCategory}</span>
            <span className="pill badge-city">📍 {storeInfo.city || "Local Market"}</span>
          </div>

          <div className="store-address-row">
            <p className="address-line">📍 {addressText}</p>
            {storeInfo.phone ? <p className="phone-line">📞 {storeInfo.phone}</p> : null}
          </div>

          <div className="store-hero-footer-actions">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="primary-action store-maps-btn"
            >
              🗺️ Open in Google Maps
            </a>
            <Link className="ghost-action" to="/search">
              ← Back to Search
            </Link>
          </div>
        </div>
      </section>

      {/* B. Store Statistics */}
      <section className="store-stats-section">
        <div className="store-stats-grid">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-copy">
              <strong>{totalProducts}</strong>
              <span>Total Products</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏷️</span>
            <div className="stat-copy">
              <strong>{categoriesList.length}</strong>
              <span>Categories</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💰</span>
            <div className="stat-copy">
              <strong>{currency(avgPrice)}</strong>
              <span>Avg Product Price</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <div className="stat-copy">
              <strong>{rating} / 5.0</strong>
              <span>Store Rating</span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <div className="stat-copy">
              <strong>{budgetCategory}</strong>
              <span>Budget Tier</span>
            </div>
          </div>
        </div>
      </section>

      {/* C. Products Section */}
      <section className="panel store-products-panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Available Inventory</p>
            <h2>In-Stock Products ({filteredProducts.length})</h2>
          </div>

          {categoriesList.length > 1 ? (
            <div className="product-category-pills">
              <button
                className={selectedProductCategory === "All" ? "pill-btn active" : "pill-btn"}
                onClick={() => setSelectedProductCategory("All")}
              >
                All ({storeProducts.length})
              </button>
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  className={selectedProductCategory === cat ? "pill-btn active" : "pill-btn"}
                  onClick={() => setSelectedProductCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="store-products-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => {
              const pId = prod.productId || prod.id;
              const isProdSaved = savedProductIds.has(pId);
              const isProdCompared = isCompared(pId);
              return (
                <article key={pId || prod.productName} className="product-item-card">
                  <div className="product-card-image-wrap">
                    <HomeImage
                      className="product-card-image"
                      src={prod.image || imageForCategory(prod.category)}
                      alt={prod.productName}
                      lazy
                    />
                    <span className="product-stock-badge">In Stock ({prod.quantity || 50})</span>
                  </div>
                  <div className="product-card-body">
                    <span className="product-brand">{prod.brand || "Brand"}</span>
                    <h3 className="product-name">{prod.productName}</h3>
                    <p className="product-category-tag">{prod.category || "General"}</p>
                    <div className="product-card-footer">
                      <strong className="product-price">{currency(prod.price)}</strong>
                      <div className="product-card-actions">
                        <button
                          type="button"
                          className={isProdCompared ? "compare-action-btn added" : "compare-action-btn"}
                          disabled={isProdCompared}
                          onClick={() => addToCompare(prod)}
                        >
                          {isProdCompared ? "Added ✓" : "Compare"}
                        </button>
                        <button
                          className={isProdSaved ? "save-button saved" : "save-button"}
                          onClick={() => saveProduct(prod)}
                        >
                          {isProdSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state">No products found for this category.</div>
          )}
        </div>
      </section>

      {/* D. Similar Stores Section */}
      {similarStores.length > 0 ? (
        <section className="panel store-similar-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Discovery</p>
              <h2>Other Nearby Retailers</h2>
            </div>
            <Link className="ghost-action" to="/search">View All Stores</Link>
          </div>
          <div className="store-grid">
            {similarStores.map((s) => (
              <StoreCard
                key={s.id}
                store={s}
                distance={s.distance}
                saved={savedStores.some((item) => String(item.id) === String(s.id))}
                onSave={toggleSavedStore}
                visual
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default StoreDetailsPage;
