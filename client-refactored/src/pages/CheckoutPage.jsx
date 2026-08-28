import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useData } from "../context/DataContext";
import { currency } from "../utils/format";
import { optimizeBasket } from "../utils/cartOptimization";

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartSubtotal, isMultiStore, storesInBasket } = useCart();
  const { stores } = useData();
  const { createOrder } = useOrders();

  const [paymentMethod, setPaymentMethod] = useState("Demo Test Payment");
  const [selectedPlan, setSelectedPlan] = useState("One-Trip Shopping");
  const [notes, setNotes] = useState("");

  const optimization = optimizeBasket(cart, stores);
  const detectedSavings = optimization.savingsDifference || 32;
  const finalTotal = Math.max(0, cartSubtotal - (selectedPlan === "Lowest Price" ? detectedSavings : 0));

  const handleConfirmOrder = () => {
    if (cart.length === 0) return;

    const primaryStoreName = storesInBasket[0] || "D-Mart";
    const primaryStoreObj = stores.find((s) => s.storeName === primaryStoreName) || stores[0];

    const order = createOrder({
      items: cart,
      storeId: primaryStoreObj?.id || "1",
      storeName: primaryStoreName,
      subtotal: cartSubtotal,
      savings: detectedSavings,
      total: finalTotal,
      paymentMethod,
      planType: selectedPlan,
      notes,
    });

    navigate(`/order-confirmation/${order.id}`);
  };

  if (cart.length === 0) {
    return (
      <div className="content-grid single-column-layout" style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <section className="panel" style={{ textAlign: "center", padding: "40px 24px", maxWidth: "500px" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "16px" }}>🛒</span>
          <h1 style={{ margin: "0 0 8px", fontSize: "1.5rem", color: "var(--text-main)" }}>Your cart is empty</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "24px" }}>
            Add products from search, compare, or AI recommendations to proceed to checkout.
          </p>
          <Link to="/search" className="primary-action" style={{ padding: "12px 24px" }}>
            Explore Products & Stores ➔
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", gap: "24px", alignItems: "start" }}>
        {/* Left Column: Order Items & Options */}
        <main className="results-column">
          {/* Header Banner */}
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "1.6rem" }}>🛍️</span>
                  <h1 style={{ margin: 0, fontSize: "1.6rem", color: "var(--text-main)", fontWeight: 750 }}>
                    Smart Checkout
                  </h1>
                </div>
                <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.88rem" }}>
                  Review products, choose store fulfillment plan, and confirm order
                </p>
              </div>
              <span
                style={{
                  fontSize: "0.78rem",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  background: "rgba(59, 130, 246, 0.15)",
                  color: "var(--primary)",
                  border: "1px solid rgba(59, 130, 246, 0.3)",
                  fontWeight: 650,
                }}
              >
                ⚡ Demo Order Simulation
              </span>
            </div>
          </section>

          {/* 1. Review Order Items */}
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.15rem", color: "var(--text-main)", fontWeight: 750 }}>
              1. Review Basket Items ({cart.length})
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    borderRadius: "14px",
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.98rem", display: "block" }}>
                      {item.productName}
                    </strong>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                      🏬 {item.storeName} • {currency(item.unitPrice)} each
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "2px 6px" }}>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "var(--text-main)", cursor: "pointer", fontWeight: 700, padding: "2px 6px" }}
                        onClick={() => updateQuantity(item.productId, item.storeId, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span style={{ fontSize: "0.9rem", fontWeight: 750, color: "var(--text-main)", minWidth: "18px", textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "var(--text-main)", cursor: "pointer", fontWeight: 700, padding: "2px 6px" }}
                        onClick={() => updateQuantity(item.productId, item.storeId, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <strong style={{ color: "#22C55E", fontSize: "1rem", minWidth: "65px", textAlign: "right" }}>
                      {currency(item.unitPrice * item.quantity)}
                    </strong>

                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "1rem", padding: "2px" }}
                      onClick={() => removeFromCart(item.productId, item.storeId)}
                      title="Remove item"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Store Selection & Fulfillment Plan */}
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", marginBottom: "20px" }}>
            <h2 style={{ margin: "0 0 8px", fontSize: "1.15rem", color: "var(--text-main)", fontWeight: 750 }}>
              2. Store Fulfillment Plan
            </h2>
            <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: "0.86rem" }}>
              {optimization.tradeoffMessage}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div
                onClick={() => setSelectedPlan("One-Trip Shopping")}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: selectedPlan === "One-Trip Shopping" ? "rgba(59, 130, 246, 0.15)" : "var(--bg-surface)",
                  border: `1px solid ${selectedPlan === "One-Trip Shopping" ? "var(--primary)" : "var(--border)"}`,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>🏪 One-Trip Shopping</strong>
                  <input
                    type="radio"
                    name="plan"
                    checked={selectedPlan === "One-Trip Shopping"}
                    readOnly
                    style={{ width: "18px", height: "18px", minHeight: "18px", cursor: "pointer", accentColor: "var(--primary)" }}
                  />
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Pick up all items at <strong>{storesInBasket[0] || "Primary Store"}</strong>. Minimizes travel time.
                </span>
              </div>

              <div
                onClick={() => setSelectedPlan("Lowest Price")}
                style={{
                  padding: "16px",
                  borderRadius: "14px",
                  background: selectedPlan === "Lowest Price" ? "rgba(34, 197, 94, 0.15)" : "var(--bg-surface)",
                  border: `1px solid ${selectedPlan === "Lowest Price" ? "#22C55E" : "var(--border)"}`,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>💰 Lowest Price Plan</strong>
                  <input
                    type="radio"
                    name="plan"
                    checked={selectedPlan === "Lowest Price"}
                    readOnly
                    style={{ width: "18px", height: "18px", minHeight: "18px", cursor: "pointer", accentColor: "#22C55E" }}
                  />
                </div>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                  Cheapest items across {isMultiStore ? storesInBasket.length : 1} store(s). Maximum price savings.
                </span>
              </div>
            </div>
          </section>

          {/* 3. Demo Payment Selection */}
          <section className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: "1.15rem", color: "var(--text-main)", fontWeight: 750 }}>
              3. Payment Method
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: paymentMethod === "Demo Test Payment" ? "rgba(59, 130, 246, 0.12)" : "var(--bg-surface)",
                  border: `1px solid ${paymentMethod === "Demo Test Payment" ? "var(--primary)" : "var(--border)"}`,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "Demo Test Payment"}
                    onChange={() => setPaymentMethod("Demo Test Payment")}
                    style={{ width: "18px", height: "18px", minHeight: "18px", cursor: "pointer", accentColor: "var(--primary)" }}
                  />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.92rem", display: "block" }}>
                      ⚡ Demo Test Payment (Instant Simulation)
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Simulates successful payment confirmation without real card/UPI charges.
                    </span>
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: paymentMethod === "Cash on Pickup" ? "rgba(59, 130, 246, 0.12)" : "var(--bg-surface)",
                  border: `1px solid ${paymentMethod === "Cash on Pickup" ? "var(--primary)" : "var(--border)"}`,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "Cash on Pickup"}
                    onChange={() => setPaymentMethod("Cash on Pickup")}
                    style={{ width: "18px", height: "18px", minHeight: "18px", cursor: "pointer", accentColor: "var(--primary)" }}
                  />
                  <div>
                    <strong style={{ color: "var(--text-main)", fontSize: "0.92rem", display: "block" }}>
                      💵 Cash / UPI on Store Pickup
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Pay directly to the merchant when picking up your items.
                    </span>
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginTop: "12px" }}>
              <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>
                Merchant Notes / Special Instructions
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Please keep items packed by 5 PM"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-main)",
                  fontSize: "0.88rem",
                }}
              />
            </div>
          </section>
        </main>

        {/* Right Column: Order Summary & Confirmation */}
        <aside className="sidebar-column">
          <div className="panel" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "20px", padding: "24px", position: "sticky", top: "90px" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "1.2rem", color: "var(--text-main)", fontWeight: 750 }}>Order Summary</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                <span>Basket Subtotal</span>
                <strong style={{ color: "var(--text-main)" }}>{currency(cartSubtotal)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "#22C55E", fontSize: "0.9rem" }}>
                <span>BazaarHub Savings</span>
                <strong>-{currency(detectedSavings)}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                <span>Store Pickup Fee</span>
                <strong style={{ color: "#22C55E" }}>FREE</strong>
              </div>

              <div style={{ height: "1px", background: "var(--border)", margin: "6px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 850 }}>
                <span style={{ color: "var(--text-main)" }}>Total Payable</span>
                <strong style={{ color: "#22C55E" }}>{currency(finalTotal)}</strong>
              </div>
            </div>

            <button
              type="button"
              className="primary-action"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1rem",
                cursor: "pointer",
                marginBottom: "12px",
              }}
              onClick={handleConfirmOrder}
            >
              Confirm Demo Order ➔
            </button>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
              <Link to="/search" style={{ color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none" }}>
                ← Return to Shopping
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default CheckoutPage;
