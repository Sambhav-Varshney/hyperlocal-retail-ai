"use strict";

require("dotenv").config({ quiet: true });
const { pool } = require("../config/db");

const DEFAULT_CATEGORIES = [
  { category_name: "Groceries", slug: "groceries", description: "Daily kitchen essentials, staples, and packaged foods", icon: "shopping-bag", display_order: 1 },
  { category_name: "Dairy", slug: "dairy", description: "Fresh milk, butter, cheese, paneer, and yogurt", icon: "coffee", display_order: 2 },
  { category_name: "Snacks", slug: "snacks", description: "Biscuits, chocolates, chips, and quick bites", icon: "cookie", display_order: 3 },
  { category_name: "Beverages", slug: "beverages", description: "Soft drinks, juices, tea, coffee, and energy drinks", icon: "glass", display_order: 4 },
  { category_name: "Personal Care", slug: "personal-care", description: "Soaps, shampoos, oral care, and skin hygiene", icon: "user", display_order: 5 },
  { category_name: "Household", slug: "household", description: "Detergents, dishwash, surface cleaners, and home care", icon: "home", display_order: 6 },
];

const DEFAULT_STORES = [
  { store_name: "Reliance Smart", owner_name: "Reliance Retail", city: "Mumbai", market_area: "Bandra West", price_factor: 1.0 },
  { store_name: "D-Mart", owner_name: "Avenue Supermarts", city: "Mumbai", market_area: "Andheri East", price_factor: 0.93 },
  { store_name: "Easy Day", owner_name: "Future Group", city: "Delhi", market_area: "Connaught Place", price_factor: 1.02 },
  { store_name: "Local Mart", owner_name: "Rajesh Sharma", city: "Bengaluru", market_area: "Koramangala", price_factor: 1.04 },
  { store_name: "V-Mart", owner_name: "V-Mart Retail", city: "Lucknow", market_area: "Hazratganj", price_factor: 0.97 },
];

