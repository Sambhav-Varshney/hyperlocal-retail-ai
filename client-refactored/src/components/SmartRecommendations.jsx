import { Link } from "react-router-dom";

const RECOMMENDATIONS_MAP = {
  snacks: {
    boughtTogether: [
      { name: "Coca-Cola 750ml", price: 45, icon: "🥤", category: "Beverages" },
      { name: "Lay's Salted Chips", price: 20, icon: "🥔", category: "Snacks" },
      { name: "Parle-G Biscuits", price: 20, icon: "🍪", category: "Snacks" },
      { name: "Dairy Milk Chocolate", price: 45, icon: "🍫", category: "Snacks" },
    ],
    trendingMessage: "Snacks & Cold drinks are trending in your area this week",
    smartTip: "Customers usually buy Maggi or Chips with Coca-Cola!",
  },
  dairy: {
    boughtTogether: [
      { name: "Britannia Wheat Bread", price: 45, icon: "🍞", category: "Bakery" },
      { name: "Amul Butter 100g", price: 58, icon: "🧈", category: "Dairy" },
      { name: "Mother Dairy Curd 400g", price: 48, icon: "🥣", category: "Dairy" },
      { name: "Amul Paneer 200g", price: 95, icon: "🧀", category: "Dairy" },
    ],
    trendingMessage: "Fresh Milk & Dairy essentials are high-demand items today",
    smartTip: "Customers usually buy Milk with fresh Wheat Bread & Butter!",
  },
  beverages: {
    boughtTogether: [
      { name: "Amul Gold Milk 1L", price: 68, icon: "🥛", category: "Dairy" },
      { name: "Madhur Refined Sugar 1kg", price: 48, icon: "🍚", category: "Groceries" },
      { name: "Parle-G Biscuits", price: 20, icon: "🍪", category: "Snacks" },
      { name: "Tata Tea Gold 500g", price: 275, icon: "🫖", category: "Beverages" },
    ],
    trendingMessage: "Nescafe Coffee & Premium Teas are trending in your area",
    smartTip: "Customers usually pair Instant Coffee with Fresh Milk & Biscuits!",
  },
  groceries: {
    boughtTogether: [
      { name: "India Gate Rice 5kg", price: 430, icon: "🌾", category: "Groceries" },
      { name: "Aashirvaad Wheat Atta 5kg", price: 298, icon: "🌾", category: "Groceries" },
      { name: "Tata Iodized Salt 1kg", price: 26, icon: "🧂", category: "Groceries" },
      { name: "Fortune Sunflower Oil 1L", price: 165, icon: "🛢️", category: "Groceries" },
    ],
    trendingMessage: "Whole Wheat Atta & Rice are popular market choices today",
    smartTip: "Shoppers often buy Atta with Refined Sunflower Oil & Spices!",
  },
  personalcare: {
    boughtTogether: [
      { name: "Lux Rose Soap 100g", price: 36, icon: "🧼", category: "Personal Care" },
      { name: "Clinic Plus Shampoo 340ml", price: 185, icon: "🧴", category: "Personal Care" },
      { name: "Colgate Toothpaste 200g", price: 70, icon: "🪥", category: "Personal Care" },
      { name: "Dove Beauty Soap 100g", price: 62, icon: "🧼", category: "Personal Care" },
    ],
    trendingMessage: "Hygiene & Hair care products are top rated this month",
    smartTip: "Customers usually buy Toothpaste with Soaps & Shampoos!",
  },
  cleaning: {
    boughtTogether: [
      { name: "Surf Excel Detergent 1kg", price: 140, icon: "🧺", category: "Cleaning" },
      { name: "Vim Dishwash Gel 500ml", price: 108, icon: "🧽", category: "Cleaning" },
      { name: "Harpic Toilet Cleaner 500ml", price: 95, icon: "🚽", category: "Cleaning" },
      { name: "Colin Glass Spray 500ml", price: 102, icon: "🪟", category: "Cleaning" },
    ],
    trendingMessage: "Home cleaning & laundry powders are popular nearby",
    smartTip: "Shoppers frequently pair Dishwash Gel with Detergent Powder!",
  },
};

function SmartRecommendations({ product }) {
  const rawCat = (product?.category || "groceries").toLowerCase().replace(/[^a-z]/g, "");
  
  let catKey = "groceries";
  if (rawCat.includes("snack")) catKey = "snacks";
  else if (rawCat.includes("dairy")) catKey = "dairy";
  else if (rawCat.includes("beverag") || rawCat.includes("drink") || rawCat.includes("coffee") || rawCat.includes("tea")) catKey = "beverages";
  else if (rawCat.includes("personal") || rawCat.includes("care") || rawCat.includes("soap") || rawCat.includes("shampoo")) catKey = "personalcare";
  else if (rawCat.includes("clean") || rawCat.includes("house")) catKey = "cleaning";

  const config = RECOMMENDATIONS_MAP[catKey] || RECOMMENDATIONS_MAP.groceries;

  return (
    <div className="panel smart-recommendations-panel">
      <div className="panel-heading compact" style={{ marginBottom: "16px" }}>
        <div>
          <p className="eyebrow">Product Intelligence</p>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--text-main)" }}>Smart Recommendations</h2>
        </div>
      </div>

      {/* 1. People Also Bought */}
      <div className="recommendation-section" style={{ marginBottom: "20px" }}>
        <h3 className="section-subtitle" style={{ fontSize: "0.95rem", fontWeight: 750, color: "var(--text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          🛒 People also bought
        </h3>
        <div className="bought-together-grid">
          {config.boughtTogether.map((item, index) => (
            <div key={index} className="bought-item-card">
              <span className="bought-item-icon" aria-hidden="true">{item.icon}</span>
              <div className="bought-item-info">
                <strong className="bought-item-title">{item.name}</strong>
                <span className="bought-item-meta">₹{item.price} • {item.category}</span>
              </div>
              <Link to={`/search?q=${encodeURIComponent(item.name)}`} className="primary-action-sm">
                Find ↗
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Trending Nearby */}
      <div className="recommendation-banner trending-banner">
        <span className="banner-icon" aria-hidden="true">🔥</span>
        <div>
          <strong className="banner-title">Trending nearby</strong>
          <p className="banner-desc">{config.trendingMessage}</p>
        </div>
      </div>

      {/* 3. Smart Tip */}
      <div className="recommendation-banner smart-tip-banner" style={{ marginTop: "12px" }}>
        <span className="banner-icon" aria-hidden="true">✨</span>
        <div>
          <strong className="banner-title">Smart tip</strong>
          <p className="banner-desc">{config.smartTip}</p>
        </div>
      </div>
    </div>
  );
}

export default SmartRecommendations;
