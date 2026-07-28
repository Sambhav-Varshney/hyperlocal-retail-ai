import { SORT_OPTIONS } from "../../utils/constants";

const PRICE_RANGE_OPTIONS = [
  { value: "All", label: "All" },
  { value: "under-100", label: "Under ₹100" },
  { value: "100-500", label: "₹100–₹500" },
  { value: "500-1000", label: "₹500–₹1000" },
  { value: "above-1000", label: "Above ₹1000" },
];

function SearchFilters({
  search,
  setSearch,
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
          placeholder="Search stores, products, brands or areas..."
        />
        <button className="primary-action" onClick={onSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <div className="filter-grid">
        <label>
          Category
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option value="All">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug || category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </label>
        <label>
          Price Range
          <select value={budget} onChange={(event) => setBudget(event.target.value)}>
            {PRICE_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label>
          Sort By
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
