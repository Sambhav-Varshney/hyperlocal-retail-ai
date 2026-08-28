export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 401) {
    if (!endpoint.startsWith("/auth/")) {
      window.dispatchEvent(new Event("auth:expired"));
      throw new Error("Your session has expired. Please login again.");
    }
    let message = "Invalid email or password";
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      // Body not JSON
    }
    throw new Error(message);
  }

  if (!response.ok) {
    let message = "API request failed";
    try {
      const body = await response.json();
      message = body.message || message;
    } catch {
      // response body was not JSON, keep default message
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

const api = {
  getCategories() {
    return apiRequest("/categories");
  },

  getStores(search = "") {
    return apiRequest(`/stores?search=${encodeURIComponent(search)}`);
  },

  getStoreById(id) {
    return apiRequest(`/stores/${id}`);
  },

  getUsers() {
    return apiRequest("/users");
  },

  getSearchLogs() {
    return apiRequest("/search-logs");
  },

  createSearchLog(data) {
    return apiRequest("/search-logs", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  login(payload) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  register(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export default api;
