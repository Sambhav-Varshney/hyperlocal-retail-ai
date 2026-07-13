import { useData } from "../context/DataContext";
import { currency, getBudgetType } from "../utils/format";
import EmptyState from "../components/common/EmptyState";

function ComparePage() {
  const { compareStores, removeFromCompare, savedComparisons, saveComparison } = useData();

  const handleSave = () => {
    if (!compareStores.length) return;
    saveComparison({
      id: Date.now(),
      stores: compareStores,
      savedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="results-column">
      <section className="panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Compare</p>
            <h1>Compare stores side by side</h1>
          </div>
          {compareStores.length > 1 ? (
            <button className="ghost-action" onClick={handleSave}>
              Save comparison
            </button>
          ) : null}
        </div>

        {compareStores.length ? (
          <div className="store-grid">
            {compareStores.map((store) => (
              <article className="store-card" key={store.id}>
                <div className="store-card-top">
                  <div>
                    <p className="store-category">{store.category || "Local Store"}</p>
                    <h3>{store.storeName}</h3>
                    <span>{store.productName}</span>
                  </div>
                  <button
                    className="save-button"
                    onClick={() => removeFromCompare(store.id)}
                    aria-label="Remove from comparison"
                  >
                    Remove
                  </button>
                </div>
                <div className="price-line">
                  <strong>{currency(store.price)}</strong>
                </div>
                <div className="meta-grid">
                  <span>Rating {Number(store.rating || 0).toFixed(1)}</span>
                  <span>{getBudgetType(store.price)}</span>
                  <span>{store.totalReviews || 0} reviews</span>
                </div>
                <p className="address-line">
                  {store.fullAddress ||
                    [store.marketArea, store.city, store.state].filter(Boolean).join(", ")}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState>
            No stores in comparison yet. Add up to 4 from the Search page.
          </EmptyState>
        )}
      </section>

      {savedComparisons.length ? (
        <section className="panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">History</p>
              <h2>Saved comparisons</h2>
            </div>
          </div>
          <div className="profile-list">
            {savedComparisons.map((comparison) => (
              <span key={comparison.id}>
                {comparison.stores.map((store) => store.storeName).join(" vs ")} &mdash;{" "}
                {new Date(comparison.savedAt).toLocaleDateString()}
              </span>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ComparePage;
