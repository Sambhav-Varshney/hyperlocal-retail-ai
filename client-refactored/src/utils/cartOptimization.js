import { currency } from "./format";

/**
 * Stage 8 Smart Basket / One-Trip Optimization Engine.
 * Evaluates total cost, store visits, distance, and potential savings.
 */
export function optimizeBasket(cartItems = [], allStores = []) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return {
      hasOptimization: false,
      message: "Add items to your cart to run One-Trip Basket Optimization.",
    };
  }

  // 1. Cheapest Plan (Multi-Store / Best price per item)
  const cheapestTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.unitPrice || 0) * item.quantity,
    0
  );

  const multiStoreCount = Array.from(new Set(cartItems.map((i) => i.storeName))).length;

  if (multiStoreCount <= 1 || allStores.length === 0) {
    return {
      hasOptimization: false,
      message: "All items in your basket currently come from a single store!",
      cheapestTotal,
      oneStoreTotal: cheapestTotal,
      storeDifference: 0,
      savingsDifference: 0,
    };
  }

  // 2. One-Store Plan (Evaluate single stores for best coverage & total cost)
  const storeTotalsMap = {};

  allStores.forEach((store) => {
    const storeName = store.storeName;
    if (!storeTotalsMap[storeName]) {
      storeTotalsMap[storeName] = {
        storeName,
        storeId: store.id,
        matchedCount: 0,
        totalCost: 0,
        distance: store.distance || null,
        rating: store.rating || 4.5,
      };
    }
  });

  // Calculate cost per store for matching items
  cartItems.forEach((cartItem) => {
    const qName = cartItem.productName.toLowerCase();

    Object.keys(storeTotalsMap).forEach((sName) => {
      const storeObj = storeTotalsMap[sName];
      const matchedStoreItem = allStores.find(
        (s) =>
          s.storeName === sName &&
          (s.productName || "").toLowerCase().includes(qName)
      );

      if (matchedStoreItem) {
        storeObj.matchedCount += 1;
        storeObj.totalCost += Number(matchedStoreItem.price) * cartItem.quantity;
      } else {
        // Fallback to current unit price if exact store item isn't in catalog snapshot
        storeObj.totalCost += Number(cartItem.unitPrice) * cartItem.quantity;
      }
    });
  });

  const storeOptions = Object.values(storeTotalsMap).sort(
    (a, b) => b.matchedCount - a.matchedCount || a.totalCost - b.totalCost
  );

  const bestOneStoreOption = storeOptions[0] || {
    storeName: cartItems[0].storeName,
    totalCost: cheapestTotal + 15,
  };

  const oneStoreTotal = bestOneStoreOption.totalCost;
  const savingsDifference = Math.max(0, oneStoreTotal - cheapestTotal);
  const storeDifference = multiStoreCount - 1;

  return {
    hasOptimization: true,
    cheapestPlan: {
      totalCost: cheapestTotal,
      storeCount: multiStoreCount,
    },
    oneStorePlan: {
      storeName: bestOneStoreOption.storeName,
      totalCost: oneStoreTotal,
      storeCount: 1,
    },
    savingsDifference,
    storeDifference,
    tradeoffMessage: `Save ${currency(savingsDifference)} with multi-store shopping, or save ${storeDifference} extra store visit${storeDifference > 1 ? "s" : ""} by shopping at ${bestOneStoreOption.storeName}!`,
  };
}
