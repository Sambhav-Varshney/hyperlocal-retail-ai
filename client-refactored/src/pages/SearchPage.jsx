import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import SearchFilters from "../components/forms/SearchFilters";
import StoreCard from "../components/cards/StoreCard";
import MapPanel from "../components/ui/MapPanel";
import RecommendationPanel from "../components/ui/RecommendationPanel";
import EmptyState from "../components/common/EmptyState";

function SearchPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const {
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
    categories,
    handleSearch,
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

  // Pre-fill the category filter when arriving from a "/search?category=..." link
  // (e.g. from the Home or Categories pages).
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) setSelectedCategory(categoryParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const savedIds = new Set(savedStores.map((store) => store.id));
  const compareIds = new Set(compareStores.map((store) => store.id));

  return (
    <div className="content-grid">
      <div className="results-column">
        <SearchFilters
          search={search}
          setSearch={setSearch}
          searchType={searchType}
          setSearchType={setSearchType}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          budget={budget}
          setBudget={setBudget}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          onSearch={handleSearch}
          onUseLocation={handleUseLocation}
          location={location}
          loading={loading}
        />

        <div className="panel">
          <div className="results-header">
            <div>
              <p className="eyebrow">Results</p>
              <h2>{filteredStores.length} stores match your filters</h2>
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
                {" "}Offers
              </label>
              <select value={minRating} onChange={(event) => setMinRating(Number(event.target.value))}>
                <option value={0}>Any rating</option>
                <option value={3}>3+ rating</option>
                <option value={4}>4+ rating</option>
                <option value={4.5}>4.5+ rating</option>
              </select>
            </div>
          </div>

          <div className="store-grid">
            {filteredStores.length ? (
              filteredStores.map((store) => (
                <div key={store.id} className="store-card-wrapper">
                  <StoreCard
                    store={store}
                    distance={store.distance}
                    bestDeal={bestPrice !== null && Number(store.price || 0) === bestPrice}
                    saved={savedIds.has(store.id)}
                    onSave={toggleSavedStore}
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
              <EmptyState>
                {user ? "No stores match these filters yet." : "Search stores or refine filters to see results."}
              </EmptyState>
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
