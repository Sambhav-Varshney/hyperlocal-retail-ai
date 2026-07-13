import { currency } from "../../utils/format";

function StoreDetailsCard({ store, onClose }) {
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
              [store.shopNumber, store.street, store.marketArea, store.city].filter(Boolean).join(", ")}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

export default StoreDetailsCard;
