import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../quizApi"; // <-- use shared Axios instance

export default function StudentSignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const validateEmail = () => {
    const trimmedEmail = email.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();

    if (!trimmedEmail) {
      setError("Email is required.");
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setError("Please enter a valid Gmail address.");
      return false;
    }

    if (!normalizedEmail.endsWith("@gmail.com")) {
      setError("Please use a Gmail address.");
      return false;
    }

    return true;
  };

  const validateOtp = () => {
    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      setError("OTP is required.");
      return false;
    }

    if (!/^\d{4,6}$/.test(trimmedOtp)) {
      setError("Enter a valid OTP.");
      return false;
    }

    return true;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!validateEmail()) return;

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // hits: https://quizmicroservice.onrender.com/api/auth/send-student-signup-otp
      await api.post("/auth/send-student-signup-otp", {
        email: normalizedEmail,
      });

      setOtpSent(true);
      setStep(2);
      setSuccessMessage("OTP sent successfully to your Gmail.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to send OTP right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!validateEmail() || !validateOtp()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      // hits: https://quizmicroservice.onrender.com/api/auth/verify-student-signup-otp
      await api.post("/auth/verify-student-signup-otp", {
        email: normalizedEmail,
        otp: trimmedOtp,
      });

      setSuccessMessage("Email verified successfully. Redirecting...");

      setTimeout(() => {
        navigate("/enter-details", {
          state: {
            verifiedEmail: normalizedEmail,
            verified: true,
          },
          replace: true,
        });
      }, 900);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmail = () => {
    setStep(1);
    setOtp("");
    setOtpSent(false);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__head">
          <p className="auth-badge">Student signup</p>
          <h1 className="auth-title">Verify your Gmail first</h1>
          <p className="auth-subtitle">
            Before creating a student account, verify your Gmail using OTP.
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <label className="field">
              <span>Gmail address</span>
              <input
                type="email"
                name="email"
                placeholder="Enter your Gmail"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setSuccessMessage("");
                }}
                autoComplete="email"
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
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <label className="field">
              <span>Verified Gmail</span>
              <input type="email" value={email.trim().toLowerCase()} readOnly />
            </label>

            <label className="field">
              <span>Enter OTP</span>
              <input
                type="text"
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value);
                  setError("");
                  setSuccessMessage("");
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
            </label>

            <p className="auth-helper">
              Enter the OTP sent to your Gmail to continue to the student details page.
            </p>

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

            <div className="auth-actions-row">
              <button
                className="secondary-btn"
                type="button"
                onClick={handleEditEmail}
                disabled={loading}
              >
                Change Email
              </button>

              <button
                className="primary-btn auth-inline-btn"
                type="submit"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>

            {otpSent && (
              <button
                className="secondary-btn auth-resend-btn"
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            )}
          </form>
        )}

        <div className="auth-links">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}