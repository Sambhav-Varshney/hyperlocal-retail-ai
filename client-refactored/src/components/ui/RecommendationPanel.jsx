import { useMemo } from "react";
import { currency } from "../../utils/format";
import { formatDistance } from "../../utils/distanceUtils";

function RecommendationPanel({ stores = [] }) {
  const smartPicks = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    // 1. Cheapest Option (Lowest Price)
    const cheapest = stores.slice().sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity))[0];

    // 2. Highest Rated
    const highestRated = stores.slice().sort((a, b) => Number(b.rating || -Infinity) - Number(a.rating || -Infinity))[0];

    // 3. Best Value (Formula: rating / price)
    const bestValue = stores.slice().sort((a, b) => {
      const scoreA = Number(a.price) > 0 ? Number(a.rating || 0) / Number(a.price) : 0;
      const scoreB = Number(b.price) > 0 ? Number(b.rating || 0) / Number(b.price) : 0;
      return scoreB - scoreA;
    })[0];

    const picks = [];

    if (cheapest) {
      picks.push({
        type: "Cheapest Option",
        badge: "Lowest Price 🏷️",
        item: cheapest,
        productName: cheapest.productName || "Product",
        storeName: cheapest.storeName || "Local Retailer",
        meta: currency(cheapest.price),
      });
    }

    if (highestRated) {
      // Pick highest rated (if distinct from cheapest or as secondary pick)
      const targetRated = (highestRated.id !== cheapest?.id)
        ? highestRated
        : stores.filter((s) => s.id !== cheapest?.id).sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0] || highestRated;

      if (targetRated) {
        picks.push({
          type: "Highest Rated",
          badge: "Top Rated ⭐",
          item: targetRated,
          productName: targetRated.productName || "Product",
          storeName: targetRated.storeName || "Local Retailer",
          meta: `⭐ ${Number(targetRated.rating || 0).toFixed(1)} Rating`,
        });
      }
    }

    if (bestValue) {
      const existingIds = new Set(picks.map((p) => p.item.id));
      const targetValue = !existingIds.has(bestValue.id)
        ? bestValue
        : stores.filter((s) => !existingIds.has(s.id)).sort((a, b) => (Number(b.rating || 0) / Number(b.price || 1)) - (Number(a.rating || 0) / Number(a.price || 1)))[0] || bestValue;

      if (targetValue) {
        const valueScore = ((Number(targetValue.rating || 0) / Number(targetValue.price || 1)) * 100).toFixed(1);
        picks.push({
          type: "Best Value",
          badge: "Best Value 💡",
          item: targetValue,
          productName: targetValue.productName || "Product",
          storeName: targetValue.storeName || "Local Retailer",
          meta: `Score ${valueScore} • ${currency(targetValue.price)}`,
        });
      }
    }

    return picks.slice(0, 3);
  }, [stores]);

  return (
    <section className="panel recommendations" aria-label="Smart Picks Recommendations">
      <div className="panel-heading compact">
        <div>
          <p className="eyebrow">Smart Recommendations</p>
          <h2>Smart Picks</h2>
        </div>
      </div>
      {smartPicks.length ? (
        <div className="smart-picks-list">
          {smartPicks.map((pick) => (
            <div className="recommendation-item smart-pick-card" key={`${pick.type}-${pick.item.id}`}>
              <div className="smart-pick-badge-line">
                <span className="smart-pick-type">{pick.type}</span>
                <span className="smart-pick-badge">{pick.badge}</span>
              </div>
              <strong className="smart-pick-product">{pick.productName}</strong>
              <p className="smart-pick-store">🏬 {pick.storeName}</p>
              <div className="smart-pick-footer">
                <span className="smart-pick-meta">{pick.meta}</span>
                {pick.item.distance ? (
                  <span className="smart-pick-dist">{formatDistance(pick.item.distance)}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-text">No active results for recommendations.</p>
      )}
    </section>
  );
}

export default RecommendationPanel;
