import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../quizApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginAs: "",
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasSelectedRole =
    formData.loginAs === "admin" || formData.loginAs === "student";

  const isEmail = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(value.trim());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleRoleChange = (e) => {
    const value = e.target.value;

    setFormData({
      loginAs: value,
      identifier: "",
      password: "",
    });

    setError("");
  };

  const validateForm = () => {
    if (!formData.loginAs) {
      setError("Please select login type.");
      return false;
    }

    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError("Email/username and password are required.");
      return false;
    }

    const identifier = formData.identifier.trim();

    if (identifier.includes("@") && !isEmail(identifier)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const sendLoginLog = async (user, role) => {
    try {
      const deviceInfo = navigator.userAgent || "Unknown device";

      await api.post("/auth/login-log", {
        userId: user.id,
        fullName: user.fullName,
        role,
        deviceInfo,
      });
    } catch (error) {
      console.error("Login log failed", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const trimmedIdentifier = formData.identifier.trim();

      const response = await api.post("/auth/login", {
        emailOrUsername: trimmedIdentifier,
        password: formData.password,
        role: formData.loginAs.toUpperCase(),
      });

      const data = response.data;

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      if (data?.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (data?.role) {
        localStorage.setItem("role", data.role);
      }

      if (data?.user) {
        const effectiveRole = data.role || formData.loginAs.toUpperCase();
        sendLoginLog(data.user, effectiveRole);
      }

      const isAdmin =
        formData.loginAs === "admin" ||
        data?.role === "ADMIN" ||
        data?.role === "ROLE_ADMIN";

      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/select-quiz", { replace: true });
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your credentials and selected role."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__head">
            <p className="auth-badge">Welcome</p>
            <h1 className="auth-title">Login to your account</h1>
            <p className="auth-subtitle">Choose your role</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field">
              <span>Login as</span>
              <select
                name="loginAs"
                value={formData.loginAs}
                onChange={handleRoleChange}
              >
                <option value="" disabled>
                  Select option
                </option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {hasSelectedRole && (
              <>
                <label className="field">
                  <span>Email or Username</span>
                  <input
                    type="text"
                    name="identifier"
                    placeholder={
                      formData.loginAs === "admin"
                        ? "Enter admin email or username"
                        : "Enter student email or username"
                    }
                    value={formData.identifier}
                    onChange={handleChange}
                    autoComplete="username"
                  />
                </label>

                <label className="field">
                  <span>Password</span>
                  <input
                    type="password"
                    name="password"
                    placeholder={
                      formData.loginAs === "admin"
                        ? "Enter admin password"
                        : "Enter student password"
                    }
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                </label>

                <button
                  className="primary-btn"
				  id="login-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading
                    ? "Logging in..."
                    : formData.loginAs === "admin"
                    ? "Login as Admin"
                    : "Login as Student"}
                </button>
              </>
            )}

            {error && <div className="error-box">{error}</div>}
          </form>

          <div className="auth-links">
            {formData.loginAs === "student" && (
              <p>
                Don&apos;t have a student account?{" "}
                <Link to="/signup" className="auth-link">
                  Sign up
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}