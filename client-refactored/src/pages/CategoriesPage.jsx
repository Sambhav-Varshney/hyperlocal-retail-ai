import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import EmptyState from "../components/common/EmptyState";

const categoryIcons = {
  beverages: "🥤",
  dairy: "🥛",
  groceries: "🛒",
  snacks: "🍿",
  "personal-care": "🧴",
};

function CategoriesPage() {
  const { categories = [], stores = [] } = useData();
  const [searchTerm, setSearchTerm] = useState("");

  const countByCategory = (categoryName) =>
    stores.filter((store) => store.category === categoryName).length;

  const getCategorySlug = (category) =>
    category.slug || category.categoryName.toLowerCase().replace(/\s+/g, "-");

  const filteredCategories = categories.filter((c) =>
    c.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="panel categories-page-panel">
      <div className="panel-heading categories-header">
        <div>
          <p className="eyebrow">Explore</p>
          <h1>All categories</h1>
          <p className="page-subtitle">
            Explore products across all categories
          </p>
        </div>

        {/* Search Categories Input */}
        <div className="category-search-wrap">
          <input
            type="text"
            className="category-search-input"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="category-search-icon" aria-hidden="true">🔍</span>
        </div>
      </div>

      <div className="categories-grid">
        {filteredCategories.length ? (
          filteredCategories.map((category) => {
            const count = countByCategory(category.categoryName);
            const slug = getCategorySlug(category);

            return (
              <Link
                key={category.id}
                to={`/search?category=${encodeURIComponent(slug)}`}
                className="category-card polished-category-card"
              >
                <div className="category-card-header">
                  <span className="category-icon" aria-hidden="true">
                    {categoryIcons[slug] || "🛍️"}
                  </span>
                </div>

                <div className="category-card-copy">
                  <h2>{category.categoryName}</h2>
                  <p className="category-description">
                    {category.description || `${category.categoryName} products`}
                  </p>
                  <span className="category-store-badge">
                    {count ? `${count} stores` : "Explore"}
                  </span>
                </div>

                <span className="category-explore" aria-hidden="true">
                  Explore <span>→</span>
                </span>
              </Link>
            );
          })
        ) : (
          <EmptyState title="No categories found">
            No categories match your search term "{searchTerm}".
          </EmptyState>
        )}
      </div>
    </section>
  );
}

export default CategoriesPage;
