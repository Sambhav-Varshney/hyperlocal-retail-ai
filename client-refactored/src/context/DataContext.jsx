import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { getBudgetType, safeJSONParse } from "../utils/format";
import { calculateDistance, DEFAULT_MARKET_LOCATION } from "../utils/distanceUtils";
import { isSameProductFamily, getProductDisplayName } from "../utils/productMatcher";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const DataContext = createContext(null);

const normalizeFilterValue = (value) => String(value ?? "").trim().toLowerCase();

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
  const [stores, setStores] = useState([]);
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

    if (categoriesResult.status === "fulfilled") {
      setCategories(Array.isArray(categoriesResult.value) ? categoriesResult.value : []);
    }
    if (storesResult.status === "fulfilled") setStores(storesResult.value || []);
    if (usersResult.status === "fulfilled") setUsers(usersResult.value || []);
    if (searchLogsResult.status === "fulfilled") setSearchLogs(searchLogsResult.value || []);

    const failedRequests = results.filter((result) => result.status === "rejected");
    if (failedRequests.length) {
      showToast(
        failedRequests[0].reason?.message || "Some dashboard data could not be loaded",
        "error"
      );
    }

    setLoading(false);
  }, [showToast]);

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

  const filteredStores = useMemo(() => {
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

    const matched = withDistance
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
      .filter((store) => !showOffers || store.hasOffer !== false)
      .filter((store) => {
        if (!term) return true;

        const pName = normalizeFilterValue(store.productName);
        const bName = normalizeFilterValue(store.brand);
        const cName = normalizeFilterValue(store.category);
        const sName = normalizeFilterValue(store.storeName);

        return pName.includes(term) || bName.includes(term) || cName.includes(term) || sName.includes(term);
      })
      .map((store) => {
        if (!term) {
          return { ...store, matchReason: null };
        }

        const p = store.productName?.toLowerCase() || "";
        const c = store.category?.toLowerCase() || "";
        const s = store.storeName?.toLowerCase() || "";

        if (p.includes(term)) return { ...store, matchReason: "Matched Product" };
        if (c.includes(term)) return { ...store, matchReason: "Matched Category" };
        if (s.includes(term)) return { ...store, matchReason: "Matched Store" };

        return { ...store, matchReason: "Partial Match" };
      })
      .sort((a, b) => {
        if (sortBy === "Lowest Price" || sortBy === "Price Low") return Number(a.price ?? Infinity) - Number(b.price ?? Infinity);
        if (sortBy === "Highest Price") return Number(b.price ?? -Infinity) - Number(a.price ?? -Infinity);
        if (sortBy === "Highest Rating" || sortBy === "Rating High") return Number(b.rating ?? -Infinity) - Number(a.rating ?? -Infinity);
        if (sortBy === "Nearest Store" || sortBy === "Nearby") return (a.distance ?? 99999) - (b.distance ?? 99999);
        return 0; // Best Match preserves relevance order
      });

    return matched;
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

  const handleSearch = useCallback(
    async (explicitQuery) => {
      const term = (explicitQuery !== undefined ? explicitQuery : search).trim();
      setSearch(term);
      setCommittedSearch(term);

      setLoading(true);
      try {
        const storeData = await api.getStores(term);
        setStores(storeData || []);

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
          });
        }
      } catch (error) {
        showToast(error.message || "Search failed", "error");
        setStores([]);
      } finally {
        setLoading(false);
      }
    },
    [search, user, location, showToast]
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

  const toggleSavedStore = useCallback((store) => {
    setSavedStores((current) => {
      const exists = current.some((item) => item.id === store.id);
      if (exists) return current.filter((item) => item.id !== store.id);
      return [store, ...current];
    });
  }, []);

  const saveComparison = useCallback(
    (comparison) => {
      if (!user) {
        openAuthModal("/login", "Login to save this comparison and continue.");
        return;
      }
      setSavedComparisons((current) => [comparison, ...current]);
      showToast("Comparison saved");
    },
    [user, openAuthModal, showToast]
  );

  const saveProduct = useCallback((product) => {
    setSavedProducts((current) => {
      if (current.some((item) => item.id === product.id)) return current;
      return [product, ...current];
    });
    showToast("Product saved");
  }, [showToast]);

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
