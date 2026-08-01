import { Link, useNavigate } from "react-router-dom";
import { currency, getBudgetType } from "../../utils/format";
import { imageForCategory } from "../../assets/homeImages";
import HomeImage from "../common/HomeImage";
import { useData } from "../../context/DataContext";

function StoreCard({ store, distance, bestDeal, saved, onSave, visual = false, showCompare = true }) {
  const navigate = useNavigate();
  const { isCompared, addToCompare } = useData();
  const itemId = store.id ?? store.productId;
  const compared = isCompared(itemId);

  const address = store.fullAddress || [store.marketArea, store.city, store.state].filter(Boolean).join(", ");
  const isOpen = Boolean(store.isOpen);
  const openDetails = () => navigate(`/store/${store.id}`);

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails();
    }
  };

  const handleCompareClick = (event) => {
    event.stopPropagation();
    addToCompare(store);
  };

  return (
    <article className="store-card store-result-card" role="link" tabIndex={0} onClick={openDetails} onKeyDown={handleCardKeyDown}>
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
        <button className={saved ? "save-button saved" : "save-button"} onClick={(event) => { event.stopPropagation(); onSave(store); }}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="price-line">
        <strong>{store.price ? currency(store.price) : "Price on request"}</strong>
        {bestDeal ? <span>Best deal</span> : null}
      </div>
      <div className="meta-grid">
        <span>⭐ {Number(store.rating || 0).toFixed(1)}</span>
        <span>{store.price ? getBudgetType(store.price) : "Price varies"}</span>
        <span className={isOpen ? "store-status open" : "store-status closed"}>{isOpen ? "Open now" : "Closed"}</span>
        <span>{distance ? `${distance.toFixed(1)} km` : "Distance N/A"}</span>
      </div>
      <p className="address-line">{address || "Address available on store details"}</p>
      <div className="card-actions">
        <Link to={`/store/${store.id}`} onClick={(event) => event.stopPropagation()}>View details</Link>
        {showCompare ? (
          <button
            type="button"
            className={compared ? "compare-action-btn added" : "compare-action-btn"}
            disabled={compared}
            onClick={handleCompareClick}
          >
            {compared ? "Added ✓" : "Compare"}
          </button>
        ) : null}
        {store.latitude && store.longitude ? (
          <a
            href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            Map
          </a>
        ) : null}
      </div>
    </article>
  );
}

export default StoreCard;
