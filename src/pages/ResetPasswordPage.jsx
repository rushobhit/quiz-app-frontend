import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return false;
    }

    if (!formData.password.trim() || !formData.confirmPassword.trim()) {
      setError("Both password fields are required.");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
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
      setSuccessMessage("");

      await axios.post("/api/auth/reset-password", {
        token,
        newPassword: formData.password, // IMPORTANT: matches ResetPasswordRequest
      });

      setSuccessMessage(
        "Your password has been reset successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to reset password. The link may be invalid or expired."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <p className="auth-badge">Password reset</p>
          <h1 className="auth-title">Set a new password</h1>
          <p className="auth-subtitle">
            Enter your new password below to complete the recovery process.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span>Confirm new password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>

          {error && (
            <div className="error-box" role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="success-box" role="status" aria-live="polite">
              {successMessage}
            </div>
          )}

          <button
            className="primary-btn"
            type="submit"
            disabled={loading || !token}
          >
            {loading ? "Updating password..." : "Reset Password"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Back to{" "}
            <Link to="/login" className="auth-link">
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}