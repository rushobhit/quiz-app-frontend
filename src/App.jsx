import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import ResultPage from "./pages/ResultPage";
import LoginPage from "./pages/LoginPage";
import StudentSignupPage from "./pages/StudentSignupPage";
import EnterDetailsPage from "./pages/EnterDetailsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import StudentLayout from "./layouts/StudentLayout";
import InstructionsPage from "./pages/InstructionsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

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
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}

function PublicOnlyRoutes() {
  const { isAuthenticated, role } = getAuthState();

  if (!isAuthenticated) return <Outlet />;

  if (role === "ADMIN" || role === "ROLE_ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/select-quiz" replace />;
}

function AdminRoutes() {
  const { isAuthenticated, role } = getAuthState();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (role === "ADMIN" || role === "ROLE_ADMIN") {
    return <Outlet />;
  }

  return <Navigate to="/select-quiz" replace />;
}

export default function App() {
  const { isAuthenticated, role } = getAuthState();

  return (
    <Routes>
      <Route element={<PublicOnlyRoutes />}>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<StudentSignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route path="/enter-details" element={<EnterDetailsPage />} />

	  <Route element={<ProtectedRoutes />}>
	    <Route element={<StudentLayout />}>
	      <Route path="/select-quiz" element={<HomePage />} />
	      <Route path="/instructions" element={<InstructionsPage />} />
	    </Route>

	    <Route path="/quiz/:id" element={<QuizPage />} />
	    <Route path="/result" element={<ResultPage />} />
	  </Route>

      <Route element={<AdminRoutes />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>

      <Route
        path="*"
        element={
          !isAuthenticated ? (
            <Navigate to="/" replace />
          ) : role === "ADMIN" || role === "ROLE_ADMIN" ? (
            <Navigate to="/admin" replace />
          ) : (
            <Navigate to="/select-quiz" replace />
          )
        }
      />
    </Routes>
  );
}