import { useMemo, useState } from "react";
import StoreMapCard from "./StoreMapCard";
import { formatDistance } from "../../utils/distanceUtils";

const CATEGORY_ICONS = {
  groceries: "🛒",
  dairy: "🥛",
  beverages: "🥤",
  snacks: "🍿",
  "personal-care": "🧴",
  personalcare: "🧴",
  cleaning: "🧺",
  household: "🧺",
  bakery: "🍞",
  spices: "🌶️",
};

export function NearbyMap({ stores = [], location = null, selectedStoreId = null, onSelectStore = null, compact = false }) {
  const [activeStoreId, setActiveStoreId] = useState(selectedStoreId);

  const effectiveActiveId = selectedStoreId !== null ? selectedStoreId : activeStoreId;

  const activeStore = useMemo(() => {
    if (!stores.length) return null;
    return stores.find((s) => String(s.id) === String(effectiveActiveId)) || null;
  }, [stores, effectiveActiveId]);

  // Compute map pin positions dynamically from lat/lon coordinates
  const pinPositions = useMemo(() => {
    if (!stores.length) return [];

    const lats = stores.map((s) => Number(s.latitude || 28.6139)).filter(Boolean);
    const lons = stores.map((s) => Number(s.longitude || 77.2090)).filter(Boolean);

    if (location?.lat && location?.lon) {
      lats.push(Number(location.lat));
      lons.push(Number(location.lon));
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latRange = maxLat - minLat || 0.05;
    const lonRange = maxLon - minLon || 0.05;

    return stores.map((store, idx) => {
      const lat = Number(store.latitude || minLat);
      const lon = Number(store.longitude || minLon);

      // Invert lat for top% (higher lat = higher up = lower top%)
      const topPct = 82 - Math.round(((lat - minLat) / latRange) * 64);
      const leftPct = 12 + Math.round(((lon - minLon) / lonRange) * 76);

      const catKey = (store.category || "").toLowerCase().replace(/[^a-z]/g, "");
      const icon = CATEGORY_ICONS[catKey] || "🏬";

      return {
        store,
        topPct: Math.max(12, Math.min(84, topPct)),
        leftPct: Math.max(10, Math.min(86, leftPct)),
        icon,
        index: idx + 1,
      };
    });
  }, [stores, location]);

  // Compute user pin position if location is active
  const userPin = useMemo(() => {
    if (!location?.lat || !location?.lon || !pinPositions.length) return null;

    const lats = stores.map((s) => Number(s.latitude || 28.6139)).concat(Number(location.lat));
    const lons = stores.map((s) => Number(s.longitude || 77.2090)).concat(Number(location.lon));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    const latRange = maxLat - minLat || 0.05;
    const lonRange = maxLon - minLon || 0.05;

    const topPct = 82 - Math.round(((location.lat - minLat) / latRange) * 64);
    const leftPct = 12 + Math.round(((location.lon - minLon) / lonRange) * 76);

    return {
      topPct: Math.max(10, Math.min(84, topPct)),
      leftPct: Math.max(10, Math.min(86, leftPct)),
    };
  }, [location, stores, pinPositions]);

  const handlePinClick = (storeId) => {
    setActiveStoreId(storeId);
    if (onSelectStore) onSelectStore(storeId);
  };

  return (
    <section className={`panel map-panel ${compact ? "compact-map-panel" : ""}`} style={{ position: "relative", overflow: "hidden" }}>
      <div className="panel-heading compact" style={{ marginBottom: "12px" }}>
        <div>
          <p className="eyebrow">Interactive Nearby Map</p>
          <h2 style={{ margin: 0, fontSize: compact ? "1.1rem" : "1.25rem", color: "var(--text-main)" }}>
            Store Coverage ({stores.length})
          </h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="pill" style={{ fontSize: "0.78rem" }}>
            {location ? "📍 GPS Active" : "🌐 Manual Mode"}
          </span>
          {activeStore ? (
            <button
              type="button"
              className="ghost-action"
              style={{ padding: "3px 8px", fontSize: "0.75rem" }}
              onClick={() => {
                setActiveStoreId(null);
                if (onSelectStore) onSelectStore(null);
              }}
            >
              Clear Focus
            </button>
          ) : null}
        </div>
      </div>

      <div
        className="map-canvas"
        style={{
          position: "relative",
          width: "100%",
          height: compact ? "280px" : "400px",
          borderRadius: "16px",
          backgroundColor: "#060e1a",
          border: "1px solid var(--border)",
          overflow: "hidden",
          background: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, rgba(7, 17, 31, 0.95) 100%)",
        }}
      >
        {/* Subtle Map Grid Lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        {/* User Location Pulse Pin */}
        {userPin ? (
          <div
            className="user-location-pin"
            style={{
              position: "absolute",
              top: `${userPin.topPct}%`,
              left: `${userPin.leftPct}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 5,
            }}
            title="Your Location"
          >
            <span
              style={{
                display: "block",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "#3B82F6",
                boxShadow: "0 0 0 4px rgba(59, 130, 246, 0.35), 0 0 16px #3B82F6",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                position: "absolute",
                top: "24px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "0.72rem",
                fontWeight: 800,
                color: "#F8FAFC",
                backgroundColor: "rgba(15, 23, 42, 0.85)",
                padding: "2px 6px",
                borderRadius: "6px",
                whiteSpace: "nowrap",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              📍 You
            </span>
          </div>
        ) : null}

        {/* Store Pins */}
        {pinPositions.map(({ store, topPct, leftPct, icon, index }) => {
          const isActive = String(store.id) === String(effectiveActiveId);
          return (
            <button
              key={store.id}
              type="button"
              className={`map-pin ${isActive ? "active-pin" : ""}`}
              onClick={() => handlePinClick(store.id)}
              style={{
                position: "absolute",
                top: `${topPct}%`,
                left: `${leftPct}%`,
                transform: "translate(-50%, -50%)",
                zIndex: isActive ? 8 : 4,
                padding: "6px 10px",
                borderRadius: "20px",
                backgroundColor: isActive ? "#3B82F6" : "var(--bg-card)",
                color: isActive ? "#ffffff" : "var(--text-main)",
                border: isActive ? "2px solid #ffffff" : "1px solid var(--border)",
                boxShadow: isActive ? "0 0 20px rgba(59, 130, 246, 0.8)" : "0 4px 12px rgba(0, 0, 0, 0.3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.82rem",
                fontWeight: 700,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              title={`${store.storeName} (${store.distance ? formatDistance(store.distance) : store.city})`}
            >
              <span>{icon}</span>
              <span>{store.storeName ? store.storeName.split(" ")[0] : `#${index}`}</span>
            </button>
          );
        })}

        {/* Selected Store Map Popup Card */}
        {activeStore ? (
          <StoreMapCard store={activeStore} onClose={() => setActiveStoreId(null)} />
        ) : null}
      </div>

      <p className="map-note" style={{ margin: "10px 0 0", fontSize: "0.82rem", color: "var(--text-muted)" }}>
        Click any store pin on the map to view distance, products, and open in Google Maps.
      </p>
    </section>
  );
}

export default NearbyMap;
