import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";
import * as apiModule from "./services/api";

// Mock the default export (the api object) as well as the named export
jest.mock("./services/api", () => ({
  __esModule: true,
  API_BASE_URL: "http://localhost:5000/api",
  apiRequest: jest.fn(),
  default: {
    getCategories: jest.fn(),
    getStores: jest.fn(),
    getUsers: jest.fn(),
    getSearchLogs: jest.fn(),
    createSearchLog: jest.fn(),
    getStoreById: jest.fn(),
    login: jest.fn(),
    register: jest.fn(),
    getPaymentConfig: jest.fn(),
    createPaymentOrder: jest.fn(),
    verifyPayment: jest.fn(),
  },
}));

beforeEach(() => {
  const api = apiModule.default;
  api.getCategories.mockResolvedValue([]);
  api.getStores.mockResolvedValue([]);
  api.getUsers.mockResolvedValue([]);
  api.getSearchLogs.mockResolvedValue([]);
  api.createSearchLog.mockResolvedValue({});
  api.getStoreById.mockResolvedValue(null);
  api.getPaymentConfig.mockResolvedValue({ keyId: "rzp_test_demo_public_key", mode: "TEST_SANDBOX" });
  api.createPaymentOrder.mockResolvedValue({
    paymentId: "PAY-123456",
    razorpayOrderId: "order_123456",
    amount: 10000,
    currency: "INR",
    keyId: "rzp_test_demo_public_key",
  });
  api.verifyPayment.mockResolvedValue({ success: true, verified: true });

  api.login.mockImplementation((payload) => {
    if (payload.email === "unregistered@example.com") {
      return Promise.reject(new Error("User not registered. Please create an account first."));
    }
    return Promise.resolve({
      user: { id: 1, name: "Test User", email: payload.email || "customer@bazaarhub.com", role: "customer" },
      token: "fake-token",
    });
  });

  api.register.mockResolvedValue({
    id: 2,
    name: "New User",
    email: "new@example.com",
    role: "customer",
  });

  // Clear persisted auth between tests
  localStorage.clear();
  window.history.pushState({}, "", "/");
});

function renderAt(path) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

test("renders BazaarHub brand in the navbar", async () => {
  renderAt("/login");
  await waitFor(() => {
    expect(screen.getAllByText("BazaarHub").length).toBeGreaterThan(0);
  });
});

test("home page renders without crashing for guest user", async () => {
  localStorage.setItem("bazaarhub_guest", "true");
  render(<App />);
  await waitFor(() => {
    expect(
      screen.getByText(/Find nearby stores, compare prices/i)
    ).toBeInTheDocument();
  });
});

test("login page renders without crashing with Continue as Guest button", async () => {
  renderAt("/login");
  await waitFor(() => {
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByText(/Continue as Guest/i)).toBeInTheDocument();
  });
});

test("categories page renders without crashing", async () => {
  renderAt("/categories");
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "All categories" })).toBeInTheDocument();
  });
});

test("search page renders without crashing", async () => {
  renderAt("/search");
  await waitFor(() => {
    expect(screen.getByPlaceholderText("Search stores, products, brands or areas...")).toBeInTheDocument();
  });
});

test("blocks customer role from /admin/dashboard and displays Access Restricted", async () => {
  localStorage.setItem(
    "authUser",
    JSON.stringify({ id: 1, name: "Customer User", email: "customer@bazaarhub.com", role: "customer" })
  );
  localStorage.setItem("authToken", "fake-token");

  renderAt("/admin/dashboard");
  await waitFor(() => {
    expect(screen.getByText("Access Restricted")).toBeInTheDocument();
  });
});

test("allows admin role to view /admin/dashboard", async () => {
  localStorage.setItem(
    "authUser",
    JSON.stringify({ id: 3, name: "Admin User", email: "admin@bazaarhub.com", role: "admin" })
  );
  localStorage.setItem("authToken", "fake-token");

  renderAt("/admin/dashboard");
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "Admin Dashboard" })).toBeInTheDocument();
  });
});

test("allows shop_owner role to view /shop/dashboard", async () => {
  localStorage.setItem(
    "authUser",
    JSON.stringify({ id: 2, name: "D-Mart Owner", email: "shopowner@bazaarhub.com", role: "shop_owner" })
  );
  localStorage.setItem("authToken", "fake-token");

  renderAt("/shop/dashboard");
  await waitFor(() => {
    expect(screen.getByText("Shop Owner Menu")).toBeInTheDocument();
  });
});

test("checkout page renders empty cart state when no items in cart", async () => {
  localStorage.setItem("bazaarhub_guest", "true");
  renderAt("/checkout");
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
  });
});

test("shop owner dashboard shows Store Orders tab", async () => {
  localStorage.setItem(
    "authUser",
    JSON.stringify({ id: 2, name: "D-Mart Owner", email: "shopowner@bazaarhub.com", role: "shop_owner" })
  );
  localStorage.setItem("authToken", "fake-token");

  renderAt("/shop/dashboard?tab=orders");
  await waitFor(() => {
    expect(screen.getByRole("heading", { name: /Fulfillment Orders for/i })).toBeInTheDocument();
  });
});
