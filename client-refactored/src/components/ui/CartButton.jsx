import { useCart } from "../../context/CartContext";

function CartButton() {
  const { cartItemCount, toggleCart } = useCart();

  return (
    <button
      type="button"
      className="ghost-action cart-nav-btn"
      onClick={toggleCart}
      title="View Smart Shopping Cart"
      aria-label={`Shopping Cart (${cartItemCount} items)`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 14px",
        borderRadius: "999px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--text-main)",
        cursor: "pointer",
        fontWeight: 650,
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>🛒</span>
      <span>Cart</span>
      <span
        style={{
          background: cartItemCount > 0 ? "var(--primary)" : "var(--bg-surface)",
          color: "#fff",
          fontSize: "0.75rem",
          fontWeight: 800,
          padding: "2px 8px",
          borderRadius: "999px",
        }}
      >
        {cartItemCount}
      </span>
    </button>
  );
}

export default CartButton;
