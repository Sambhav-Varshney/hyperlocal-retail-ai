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

  const countByCategory = (categoryName) =>
    stores.filter((store) => store.category === categoryName).length;

  const getCategorySlug = (category) =>
    category.slug || category.categoryName.toLowerCase().replace(/\s+/g, "-");

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Browse</p>
          <h1>All categories</h1>
        </div>
      </div>

      <div className="categories-grid">
        {categories.length ? (
          categories.map((category) => (
            <Link
              key={category.id}
              to={`/search?category=${encodeURIComponent(getCategorySlug(category))}`}
              className="category-card"
            >
              <div className="category-card-header">
                <span className="category-icon" aria-hidden="true">
                  {categoryIcons[getCategorySlug(category)] || "🛍️"}
                </span>
                <span className="category-store-count">
                  {countByCategory(category.categoryName)} stores
                </span>
              </div>

              <div className="category-card-copy">
                <p className="category-card-label">Category</p>
                <h2>{category.categoryName}</h2>
                <p className="category-description">
                  {category.description || `Explore ${category.categoryName.toLowerCase()} near you.`}
                </p>
              </div>

              <span className="category-explore" aria-hidden="true">
                Explore <span>→</span>
              </span>
            </Link>
          ))
        ) : (
          <EmptyState>No categories available yet.</EmptyState>
        )}
      </div>
    </section>
  );
}

export default CategoriesPage;
