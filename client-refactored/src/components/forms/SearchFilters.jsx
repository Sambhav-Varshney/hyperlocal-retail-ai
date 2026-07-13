import { BUDGET_OPTIONS, SEARCH_TYPES, SORT_OPTIONS } from "../../utils/constants";

function SearchFilters({
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
  onSearch,
  onUseLocation,
  location,
  loading,
}) {
  return (
    <section className="panel search-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Discovery</p>
          <h1>Find nearby stores, compare prices, decide faster.</h1>
        </div>
        <button className="ghost-action" onClick={onUseLocation}>
          {location ? "Location active" : "Use my location"}
        </button>
      </div>

      <div className="search-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSearch();
          }}
          placeholder="Search products, stores, or categories"
        />
        <button className="primary-action" onClick={onSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="filter-grid">
        {setSearchType ? (
          <label>
            Search in
            <select value={searchType} onChange={(event) => setSearchType(event.target.value)}>
              {SEARCH_TYPES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          Category
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="All">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Budget
          <select value={budget} onChange={(event) => setBudget(event.target.value)}>
            {BUDGET_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}

export default SearchFilters;
