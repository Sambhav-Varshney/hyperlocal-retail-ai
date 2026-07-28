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
    addToCompare,
    compareStores,
    showOpenNow,
    setShowOpenNow,
    showOffers,
    setShowOffers,
    minRating,
    setMinRating,
  } = useData();

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const queryParam = searchParams.get("q") || searchParams.get("keyword");

    if (queryParam) setSearch(queryParam);
    if (categoryParam) {
      const matchedCategory = categories.find(
        (category) => category.slug === categoryParam || category.categoryName.toLowerCase() === categoryParam.toLowerCase()
      );
      setSelectedCategory(matchedCategory?.slug || matchedCategory?.id || categoryParam);
    }
  }, [searchParams, categories, setSearch, setSelectedCategory]);

  const savedIds = new Set(savedStores.map((store) => store.id));
  const compareIds = new Set(compareStores.map((store) => store.id));
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
          onSearch={() => setSearch(search.trim())}
          onUseLocation={handleUseLocation}
          location={location}
          loading={loading}
        />

        <div className="panel search-results-panel">
          <div className="results-header">
            <div>
              <p className="eyebrow">Results</p>
              <h2>{filteredStores.length ? `${filteredStores.length} ${filteredStores.length === 1 ? "result" : "results"} found` : "No results found"}</h2>
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
            ) : filteredStores.length ? (
              filteredStores.map((store) => (
                <div key={store.id} className="store-card-wrapper">
                  <StoreCard
                    store={store}
                    distance={store.distance}
                    bestDeal={bestPrice !== null && Number(store.price || 0) === bestPrice}
                    saved={savedIds.has(store.id)}
                    onSave={toggleSavedStore}
                    visual
                  />
                  <button
                    className="ghost-action"
                    disabled={compareIds.has(store.id)}
                    onClick={() => addToCompare(store)}
                  >
                    {compareIds.has(store.id) ? "In comparison" : "Add to compare"}
                  </button>
                </div>
              ))
            ) : (
              <EmptyState>No results found matching your filters. Try changing category or search keyword.</EmptyState>
            )}
          </div>
        </div>
      </div>

      <div className="side-column">
        <MapPanel stores={filteredStores} location={location} />
        <RecommendationPanel stores={filteredStores} />
      </div>
    </div>
  );
}

export default SearchPage;
