import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { safeJSONParse } from "../utils/format";

const AuthContext = createContext(null);

// Default Pre-Registered Accounts for Demo & Role Testing
const DEFAULT_REGISTERED_USERS = [
  {
    id: 1,
    name: "Sambhav Varshney",
    email: "customer@bazaarhub.com",
    password: "password123",
    role: "customer",
  },
  {
    id: 2,
    name: "D-Mart Owner",
    email: "shopowner@bazaarhub.com",
    password: "password123",
    role: "shop_owner",
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@bazaarhub.com",
    password: "password123",
    role: "admin",
  },
  {
    id: 4,
    name: "Sambhav Varshney",
    email: "svvarshney649@gmail.com",
    password: "password123",
    role: "customer",
  },
  {
    id: 5,
    name: "D-Mart Owner",
    email: "owner@dmart.com",
    password: "password123",
    role: "shop_owner",
  },
];

export function AuthProvider({ children, onNotify }) {
  const [user, setUser] = useState(() => safeJSONParse(localStorage.getItem("authUser")) || null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem("bazaarhub_guest") === "true");
  const [authLoading, setAuthLoading] = useState(false);

  // Persistent Registered Users list (combines defaults + user registrations)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    const saved = safeJSONParse(localStorage.getItem("bazaarhub_registered_users"));
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return DEFAULT_REGISTERED_USERS;
  });

  // Sync registered users to LocalStorage
  useEffect(() => {
    localStorage.setItem("bazaarhub_registered_users", JSON.stringify(registeredUsers));
  }, [registeredUsers]);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setIsGuest(false);
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      localStorage.removeItem("bazaarhub_guest");
      onNotify?.("Session expired. Please login again.", "error");
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [onNotify]);

  const persistSession = (auth) => {
    let role = auth.user?.role || "customer";
    if (role === "user") role = "customer";

    const normalizedUser = {
      ...auth.user,
      role,
    };

    setUser(normalizedUser);
    setIsGuest(false);
    localStorage.removeItem("bazaarhub_guest");
    localStorage.setItem("authUser", JSON.stringify(normalizedUser));
    localStorage.setItem("authToken", auth.token);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem("bazaarhub_guest", "true");
    onNotify?.("Continuing as guest");
  };

  /**
   * Login handler: Validates credentials against backend or registered user registry.
   */
  const login = async (payload) => {
    setAuthLoading(true);
    const inputEmail = (payload.email || "").trim().toLowerCase();
    const inputPassword = payload.password || "";

    try {
      // 1. Try real backend API first if available
      const auth = await api.login(payload);
      persistSession(auth);
      onNotify?.("Logged in successfully");
      return { success: true };
    } catch (apiError) {
      // 2. Check registration registry
      const matchedUser = registeredUsers.find((u) => u.email.toLowerCase() === inputEmail);

      if (!matchedUser) {
        onNotify?.("User not registered. Please create an account first.", "error");
        return { success: false, error: "User not registered. Please create an account first." };
      }

      // Check password if provided (for non-empty input)
      if (inputPassword && matchedUser.password && matchedUser.password !== inputPassword) {
        onNotify?.("Invalid email or password.", "error");
        return { success: false, error: "Invalid email or password." };
      }

      const verifiedAuth = {
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
        },
        token: "jwt-session-token-" + Date.now(),
      };

      persistSession(verifiedAuth);
      onNotify?.(`Logged in as ${matchedUser.role.replace("_", " ")}`);
      return { success: true };
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Register handler: Creates a new user in the registry and logs them in.
   */
  const register = async (payload) => {
    setAuthLoading(true);
    const inputEmail = (payload.email || "").trim().toLowerCase();
    const inputName = payload.name || "New User";
    const inputPassword = payload.password || "password123";

    try {
      // Check duplicate
      const exists = registeredUsers.some((u) => u.email.toLowerCase() === inputEmail);
      if (exists) {
        onNotify?.("An account with that email already exists. Please login.", "error");
        return { success: false, error: "An account with that email already exists. Please login." };
      }

      const newUser = {
        id: Date.now(),
        name: inputName,
        email: inputEmail,
        password: inputPassword,
        role: "customer",
      };

      // Update registered users registry
      setRegisteredUsers((prev) => [...prev, newUser]);

      // Try API register
      try {
        await api.register(payload);
      } catch {
        // API offline fallback
      }

      const newAuth = {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
        token: "jwt-session-token-" + Date.now(),
      };

      persistSession(newAuth);
      onNotify?.("Account registered and logged in successfully!");
      return { success: true };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return false;
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("bazaarhub_guest");
    onNotify?.("Logged out");
    return true;
  };

  const isAdmin = user?.role === "admin";
  const isShopOwner = user?.role === "shop_owner";
  const isCustomer = !user || user?.role === "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        registeredUsers,
        continueAsGuest,
        authLoading,
        login,
        register,
        logout,
        isAdmin,
        isShopOwner,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
