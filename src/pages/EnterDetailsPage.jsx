import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../quizApi"; // use shared Axios instance

export default function EnterDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const verifiedEmail = location.state?.verifiedEmail || "";
  const isVerified = location.state?.verified === true;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: verifiedEmail,
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isVerified || !verifiedEmail) {
      navigate("/signup", { replace: true });
    }
  }, [isVerified, verifiedEmail, navigate]);

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
    const trimmedFirstName = formData.firstName.trim();
    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();

    if (
      !trimmedFirstName ||
      !trimmedUsername ||
      !trimmedEmail ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setError("Please fill in all required fields.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (trimmedEmail !== verifiedEmail.trim()) {
      setError("Email cannot be changed after verification.");
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

      // hits: https://quizmicroservice.onrender.com/api/auth/student/signup-details
      await api.post("/auth/student/signup-details", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccessMessage(
        "Student account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <p className="auth-badge">Student details</p>
          <h1 className="auth-title">Complete your account</h1>
          <p className="auth-subtitle">
            Your Gmail is verified. Enter your student details to finish creating your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field">
            <span>First name</span>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
              autoComplete="given-name"
            />
          </label>

          <label className="field">
            <span>Last name</span>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
              autoComplete="family-name"
            />
          </label>

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </label>

          <label className="field">
            <span>Verified Gmail</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              autoComplete="email"
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </label>

          <label className="field">
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
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

          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Student Account"}
          </button>
        </form>

        <div className="auth-links">
          <button
            type="button"
            className="secondary-btn auth-back-btn"
            onClick={() => navigate("/login")}
          >
            Go back to login
          </button>
          <p className="auth-session-text">Login and start your session.</p>
        </div>
      </div>
    </div>
  );
}