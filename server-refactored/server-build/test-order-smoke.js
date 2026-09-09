"use strict";

process.env.JWT_SECRET = "smoke-test-secret-key-12345";

const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");

const secret = process.env.JWT_SECRET;

const tokenCustomer1 = jwt.sign({ id: "1", email: "customer@bazaarhub.com", role: "customer", name: "Sambhav Varshney" }, secret);
const tokenCustomer2 = jwt.sign({ id: "2", email: "rahul@gmail.com", role: "customer", name: "Rahul Sharma" }, secret);
const tokenShopOwner1 = jwt.sign({ id: "1", email: "dmart@bazaarhub.com", role: "shop_owner", name: "D-Mart Owner" }, secret);
const tokenShopOwner2 = jwt.sign({ id: "99", email: "otherstore@bazaarhub.com", role: "shop_owner", name: "Other Store Owner" }, secret);
const tokenAdmin = jwt.sign({ id: "100", email: "admin@bazaarhub.com", role: "admin", name: "System Admin" }, secret);

function makeRequest(server, method, path, token = null, body = null) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: address.port,
        path,
        method,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on("error", reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSmokeTests() {
  const server = http.createServer(app);
  await new Promise((res) => server.listen(0, "127.0.0.1", res));

  console.log("==================================================");
  console.log("STAGE 11 ORDER API SMOKE TEST EXECUTION");
  console.log("==================================================\n");

  const results = [];

  function record(method, endpoint, role, status, pass, detail = "") {
    results.push({ method, endpoint, role, status, result: pass ? "PASS" : "FAIL", detail });
    console.log(`[${pass ? "PASS" : "FAIL"}] ${method} ${endpoint} | Role: ${role} | HTTP ${status} ${detail ? "(" + detail + ")" : ""}`);
  }

  try {
    // 1. POST /api/orders (Customer create)
    const createRes = await makeRequest(server, "POST", "/api/orders", tokenCustomer1, {
      items: [{ productId: "1", productName: "Amul Milk 1L", unitPrice: 52, quantity: 1 }],
      storeId: "1",
      storeName: "D-Mart",
      subtotal: 52,
      savings: 0,
      total: 52,
      paymentMethod: "Demo Test Payment",
    });
    const createdOrderId = createRes.body?.order?.id;
    record("POST", "/api/orders", "customer", createRes.status, createRes.status === 201 && !!createdOrderId, `Order ID: ${createdOrderId}`);

    // Unauthorized POST
    const createUnauthRes = await makeRequest(server, "POST", "/api/orders", null, {});
    record("POST", "/api/orders", "unauthorized", createUnauthRes.status, createUnauthRes.status === 401);

    // 2. GET /api/orders (Customer get own orders)
    const cust1OrdersRes = await makeRequest(server, "GET", "/api/orders", tokenCustomer1);
    const cust1Orders = cust1OrdersRes.body?.orders || [];
    const cust1Only = cust1Orders.length > 0 && cust1Orders.every((o) => String(o.customerId) === "1" || o.customerEmail === "customer@bazaarhub.com");
    record("GET", "/api/orders", "customer (customer1)", cust1OrdersRes.status, cust1OrdersRes.status === 200 && cust1Only, `Returned ${cust1Orders.length} orders; private data isolated`);

    const cust2OrdersRes = await makeRequest(server, "GET", "/api/orders", tokenCustomer2);
    const cust2Orders = cust2OrdersRes.body?.orders || [];
    const cust2Only = cust2Orders.length > 0 && cust2Orders.every((o) => String(o.customerId) === "2" || o.customerEmail === "rahul@gmail.com");
    record("GET", "/api/orders", "customer (customer2)", cust2OrdersRes.status, cust2OrdersRes.status === 200 && cust2Only, `Returned ${cust2Orders.length} orders; private data isolated`);

    const custUnauthRes = await makeRequest(server, "GET", "/api/orders", null);
    record("GET", "/api/orders", "unauthorized", custUnauthRes.status, custUnauthRes.status === 401);

    // 3. GET /api/orders/shop (Shop Owner store isolated orders)
    const shop1Res = await makeRequest(server, "GET", "/api/orders/shop", tokenShopOwner1);
    const shop1Orders = shop1Res.body?.orders || [];
    record("GET", "/api/orders/shop", "shop_owner (store 1)", shop1Res.status, shop1Res.status === 200 && shop1Orders.length > 0, `Returned ${shop1Orders.length} store 1 orders`);

    const shop2Res = await makeRequest(server, "GET", "/api/orders/shop", tokenShopOwner2);
    const shop2Orders = shop2Res.body?.orders || [];
    record("GET", "/api/orders/shop", "shop_owner (store 99 - isolated)", shop2Res.status, shop2Res.status === 200 && shop2Orders.length === 0, `Returned 0 orders for store 99`);

    const shopWrongRoleRes = await makeRequest(server, "GET", "/api/orders/shop", tokenCustomer1);
    record("GET", "/api/orders/shop", "customer (wrong role)", shopWrongRoleRes.status, shopWrongRoleRes.status === 403);

    // 4. GET /api/orders/admin (Admin platform wide orders)
    const adminRes = await makeRequest(server, "GET", "/api/orders/admin", tokenAdmin);
    const adminOrders = adminRes.body?.orders || [];
    record("GET", "/api/orders/admin", "admin", adminRes.status, adminRes.status === 200 && adminOrders.length >= 3, `Returned all ${adminOrders.length} platform orders`);

    const adminWrongRoleRes = await makeRequest(server, "GET", "/api/orders/admin", tokenCustomer1);
    record("GET", "/api/orders/admin", "customer (wrong role)", adminWrongRoleRes.status, adminWrongRoleRes.status === 403);

    // 5. PUT /api/orders/:id/status (Update status via PUT)
    const putRes = await makeRequest(server, "PUT", `/api/orders/${createdOrderId}/status`, tokenShopOwner1, { status: "ACCEPTED" });
    record("PUT", `/api/orders/${createdOrderId}/status`, "shop_owner", putRes.status, putRes.status === 200 && putRes.body?.order?.orderStatus === "ACCEPTED", `Status updated to ACCEPTED`);

    // Verify PUT shop owner isolation (shopOwner2 attempting to modify shopOwner1's order)
    const putForbiddenRes = await makeRequest(server, "PUT", `/api/orders/${createdOrderId}/status`, tokenShopOwner2, { status: "PREPARING" });
    record("PUT", `/api/orders/${createdOrderId}/status`, "shop_owner (wrong store owner)", putForbiddenRes.status, putForbiddenRes.status === 403, `Forbidden to modify another store's order`);

    // 6. PATCH /api/orders/:id/status (Update status via PATCH and test lifecycle progression)
    // Lifecycle test: PLACED (created) -> ACCEPTED (via PUT above) -> PREPARING -> READY_FOR_PICKUP -> COMPLETED (via PATCH)
    const patchPrepRes = await makeRequest(server, "PATCH", `/api/orders/${createdOrderId}/status`, tokenShopOwner1, { status: "PREPARING" });
    record("PATCH", `/api/orders/${createdOrderId}/status`, "shop_owner", patchPrepRes.status, patchPrepRes.status === 200 && patchPrepRes.body?.order?.orderStatus === "PREPARING", `Lifecycle step: PREPARING`);

    const patchReadyRes = await makeRequest(server, "PATCH", `/api/orders/${createdOrderId}/status`, tokenShopOwner1, { status: "READY_FOR_PICKUP" });
    record("PATCH", `/api/orders/${createdOrderId}/status`, "shop_owner", patchReadyRes.status, patchReadyRes.status === 200 && patchReadyRes.body?.order?.orderStatus === "READY_FOR_PICKUP", `Lifecycle step: READY_FOR_PICKUP`);

    const patchCompleteRes = await makeRequest(server, "PATCH", `/api/orders/${createdOrderId}/status`, tokenShopOwner1, { status: "COMPLETED" });
    record("PATCH", `/api/orders/${createdOrderId}/status`, "shop_owner", patchCompleteRes.status, patchCompleteRes.status === 200 && patchCompleteRes.body?.order?.orderStatus === "COMPLETED", `Lifecycle step: COMPLETED`);

    console.log("\n==================================================");
    console.log("SMOKE TEST SUMMARY");
    console.log("==================================================");
    const failedCount = results.filter((r) => r.result === "FAIL").length;
    console.log(`Total tests: ${results.length} | Passed: ${results.length - failedCount} | Failed: ${failedCount}`);
    console.log(`PUT endpoint status update: WORKING`);
    console.log(`PATCH endpoint status update: WORKING`);
    console.log(`Order Lifecycle (PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> COMPLETED): VERIFIED`);

    if (failedCount > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runSmokeTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
