import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../services/api";
import { getBudgetType, safeJSONParse } from "../utils/format";
import { calculateDistance, DEFAULT_MARKET_LOCATION } from "../utils/distanceUtils";
import { isSameProductFamily, getProductDisplayName } from "../utils/productMatcher";
import { FALLBACK_STORES } from "../data/mockStoresData";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const DataContext = createContext(null);

const normalizeFilterValue = (value) => String(value ?? "").trim().toLowerCase();

const STOP_WORDS = new Set([
  "cheapest", "cheap", "best", "top", "rated", "near", "me", "find", "buy", "get",
  "store", "stores", "product", "products", "show", "give", "looking", "for",
  "the", "a", "an", "in", "at", "with", "under", "above", "approx", "nearby", "please"
]);

function parseSearchKeywords(rawTerm) {
  if (!rawTerm) return [];
  const words = rawTerm.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const coreKeywords = words.filter((w) => !STOP_WORDS.has(w));
  return coreKeywords.length > 0 ? coreKeywords : words;
}

const COMMON_SUGGESTION_MAP = {
  coffee: ["Coffee", "Nescafe Coffee", "Bru Coffee"],
  cofee: ["Coffee", "Nescafe Coffee", "Bru Coffee"],
  milk: ["Amul Gold Milk", "Mother Dairy Milk", "Amul Butter"],
  milkk: ["Amul Gold Milk", "Mother Dairy Milk", "Amul Butter"],
  tea: ["Red Label Tea", "Tata Tea Gold"],
  atta: ["Aashirvaad Atta", "India Gate Rice"],
  toothpaste: ["Colgate Toothpaste", "Closeup Toothpaste"],
  toothpste: ["Colgate Toothpaste", "Closeup Toothpaste"],
  chips: ["Lay's Potato Chips", "Kurkure Masala Munch", "Bingo Mad Angles"],
  shampoo: ["Clinic Plus Shampoo", "Head & Shoulders"],
  shampoe: ["Clinic Plus Shampoo", "Head & Shoulders"],
  biscuit: ["Parle-G Biscuits", "Britannia Good Day"],
  biscuits: ["Parle-G Biscuits", "Britannia Good Day"],
  soap: ["Lux Rose Soap", "Dove Beauty Soap", "Lifebuoy Soap"],
  soapp: ["Lux Rose Soap", "Dove Beauty Soap", "Lifebuoy Soap"],
  maggi: ["Maggi 2-Minute Noodles", "Yippee Masala Noodles"],
  coldrink: ["Coca-Cola", "Pepsi", "Sprite"],
  juice: ["Real Mixed Fruit Juice"],
  oil: ["Fortune Sunflower Oil"],
  detergent: ["Surf Excel Detergent", "Ariel Detergent"],
};

function getDidYouMeanSuggestions(rawTerm, allStores) {
  if (!rawTerm) return [];
  const lower = rawTerm.toLowerCase().trim();

  for (const [key, suggestions] of Object.entries(COMMON_SUGGESTION_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return suggestions;
    }
  }

  const uniqueNames = Array.from(
    new Set(allStores.map((s) => s.productName).filter(Boolean))
  );

  const keywords = lower.split(/\s+/).filter((w) => w.length >= 2);
  if (!keywords.length) return uniqueNames.slice(0, 4);

  const matched = uniqueNames.filter((name) => {
    const n = name.toLowerCase();
    return keywords.some((kw) => n.includes(kw) || kw.includes(n));
  });

  return matched.length > 0
    ? matched.slice(0, 4)
    : ["Amul Gold Milk 1L", "Maggi 2-Minute Masala Noodles 280g", "Nescafe Classic Instant Coffee 50g", "Lay's Classic Salted Potato Chips 50g"];
}

const getOfferState = (store) => {
  const offerValue = store.hasOffer ?? store.offerAvailable ?? store.offer ?? store.discount ?? store.discountPercent ?? store.offerPrice;
  if (offerValue === undefined || offerValue === null || offerValue === "") return null;
  if (typeof offerValue === "boolean") return offerValue;
  if (typeof offerValue === "number") return offerValue > 0;
  return ["1", "true", "yes", "available", "active"].includes(normalizeFilterValue(offerValue));
};

