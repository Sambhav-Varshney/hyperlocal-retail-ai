import { Link } from "react-router-dom";
import { currency, getBudgetType } from "../../utils/format";
import { imageForCategory } from "../../assets/homeImages";
import HomeImage from "../common/HomeImage";

function StoreCard({ store, distance, bestDeal, saved, onSave, visual = false }) {
  return (
    <article className="store-card">
      {visual ? (
        <div className="store-card-image-wrap">
          <HomeImage
            className="store-card-image"
            src={store.image || store.imageUrl || imageForCategory(store.category)}
            alt={`${store.storeName || "Local store"} storefront and products`}
            lazy
          />
        </div>
      ) : null}
      <div className="store-card-top">
        <div>
          <p className="store-category">{store.category || "Local Store"}</p>
          <h3>{store.storeName}</h3>
          <span>{store.productName}</span>
        </div>
        <button className={saved ? "save-button saved" : "save-button"} onClick={() => onSave(store)}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="price-line">
        <strong>{currency(store.price)}</strong>
        {bestDeal ? <span>Best deal</span> : null}
      </div>
      <div className="meta-grid">
        <span>Rating {Number(store.rating || 0).toFixed(1)}</span>
        <span>{getBudgetType(store.price)}</span>
        <span>{distance ? `${distance.toFixed(1)} km` : "Distance N/A"}</span>
      </div>
      <p className="address-line">
        {store.fullAddress || [store.marketArea, store.city, store.state].filter(Boolean).join(", ")}
      </p>
      <div className="card-actions">
        <Link to={`/store/${store.id}`}>Details</Link>
        {store.latitude && store.longitude ? (
          <a
            href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            Map
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default StoreCard;
