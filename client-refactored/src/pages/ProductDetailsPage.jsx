import { Link, useParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import { currency, getBudgetType } from "../utils/format";

function ProductDetailsPage() {
  const { id } = useParams();
  const { stores, savedProducts, saveProduct } = useData();

  // Products in this app are identified by store entries (each store sells a product).
  const store = stores.find((s) => String(s.id) === String(id));
  const isSaved = savedProducts.some((p) => String(p.id) === String(id));

  if (!store) {
    return (
      <section className="panel">
        <p className="empty-text">Product not found.</p>
        <Link className="ghost-action" to="/search">
          Back to search
        </Link>
      </section>
    );
  }

  return (
    <div className="content-grid">
      <div className="results-column">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="store-category">{store.category || "Product"}</p>
              <h1>{store.productName}</h1>
              <span>Sold by {store.storeName}</span>
            </div>
            <button
              className={isSaved ? "save-button saved" : "save-button"}
              onClick={() =>
                saveProduct({ id: store.id, productName: store.productName, price: store.price })
              }
            >
              {isSaved ? "Saved" : "Save product"}
            </button>
          </div>

          <div className="price-line">
            <strong>{currency(store.price)}</strong>
            <span>{getBudgetType(store.price)}</span>
          </div>

          <dl>
            <div>
              <dt>Store</dt>
              <dd>
                <Link to={`/store/${store.id}`}>{store.storeName}</Link>
              </dd>
            </div>
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
                  [store.marketArea, store.city, store.state].filter(Boolean).join(", ")}
              </dd>
            </div>
          </dl>

          <div className="card-actions">
            <Link className="ghost-action" to={`/store/${store.id}`}>
              View store
            </Link>
            <Link className="ghost-action" to="/search">
              ← Back to search
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProductDetailsPage;
