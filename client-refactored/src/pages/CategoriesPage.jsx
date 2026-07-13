import { Link } from "react-router-dom";
import { useData } from "../context/DataContext";
import EmptyState from "../components/common/EmptyState";

function CategoriesPage() {
  const { categories, stores } = useData();

  const countByCategory = (categoryName) =>
    stores.filter((store) => store.category === categoryName).length;

  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Browse</p>
          <h1>All categories</h1>
        </div>
      </div>

      <div className="store-grid">
        {categories.length ? (
          categories.map((category) => (
            <Link
              key={category.id}
              to={`/search?category=${encodeURIComponent(category.categoryName)}`}
              className="store-card"
            >
              <div className="store-card-top">
                <div>
                  <p className="store-category">Category</p>
                  <h3>{category.categoryName}</h3>
                </div>
              </div>
              <span className="pill">{countByCategory(category.categoryName)} stores</span>
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
