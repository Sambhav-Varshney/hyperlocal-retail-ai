import { useData } from "../context/DataContext";
import StoreCard from "../components/cards/StoreCard";
import EmptyState from "../components/common/EmptyState";
import { currency } from "../utils/format";

function SavedPage() {
  const { savedStores, toggleSavedStore, savedProducts, bestPrice } = useData();

  return (
    <div className="results-column">
      <section className="panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Saved</p>
            <h1>Your saved stores</h1>
          </div>
        </div>
        <div className="store-grid">
          {savedStores.length ? (
            savedStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                distance={store.distance}
                bestDeal={bestPrice !== null && Number(store.price || 0) === bestPrice}
                saved
                onSave={toggleSavedStore}
              />
            ))
          ) : (
            <EmptyState>You haven't saved any stores yet. Save one from Search.</EmptyState>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading compact">
          <div>
            <p className="eyebrow">Saved</p>
            <h2>Your saved products</h2>
          </div>
        </div>
        <div className="profile-list">
          {savedProducts.length ? (
            savedProducts.map((product) => (
              <span key={product.id}>
                {product.productName} — {currency(product.price)}
              </span>
            ))
          ) : (
            <span>No saved products yet.</span>
          )}
        </div>
      </section>
    </div>
  );
}

export default SavedPage;
