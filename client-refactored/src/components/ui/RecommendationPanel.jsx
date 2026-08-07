import { useMemo } from "react";
import { currency } from "../../utils/format";
import { formatDistance } from "../../utils/distanceUtils";

function RecommendationPanel({ stores = [] }) {
  const smartPicks = useMemo(() => {
    if (!stores || stores.length === 0) return [];

    const picks = [];
    const usedProductNames = new Set();

    // 1. Cheapest Option
    const cheapestCandidates = stores.slice().sort((a, b) => Number(a.price || Infinity) - Number(b.price || Infinity));
    const cheapest = cheapestCandidates[0];

    if (cheapest) {
      picks.push({
        type: "Cheapest Option",
        badge: "Lowest Price 🏷️",
        item: cheapest,
        productName: cheapest.productName || "Product",
        storeName: cheapest.storeName || "Local Retailer",
        meta: currency(cheapest.price),
      });
      usedProductNames.add((cheapest.productName || "").toLowerCase().trim());
    }

    // 2. Highest Rated (Distinct product name)
    const ratedCandidates = stores
      .slice()
      .filter((s) => !usedProductNames.has((s.productName || "").toLowerCase().trim()))
      .sort((a, b) => Number(b.rating || -Infinity) - Number(a.rating || -Infinity));

    const highestRated = ratedCandidates[0] || stores.find((s) => s.id !== cheapest?.id) || cheapest;

    if (highestRated) {
      picks.push({
        type: "Highest Rated",
        badge: "Top Rated ⭐",
        item: highestRated,
        productName: highestRated.productName || "Product",
        storeName: highestRated.storeName || "Local Retailer",
        meta: `⭐ ${Number(highestRated.rating || 0).toFixed(1)} Rating`,
      });
      usedProductNames.add((highestRated.productName || "").toLowerCase().trim());
    }

    // 3. Best Value (Distinct product name)
    const valueCandidates = stores
      .slice()
      .filter((s) => !usedProductNames.has((s.productName || "").toLowerCase().trim()))
      .sort((a, b) => {
        const scoreA = Number(a.price) > 0 ? Number(a.rating || 0) / Number(a.price) : 0;
        const scoreB = Number(b.price) > 0 ? Number(b.rating || 0) / Number(b.price) : 0;
        return scoreB - scoreA;
      });

    const bestValue = valueCandidates[0] || stores.filter((s) => s.id !== cheapest?.id && s.id !== highestRated?.id)[0] || cheapest;

    if (bestValue && picks.length < 3) {
      const valueScore = ((Number(bestValue.rating || 0) / Number(bestValue.price || 1)) * 100).toFixed(1);
      picks.push({
        type: "Best Value",
        badge: "Best Value 💡",
        item: bestValue,
        productName: bestValue.productName || "Product",
        storeName: bestValue.storeName || "Local Retailer",
        meta: `Score ${valueScore} • ${currency(bestValue.price)}`,
      });
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
            <div className="recommendation-item smart-pick-card" key={`${pick.type}-${pick.item.id}-${pick.productName}`}>
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
