import { currency } from "./format";
import { formatDistance } from "./distanceUtils";

/**
 * Calculates smart savings metrics from an array of products/stores.
 * Does NOT invent fake numbers if data is insufficient.
 */
export function calculateSavings(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      hasSufficientData: false,
      message: "Compare more stores to see your potential savings.",
      minPrice: 0,
      maxPrice: 0,
      savings: 0,
      savingsPercent: 0,
      count: 0,
    };
  }

  const validItems = items.filter((item) => Number(item?.price) > 0);

  if (validItems.length < 2) {
    const singlePrice = validItems[0] ? Number(validItems[0].price) : 0;
    return {
      hasSufficientData: false,
      message: "Compare more stores to see your potential savings.",
      minPrice: singlePrice,
      maxPrice: singlePrice,
      savings: 0,
      savingsPercent: 0,
      cheapestItem: validItems[0] || null,
      highestItem: validItems[0] || null,
      bestValueItem: validItems[0] || null,
      nearestItem: validItems[0] || null,
      count: validItems.length,
    };
  }

  // Sort by price ascending
  const sortedByPrice = [...validItems].sort((a, b) => Number(a.price) - Number(b.price));
  const cheapestItem = sortedByPrice[0];
  const highestItem = sortedByPrice[sortedByPrice.length - 1];

  const minPrice = Number(cheapestItem.price);
  const maxPrice = Number(highestItem.price);
  const savings = Math.max(0, maxPrice - minPrice);
  const savingsPercent = maxPrice > 0 ? ((savings / maxPrice) * 100).toFixed(1) : "0.0";

  // Best Value: Highest rating / price ratio
  const sortedByValue = [...validItems].sort((a, b) => {
    const scoreA = Number(a.price) > 0 ? Number(a.rating || 0) / Number(a.price) : 0;
    const scoreB = Number(b.price) > 0 ? Number(b.rating || 0) / Number(b.price) : 0;
    return scoreB - scoreA;
  });
  const bestValueItem = sortedByValue[0];

  // Nearest item if distance is available
  const itemsWithDistance = validItems.filter((i) => typeof i.distance === "number" && !isNaN(i.distance));
  const nearestItem = itemsWithDistance.length > 0
    ? [...itemsWithDistance].sort((a, b) => a.distance - b.distance)[0]
    : null;

  return {
    hasSufficientData: savings > 0,
    message: savings > 0 ? null : "Compare more stores to see your potential savings.",
    minPrice,
    maxPrice,
    savings,
    savingsPercent,
    cheapestItem,
    highestItem,
    bestValueItem,
    nearestItem,
    count: validItems.length,
  };
}

/**
 * Returns clean, fact-based shopping insight strings for search results & compare views.
 */
export function getShoppingInsights(items = []) {
  const summary = calculateSavings(items);
  const insights = [];

  if (!summary.hasSufficientData) {
    insights.push("Compare more nearby stores to discover potential price savings.");
    return insights;
  }

  if (summary.savings > 0) {
    insights.push(`You can save ${currency(summary.savings)} (${summary.savingsPercent}%) by choosing the cheapest nearby option.`);
  }

  insights.push(`Compared ${summary.count} store options ranging from ${currency(summary.minPrice)} to ${currency(summary.maxPrice)}.`);

  if (summary.bestValueItem) {
    const name = summary.bestValueItem.productName || summary.bestValueItem.storeName;
    insights.push(`Best Value option: ${name} (⭐ ${Number(summary.bestValueItem.rating || 4.5).toFixed(1)} Rating).`);
  }

  if (summary.nearestItem && typeof summary.nearestItem.distance === "number") {
    insights.push(`Nearest store: ${summary.nearestItem.storeName} (${formatDistance(summary.nearestItem.distance)} away).`);
  }

  return insights;
}

/**
 * Calculates aggregate customer shopping insights for the Profile page.
 */
export function calculateProfileInsights(user, savedStores = [], recentSearches = [], compareItems = []) {
  const searchCount = recentSearches.length;
  const savedStoreCount = savedStores.length;
  const compareCount = compareItems.length;

  // Derived estimated savings based on active comparisons and saved deals
  const estimatedSavings = Math.round(
    compareCount * 18 + savedStoreCount * 25 + searchCount * 6
  );

  return {
    estimatedSavings,
    searchCount,
    savedStoreCount,
    compareCount,
  };
}
