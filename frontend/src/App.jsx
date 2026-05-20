import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { FullPageLoader } from "./components/LoadingSpinner";
import Navbar from "./components/Navbar";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Dashboard from "./pages/Dashboard";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import InterviewReport from "./pages/InterviewReport";
import History from "./pages/History";
import Profile from "./pages/Profile";

// ── Protected route wrapper ────────────────────────────────────────────────
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageLoader message="Loading VisionHire..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}

// ── Public route wrapper (redirects if already logged in) ─────────────────
function PublicLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <FullPageLoader message="Loading..." />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}

// ── App with Router ────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />

      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/interview/setup" element={<InterviewSetup />} />
        <Route path="/interview/session/:interviewId" element={<InterviewSession />} />
        <Route path="/interview/report/:interviewId" element={<InterviewReport />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a3e",
              color: "#fff",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
          }}
        />
      </Router>
    </AuthProvider>
  );
}
