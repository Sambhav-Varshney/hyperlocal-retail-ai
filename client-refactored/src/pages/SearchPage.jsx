import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import LocationPermissionAlert from "../components/ui/LocationPermissionAlert";
import EmptyState from "../components/common/EmptyState";
import StoreCard from "../components/cards/StoreCard";
import SearchFilters from "../components/forms/SearchFilters";
import NearbyMap from "../components/ui/NearbyMap";
import MapToggle from "../components/ui/MapToggle";
import RecommendationPanel from "../components/ui/RecommendationPanel";
import SmartSavingsCard from "../components/ui/SmartSavingsCard";
import ShoppingInsightsCard from "../components/ui/ShoppingInsightsCard";
import AIShoppingAgent from "../components/ui/AIShoppingAgent";
import { useData } from "../context/DataContext";
import { calculateDistance } from "../utils/format";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialKeyword = searchParams.get("keyword") || searchParams.get("q") || "";

  const { stores, categories, loading, savedStores } = useData();

  const [search, setSearch] = useState(initialKeyword);
  const [committedSearch, setCommittedSearch] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [budget, setBudget] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState("both"); // "both" | "grid" | "map"
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const [location, setLocation] = useState({ lat: 28.6139, lng: 77.209, address: "Connaught Place, New Delhi" });
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    const queryCat = searchParams.get("category");
    const queryKw = searchParams.get("keyword") || searchParams.get("q");
    if (queryCat !== null) setSelectedCategory(queryCat);
    if (queryKw !== null) {
      setSearch(queryKw);
      setCommittedSearch(queryKw);
    }
  }, [searchParams]);

  const handleUseLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            address: "Your Current Location",
          });
          setLocationDenied(false);
        },
        () => {
          setLocationDenied(true);
        }
      );
    } else {
      setLocationDenied(true);
    }
  };

  const handleSearch = (term) => {
    setCommittedSearch(term);
  };

  const onSearchSubmit = (term) => {
    setSearch(term);
    handleSearch(term);
    setSearchParams(term ? { keyword: term } : {});
  };

  const handleFocusStoreOnMap = (storeId) => {
    setSelectedStoreId(storeId);
    if (viewMode === "grid") setViewMode("both");
  };

  const savedIds = new Set(savedStores.map((store) => store.id));

  // Product relevance & filtering engine
  const activeTerm = committedSearch.trim().toLowerCase();
  const maxBudget = budget ? Number(budget) : null;

  let filtered = stores.filter((store) => {
    if (selectedCategory && store.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (maxBudget && store.price > maxBudget) {
      return false;
    }
    if (activeTerm) {
      const matchName = store.productName?.toLowerCase().includes(activeTerm);
      const matchStore = store.storeName?.toLowerCase().includes(activeTerm);
      const matchCategory = store.category?.toLowerCase().includes(activeTerm);
      const matchBrand = store.brand?.toLowerCase().includes(activeTerm);
      const matchCity = store.city?.toLowerCase().includes(activeTerm);
      return matchName || matchStore || matchCategory || matchBrand || matchCity;
    }
    return true;
  });

  const isFallbackSearch = Boolean(activeTerm && filtered.length === 0);
  if (isFallbackSearch) {
    filtered = stores.slice(0, 8);
  }

  const sortedProducts = [...filtered].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "distance") {
      const distA = calculateDistance(location.lat, location.lng, a.latitude, a.longitude);
      const distB = calculateDistance(location.lat, location.lng, b.latitude, b.longitude);
      return distA - distB;
    }
    return 0;
  });

  const visibleProducts = sortedProducts;

  const didYouMeanSuggestions = isFallbackSearch && activeTerm
    ? ["Snacks", "Dairy", "Groceries", "Beverages", "Amul Toned Milk", "Maggi Noodles"].filter(
        (s) => s.toLowerCase() !== activeTerm
      ).slice(0, 3)
    : [];

  const layoutContainerClass = viewMode === "grid" ? "content-grid single-column-layout" : "content-grid";

  return (
    <div className={layoutContainerClass}>
      <div className="results-column">
        {locationDenied ? <LocationPermissionAlert onTryAgain={handleUseLocation} /> : null}

        {/* Stage 7: AI Shopping Agent */}
        <AIShoppingAgent />

        <SearchFilters
          search={search}
          setSearch={setSearch}
          setCommittedSearch={setCommittedSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          budget={budget}
          setBudget={setBudget}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          onSearch={onSearchSubmit}
          onUseLocation={handleUseLocation}
          location={location}
          loading={loading}
        />

        {/* Fallback Banner & "Did You Mean?" Suggestions */}
        {isFallbackSearch && search ? (
          <div className="search-fallback-banner panel" style={{ marginBottom: "20px", padding: "18px 22px" }}>
            <div className="fallback-banner-header" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span className="fallback-icon" style={{ fontSize: "1.6rem" }}>💡</span>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem", color: "var(--text-main)" }}>
                  Couldn't find an exact match for "{search}".
                </h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>
                  Showing related products and top deals nearby instead.
                </p>
              </div>
            </div>

            {didYouMeanSuggestions && didYouMeanSuggestions.length > 0 ? (
              <div className="did-you-mean-row" style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span className="did-you-mean-label" style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)" }}>
                  Did you mean?
                </span>
                <div className="did-you-mean-tags" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {didYouMeanSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="pill-btn active"
                      style={{ padding: "4px 12px", fontSize: "0.82rem", cursor: "pointer" }}
                      onClick={() => onSearchSubmit(suggestion)}
                    >
                      ✨ {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Stage 6: Smart Savings Summary & Shopping Insights Cards */}
        {visibleProducts.length > 0 ? (
          <>
            <SmartSavingsCard items={visibleProducts} />
            <ShoppingInsightsCard items={visibleProducts} />
          </>
        ) : null}

        {/* Main Search Panel: Always renders Header + MapToggle */}
        <div className="panel search-results-panel">
          <div className="results-header" style={{ flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
            <div>
              <p className="eyebrow">Results</p>
              <h2>
                {isFallbackSearch
                  ? `Recommended Products (${visibleProducts.length})`
                  : visibleProducts.length
                  ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "result" : "results"} found`
                  : "No results found"}
              </h2>
            </div>
            {/* MapToggle control bar is ALWAYS visible so user can switch between Grid, Split View, and Map View anytime */}
            <MapToggle viewMode={viewMode} onChangeViewMode={setViewMode} totalStores={visibleProducts.length} />
          </div>

          {/* If viewMode === "map", display interactive map directly below header */}
          {viewMode === "map" ? (
            <div style={{ marginBottom: "24px" }}>
              <NearbyMap
                stores={visibleProducts}
                location={location}
                selectedStoreId={selectedStoreId}
                onSelectStore={setSelectedStoreId}
                compact={false}
              />
            </div>
          ) : null}

          {visibleProducts.length ? (
            <div
              className="store-grid"
              style={
                viewMode === "grid"
                  ? { gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }
                  : undefined
              }
            >
              {visibleProducts.map((store) => (
                <StoreCard
                  key={`${store.id}-${store.productId || store.productName}`}
                  store={store}
                  isSaved={savedIds.has(store.id)}
                  onFocusMap={handleFocusStoreOnMap}
                />
              ))}
            </div>
          ) : (
            <EmptyState>No products or stores match your filters. Try clearing budget or category filters.</EmptyState>
          )}
        </div>
      </div>

      {viewMode !== "grid" ? (
        <div className="sidebar-column">
          {viewMode === "both" ? (
            <div style={{ position: "sticky", top: "90px", marginBottom: "24px", zIndex: 5 }}>
              <NearbyMap
                stores={visibleProducts}
                location={location}
                selectedStoreId={selectedStoreId}
                onSelectStore={setSelectedStoreId}
                compact={true}
              />
            </div>
          ) : null}
          <RecommendationPanel stores={visibleProducts} />
        </div>
      ) : null}
    </div>
  );
}

export default SearchPage;
