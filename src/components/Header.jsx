import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../quizApi";
import { useTheme } from "../context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const storedRole = localStorage.getItem("role") || "";
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const fullNameFromParts = useMemo(() => {
    const firstName = storedUser?.firstName?.trim?.() || "";
    const lastName = storedUser?.lastName?.trim?.() || "";
    return [firstName, lastName].filter(Boolean).join(" ").trim();
  }, [storedUser]);

  const displayName =
    fullNameFromParts ||
    storedUser?.fullName ||
    storedUser?.name ||
    storedUser?.username ||
    storedUser?.email ||
    "Student";

  const displayRole =
    storedRole === "ADMIN" || storedRole === "ROLE_ADMIN"
      ? "Admin"
      : storedRole
      ? "Student"
      : "";

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      if (storedUser?.email) {
        await logout({
          fullName:
            fullNameFromParts ||
            storedUser?.fullName ||
            storedUser?.name ||
            storedUser?.username ||
            "",
          email: storedUser.email,
          role: storedRole,
          eventType: "LOGOUT",
          source: "HEADER",
        });
      }
    } catch (err) {
      console.error("Logout logging/email failed:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/login", { replace: true });
    }
  };

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <button
          type="button"
          className="app-brand"
          onClick={() => navigate("/select-quiz")}
        >
          <span className="app-brand__mark">Q</span>
          <span className="app-brand__copy">
            <strong>Quiz App</strong>
            <small>Practice smarter</small>
          </span>
        </button>

        <div className="app-header__right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
          >
            <span className="theme-toggle__track">
              <span
                className={`theme-toggle__thumb theme-toggle__thumb--${theme}`}
              />
            </span>
          </button>

          {isLoggedIn && (
            <div className="app-user-chip">
              <div className="app-user-chip__text">
                <span className="app-user-chip__name">{displayName}</span>
                {displayRole && (
                  <span className="app-user-chip__role">{displayRole}</span>
                )}
              </div>

              <button
                type="button"
                className="app-user-chip__logout"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}