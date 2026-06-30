import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api, { getApiErrorMessage } from "../quizApi";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("password"); // "password" or "username"

  // Password reset state
  const [resetStep, setResetStep] = useState(1); // 1: verify details, 2: reset password
  const [pwForm, setPwForm] = useState({
    identifierType: "EMAIL",
    identifier: "",
    dob: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [resetToken, setResetToken] = useState("");

  // Username recovery state
  const [unForm, setUnForm] = useState({
    email: "",
    dob: "",
  });
  const [recoveredUsername, setRecoveredUsername] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleUnChange = (e) => {
    setUnForm({ ...unForm, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleVerifyDetails = async (e) => {
    e.preventDefault();
    if (!pwForm.identifier.trim() || !pwForm.dob) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await api.post("/auth/forgot-password", {
        identifierType: pwForm.identifierType,
        identifier: pwForm.identifier.trim(),
        dob: pwForm.dob,
      });

      if (response.data?.token) {
        setResetToken(response.data.token);
        setResetStep(2);
        setSuccess("Details verified successfully. Please enter your new password.");
      } else {
        setError("Failed to verify details. Try again.");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid verification details."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!pwForm.newPassword || !pwForm.confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (pwForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await api.post("/auth/reset-password", {
        token: resetToken,
        newPassword: pwForm.newPassword,
      });

      setSuccess("Password reset successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to reset password."));
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverUsername = async (e) => {
    e.preventDefault();
    if (!unForm.email.trim() || !unForm.dob) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setRecoveredUsername("");

      const response = await api.post("/auth/forgot-username", {
        email: unForm.email.trim().toLowerCase(),
        dob: unForm.dob,
      });

      if (response.data?.username) {
        setRecoveredUsername(response.data.username);
        setSuccess("Username recovered successfully!");
      } else {
        setError("Failed to recover username.");
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid recovery details."));
    } finally {
      setLoading(false);
    }
  };

  const toggleTab = (tab) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
    setResetStep(1);
    setResetToken("");
    setRecoveredUsername("");
  };

  return (
    <>
      <Header />
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__head">
            <p className="auth-badge">Account Recovery</p>
            <h1 className="auth-title">Forgot Credentials?</h1>
            
            {/* Tabs Selector */}
            <div className="tab-selector" style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                type="button"
                className={`tab-btn ${activeTab === "password" ? "active" : ""}`}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: activeTab === "password" ? "#01696f" : "#e0e0e0",
                  color: activeTab === "password" ? "#fff" : "#333",
                  transition: 'all 0.3s ease'
                }}
                onClick={() => toggleTab("password")}
              >
                Reset Password
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "username" ? "active" : ""}`}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: activeTab === "username" ? "#01696f" : "#e0e0e0",
                  color: activeTab === "username" ? "#fff" : "#333",
                  transition: 'all 0.3s ease'
                }}
                onClick={() => toggleTab("username")}
              >
                Recover Username
              </button>
            </div>
          </div>

          {activeTab === "password" && (
            <div className="tab-content" style={{ marginTop: '20px' }}>
              {resetStep === 1 ? (
                <form onSubmit={handleVerifyDetails} className="auth-form">
                  <label className="field">
                    <span>Search by</span>
                    <select
                      name="identifierType"
                      value={pwForm.identifierType}
                      onChange={handlePwChange}
                    >
                      <option value="EMAIL">Gmail Address</option>
                      <option value="USERNAME">Username</option>
                    </select>
                  </label>

                  <label className="field">
                    <span>{pwForm.identifierType === "EMAIL" ? "Gmail Address" : "Username"}</span>
                    <input
                      type="text"
                      name="identifier"
                      placeholder={`Enter your ${pwForm.identifierType.toLowerCase()}`}
                      value={pwForm.identifier}
                      onChange={handlePwChange}
                    />
                  </label>

                  <label className="field">
                    <span>Date of Birth</span>
                    <input
                      type="date"
                      name="dob"
                      value={pwForm.dob}
                      onChange={handlePwChange}
                    />
                  </label>

                  {error && <div className="error-box">{error}</div>}
                  {success && <div className="success-box">{success}</div>}

                  <button className="primary-btn" type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Details"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="auth-form">
                  <label className="field">
                    <span>New Password</span>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Enter at least 8 characters"
                      value={pwForm.newPassword}
                      onChange={handlePwChange}
                      autoComplete="new-password"
                    />
                  </label>

                  <label className="field">
                    <span>Confirm New Password</span>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Re-enter new password"
                      value={pwForm.confirmPassword}
                      onChange={handlePwChange}
                      autoComplete="new-password"
                    />
                  </label>

                  {error && <div className="error-box">{error}</div>}
                  {success && <div className="success-box">{success}</div>}

                  <button className="primary-btn" type="submit" disabled={loading}>
                    {loading ? "Resetting Password..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "username" && (
            <div className="tab-content" style={{ marginTop: '20px' }}>
              <form onSubmit={handleRecoverUsername} className="auth-form">
                <label className="field">
                  <span>Gmail Address</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter registered Gmail"
                    value={unForm.email}
                    onChange={handleUnChange}
                  />
                </label>

                <label className="field">
                  <span>Date of Birth</span>
                  <input
                    type="date"
                    name="dob"
                    value={unForm.dob}
                    onChange={handleUnChange}
                  />
                </label>

                {error && <div className="error-box">{error}</div>}
                {success && <div className="success-box">{success}</div>}

                {recoveredUsername && (
                  <div className="success-box" style={{ backgroundColor: "#e2f8f0", color: "#0d5c3a", borderLeft: "5px solid #28a745", padding: "12px", marginTop: "10px", borderRadius: "4px" }}>
                    Your Username is: <strong style={{ fontSize: "1.1rem" }}>{recoveredUsername}</strong>
                  </div>
                )}

                <button className="primary-btn" type="submit" disabled={loading}>
                  {loading ? "Recovering..." : "Recover Username"}
                </button>
              </form>
            </div>
          )}

          <div className="auth-links" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>
              Remembered credentials?{" "}
              <Link to="/login" className="auth-link">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
