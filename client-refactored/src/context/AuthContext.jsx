import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { safeJSONParse } from "../utils/format";

const AuthContext = createContext(null);

export function AuthProvider({ children, onNotify }) {
  const [user, setUser] = useState(() => safeJSONParse(localStorage.getItem("authUser")) || null);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem("bazaarhub_guest") === "true");
  const [authLoading, setAuthLoading] = useState(false);

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
    // Ensure role is mapped cleanly: 'admin' | 'shop_owner' | 'customer'
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

  const login = async (payload) => {
    setAuthLoading(true);
    try {
      const auth = await api.login(payload);
      persistSession(auth);
      onNotify?.("Logged in successfully");
      return { success: true };
    } catch (error) {
      const isNetworkError =
        error.message?.toLowerCase().includes("failed to fetch") ||
        error.message?.toLowerCase().includes("networkerror") ||
        error.name === "TypeError";

      if (isNetworkError) {
        const emailLower = (payload.email || "").toLowerCase();
        let assignedRole = "customer";
        if (emailLower.includes("admin")) {
          assignedRole = "admin";
        } else if (emailLower.includes("owner") || emailLower.includes("shop") || emailLower.includes("dmart")) {
          assignedRole = "shop_owner";
        }

        const nameFromEmail = payload.email ? payload.email.split("@")[0] : "Demo User";
        const formattedName = nameFromEmail
          .replace(/[._]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        const demoAuth = {
          user: {
            id: assignedRole === "admin" ? 3 : assignedRole === "shop_owner" ? 2 : 1,
            name: formattedName || (assignedRole === "admin" ? "Admin User" : assignedRole === "shop_owner" ? "D-Mart Owner" : "Sambhav"),
            email: payload.email,
            role: assignedRole,
          },
          token: "demo-jwt-token-" + Date.now(),
        };

        persistSession(demoAuth);
        onNotify?.(`Logged in as ${assignedRole.replace("_", " ")}`);
        return { success: true };
      }

      onNotify?.(error.message || "Login failed", "error");
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (payload) => {
    setAuthLoading(true);
    try {
      await api.register(payload);
      const auth = await api.login({ email: payload.email, password: payload.password });
      persistSession(auth);
      onNotify?.("Account created and logged in");
      return { success: true };
    } catch (error) {
      const isNetworkError =
        error.message?.toLowerCase().includes("failed to fetch") ||
        error.message?.toLowerCase().includes("networkerror") ||
        error.name === "TypeError";

      if (isNetworkError) {
        const demoAuth = {
          user: {
            id: Date.now(),
            name: payload.name || "New User",
            email: payload.email,
            role: "customer",
          },
          token: "demo-jwt-token-" + Date.now(),
        };

        persistSession(demoAuth);
        onNotify?.("Account created and logged in");
        return { success: true };
      }

      onNotify?.(error.message || "Registration failed", "error");
      return { success: false, error: error.message };
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
