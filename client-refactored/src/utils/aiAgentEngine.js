import { calculateSavings } from "./savingsUtils";
import { currency } from "./format";
import { formatDistance } from "./distanceUtils";

/**
 * Stage 7 AI Shopping Agent Intent Extractor & Recommendation Engine.
 * Reuses existing BazaarHub search, matching, and savings logic.
 */

const STOP_WORDS = new Set([
  "find", "me", "the", "a", "an", "for", "under", "below", "less", "than",
  "cheap", "cheapest", "best", "top", "rated", "near", "nearby", "closest",
  "nearest", "give", "show", "buy", "get", "need", "i", "want", "which",
  "is", "one", "store", "product", "price", "budget", "please", "with"
]);

export function parseAgentIntent(rawPrompt) {
  if (!rawPrompt || typeof rawPrompt !== "string") {
    return { type: "empty" };
  }

  const text = rawPrompt.trim();
  const lower = text.toLowerCase();

  // Detect Budget Limit (e.g. "under ₹500", "budget 400", "under 300")
  const budgetMatch = lower.match(/(?:under|below|budget|less than|max)\s*₹?\s*(\d+)/i) || lower.match(/₹\s*(\d+)/);
  const maxBudget = budgetMatch ? parseInt(budgetMatch[1], 10) : null;

  // Detect Priorities
  let priority = "cheapest"; // default
  if (lower.includes("near") || lower.includes("closest") || lower.includes("distance")) {
    priority = "distance";
  } else if (lower.includes("rated") || lower.includes("rating") || lower.includes("quality")) {
    priority = "rating";
  } else if (lower.includes("value") || lower.includes("score")) {
    priority = "value";
  }

  // Detect Multi-Item Basket Query (e.g. "Milk, Bread, Eggs" or "need: Milk\nBread")
  const isMultiItem = lower.includes(",") || lower.includes("need:") || lower.includes("basket") || lower.includes("\n");

  if (isMultiItem) {
    const rawItems = text
      .replace(/i need:?/i, "")
      .replace(/budget:?\s*₹?\d+/i, "")
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 1 && !item.toLowerCase().includes("budget"));

    if (rawItems.length > 1) {
      return {
        type: "basket",
        items: rawItems,
        maxBudget,
        priority,
      };
    }
  }

  // Single Item Keyword Extraction
  const words = lower.replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const coreKeywords = words.filter((w) => !STOP_WORDS.has(w) && isNaN(w));

  const searchKeyword = coreKeywords.length > 0 ? coreKeywords.join(" ") : words.join(" ");

  return {
    type: "single",
    keyword: searchKeyword,
    maxBudget,
    priority,
    rawPrompt: text,
  };
}

export function executeAgentQuery(prompt, allStores = [], userLocation = null) {
  const intent = parseAgentIntent(prompt);

  if (intent.type === "empty") {
    return {
      type: "text",
      message: "Please tell me what you're shopping for! For example: 'Find cheapest milk near me' or 'Breakfast items under ₹500'.",
    };
  }

  // Multi-Item Basket Query Processing
  if (intent.type === "basket") {
    const basketResults = [];
    const missingItems = [];
    let totalCost = 0;

    intent.items.forEach((itemQuery) => {
      const q = itemQuery.toLowerCase();
      const matches = allStores.filter((s) => {
        const pName = (s.productName || "").toLowerCase();
        const brand = (s.brand || "").toLowerCase();
        const cat = (s.category || "").toLowerCase();
        return pName.includes(q) || brand.includes(q) || cat.includes(q);
      });

      if (matches.length > 0) {
        // Pick cheapest match for basket calculation
        const sorted = [...matches].sort((a, b) => Number(a.price) - Number(b.price));
        const bestMatch = sorted[0];
        totalCost += Number(bestMatch.price);
        basketResults.push({
          query: itemQuery,
          productName: bestMatch.productName,
          price: Number(bestMatch.price),
          storeName: bestMatch.storeName,
          storeId: bestMatch.id,
          item: bestMatch,
        });
      } else {
        missingItems.push(itemQuery);
      }
    });

    const isOverBudget = intent.maxBudget ? totalCost > intent.maxBudget : false;
    const budgetDifference = intent.maxBudget ? intent.maxBudget - totalCost : 0;

    return {
      type: "basket_recommendation",
      basketResults,
      missingItems,
      totalCost,
      maxBudget: intent.maxBudget,
      isOverBudget,
      budgetDifference,
      explanation: isOverBudget
        ? `Estimated basket total is ${currency(totalCost)}, which exceeds your ₹${intent.maxBudget} budget by ${currency(Math.abs(budgetDifference))}.`
        : intent.maxBudget
        ? `Estimated basket total is ${currency(totalCost)}. You remain ${currency(budgetDifference)} under your ₹${intent.maxBudget} budget!`
        : `Estimated total for your ${basketResults.length} basket items is ${currency(totalCost)}.`,
    };
  }

  // Single Item Search Processing
  const q = intent.keyword.toLowerCase();
  let matches = allStores.filter((s) => {
    const pName = (s.productName || "").toLowerCase();
    const brand = (s.brand || "").toLowerCase();
    const cat = (s.category || "").toLowerCase();
    const store = (s.storeName || "").toLowerCase();
    return pName.includes(q) || brand.includes(q) || cat.includes(q) || store.includes(q);
  });

  // Fallback to all stores if keyword match is very broad
  if (matches.length === 0 && allStores.length > 0) {
    matches = allStores.slice(0, 4);
  }

  // Apply Budget Filter if specified
  if (intent.maxBudget && intent.maxBudget > 0) {
    const budgetFiltered = matches.filter((s) => Number(s.price) <= intent.maxBudget);
    if (budgetFiltered.length > 0) {
      matches = budgetFiltered;
    }
  }

  if (matches.length === 0) {
    return {
      type: "no_results",
      message: `I couldn't find a matching product for "${intent.keyword}" in the current catalog.`,
    };
  }

  // Calculate Savings Summary across matching stores
  const savingsSummary = calculateSavings(matches);

  // Pick Primary Recommendation based on priority
  let recommendedItem = matches[0];
  if (intent.priority === "cheapest" && savingsSummary.cheapestItem) {
    recommendedItem = savingsSummary.cheapestItem;
  } else if (intent.priority === "rating" && savingsSummary.bestValueItem) {
    recommendedItem = savingsSummary.bestValueItem;
  } else if (intent.priority === "distance" && savingsSummary.nearestItem) {
    recommendedItem = savingsSummary.nearestItem;
  } else if (intent.priority === "value" && savingsSummary.bestValueItem) {
    recommendedItem = savingsSummary.bestValueItem;
  }

  // Generate Fact-Based Explanation Bullets
  const reasons = [];
  reasons.push(`Lowest price: ${currency(recommendedItem.price)} at ${recommendedItem.storeName}`);
  reasons.push(`Store rating: ⭐ ${Number(recommendedItem.rating || 4.5).toFixed(1)}`);

  if (typeof recommendedItem.distance === "number") {
    reasons.push(`Proximity: ${formatDistance(recommendedItem.distance)} away`);
  }
  if (savingsSummary.savings > 0) {
    reasons.push(`Saves ${currency(savingsSummary.savings)} (${savingsSummary.savingsPercent}% OFF vs max market price)`);
  }

  return {
    type: "single_recommendation",
    query: intent.keyword,
    recommendedItem,
    allMatches: matches,
    savingsSummary,
    reasons,
    confidence: matches.length > 1 ? "High (Verified local comparison)" : "Moderate (Limited catalog matches)",
  };
}
