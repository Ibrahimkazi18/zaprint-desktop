import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Eager load only the auth page since it's the entry point
import AuthPage from "./pages/AuthPage";

// Lazy load all other pages
const ShopOnboarding = lazy(() => import("./pages/ShopOnboarding"));
const PaymentOnboarding = lazy(() => import("./pages/PaymentOnboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PendingOrders = lazy(() => import("./pages/PendingOrders"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const RegisterPrinter = lazy(() => import("./pages/RegisterPrinter"));
const Printers = lazy(() => import("./pages/Printers"));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/onboarding" element={<ShopOnboarding />} />
          <Route path="/payment-onboarding" element={<PaymentOnboarding />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-orders"
            element={
              <ProtectedRoute>
                <PendingOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-printer"
            element={
              <ProtectedRoute>
                <RegisterPrinter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/printers"
            element={
              <ProtectedRoute>
                <Printers />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster />
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
