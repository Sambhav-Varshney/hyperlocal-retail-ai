import { Link } from "react-router-dom";
import { currency } from "../../utils/format";
import { formatDistance } from "../../utils/distanceUtils";

function StoreMapCard({ store, onClose }) {
  if (!store) return null;

  const lat = store.latitude;
  const lon = store.longitude;
  const addressText =
    store.fullAddress ||
    [store.marketArea, store.city, store.state].filter(Boolean).join(", ");

  const mapsUrl =
    lat && lon
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.storeName} ${addressText}`)}`;

  const isOpen = store.isOpen !== false;
  const productName = store.productName || store.name || "Store Item";

  return (
    <div
      className="store-map-card-popup"
      style={{
        position: "absolute",
        bottom: "16px",
        left: "16px",
        right: "16px",
        zIndex: 10,
        padding: "16px",
        borderRadius: "16px",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.45)",
        color: "var(--text-main)",
        animation: "fadeInUp 0.2s ease-out",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "8px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {store.category || "Local Store"}
          </span>
          <h3 style={{ margin: "2px 0 0", fontSize: "1.1rem", color: "var(--text-main)" }}>
            {store.storeName}
          </h3>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "1.1rem",
              cursor: "pointer",
              padding: "2px 6px",
            }}
            aria-label="Close store details"
          >
            ✕
          </button>
        ) : null}
      </div>

      <p
        style={{
          margin: "0 0 10px",
          fontSize: "0.86rem",
          color: "var(--text-muted)",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        📍 {addressText || "Address available on store page"}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "14px",
          fontSize: "0.82rem",
        }}
      >
        <span className="pill badge-rating">⭐ {Number(store.rating || 4.2).toFixed(1)}</span>
        <span className={`pill ${isOpen ? "status-open" : "status-closed"}`} style={{ color: isOpen ? "var(--success)" : "var(--danger)" }}>
          {isOpen ? "🟢 Open now" : "🔴 Closed"}
        </span>
        {store.distance !== undefined && store.distance !== null ? (
          <span className="pill">📍 {formatDistance(store.distance)}</span>
        ) : null}
        {store.price ? (
          <span className="pill" style={{ fontWeight: 700, color: "var(--text-main)" }}>
            {productName}: {currency(store.price)}
          </span>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="primary-action-sm"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            fontSize: "0.84rem",
          }}
        >
          🗺️ Open in Google Maps ↗
        </a>
        <Link
          to={`/store/${store.id}`}
          className="ghost-action"
          style={{ padding: "8px 14px", fontSize: "0.84rem" }}
        >
          View Details ↗
        </Link>
      </div>
    </div>
  );
}

export default StoreMapCard;
