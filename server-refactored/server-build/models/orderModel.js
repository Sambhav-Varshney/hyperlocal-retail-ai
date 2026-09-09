"use strict";

/**
 * Data Access Layer for Orders
 * Encapsulates operations over the in-memory ordersStore.
 * Implements a clean repository interface that can be swapped for a MySQL adapter in future stages.
 */

// In-memory seed orders repository
let ordersStore = [
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

async function findAll() {
  return ordersStore;
}

async function findById(id) {
  return ordersStore.find((o) => o.id === id) || null;
}

async function findByCustomer(customerId, customerEmail) {
  return ordersStore.filter(
    (o) => String(o.customerId) === String(customerId) || (customerEmail && o.customerEmail === customerEmail)
  );
}

async function findByStore(storeId, storeName) {
  const nameFilter = storeName ? storeName.toLowerCase() : "";
  return ordersStore.filter(
    (o) =>
      String(o.storeId) === String(storeId) ||
      (nameFilter && o.storeName && o.storeName.toLowerCase().includes(nameFilter))
  );
}

async function insert(orderData) {
  ordersStore.unshift(orderData);
  return orderData;
}

async function updateStatus(id, newStatus) {
  const index = ordersStore.findIndex((o) => o.id === id);
  if (index === -1) return null;

  ordersStore[index].orderStatus = newStatus;
  ordersStore[index].updatedAt = new Date().toISOString();
  return ordersStore[index];
}

module.exports = {
  findAll,
  findById,
  findByCustomer,
  findByStore,
  insert,
  updateStatus,
  ordersStore,
};
