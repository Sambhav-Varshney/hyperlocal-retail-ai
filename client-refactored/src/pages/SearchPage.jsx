import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useData } from "../context/DataContext";
import SearchFilters from "../components/forms/SearchFilters";
import StoreCard from "../components/cards/StoreCard";
import MapPanel from "../components/ui/MapPanel";
import RecommendationPanel from "../components/ui/RecommendationPanel";
import EmptyState from "../components/common/EmptyState";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const {
    search,
    setSearch,
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
    loading,
    filteredStores,
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

  // SINGLE SOURCE OF TRUTH DATASET
  const visibleProducts = filteredStores;

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const queryParam = searchParams.get("q") || searchParams.get("keyword");

    if (queryParam) handleSearch(queryParam);
    if (categoryParam) {
      const matchedCategory = categories.find(
        (category) => category.slug === categoryParam || category.categoryName.toLowerCase() === categoryParam.toLowerCase()
      );
      setSelectedCategory(matchedCategory?.slug || matchedCategory?.id || categoryParam);
    }
  }, [searchParams, categories, handleSearch, setSelectedCategory]);

  const savedIds = new Set(savedStores.map((store) => store.id));

  return (
    <div className="content-grid">
      <div className="results-column">
        <SearchFilters
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          budget={budget}
          setBudget={setBudget}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          onSearch={() => handleSearch()}
          onUseLocation={handleUseLocation}
          location={location}
          loading={loading}
        />

        <div className="panel search-results-panel">
          <div className="results-header">
            <div>
              <p className="eyebrow">Results</p>
              <h2>
                {visibleProducts.length
                  ? `${visibleProducts.length} ${visibleProducts.length === 1 ? "result" : "results"} found`
                  : "No results found"}
              </h2>
            </div>
            <div className="card-actions">
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
                <option value={0}>Any</option>
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
                  key={store.id}
                  store={store}
                  distance={store.distance}
                  bestDeal={bestPrice !== null && Number(store.price || 0) === bestPrice}
                  saved={savedIds.has(store.id)}
                  onSave={toggleSavedStore}
                  visual
                />
              ))
            ) : (
              <EmptyState title="No products found" onClearFilters={resetFilters}>
                No products found matching your active search query or filters.
              </EmptyState>
            )}
          </div>
        </div>
      </div>

      <div className="side-column">
        <MapPanel stores={visibleProducts} location={location} />
        <RecommendationPanel stores={visibleProducts} />
      </div>
    </div>
  );
}

export default SearchPage;
