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
  api.login.mockResolvedValue({
    user: { id: 1, name: "Test User", email: "test@example.com" },
    token: "fake-token",
  });
  api.register.mockResolvedValue({
    id: 2,
    name: "New User",
    email: "new@example.com",
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
  render(<App />);
  await waitFor(() => {
    expect(screen.getByText("BazaarHub")).toBeInTheDocument();
  });
});

test("home page renders without crashing", async () => {
  render(<App />);
  await waitFor(() => {
    expect(
      screen.getByText(/Find nearby stores, compare prices, decide smarter\./i)
    ).toBeInTheDocument();
  });
});

test("login page renders without crashing", async () => {
  renderAt("/login");
  await waitFor(() => {
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
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
    expect(screen.getByPlaceholderText("Search products, stores, or categories")).toBeInTheDocument();
  });
});
