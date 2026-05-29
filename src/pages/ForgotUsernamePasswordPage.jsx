import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../quizApi"; // use shared Axios instance

export default function ForgotUsernamePasswordPage() {
  const [recoveryType, setRecoveryType] = useState("password");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email is required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleTypeChange = (e) => {
    setRecoveryType(e.target.value);
    setEmail("");
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateEmail()) return;

    const trimmedEmail = email.trim();

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      if (recoveryType === "username") {
        // https://quizmicroservice.onrender.com/api/auth/forgot-username
        await api.post("/auth/forgot-username", { email: trimmedEmail });
        setSuccessMessage(
          "If an account exists with this email, your username has been sent to your Gmail."
        );
      } else {
        // https://quizmicroservice.onrender.com/api/auth/forgot-password
        await api.post("/auth/forgot-password", { email: trimmedEmail });
        setSuccessMessage(
          "If an account exists with this email, a password reset link has been sent to your Gmail."
        );
      }

      setEmail("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to process your request right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isUsernameRecovery = recoveryType === "username";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <p className="auth-badge">Account recovery</p>
          <h1 className="auth-title">Recover your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>Recovery type</span>
            <select
              name="recoveryType"
              value={recoveryType}
              onChange={handleTypeChange}
              className="auth-select"
            >
              <option value="password">Forgot Password</option>
              <option value="username">Forgot Username</option>
            </select>
          </label>

          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              name="email"
              placeholder="Enter your registered Gmail"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
                setSuccessMessage("");
              }}
              autoComplete="email"
            />
          </label>

          {isUsernameRecovery ? (
            <p className="auth-helper">
              We will send your username to your registered email address.
            </p>
          ) : (
            <p className="auth-helper">
              We will send a password reset link to your registered email address.
            </p>
          )}

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

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading
              ? "Processing..."
              : isUsernameRecovery
              ? "Send Username"
              : "Send Reset Link"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Remember your account details?{" "}
            <Link to="/login" className="auth-link">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}