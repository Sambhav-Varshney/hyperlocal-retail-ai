import { currency } from "../../utils/format";

function RecommendationPanel({ stores = [] }) {
  const recommendations = stores
    .slice()
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(a.price || 0) - Number(b.price || 0))
    .slice(0, 3);

  return (
    <section className="panel recommendations">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">AI recommendation UI</p>
          <h2>Smart picks</h2>
        </div>
      </div>
      {recommendations.length ? (
        recommendations.map((store) => (
          <div className="recommendation-item" key={store.id}>
            <strong>{store.storeName}</strong>
            <span>
              {currency(store.price)} | {Number(store.rating || 0).toFixed(1)} rating
            </span>
          </div>
        ))
      ) : (
        <p className="empty-text">Search stores to generate recommendations.</p>
      )}
    </section>
  );
}

export default RecommendationPanel;
