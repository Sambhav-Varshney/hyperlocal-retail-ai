function Metrics({ stores = [], categories = [], users = [], searchLogs = [] }) {
  const items = [
    ["Stores", stores.length],
    ["Categories", categories.length],
    ["Users", users.length],
    ["Searches", searchLogs.length],
  ];

  return (
    <section className="metrics-grid">
      {items.map(([label, value]) => (
        <div className="metric-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

export default Metrics;
