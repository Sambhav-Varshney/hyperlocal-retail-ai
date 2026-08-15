function LocationPermissionAlert({ onTryAgain }) {
  return (
    <div
      className="location-permission-alert"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 16px",
        borderRadius: "12px",
        backgroundColor: "rgba(239, 68, 68, 0.08)",
        border: "1px solid rgba(239, 68, 68, 0.2)",
        marginBottom: "16px",
        fontSize: "0.86rem",
        color: "var(--text-main)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "1.1rem" }}>📍</span>
        <span>Location access is unavailable. Showing available stores instead.</span>
      </div>
      {onTryAgain ? (
        <button
          type="button"
          className="ghost-action"
          style={{ padding: "4px 10px", fontSize: "0.78rem" }}
          onClick={onTryAgain}
        >
          Enable Location
        </button>
      ) : null}
    </div>
  );
}

export default LocationPermissionAlert;