// Product Master Catalog: [product_name, brand, category_name, base_price, base_qty]
const MASTER_CATALOG = [
  // Groceries
  ["Maggi 2-Minute Masala Noodles 280g", "Maggi", "Groceries", 14, 150],
  ["Yippee Magic Masala Noodles 240g", "Sunfeast", "Groceries", 15, 120],
  ["Top Ramen Curry Noodles 280g", "Nissin", "Groceries", 14, 90],
  ["Aashirvaad Whole Wheat Atta 5kg", "Aashirvaad", "Groceries", 320, 45],
  ["Fortune Sunflower Oil 1L", "Fortune", "Groceries", 165, 80],
  ["India Gate Basmati Rice 5kg", "India Gate", "Groceries", 430, 35],
  ["Tata Iodized Salt 1kg", "Tata", "Groceries", 28, 200],
  ["Saffola Gold Refined Oil 1L", "Saffola", "Groceries", 185, 60],
  ["Everest Garam Masala 100g", "Everest", "Groceries", 78, 110],
  ["MDH Kitchen King Masala 100g", "MDH", "Groceries", 82, 95],

  // Dairy
  ["Amul Gold Full Cream Milk 1L", "Amul", "Dairy", 68, 100],
  ["Amul Taaza Toned Milk 1L", "Amul", "Dairy", 56, 120],
  ["Mother Dairy Toned Milk 1L", "Mother Dairy", "Dairy", 54, 110],
  ["Amul Pasteurised Salted Butter 100g", "Amul", "Dairy", 58, 85],
  ["Amul Fresh Malai Paneer 200g", "Amul", "Dairy", 95, 50],
  ["Mother Dairy Classic Dahi 400g", "Mother Dairy", "Dairy", 50, 75],
  ["Amul Processed Cheese Slices 200g", "Amul", "Dairy", 140, 40],
  ["Gowardhan Pure Cow Ghee 1L", "Gowardhan", "Dairy", 610, 30],

  // Snacks
  ["Parle-G Gluco Biscuits 250g", "Parle", "Snacks", 20, 250],
  ["Britannia Good Day Butter Cookies 200g", "Britannia", "Snacks", 35, 180],
  ["Cadbury Dairy Milk Chocolate 50g", "Cadbury", "Snacks", 45, 200],
  ["Cadbury Dairy Milk Silk 150g", "Cadbury", "Snacks", 85, 90],
  ["Nestlé KitKat 4-Finger Chocolate 38g", "Nestle", "Snacks", 30, 160],
  ["Cadbury Oreo Vanilla Cream Biscuits 120g", "Oreo", "Snacks", 35, 140],
  ["Parle Hide & Seek Choco Chip 120g", "Parle", "Snacks", 40, 110],
  ["Lay's Classic Salted Potato Chips 50g", "Lay's", "Snacks", 20, 220],
  ["Kurkure Masala Munch 85g", "Kurkure", "Snacks", 20, 200],
  ["Bingo Mad Angles Cream & Onion 80g", "Bingo", "Snacks", 20, 150],

  // Beverages
  ["Coca-Cola Soft Drink 750ml", "Coca-Cola", "Beverages", 45, 130],
  ["Pepsi Soft Drink 750ml", "PepsiCo", "Beverages", 42, 140],
  ["Sprite Lemon-Lime Drink 750ml", "Coca-Cola", "Beverages", 45, 120],
  ["Thums Up Soft Drink 750ml", "Coca-Cola", "Beverages", 45, 150],
  ["Maaza Mango Drink 1.2L", "Coca-Cola", "Beverages", 75, 80],
  ["Parle Frooti Mango Drink 1L", "Parle", "Beverages", 72, 85],
  ["Brooke Bond Red Label Tea 500g", "Brooke Bond", "Beverages", 290, 45],
  ["Nescafe Classic Instant Coffee 50g", "Nestle", "Beverages", 175, 65],
  ["Real Fruit Power Mixed Fruit Juice 1L", "Dabur", "Beverages", 115, 55],

  // Personal Care
  ["Colgate Strong Teeth Toothpaste 200g", "Colgate", "Personal Care", 70, 160],
  ["Closeup Red Hot Gel Toothpaste 150g", "Closeup", "Personal Care", 92, 110],
  ["Lux Rose & Vitamin E Soap 100g", "Lux", "Personal Care", 40, 180],
  ["Dove Beauty Cream Soap Bar 100g", "Dove", "Personal Care", 62, 140],
  ["Lifebuoy Total 10 Soap 100g", "Lifebuoy", "Personal Care", 38, 200],
  ["Clinic Plus Strong & Long Shampoo 340ml", "Clinic Plus", "Personal Care", 185, 75],
  ["Head & Shoulders Anti-Dandruff 340ml", "Head & Shoulders", "Personal Care", 275, 60],
  ["Dettol Antiseptic Disinfectant 250ml", "Dettol", "Personal Care", 132, 90],

  // Household
  ["Surf Excel Easy Wash Detergent 1kg", "Surf Excel", "Household", 140, 95],
  ["Ariel Complete Detergent Powder 1kg", "Ariel", "Household", 190, 70],
  ["Vim Dishwash Bar 200g", "Vim", "Household", 20, 250],
  ["Vim Liquid Dishwash Gel 500ml", "Vim", "Household", 112, 85],
  ["Harpic Power Plus Toilet Cleaner 500ml", "Harpic", "Household", 95, 110],
  ["Colin Glass Cleaner Spray 500ml", "Colin", "Household", 105, 60],
  ["Goodknight Gold Flash Refill 45ml", "Goodknight", "Household", 82, 130],
];

// Specific store distribution mapping (which stores stock which index of MASTER_CATALOG with custom pricing)
// Enables realistic store inventory variations & price comparison across Reliance, DMart, EasyDay, LocalMart, VMart
const STORE_INVENTORY_DISTRIBUTION = {
  "Reliance Smart": [0, 1, 3, 4, 6, 7, 10, 11, 13, 14, 16, 18, 19, 20, 21, 22, 23, 25, 28, 29, 30, 31, 32, 34, 37, 38, 39, 41, 42, 44, 45, 47, 48, 50],
  "D-Mart":         [0, 1, 2, 3, 4, 5, 6, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 25, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50],
  "Easy Day":       [0, 1, 3, 4, 7, 9, 10, 12, 13, 15, 16, 18, 19, 20, 22, 23, 25, 26, 28, 29, 30, 32, 33, 34, 36, 37, 38, 40, 41, 43, 44, 45, 47, 48, 50],
  "Local Mart":     [0, 2, 3, 6, 8, 9, 11, 12, 13, 14, 15, 18, 19, 20, 24, 25, 26, 28, 29, 31, 33, 34, 35, 37, 38, 39, 41, 42, 44, 46, 47, 49, 50],
  "V-Mart":         [0, 1, 2, 4, 5, 7, 10, 13, 14, 16, 17, 18, 19, 21, 22, 23, 25, 27, 28, 29, 30, 32, 34, 35, 37, 38, 39, 40, 41, 43, 45, 47, 48, 50]
};

