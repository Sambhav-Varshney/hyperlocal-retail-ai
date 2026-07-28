import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";
import { distanceKm, getBudgetType, safeJSONParse } from "../utils/format";

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

    const withDistance = stores.map((store) => ({
      ...store,
      distance: distanceKm(store, location),
      hasOffer: getOfferState(store),
    }));

    const term = search.trim().toLowerCase();

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

        return [
          store.productName,
          store.brand,
          store.storeName,
          store.category,
          store.fullAddress,
          store.street,
          store.marketArea,
          store.city,
          store.state,
        ].some((value) => normalizeFilterValue(value).includes(term));
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
        if (sortBy === "Price Low") return Number(a.price ?? Infinity) - Number(b.price ?? Infinity);
        if (sortBy === "Rating High") return Number(b.rating ?? -Infinity) - Number(a.rating ?? -Infinity);
        if (sortBy === "Nearby") return (a.distance ?? 99999) - (b.distance ?? 99999);
        return Number(a.price || 0) - Number(b.price || 0);
      });

    return matched;
  }, [
    stores,
    categories,
    selectedCategory,
    budget,
    sortBy,
    location,
    search,
    showOpenNow,
    showOffers,
    minRating,
  ]);

  const bestPrice = filteredStores.length
    ? Math.min(...filteredStores.map((store) => Number(store.price || 0)))
    : null;

  const handleSearch = useCallback(async () => {
    setLoading(true);
    try {
      const storeData = await api.getStores(search.trim());
      setStores(storeData || []);

      if (search.trim()) {
        setRecentSearches((current) =>
          [search.trim(), ...current.filter((item) => item !== search.trim())].slice(0, 8)
        );
        await api.createSearchLog({
          userId: user?.id,
          keyword: search.trim(),
          city: location?.city || "",
          state: location?.state || "",
          latitude: location?.lat,
          longitude: location?.lon,
          resultsFound: storeData?.length || 0,
        });
      }

      showToast(`Found ${storeData?.length || 0} matching ${storeData?.length === 1 ? "result" : "results"}`);
    } catch (error) {
      showToast(error.message || "Search failed", "error");
      setStores([]);
    } finally {
      setLoading(false);
    }
  }, [search, user, location, showToast]);

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
    (store) => {
      setCompareStores((current) => {
        if (current.some((item) => item.id === store.id)) return current;
        if (current.length >= 4) {
          showToast("You can compare up to 4 stores only", "error");
          return current;
        }
        return [...current, store];
      });
    },
    [showToast]
  );

  const removeFromCompare = useCallback((storeId) => {
    setCompareStores((current) => current.filter((item) => item.id !== storeId));
  }, []);

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

  const value = {
    categories,
    stores,
    users,
    searchLogs,
    loading,
    search,
    setSearch,
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
    compareStores,
    addToCompare,
    removeFromCompare,
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
