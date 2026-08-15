import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./styles/theme.css";

import { ThemeProvider } from "./context/ThemeContext";
import { UIProvider, useUI } from "./context/UIContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PageLayout from "./components/layout/PageLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import CategoriesPage from "./pages/CategoriesPage";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
import ShopDashboardPage from "./pages/ShopDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AuthPageShell from "./pages/AuthPageShell";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import StoreDetailsPage from "./pages/StoreDetailsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ComparePage from "./pages/ComparePage";

// Inner component so it can consume UIContext (needed by AuthProvider's onNotify).
function AppProviders({ children }) {
  const { showToast } = useUI();

  return (
    <AuthProvider onNotify={showToast}>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  );
}

// Default Entry Guard: App opens on /login by default unless logged in or guest mode active
function HomeRoute() {
  const { user, isGuest } = useAuth();

  if (!user && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  return <HomePage />;
}

// Legacy /dashboard compatibility redirect based on role
function DashboardRedirect() {
  const { user } = useAuth();
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
  if (user?.role === "shop_owner") return <Navigate to="/shop/dashboard" replace />;
  return <Navigate to="/" replace />;
}

function AppRoutes() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/store/:id" element={<StoreDetailsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<AuthPageShell />} />
        <Route path="/register" element={<AuthPageShell />} />

        {/* Protected RBAC routes */}
        <Route
          path="/shop/dashboard"
          element={
            <ProtectedRoute allowedRoles={["shop_owner"]}>
              <ShopDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardRedirect />} />
        
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <ComparePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageLayout>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <UIProvider>
          <AppProviders>
            <AppRoutes />
          </AppProviders>
        </UIProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
