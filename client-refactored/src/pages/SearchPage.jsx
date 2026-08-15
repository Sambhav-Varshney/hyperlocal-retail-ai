import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import SearchFilters from "../components/forms/SearchFilters";
import StoreCard from "../components/cards/StoreCard";
import NearbyMap from "../components/ui/NearbyMap";
import RecommendationPanel from "../components/ui/RecommendationPanel";
import EmptyState from "../components/common/EmptyState";
import MapToggle from "../components/ui/MapToggle";
import LocationPermissionAlert from "../components/ui/LocationPermissionAlert";

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    search,
    setSearch,
    setCommittedSearch,
    handleSearch,
    selectedCategory,
    setSelectedCategory,
    budget,
    setBudget,
    sortBy,
    setSortBy,
    categories,
    handleUseLocation,
    location,
    locationDenied,
    loading,
    filteredStores,
    isFallbackSearch,
    didYouMeanSuggestions,
    bestPrice,
    savedStores,
    toggleSavedStore,
    showOpenNow,
    setShowOpenNow,
    showOffers,
    setShowOffers,
    minRating,
    setMinRating,
    resetFilters,
  } = useData();

  const [viewMode, setViewMode] = useState("both"); // "both" | "grid" | "map"
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const visibleProducts = filteredStores;
  const initializedQueryRef = useRef(null);

  // Sync with URL params ONCE per distinct URL parameter change
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const queryParam = searchParams.get("q") || searchParams.get("keyword");

    if (queryParam !== null && queryParam !== undefined && queryParam !== initializedQueryRef.current) {
      initializedQueryRef.current = queryParam;
      setSearch(queryParam);
      setCommittedSearch(queryParam);
    }
    if (categoryParam) {
      const matchedCategory = categories.find(
        (category) => category.slug === categoryParam || category.categoryName.toLowerCase() === categoryParam.toLowerCase()
      );
      setSelectedCategory(matchedCategory?.slug || matchedCategory?.id || categoryParam);
    }
  }, [searchParams, categories, setSearch, setCommittedSearch, setSelectedCategory]);

  const onSearchSubmit = (explicitQuery) => {
    const term = explicitQuery !== undefined ? explicitQuery : search;
    handleSearch(term);
    setSearchParams(term ? { keyword: term } : {});
  };

  const handleFocusStoreOnMap = (storeId) => {
    setSelectedStoreId(storeId);
    if (viewMode === "grid") setViewMode("both");
  };

  const savedIds = new Set(savedStores.map((store) => store.id));

  return (
    <div className="content-grid">
      <div className="results-column">
        {locationDenied ? (
          <LocationPermissionAlert onTryAgain={handleUseLocation} />
        ) : null}

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

        {/* Full-width Map View (if viewMode === "map") */}
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

        {/* Grid Results Panel (rendered in "both" and "grid" view modes) */}
        {viewMode !== "map" ? (
          <div className="panel search-results-panel">
            <div className="results-header" style={{ flexWrap: "wrap", gap: "12px" }}>
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

              <div className="card-actions" style={{ flexWrap: "wrap", gap: "10px" }}>
                <MapToggle viewMode={viewMode} setViewMode={setViewMode} />
                <label className="pill">
                  <input
                    type="checkbox"
                    checked={showOpenNow}
                    onChange={(event) => setShowOpenNow(event.target.checked)}
                  />
                  {" "}Open now
                </label>
                <label className="pill">
                  <input
                    type="checkbox"
                    checked={showOffers}
                    onChange={(event) => setShowOffers(event.target.checked)}
                  />
                  {" "}Offers only
                </label>
                <select value={minRating} onChange={(event) => setMinRating(Number(event.target.value))}>
                  <option value={0}>Any Rating</option>
                  <option value={4}>4★+</option>
                  <option value={4.5}>4.5★+</option>
                  <option value={5}>5★</option>
                </select>
              </div>
            </div>

            <div className="store-grid search-store-grid">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => <div className="home-skeleton store-skeleton" key={index} />)
              ) : visibleProducts.length ? (
                visibleProducts.map((store) => (
                  <StoreCard
                    key={store.productId ? `p-${store.productId}` : `s-${store.id}-${store.productName || ""}`}
                    store={store}
                    distance={store.distance}
                    bestDeal={bestPrice !== null && Number(store.price || 0) === bestPrice}
                    saved={savedIds.has(store.id)}
                    onSave={toggleSavedStore}
                    onFocusOnMap={handleFocusStoreOnMap}
                    visual
                  />
                ))
              ) : (
                <EmptyState title="Couldn't find an exact match" onClearFilters={resetFilters}>
                  Try adjusting your filters or search keywords above.
                </EmptyState>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Side Column (Nearby Map + Smart Picks) */}
      <div className="side-column">
        {viewMode !== "grid" ? (
          <NearbyMap
            stores={visibleProducts}
            location={location}
            selectedStoreId={selectedStoreId}
            onSelectStore={setSelectedStoreId}
            compact={true}
          />
        ) : null}
        <RecommendationPanel stores={visibleProducts} />
      </div>
    </div>
  );
}

export default SearchPage;
