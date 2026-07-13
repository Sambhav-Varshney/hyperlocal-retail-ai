import heroMarket from "./images/bazaarhub-hero-market.png";

export const HOME_IMAGES = {
  hero: heroMarket,
  groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=82",
  beverages: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=82",
  snacks: "https://images.unsplash.com/photo-1621939514649-280e2aa?auto=format&fit=crop&w=900&q=82",
  dairy: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=82",
  personalCare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=82",
  categoryFallback: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=82",
  storeFallback: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=82",
};

export function imageForCategory(categoryName) {
  const category = String(categoryName || "").toLowerCase();
  if (category.includes("groc") || category.includes("fruit") || category.includes("vegetable")) return HOME_IMAGES.groceries;
  if (category.includes("beverage") || category.includes("drink")) return HOME_IMAGES.beverages;
  if (category.includes("snack") || category.includes("bakery")) return HOME_IMAGES.snacks;
  if (category.includes("dairy") || category.includes("milk")) return HOME_IMAGES.dairy;
  if (category.includes("care") || category.includes("beauty") || category.includes("health")) return HOME_IMAGES.personalCare;
  return HOME_IMAGES.categoryFallback;
}
