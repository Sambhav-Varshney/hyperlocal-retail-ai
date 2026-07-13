import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useData } from "../context/DataContext";
import { useUI } from "../context/UIContext";
import { currency, getBudgetType } from "../utils/format";

function StoreDetailsPage() {
  const { id } = useParams();
  const { showToast } = useUI();
  const { savedStores, toggleSavedStore, addToCompare, stores } = useData();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  const isSaved = savedStores.some((s) => String(s.id) === String(id));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // First try to find it in the already-loaded stores (fast path)
    const local = stores.find((s) => String(s.id) === String(id));
    if (local) {
      setStore(local);
      setLoading(false);
      return;
    }

    // Fall back to a dedicated API call
    api.getStoreById(id)
      .then((data) => {
        if (!cancelled) setStore(data);
      })
      .catch(() => {
        if (!cancelled) showToast("Could not load store details", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id, stores, showToast]);

  if (loading) {
    return (
      <section className="panel">
        <span className="loading-chip">Loading store details…</span>
      </section>
    );
  }

  if (!store) {
    return (
      <section className="panel">
        <p className="empty-text">Store not found.</p>
        <Link className="ghost-action" to="/search">Back to search</Link>
      </section>
    );
  }

  return (
    <div className="content-grid">
      <div className="results-column">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="store-category">{store.category || "Local Store"}</p>
              <h1>{store.storeName}</h1>
              <span>{store.productName}</span>
            </div>
            <div className="card-actions">
              <button
                className={isSaved ? "save-button saved" : "save-button"}
                onClick={() => toggleSavedStore(store)}
              >
                {isSaved ? "Saved" : "Save"}
              </button>
              <button className="ghost-action" onClick={() => addToCompare(store)}>
                Compare
              </button>
            </div>
          </div>

          <div className="price-line">
            <strong>{currency(store.price)}</strong>
            <span>{getBudgetType(store.price)}</span>
          </div>

          <dl>
            <div>
              <dt>Rating</dt>
              <dd>
                {Number(store.rating || 0).toFixed(1)} from {store.totalReviews || 0} reviews
              </dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{store.phone || "Not available"}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>
                {store.fullAddress ||
                  [store.shopNumber, store.street, store.marketArea, store.city, store.state]
                    .filter(Boolean)
                    .join(", ")}
              </dd>
            </div>
            {store.isOpen !== undefined ? (
              <div>
                <dt>Status</dt>
                <dd>{store.isOpen ? "Open now" : "Closed"}</dd>
              </div>
            ) : null}
          </dl>

          <div className="card-actions">
            {store.latitude && store.longitude ? (
              <a
                href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="ghost-action"
              >
                View on Google Maps
              </a>
            ) : null}
            <Link className="ghost-action" to="/search">
              ← Back to search
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default StoreDetailsPage;
