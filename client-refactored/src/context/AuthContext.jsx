import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { safeJSONParse } from "../utils/format";

const AuthContext = createContext(null);

export function AuthProvider({ children, onNotify }) {
  const [user, setUser] = useState(() => safeJSONParse(localStorage.getItem("authUser")) || null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      onNotify?.("Session expired. Please login again.", "error");
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [onNotify]);

  const persistSession = (auth) => {
    setUser(auth.user);
    localStorage.setItem("authUser", JSON.stringify(auth.user));
    localStorage.setItem("authToken", auth.token);
  };

  const login = async (payload) => {
    setAuthLoading(true);
    try {
      const auth = await api.login(payload);
      persistSession(auth);
      onNotify?.("Logged in successfully");
      return { success: true };
    } catch (error) {
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
      onNotify?.(error.message || "Registration failed", "error");
      return { success: false, error: error.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return false;
    setUser(null);
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    onNotify?.("Logged out");
    return true;
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
