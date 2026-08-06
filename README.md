<div align="center">

# 🛒 BazaarHub

**AI-Powered Hyperlocal Retail Discovery & Price Comparison Platform**

Find nearby stores, compare real-time product prices across neighborhood retailers, and make smarter local buying decisions.

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tests](https://img.shields.io/badge/Tests-5%2F5%20Passed-2EA44F?style=for-the-badge&logo=github-actions&logoColor=white)](#build--quality-status)
[![Build](https://img.shields.io/badge/Build-Passing%20(0%20errors)-success?style=for-the-badge)](https://github.com/)

---

</div>

## 📌 Overview

**BazaarHub** bridges the gap between consumers and neighborhood retail stores. Instead of driving around or checking stores individually, BazaarHub empowers shoppers to search for specific product listings (e.g. *"Maggi Noodles"*), view instant inventory availability across nearby shops, compare prices side-by-side, calculate Haversine distance, and navigate directly via Google Maps.

---

## 🔥 Features

### 🔍 1. Smart Hyperlocal Search Engine
- **Synchronized Architecture (`visibleProducts`)**: Single source of truth powers result count, product grid, Smart Picks sidebar, map markers, and empty states.
- **Explicit Execution**: Search triggers strictly on **Enter** or **Search Button** click (preventing live-keystroke noise).
- **Exact Matching**: Guarantees zero false positives. Searching *"maggi"* renders strictly the 3 matched Maggi listings across nearby retailers.

### ⚖️ 2. Redesigned Compare Drawer
- **Spacious Widescreen Layout**: Expands up to `1560px` max-width with centered modal positioning.
- **Glassmorphism Backdrop**: Enhanced with `backdrop-filter: blur(10px)` for a sleek modern aesthetic.
- **Automated Highlights**: Highlights `🏆 Lowest Price` and `⭐ Top Rated` options side-by-side.
- **Product Listing Scoped**: Compares specific product items across stores without cross-product collision.

### 💡 3. AI Smart Picks Engine
Dynamically analyzes the active search dataset to compute:
- **Cheapest Option**: Lowest unit price item (`Lowest Price 🏷️`).
- **Highest Rated**: Top customer-rated store item (`Top Rated ⭐`).
- **Best Value**: Highest value ratio score based on `(rating / price)` (`Best Value 💡`).

### 📍 4. Haversine Distance & Location Intelligence
- Computes actual geographic distance (`km`) using the Haversine formula from device coordinates or default market center (`28.6139, 77.2090`).
- Replaces generic fallback strings with accurate distance estimates (e.g., `1.2 km`, `3.8 km`).

### ⭐ 5. Saved Stores & User Profile Hub
- **Bookmarking**: Save favorite local stores with single-click `localStorage` persistence.
- **Profile Dashboard**: User avatar badge, quick metric counters (Saved Stores, Search Count, Compare Items), search history tags with 1-click re-search, and preference settings.

---

## 🛠️ Tech Stack

| Domain | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, React Router v6 | Single Page Application architecture & client routing |
| **State** | React Context API (`DataContext`, `AuthContext`, `UIContext`) | Global data synchronization & state management |
| **Styling** | Vanilla CSS3, Modern SaaS Design System | Custom glassmorphism, 8px grid system, dark-mode friendly CSS |
| **Backend** | Node.js, Express.js | RESTful API server, async handlers, structured routing |
| **Database** | MySQL 8.0 / Raw SQL Queries | Relational database schema with pooled connections & indexing |
| **Utilities** | Haversine Formula, Custom Product Matcher | Geographic distance math & product family normalization |

---

## 🏗️ Architecture

```
BazaarHub/
├── client-refactored/              # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── cards/              # StoreCard, StoreDetailsCard
│   │   │   ├── common/             # EmptyState, HomeImage
│   │   │   ├── forms/              # SearchFilters
│   │   │   ├── layout/             # Navbar, PageLayout, ProtectedRoute
│   │   │   └── ui/                 # CompareBar, CompareDrawer, MapPanel, RecommendationPanel
│   │   ├── context/                # DataContext, AuthContext, UIContext
│   │   ├── pages/                  # HomePage, SearchPage, StoreDetailsPage, SavedPage, ProfilePage
│   │   ├── services/               # api.js (Fetch client wrapper)
│   │   └── utils/                  # distanceUtils.js, productMatcher.js, format.js
│   └── package.json
└── server-refactored/              # Node.js + Express Backend
    └── server-build/
        ├── config/                 # db.js (MySQL Pool setup)
        ├── controllers/            # storeController, authController
        ├── models/                 # storeModel, productModel
        ├── routes/                 # storeRoutes, authRoutes
        └── sql/                    # schema.sql, seed-demo-products.js
```

### Data Flow Diagram

```
[ User Input / Keyword ] 
       │ (Enter / Click)
       ▼
[ DataContext / handleSearch() ]
       │
       ▼
[ visibleProducts (Single Source of Truth) ]
   ├── 📊 Result Count ("3 results found")
   ├── 🛍️ Product Grid (StoreCard)
   ├── 💡 Smart Picks Engine (RecommendationPanel)
   ├── 📍 Map Coverage (MapPanel)
   └── 🔍 Actionable Empty State (EmptyState)
```

---

## 📸 Application Screenshots & User Flow

```
Landing Page (/) 
  ➔ Search / Explore (/search) 
  ➔ Compare Drawer Overlay 
  ➔ Store Details (/store/:id) 
  ➔ Saved Stores (/saved) 
  ➔ Profile Dashboard (/profile)
```

- **Search & Discovery Grid**: Interactive filter toolbar (Categories, Budget, Open Now, Min Rating, Sorting) with Haversine distance badges.
- **Widescreen Compare Drawer**: Centered `1560px` modal displaying side-by-side product attributes, price tags, and store links.
- **Smart Picks Recommendations**: Sidebar displaying auto-calculated Cheapest, Highest Rated, and Best Value product deals.

---

## 🚦 Build & Quality Status

The project strictly enforces Phase 3 verification before release:

```bash
# Automated Test Suite Verification
npm test -- --watchAll=false
# Result: PASS src/App.test.js (5 passed, 5 total)

# Production Bundle Build
npm run build
# Result: Compiled successfully (0 errors, 0 warnings)
```

- **JS Main Bundle (gzipped)**: `85.42 kB`
- **CSS Main Bundle (gzipped)**: `9.85 kB`
- **Test Coverage**: 100% Core Route & Component Crash Prevention

---

## ⚡ Installation & Setup

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher
- MySQL `v8.0` (Optional for full backend persistence)

### 1. Clone the Repository
```bash
git clone https://github.com/Sambhav-Varshney/hyperlocal-retail-ai.git
cd hyperlocal-retail-ai
```

### 2. Frontend Setup
```bash
cd client-refactored
npm install
npm start
```
*App will launch at `http://localhost:3000`.*

### 3. Backend Setup (Optional)
```bash
cd ../server-refactored/server-build
npm install
# Configure MySQL credentials in .env
npm start
```
*Server will launch at `http://localhost:5000`.*

---

## 🗺️ Future Roadmap

- [ ] **AI Conversational Assistant**: Natural language voice search for local product recommendations.
- [ ] **Live Inventory Sync**: WebSockets integration for real-time stock updates from merchant POS.
- [ ] **Crowdsourced Price Verification**: User-submitted receipt scanning & price verification badges.
- [ ] **Hyperlocal Route Optimization**: Multi-store shopping route planner for maximum savings.

---

## 👨‍💻 Developer & License

Created and maintained by **Sambhav Varshney**.

Distributed under the **MIT License**. See `LICENSE` for more information.
