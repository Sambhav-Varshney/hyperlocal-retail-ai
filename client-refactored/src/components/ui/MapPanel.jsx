function MapPanel({ stores, location }) {
  const visibleStores = stores.slice(0, 8);

  return (
    <section className="panel map-panel">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Nearby map</p>
          <h2>Store coverage</h2>
        </div>
        <span>{location ? "GPS enabled" : "Manual discovery"}</span>
      </div>
      <div className="map-canvas">
        {visibleStores.map((store, index) => (
          <button
            key={store.id}
            className="map-pin"
            style={{
              left: `${18 + ((index * 17) % 64)}%`,
              top: `${22 + ((index * 23) % 54)}%`,
            }}
            title={store.storeName}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <p className="map-note">Open each store card's Map link for Google Maps navigation.</p>
    </section>
  );
}

export default MapPanel;
