import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import "./theme.css";

import { UIProvider, useUI } from "./context/UIContext";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import PageLayout from "./components/layout/PageLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import SearchPage from "./pages/SearchPage";
import CategoriesPage from "./pages/CategoriesPage";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
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

function AppRoutes() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/store/:id" element={<StoreDetailsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Auth routes redirect to /dashboard when already logged in */}
        <Route path="/login" element={<AuthPageShell />} />
        <Route path="/register" element={<AuthPageShell />} />

        {/* Protected routes — redirect to /login when not authenticated */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <ComparePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
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
      <UIProvider>
        <AppProviders>
          <AppRoutes />
        </AppProviders>
      </UIProvider>
    </Router>
  );
}

export default App;
