import heroMarket from "./images/bazaarhub-hero-market.png";

export const HOME_IMAGES = {
  hero: heroMarket,
  groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=82",
  beverages: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=900&q=82",
  snacks: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=900&q=82",
  dairy: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=900&q=82",
  personalCare: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=82",
  maggi: "https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=900&q=82",
  categoryFallback: "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=900&q=82",
  storeFallback: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=82",
};

export function imageForCategory(categoryName, productName = "") {
  const cat = String(categoryName || "").toLowerCase();
  const prod = String(productName || "").toLowerCase();

  if (prod.includes("maggi") || prod.includes("noodle") || prod.includes("ramen") || prod.includes("yippee")) return HOME_IMAGES.maggi;
  if (cat.includes("dairy") || cat.includes("milk") || prod.includes("milk") || prod.includes("amul") || prod.includes("butter")) return HOME_IMAGES.dairy;
  if (cat.includes("beverage") || cat.includes("drink") || prod.includes("coke") || prod.includes("pepsi") || prod.includes("tea") || prod.includes("coffee")) return HOME_IMAGES.beverages;
  if (cat.includes("snack") || cat.includes("bakery") || prod.includes("biscuit") || prod.includes("parle") || prod.includes("oreo") || prod.includes("chips")) return HOME_IMAGES.snacks;
  if (cat.includes("care") || cat.includes("beauty") || cat.includes("health") || prod.includes("shampoo") || prod.includes("soap")) return HOME_IMAGES.personalCare;
  if (cat.includes("groc") || cat.includes("fruit") || cat.includes("vegetable") || prod.includes("atta") || prod.includes("rice")) return HOME_IMAGES.groceries;

  return HOME_IMAGES.categoryFallback;
}
