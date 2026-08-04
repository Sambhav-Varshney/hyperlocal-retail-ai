import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import HomeImage from "../components/common/HomeImage";
import { imageForCategory } from "../assets/homeImages";
import { formatDistance } from "../utils/distanceUtils";
import EmptyState from "../components/common/EmptyState";

function SavedPage() {
  const { savedStores, removeSavedStore } = useData();

  return (
    <div className="content-grid single-column-layout saved-page-layout">
      <div className="results-column">
        {/* Page Header */}
        <section className="panel page-header-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Favorites</p>
              <h1>Saved Stores ({savedStores.length})</h1>
              <p className="page-subtitle">
                Quick access to your bookmarked neighborhood stores and local markets.
              </p>
            </div>
            {savedStores.length > 0 ? (
              <Link to="/search" className="ghost-action">
                Find More Stores ↗
              </Link>
            ) : null}
          </div>
        </section>

        {/* Saved Stores Grid */}
        <section className="panel saved-stores-panel">
          {savedStores.length > 0 ? (
            <div className="store-grid saved-store-grid">
              {savedStores.map((store) => {
                const img = store.image || store.imageUrl || imageForCategory(store.category);
                const area = store.marketArea || store.city || store.fullAddress || "Local Market";
                const isOpen = store.isOpen !== false;

                return (
                  <article key={store.id} className="store-card saved-card">
                    <div className="store-card-image-wrap">
                      <HomeImage
                        className="store-card-image"
                        src={img}
                        alt={`${store.storeName || "Store"} storefront`}
                        lazy
                      />
                      <span className={`store-status-badge ${isOpen ? "open" : "closed"}`}>
                        {isOpen ? "Open Now" : "Closed"}
                      </span>
                    </div>

                    <div className="store-card-top">
                      <div>
                        <p className="store-category">{store.category || "Local Store"}</p>
                        <h3>{store.storeName}</h3>
                        <span className="store-area">📍 {area}</span>
                      </div>
                      <button
                        type="button"
                        className="save-button saved"
                        onClick={() => removeSavedStore(store.id)}
                        title="Remove from saved stores"
                      >
                        Saved ★
                      </button>
                    </div>

                    <div className="meta-grid">
                      <span>⭐ {Number(store.rating || 0).toFixed(1)} / 5.0</span>
                      <span>{store.distance ? formatDistance(store.distance) : "Nearby"}</span>
                    </div>

                    <div className="card-actions">
                      <Link to={`/store/${store.id}`} className="primary-action">
                        View Details
                      </Link>
                      <button
                        type="button"
                        className="ghost-action remove-saved-btn"
                        onClick={() => removeSavedStore(store.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No saved stores yet">
              You haven't saved any stores to your favorites. Discover local markets and save stores for quick price comparisons.
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  );
}

export default SavedPage;
