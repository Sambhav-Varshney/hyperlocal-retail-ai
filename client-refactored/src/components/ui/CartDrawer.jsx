import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { useData } from "../../context/DataContext";
import { useUI } from "../../context/UIContext";
import { currency } from "../../utils/format";
import { optimizeBasket } from "../../utils/cartOptimization";

function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartItemCount,
    storesInBasket,
    isMultiStore,
  } = useCart();

  const { stores } = useData();
  const { showToast } = useUI();
  const [showOptimization, setShowOptimization] = useState(false);

  if (!isCartOpen) return null;

  const optimization = optimizeBasket(cart, stores);

  const handlePrepareCheckout = () => {
    showToast("Basket prepared! Select store pickup options for Stage 9.");
    closeCart();
  };

  return (
    <div
      className="cart-drawer-overlay"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={closeCart}
    >
      <div
        className="cart-drawer-content"
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--bg-card)",
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.5)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", color: "var(--text-main)" }}>Shopping Cart</h2>
              <span style={{ fontSize: "0.72rem", padding: "2px 8px", borderRadius: "999px", background: "rgba(59, 130, 246, 0.15)", color: "var(--primary)", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                ⚡ Demo Availability
              </span>
            </div>
            <p style={{ margin: "2px 0 0", color: "var(--text-muted)", fontSize: "0.86rem" }}>
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"} in basket
            </p>
          </div>
          <button
            type="button"
            className="ghost-action"
            style={{ fontSize: "1.2rem", padding: "4px 8px" }}
            onClick={closeCart}
          >
            ×
          </button>
        </div>

        {/* Multi-Store Warning & One-Trip Basket Optimization Banner */}
        {isMultiStore ? (
          <div
            style={{
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(245, 158, 11, 0.1)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              marginBottom: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#F59E0B", fontWeight: 700, fontSize: "0.88rem" }}>
                🏪 Multi-Store Basket ({storesInBasket.length} stores)
              </span>
              <button
                type="button"
                className="primary-action"
                style={{ padding: "4px 10px", fontSize: "0.78rem" }}
                onClick={() => setShowOptimization((prev) => !prev)}
              >
                ⚡ Optimize Basket
              </button>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.82rem", lineHeight: 1.4 }}>
              Your basket contains products from: {storesInBasket.join(", ")}.
            </p>

            {showOptimization && optimization.hasOptimization ? (
              <div
                style={{
                  marginTop: "12px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(245, 158, 11, 0.2)",
                  color: "var(--text-main)",
                  fontSize: "0.85rem",
                }}
              >
                <strong style={{ color: "#22C55E", display: "block", marginBottom: "4px" }}>
                  💡 Basket Tradeoff Insight
                </strong>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.84rem" }}>
                  {optimization.tradeoffMessage}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Cart Line Items */}
        {cart.length > 0 ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <strong style={{ color: "var(--text-main)", fontSize: "0.95rem", display: "block" }}>
                    {item.productName}
                  </strong>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    🏬 {item.storeName} • {currency(item.unitPrice)}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Quantity controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "8px", padding: "2px 6px" }}>
                    <button
                      type="button"
                      style={{ background: "none", border: "none", color: "var(--text-main)", cursor: "pointer", fontWeight: 700, padding: "2px 6px" }}
                      onClick={() => updateQuantity(item.productId, item.storeId, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span style={{ fontSize: "0.88rem", fontWeight: 750, color: "var(--text-main)", minWidth: "16px", textAlign: "center" }}>
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

                  <strong style={{ color: "#22C55E", fontSize: "0.95rem", minWidth: "60px", textAlign: "right" }}>
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
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
            <span style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🛒</span>
            <p>Your shopping cart is currently empty.</p>
          </div>
        )}

        {/* Footer & Subtotal */}
        {cart.length > 0 ? (
          <div style={{ paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>Subtotal</span>
              <strong style={{ fontSize: "1.4rem", color: "var(--text-main)" }}>
                {currency(cartSubtotal)}
              </strong>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="ghost-action"
                style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-main)" }}
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button
                type="button"
                className="primary-action"
                style={{ flex: 2, padding: "12px", borderRadius: "12px", background: "var(--primary)", color: "#fff", fontWeight: 750 }}
                onClick={handlePrepareCheckout}
              >
                Choose Store & Prepare Order ➔
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CartDrawer;
