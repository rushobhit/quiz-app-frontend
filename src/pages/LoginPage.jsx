import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api from "../quizApi"; // <-- use your configured Axios instance

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginAs: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hasSelectedRole =
    formData.loginAs === "admin" || formData.loginAs === "student";

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
      email: "",
      password: "",
    });

    setError("");
  };

  const validateForm = () => {
    if (!formData.loginAs) {
      setError("Please select login type.");
      return false;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Email and password are required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError("");

      // use shared Axios client; this hits
      // https://quizmicroservice.onrender.com/api/auth/login
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
        role: formData.loginAs.toUpperCase(), // "ADMIN" or "STUDENT"
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

      const isAdmin =
        formData.loginAs === "admin" ||
        data.role === "ADMIN" ||
        data.role === "ROLE_ADMIN";

      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
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
                  <span>Email address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder={
                      formData.loginAs === "admin"
                        ? "Enter admin email"
                        : "Enter student email"
                    }
                    value={formData.email}
                    onChange={handleChange}
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
                  />
                </label>

                <button
                  className="primary-btn"
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
            <Link to="/forgot-account" className="auth-link">
              Forgot username or password?
            </Link>

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