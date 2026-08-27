import { createContext, useContext, useState, useEffect } from "react";
import { safeJSONParse } from "../utils/format";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    return safeJSONParse(localStorage.getItem("bazaarhub_cart")) || [];
  });

  const [shoppingLists, setShoppingLists] = useState(() => {
    return (
      safeJSONParse(localStorage.getItem("bazaarhub_shopping_lists")) || [
        {
          id: "default-1",
          name: "Weekly Groceries",
          items: [
            { id: "item-1", text: "Milk 1L", completed: false },
            { id: "item-2", text: "Bread 400g", completed: false },
            { id: "item-3", text: "Eggs 6 pcs", completed: false },
            { id: "item-4", text: "Butter 100g", completed: true },
          ],
        },
      ]
    );
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem("bazaarhub_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("bazaarhub_shopping_lists", JSON.stringify(shoppingLists));
  }, [shoppingLists]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Add product to cart (prevent duplicate line items, increment quantity instead)
  const addToCart = (product, storeOverride = null, qtyToAdd = 1) => {
    const pId = product?.productId || product?.id;
    const pName = product?.productName || product?.name || "Product";
    const sId = storeOverride?.id || product?.storeId || product?.id || "store-1";
    const sName = storeOverride?.storeName || product?.storeName || "Local Store";
    const unitPrice = Number(product?.price || storeOverride?.price || 0);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) =>
          String(item.productId) === String(pId) && String(item.storeId) === String(sId)
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + qtyToAdd;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty > 0 ? newQty : 1,
        };
        return updated;
      }

      const newLineItem = {
        id: `${pId}-${sId}`,
        productId: pId,
        productName: pName,
        storeId: sId,
        storeName: sName,
        unitPrice,
        price: unitPrice,
        quantity: Math.max(1, qtyToAdd),
        category: product?.category || "General",
        rating: product?.rating || storeOverride?.rating || 4.5,
        distance: product?.distance || storeOverride?.distance || null,
      };

      return [...prevCart, newLineItem];
    });

    openCart();
  };

  const updateQuantity = (productId, storeId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId, storeId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (String(item.productId) === String(productId) && String(item.storeId) === String(storeId)) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, storeId) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(String(item.productId) === String(productId) && String(item.storeId) === String(storeId))
      )
    );
  };

  const clearCart = () => setCart([]);

  // Derived Totals
  const cartSubtotal = cart.reduce((sum, item) => sum + Number(item.unitPrice || 0) * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const storesInBasket = Array.from(new Set(cart.map((item) => item.storeName).filter(Boolean)));
  const isMultiStore = storesInBasket.length > 1;

  // Shopping List Management
  const createShoppingList = (name = "New Shopping List", initialItems = []) => {
    const newList = {
      id: `list-${Date.now()}`,
      name,
      items: initialItems.map((text, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        text,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
    };
    setShoppingLists((prev) => [newList, ...prev]);
  };

  const addListItem = (listId, text) => {
    if (!text || !text.trim()) return;
    setShoppingLists((prev) =>
      prev.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            items: [
              ...list.items,
              { id: `item-${Date.now()}`, text: text.trim(), completed: false },
            ],
          };
        }
        return list;
      })
    );
  };

  const toggleListItem = (listId, itemId) => {
    setShoppingLists((prev) =>
      prev.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.map((item) =>
              item.id === itemId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return list;
      })
    );
  };

  const removeListItem = (listId, itemId) => {
    setShoppingLists((prev) =>
      prev.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.filter((item) => item.id !== itemId),
          };
        }
        return list;
      })
    );
  };

  const deleteShoppingList = (listId) => {
    setShoppingLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const value = {
    cart,
    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartItemCount,
    storesInBasket,
    isMultiStore,
    shoppingLists,
    createShoppingList,
    addListItem,
    toggleListItem,
    removeListItem,
    deleteShoppingList,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
