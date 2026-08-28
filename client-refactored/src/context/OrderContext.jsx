import { createContext, useContext, useState, useEffect } from "react";
import { safeJSONParse } from "../utils/format";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";

const OrderContext = createContext(null);

const DEMO_SEED_ORDERS = [
  {
    id: "ORD-849201",
    customerId: "1",
    customerName: "Sambhav Varshney",
    customerEmail: "customer@bazaarhub.com",
    storeId: "1",
    storeName: "D-Mart",
    items: [
      { productId: "1", productName: "Amul Taaza Toned Milk 1L", unitPrice: 52, quantity: 2 },
      { productId: "2", productName: "Britannia Brown Bread 400g", unitPrice: 40, quantity: 1 },
    ],
    subtotal: 144,
    savings: 24,
    total: 120,
    paymentMethod: "Demo Test Payment",
    paymentStatus: "PAID_DEMO",
    orderStatus: "READY_FOR_PICKUP",
    planType: "One-Trip Shopping",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "ORD-739102",
    customerId: "2",
    customerName: "Rahul Sharma",
    customerEmail: "rahul@gmail.com",
    storeId: "2",
    storeName: "Reliance Smart",
    items: [
      { productId: "3", productName: "Maggi 2-Minute Masala Noodles 280g", unitPrice: 14, quantity: 4 },
      { productId: "4", productName: "Nescafe Classic Instant Coffee 50g", unitPrice: 180, quantity: 1 },
    ],
    subtotal: 236,
    savings: 36,
    total: 200,
    paymentMethod: "Cash on Pickup",
    paymentStatus: "PENDING_PICKUP",
    orderStatus: "PREPARING",
    planType: "Lowest Price",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export function OrderProvider({ children }) {
  const { user } = useAuth();
  const { cart, clearCart, addToCart } = useCart();

  const [orders, setOrders] = useState(() => {
    return safeJSONParse(localStorage.getItem("bazaarhub_orders")) || DEMO_SEED_ORDERS;
  });

  // Sync orders with LocalStorage
  useEffect(() => {
    localStorage.setItem("bazaarhub_orders", JSON.stringify(orders));
  }, [orders]);

  /**
   * Creates a new demo order from current cart or checkout state.
   */
  const createOrder = ({
    items = cart,
    storeId = "1",
    storeName = "D-Mart",
    subtotal = 0,
    savings = 0,
    total = 0,
    paymentMethod = "Demo Test Payment",
    planType = "Standard",
    notes = "",
  }) => {
    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder = {
      id: orderId,
      customerId: String(user?.id || "1"),
      customerName: user?.name || "Guest Shopper",
      customerEmail: user?.email || "guest@bazaarhub.com",
      storeId: String(storeId),
      storeName: storeName || "D-Mart",
      items: items.map((i) => ({
        productId: i.productId || i.id,
        productName: i.productName,
        unitPrice: Number(i.unitPrice || i.price),
        quantity: i.quantity,
        storeName: i.storeName || storeName,
      })),
      subtotal: Number(subtotal),
      savings: Number(savings),
      total: Number(total),
      paymentMethod,
      paymentStatus: paymentMethod.includes("Demo") ? "PAID_DEMO" : "PENDING_PICKUP",
      orderStatus: "PLACED",
      planType,
      notes,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  /**
   * Updates an order's status (PLACED -> STORE_REVIEW -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> COMPLETED / CANCELLED).
   */
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return { ...order, orderStatus: newStatus, updatedAt: new Date().toISOString() };
        }
        return order;
      })
    );
  };

  /**
   * Reorder Flow: Adds previous order's items back to the cart ("Shop Again").
   */
  const reorder = (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || !targetOrder.items) return false;

    targetOrder.items.forEach((item) => {
      addToCart(
        { id: item.productId, productName: item.productName, price: item.unitPrice },
        { id: targetOrder.storeId, storeName: item.storeName || targetOrder.storeName },
        item.quantity
      );
    });

    return true;
  };

  /**
   * Returns filtered orders depending on user role and store ownership.
   */
  const getOrdersForRole = (role = "customer", userId = null, myStoreName = "D-Mart") => {
    if (role === "admin") {
      return orders;
    }
    if (role === "shop_owner") {
      return orders.filter(
        (o) =>
          String(o.storeId) === String(userId) ||
          o.storeName?.toLowerCase().includes(myStoreName?.toLowerCase())
      );
    }
    // Default Customer: return orders placed by current user
    return orders.filter(
      (o) => String(o.customerId) === String(userId) || o.customerEmail === user?.email
    );
  };

  const value = {
    orders,
    createOrder,
    updateOrderStatus,
    reorder,
    getOrdersForRole,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within an OrderProvider");
  return context;
}
