import { useState } from "react";

function App() {
  const [search, setSearch] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Dummy store data
  const stores = [
    { name: "Gupta Store", product: "bread", price: 30, lat: 27.18, lon: 78.01 },
    { name: "Sharma Mart", product: "milk", price: 50, lat: 27.20, lon: 78.03 },
    { name: "Verma Shop", product: "bread", price: 28, lat: 27.19, lon: 78.00 },
  ];

  // Filter + Sort
  const filteredStores = stores
    .filter((store) =>
      store.product.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aStarts = a.product.toLowerCase().startsWith(search.toLowerCase());
      const bStarts = b.product.toLowerCase().startsWith(search.toLowerCase());

      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

  // Cheapest price
  const cheapestPrice =
    filteredStores.length > 0
      ? Math.min(...filteredStores.map((store) => store.price))
      : null;

  return (
    <div>
      {/* Navbar */}
      <nav style={{ backgroundColor: "#222", color: "white", padding: "10px" }}>
        <h2>BazaarHub</h2>
      </nav>

      {/* Main Content */}
      <div style={{ padding: "20px" }}>
        <h3>Hyperlocal Retail System</h3>
        <p>Find, Compare & Shop Smartly</p>

        {/* Search */}
        {/* Search */}
        <input
          type="text"
          placeholder="Search product (e.g. milk, bread)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "10px", width: "300px", marginTop: "10px" }}
        />

        <button
          onClick={() => {
            navigator.geolocation.getCurrentPosition((position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              });
            });
          }}
          style={{ marginLeft: "10px", padding: "10px" }}
        >
          Get My Location
        </button>


        {/* Results */}
        <h4>Results:</h4>
        {filteredStores.map((store, index) => (
          <div key={index}>
            <p
              style={{
                color:
                  store.price === cheapestPrice ? "green" : "black",
                fontWeight:
                  store.price === cheapestPrice ? "bold" : "normal",
              }}
            >
              {store.name} - ₹{store.price}
              {store.price === cheapestPrice && " (Best Deal)"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;