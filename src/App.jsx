import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import LoginPage from "./pages/LoginPage";
import StudentSignupPage from "./pages/StudentSignupPage";
import ForgotUsernamePasswordPage from "./pages/ForgotUsernamePasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EnterDetailsPage from "./pages/EnterDetailsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

function getAuthState() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return {
    isAuthenticated: Boolean(token),
    role,
  };
}

function ProtectedRoutes() {
  const { isAuthenticated } = getAuthState();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoutes() {
  const { isAuthenticated, role } = getAuthState();

  if (!isAuthenticated) return <Outlet />;

  // logged-in users trying to access login/signup/forgot → redirect
  if (role === "ADMIN" || role === "ROLE_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/" replace />;
}

function AdminRoutes() {
  const { isAuthenticated, role } = getAuthState();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === "ADMIN" || role === "ROLE_ADMIN") {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* public-only auth routes (login is starter page when logged out) */}
      <Route element={<PublicOnlyRoutes />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<StudentSignupPage />} />
        <Route path="/forgot-account" element={<ForgotUsernamePasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* semi-public route */}
      <Route path="/enter-details" element={<EnterDetailsPage />} />

      {/* authenticated student routes */}
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:id" element={<QuizPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Route>

      {/* admin-only routes */}
      <Route element={<AdminRoutes />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      {/* fallback: send unknown paths to login or home depending on auth */}
      <Route
        path="*"
        element={
          getAuthState().isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}