function MapToggle({ viewMode, onChangeViewMode }) {
  const handleModeChange = (mode) => {
    if (typeof onChangeViewMode === "function") {
      onChangeViewMode(mode);
    }
  };

  return (
    <div
      className="map-view-toggle"
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px",
        borderRadius: "12px",
        backgroundColor: "var(--bg-section)",
        border: "1px solid var(--border)",
      }}
    >
      <button
        type="button"
        className={`toggle-tab ${viewMode === "grid" ? "active" : ""}`}
        onClick={() => handleModeChange("grid")}
        style={{
          padding: "6px 14px",
          fontSize: "0.82rem",
          fontWeight: 700,
          borderRadius: "99px",
          border: "none",
          backgroundColor: viewMode === "grid" ? "var(--accent)" : "transparent",
          color: viewMode === "grid" ? "#ffffff" : "var(--text-muted)",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        📋 Grid
      </button>

      <button
        type="button"
        className={`toggle-tab ${viewMode === "both" ? "active" : ""}`}
        onClick={() => handleModeChange("both")}
        style={{
          padding: "6px 14px",
          fontSize: "0.82rem",
          fontWeight: 700,
          borderRadius: "9px",
          border: "none",
          backgroundColor: viewMode === "both" ? "var(--accent)" : "transparent",
          color: viewMode === "both" ? "#ffffff" : "var(--text-muted)",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        📑 Split View
      </button>

      <button
        type="button"
        className={`toggle-tab ${viewMode === "map" ? "active" : ""}`}
        onClick={() => handleModeChange("map")}
        style={{
          padding: "6px 14px",
          fontSize: "0.82rem",
          fontWeight: 700,
          borderRadius: "9px",
          border: "none",
          backgroundColor: viewMode === "map" ? "var(--accent)" : "transparent",
          color: viewMode === "map" ? "#ffffff" : "var(--text-muted)",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        🗺️ Map View
      </button>
    </div>
  );
}

export default MapToggle;