async function seedDemoProducts() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Ensure categories exist
    const categoryIdMap = new Map();
    for (const cat of DEFAULT_CATEGORIES) {
      const [existing] = await connection.query(
        "SELECT id FROM categories WHERE category_name = ? LIMIT 1",
        [cat.category_name]
      );
      if (existing.length > 0) {
        categoryIdMap.set(cat.category_name, existing[0].id);
      } else {
        const [result] = await connection.query(
          `INSERT INTO categories (category_name, slug, description, icon, display_order)
           VALUES (?, ?, ?, ?, ?)`,
          [cat.category_name, cat.slug, cat.description, cat.icon, cat.display_order]
        );
        categoryIdMap.set(cat.category_name, result.insertId);
      }
    }

    // 2. Ensure stores exist
    const storeIdMap = new Map();
    for (const st of DEFAULT_STORES) {
      const [existing] = await connection.query(
        "SELECT id FROM stores WHERE store_name = ? LIMIT 1",
        [st.store_name]
      );
      if (existing.length > 0) {
        storeIdMap.set(st.store_name, existing[0].id);
      } else {
        const [result] = await connection.query(
          `INSERT INTO stores (store_name, owner_name, product_name, category, price, city, market_area, full_address)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            st.store_name,
            st.owner_name,
            "Maggi 2-Minute Masala Noodles 280g",
            "Groceries",
            14.00,
            st.city,
            st.market_area,
            `${st.market_area}, ${st.city}`
          ]
        );
        storeIdMap.set(st.store_name, result.insertId);
      }
    }

    // 3. Clear existing product rows for re-seeding cleanly
    const storeIds = Array.from(storeIdMap.values());
    if (storeIds.length > 0) {
      await connection.query("DELETE FROM products WHERE store_id IN (?)", [storeIds]);
    }

    let seededProductCount = 0;

    // 4. Seed products for each store based on distribution & pricing factor
    for (const storeConfig of DEFAULT_STORES) {
      const storeName = storeConfig.store_name;
      const storeId = storeIdMap.get(storeName);
      const priceFactor = storeConfig.price_factor;
      const itemIndices = STORE_INVENTORY_DISTRIBUTION[storeName] || [];

      for (const idx of itemIndices) {
        const [pName, brand, categoryName, basePrice, baseQty] = MASTER_CATALOG[idx];
        const categoryId = categoryIdMap.get(categoryName);
        
        // Calculate realistic price variations per store (rounded to whole rupee or .50)
        let calculatedPrice = Math.round(basePrice * priceFactor);
        if (calculatedPrice < 1) calculatedPrice = 1;

        const imagePlaceholder = `/assets/images/products/${brand.toLowerCase().replace(/[^a-z0-9]/g, "")}.jpg`;

        await connection.query(
          `INSERT INTO products (product_name, brand, category_id, store_id, price, quantity, image)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [pName, brand, categoryId, storeId, calculatedPrice, baseQty, imagePlaceholder]
        );
        seededProductCount++;
      }

      // Update store table summary fields for backward compatibility
      if (itemIndices.length > 0) {
        const firstItem = MASTER_CATALOG[itemIndices[0]];
        await connection.query(
          "UPDATE stores SET product_name = ?, category = ?, price = ? WHERE id = ?",
          [firstItem[0], firstItem[2], Math.round(firstItem[3] * priceFactor), storeId]
        );
      }
    }

    await connection.commit();
    console.log(`[DB Seed] Successfully seeded ${seededProductCount} realistic products across ${storeIds.length} stores and ${categoryIdMap.size} categories.`);
  } catch (error) {
    await connection.rollback();
    console.error("[DB Seed Error]", error.message);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedDemoProducts().catch((err) => {
  console.error(`Product catalog seed failed: ${err.message}`);
  process.exitCode = 1;
});
