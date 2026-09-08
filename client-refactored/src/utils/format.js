export function safeJSONParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function currency(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getBudgetType(price) {
  const amount = Number(price || 0);
  if (amount <= 250) return "Budget";
  if (amount <= 1000) return "Mid Range";
  return "Premium";
}

export function hasOffer(store) {
  if (!store.price) return false;
  return Number(store.price) <= 550 || Number(store.rating || 0) >= 4.3;
}

export function getAIMetrics(store, bestPrice) {
  const price = Number(store.price || 0);
  const saving = bestPrice && price > bestPrice ? price - bestPrice : 0;

  return {
    recommendation: price <= 500 && store.rating >= 4.2 ? "Smart Match" : "Best Value",
    saveEstimate: saving ? `₹${saving.toFixed(0)} estimated savings` : "No savings",
    matchScore: Math.min(100, Math.round((store.rating || 0) * 18 + (550 - price) / 10)),
  };
}

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const radLat1 = toRad(lat1);
  const deltaLat = toRad(Number(lat2) - Number(lat1));
  const deltaLon = toRad(Number(lon2) - Number(lon1));
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radLat1) * Math.cos(toRad(lat2)) * Math.sin(deltaLon / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