const isStoreOpen = (store) => {
  if (store.isOpen === undefined || store.isOpen === null) return null;
  return [1, true, "1", "true", "open"].includes(store.isOpen) || normalizeFilterValue(store.isOpen) === "open";
};

export function DataProvider({ children }) {
  const { user } = useAuth();
  const { showToast, openAuthModal } = useUI();

  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState(FALLBACK_STORES);
  const [users, setUsers] = useState([]);
  const [searchLogs, setSearchLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [searchType, setSearchType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [budget, setBudget] = useState("All");
  const [sortBy, setSortBy] = useState("Best Match");
  const [showOpenNow, setShowOpenNow] = useState(false);
  const [showOffers, setShowOffers] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [location, setLocation] = useState(null);

  const [compareStores, setCompareStores] = useState(
    () => safeJSONParse(localStorage.getItem("compareStores")) || []
  );
  const [savedStores, setSavedStores] = useState(
    () => safeJSONParse(localStorage.getItem("savedStores")) || []
  );
  const [savedProducts, setSavedProducts] = useState(
    () => safeJSONParse(localStorage.getItem("savedProducts")) || []
  );
  const [savedComparisons, setSavedComparisons] = useState(
    () => safeJSONParse(localStorage.getItem("savedComparisons")) || []
  );
  const [recentSearches, setRecentSearches] = useState(
    () => safeJSONParse(localStorage.getItem("recentSearches")) || []
  );
  const [recentViews, setRecentViews] = useState(
    () => safeJSONParse(localStorage.getItem("recentViews")) || []
  );

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.getCategories(),
      api.getStores(),
      api.getUsers(),
      api.getSearchLogs(),
    ]);

    const [categoriesResult, storesResult, usersResult, searchLogsResult] = results;

    if (categoriesResult.status === "fulfilled" && Array.isArray(categoriesResult.value) && categoriesResult.value.length > 0) {
      setCategories(categoriesResult.value);
    } else {
      setCategories([
        { id: 1, categoryName: "Groceries", slug: "groceries" },
        { id: 2, categoryName: "Dairy", slug: "dairy" },
        { id: 3, categoryName: "Beverages", slug: "beverages" },
        { id: 4, categoryName: "Snacks", slug: "snacks" },
        { id: 5, categoryName: "Personal Care", slug: "personal-care" },
        { id: 6, categoryName: "Cleaning", slug: "cleaning" },
        { id: 7, categoryName: "Bakery", slug: "bakery" },
        { id: 8, categoryName: "Spices", slug: "spices" },
      ]);
    }

    if (storesResult.status === "fulfilled" && Array.isArray(storesResult.value) && storesResult.value.length > 0) {
      setStores(storesResult.value);
    } else {
      setStores(FALLBACK_STORES);
    }

    if (usersResult.status === "fulfilled") setUsers(usersResult.value || []);
    if (searchLogsResult.status === "fulfilled") setSearchLogs(searchLogsResult.value || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    localStorage.setItem("savedStores", JSON.stringify(savedStores));
  }, [savedStores]);

  useEffect(() => {
    localStorage.setItem("savedProducts", JSON.stringify(savedProducts));
  }, [savedProducts]);

  useEffect(() => {
    localStorage.setItem("savedComparisons", JSON.stringify(savedComparisons));
  }, [savedComparisons]);

  useEffect(() => {
    localStorage.setItem("compareStores", JSON.stringify(compareStores));
  }, [compareStores]);

  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  useEffect(() => {
    localStorage.setItem("recentViews", JSON.stringify(recentViews));
  }, [recentViews]);

  // Compute search state, fallbacks, and suggestions
  const { filteredStores, isFallbackSearch, didYouMeanSuggestions } = useMemo(() => {
    const normalizedSelectedCategory = normalizeFilterValue(selectedCategory);
    const selectedCategoryData = categories.find((category) =>
      [category.id, category.slug, category.categoryName].some(
        (value) => normalizeFilterValue(value) === normalizedSelectedCategory
      )
    );
    const selectedCategoryValues = new Set(
      [
        selectedCategory,
        selectedCategoryData?.id,
        selectedCategoryData?.slug,
        selectedCategoryData?.categoryName,
      ].map(normalizeFilterValue).filter(Boolean)
    );

    const activeLoc = location || DEFAULT_MARKET_LOCATION;
    const withDistance = stores.map((store) => ({
      ...store,
      distance: calculateDistance(activeLoc.lat, activeLoc.lon, store.latitude, store.longitude),
      hasOffer: getOfferState(store),
    }));

    const term = committedSearch.trim().toLowerCase();

    // 1. Base Filter (Category, Budget, Rating, OpenNow, Offers)
    const baseFiltered = withDistance
      .filter((store) => {
        if (!normalizedSelectedCategory || normalizedSelectedCategory === "all") return true;

        const storeCategoryValues = [
          store.categoryId,
          store.category_id,
          store.categorySlug,
          store.category_slug,
          store.category,
        ].map(normalizeFilterValue).filter(Boolean);

        return storeCategoryValues.some((value) => selectedCategoryValues.has(value));
      })
      .filter((store) => {
        if (!budget || budget === "All") return true;
        if (store.budget !== undefined && store.budget !== null && store.budget !== "") {
          return normalizeFilterValue(store.budget) === normalizeFilterValue(budget);
        }
        if (store.price === undefined || store.price === null || store.price === "") return true;

        const price = Number(store.price);
        if (!Number.isFinite(price) || price <= 0) return true;
        if (budget === "under-100") return price < 100;
        if (budget === "100-500") return price >= 100 && price <= 500;
        if (budget === "500-1000") return price > 500 && price <= 1000;
        if (budget === "above-1000") return price > 1000;

        return getBudgetType(price) === budget;
      })
      .filter((store) => {
        if (!minRating) return true;
        if (store.rating === undefined || store.rating === null || store.rating === "") return true;

        const rating = Number(store.rating);
        return Number.isNaN(rating) ? true : rating >= minRating;
      })
      .filter((store) => !showOpenNow || isStoreOpen(store) !== false)
      .filter((store) => !showOffers || store.hasOffer !== false);

    if (!term) {
      const sorted = baseFiltered.slice().sort((a, b) => {
        if (sortBy === "Lowest Price" || sortBy === "Price Low") return Number(a.price ?? Infinity) - Number(b.price ?? Infinity);
        if (sortBy === "Highest Price") return Number(b.price ?? -Infinity) - Number(a.price ?? -Infinity);
        if (sortBy === "Highest Rating" || sortBy === "Rating High") return Number(b.rating ?? -Infinity) - Number(a.rating ?? -Infinity);
        if (sortBy === "Nearest Store" || sortBy === "Nearby") return (a.distance ?? 99999) - (b.distance ?? 99999);
        return 0;
      });
      return { filteredStores: sorted, isFallbackSearch: false, didYouMeanSuggestions: [] };
    }

    // 2. Exact / Core Keyword Matching
    const exactMatched = baseFiltered.filter((store) => {
      const pName = normalizeFilterValue(store.productName);
      const bName = normalizeFilterValue(store.brand);
      const cName = normalizeFilterValue(store.category);
      const sName = normalizeFilterValue(store.storeName);
      const fullText = `${pName} ${bName} ${cName} ${sName}`;

      if (fullText.includes(term)) return true;

      const keywords = parseSearchKeywords(term);
      if (!keywords.length) return true;

      return keywords.some((kw) => fullText.includes(kw));
    });

function calculateRelevanceScore(store, term) {
  if (!term) return 0;
  const pName = store.productName?.toLowerCase() || "";
  const category = store.category?.toLowerCase() || "";

  let score = 0;

  if (term === "milk" && category === "dairy") score += 100;
  if (term === "coffee" && category === "beverages") score += 100;
  if (term === "tea" && category === "beverages") score += 100;
  if (term === "soap" && category === "personal care") score += 100;
  if (term === "shampoo" && category === "personal care") score += 100;
  if (term === "atta" && category === "groceries") score += 100;
  if (term === "rice" && category === "groceries") score += 100;

  const wordRegex = new RegExp(`\\b${term}\\b`, "i");
  if (wordRegex.test(pName)) {
    score += 50;
    if (!pName.includes("chocolate") && !pName.includes("biscuit")) {
      score += 50;
    }
  }

  return score;
}

    if (exactMatched.length > 0) {
      const sorted = exactMatched.map((store) => {
        const p = store.productName?.toLowerCase() || "";
        const c = store.category?.toLowerCase() || "";
        const s = store.storeName?.toLowerCase() || "";

        if (p.includes(term)) return { ...store, matchReason: "Matched Product" };
        if (c.includes(term)) return { ...store, matchReason: "Matched Category" };
        if (s.includes(term)) return { ...store, matchReason: "Matched Store" };

        return { ...store, matchReason: "Partial Match" };
      }).sort((a, b) => {
        if (sortBy === "Lowest Price" || sortBy === "Price Low") return Number(a.price ?? Infinity) - Number(b.price ?? Infinity);
        if (sortBy === "Highest Price") return Number(b.price ?? -Infinity) - Number(a.price ?? -Infinity);
        if (sortBy === "Highest Rating" || sortBy === "Rating High") return Number(b.rating ?? -Infinity) - Number(a.rating ?? -Infinity);
        if (sortBy === "Nearest Store" || sortBy === "Nearby") return (a.distance ?? 99999) - (b.distance ?? 99999);

        const scoreDiff = calculateRelevanceScore(b, term) - calculateRelevanceScore(a, term);
        if (scoreDiff !== 0) return scoreDiff;

        return Number(a.price ?? Infinity) - Number(b.price ?? Infinity);
      });

      return { filteredStores: sorted, isFallbackSearch: false, didYouMeanSuggestions: [] };
    }

    // 3. Fallback Search — zero exact matches found
    const suggestions = getDidYouMeanSuggestions(term, stores);
    const fallbackResults = baseFiltered.slice(0, 8).map((store) => ({
      ...store,
      matchReason: "Related Recommendation",
    }));

    return {
      filteredStores: fallbackResults,
      isFallbackSearch: true,
      didYouMeanSuggestions: suggestions,
    };
  }, [
    stores,
    categories,
    selectedCategory,
    budget,
    sortBy,
    location,
    committedSearch,
    showOpenNow,
    showOffers,
    minRating,
  ]);

  const bestPrice = filteredStores.length
    ? Math.min(...filteredStores.map((store) => Number(store.price || 0)))
    : null;

  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const handleSearch = useCallback(
    async (explicitQuery) => {
      const term = (explicitQuery !== undefined ? explicitQuery : searchRef.current).trim();
      setSearch(term);
      setCommittedSearch(term);

      // Intelligent AI Natural Language Intent Detection
      const lower = term.toLowerCase();
      if (lower.includes("cheap") || lower.includes("cheapest") || lower.includes("lowest")) {
        setSortBy("Lowest Price");
      } else if (lower.includes("near") || lower.includes("location") || lower.includes("nearest")) {
        setSortBy("Nearest Store");
      } else if (lower.includes("best") || lower.includes("top") || lower.includes("rated")) {
        setSortBy("Highest Rating");
      }

      setLoading(true);
      try {
        let storeData = await api.getStores(term);
        if (!storeData || storeData.length === 0) {
          storeData = FALLBACK_STORES;
        }
        setStores(storeData);

        if (term) {
          setRecentSearches((current) =>
            [term, ...current.filter((item) => item !== term)].slice(0, 8)
          );
          await api.createSearchLog({
            userId: user?.id,
            keyword: term,
            city: location?.city || "",
            state: location?.state || "",
            latitude: location?.lat,
            longitude: location?.lon,
            resultsFound: storeData?.length || 0,
          }).catch(() => {});
        }
      } catch (error) {
        setStores(FALLBACK_STORES);
      } finally {
        setLoading(false);
      }
    },
    [user, location]
  );

  const handleUseLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported in this browser", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setSortBy("Nearby");
        showToast("Location enabled");
      },
      () => showToast("Location permission was not granted", "error")
    );
  }, [showToast]);

  const addToCompare = useCallback(
    (item) => {
      if (!item || (item.id === undefined && item.productId === undefined)) return;
      setCompareStores((current) => {
        const itemId = item.id ?? item.productId;
        const exists = current.some((existing) => (existing.id ?? existing.productId) === itemId);
        if (exists) return current;

        if (current.length > 0) {
          const firstItem = current[0];
          if (!isSameProductFamily(firstItem, item)) {
            const activeFamilyName = getProductDisplayName(firstItem);
            showToast(
              `You're currently comparing ${activeFamilyName} across nearby stores. Clear the comparison to compare another product.`,
              "error"
            );
            return current;
          }
        }

        if (current.length >= 4) {
          showToast("You can compare up to 4 items only", "error");
          return current;
        }
        return [...current, item];
      });
    },
    [showToast]
  );

  const removeFromCompare = useCallback((itemId) => {
    if (itemId === undefined || itemId === null) return;
    setCompareStores((current) =>
      current.filter((item) => String(item.id ?? item.productId) !== String(itemId))
    );
  }, []);

  const clearCompare = useCallback(() => {
    setCompareStores([]);
  }, []);

  const isCompared = useCallback(
    (itemId) => {
      if (itemId === undefined || itemId === null) return false;
      return compareStores.some((item) => String(item.id ?? item.productId) === String(itemId));
    },
    [compareStores]
  );

  const saveStore = useCallback(
    (store) => {
      if (!user) {
        openAuthModal("/login", "Sign in to save stores to your favorites.");
        return;
      }
      if (!store || store.id === undefined) return;
      setSavedStores((current) => {
        if (current.some((item) => String(item.id) === String(store.id))) return current;
        showToast(`${store.storeName || "Store"} saved to favorites`);
        return [store, ...current];
      });
    },
    [user, openAuthModal, showToast]
  );

  const removeSavedStore = useCallback(
    (storeId) => {
      if (storeId === undefined || storeId === null) return;
      setSavedStores((current) => {
        const filtered = current.filter((item) => String(item.id) !== String(storeId));
        if (filtered.length !== current.length) {
          showToast("Store removed from favorites");
        }
        return filtered;
      });
    },
    [showToast]
  );

  const isSaved = useCallback(
    (storeId) => {
      if (storeId === undefined || storeId === null) return false;
      return savedStores.some((item) => String(item.id) === String(storeId));
    },
    [savedStores]
  );

  const toggleSavedStore = useCallback(
    (store) => {
      if (!user) {
        openAuthModal("/login", "Sign in to save stores to your favorites.");
        return;
      }
      if (!store || store.id === undefined) return;
      setSavedStores((current) => {
        const exists = current.some((item) => String(item.id) === String(store.id));
        if (exists) {
          showToast("Store removed from favorites");
          return current.filter((item) => String(item.id) !== String(store.id));
        }
        showToast(`${store.storeName || "Store"} saved to favorites`);
        return [store, ...current];
      });
    },
    [user, openAuthModal, showToast]
  );

  const saveComparison = useCallback(
    (comparison) => {
      if (!user) {
        openAuthModal("/login", "Sign in to save this comparison and continue.");
        return;
      }
      setSavedComparisons((current) => [comparison, ...current]);
      showToast("Comparison saved");
    },
    [user, openAuthModal, showToast]
  );

  const saveProduct = useCallback(
    (product) => {
      if (!user) {
        openAuthModal("/login", "Sign in to save products to your favorites.");
        return;
      }
      setSavedProducts((current) => {
        if (current.some((item) => item.id === product.id)) return current;
        return [product, ...current];
      });
      showToast("Product saved");
    },
    [user, openAuthModal, showToast]
  );

  const recordView = useCallback((store) => {
    setRecentViews((current) => [store, ...current.filter((item) => item.id !== store.id)].slice(0, 12));
  }, []);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCommittedSearch("");
    setSelectedCategory("All");
    setBudget("All");
    setSortBy("Best Match");
    setShowOpenNow(false);
    setShowOffers(false);
    setMinRating(0);
  }, []);

  const value = {
    categories,
    stores,
    users,
    searchLogs,
    loading,
    search,
    setSearch,
    committedSearch,
    setCommittedSearch,
    searchType,
    setSearchType,
    selectedCategory,
    setSelectedCategory,
    budget,
    setBudget,
    sortBy,
    setSortBy,
    showOpenNow,
    setShowOpenNow,
    showOffers,
    setShowOffers,
    minRating,
    setMinRating,
    location,
    filteredStores,
    isFallbackSearch,
    didYouMeanSuggestions,
    bestPrice,
    handleSearch,
    handleUseLocation,
    resetFilters,
    compareItems: compareStores,
    compareStores,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isCompared,
    isInCompare: isCompared,
    savedStores,
    saveStore,
    removeSavedStore,
    isSaved,
    isSavedStore: isSaved,
    toggleSavedStore,
    savedProducts,
    saveProduct,
    savedComparisons,
    saveComparison,
    recentSearches,
    recentViews,
    recordView,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
}
