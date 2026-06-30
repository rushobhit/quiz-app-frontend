import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { googleLogin, githubLogin, socialLoginMock } from "../quizApi";

const OTP_VALIDITY_SECONDS = 5 * 60; // 5 minutes
const RESEND_COOLDOWN_SECONDS = 30; // resend cooldown

export default function StudentSignupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [demoModal, setDemoModal] = useState({
    isOpen: false,
    provider: "",
  });



  const handleSocialLoginClick = (provider) => {
    setDemoModal({
      isOpen: true,
      provider: provider
    });
  };

  const handleSimulateLogin = async () => {
    try {
      setLoading(true);
      setError("");
      const providerName = demoModal.provider;
      setDemoModal({ isOpen: false, provider: "" });

      const mockEmail = `demo.${providerName}@quizapp.com`;
      const mockName = `Demo ${providerName.charAt(0).toUpperCase() + providerName.slice(1)} User`;

      const response = await socialLoginMock(mockEmail, mockName, providerName);
      const data = response.data;

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));
      if (data?.role) localStorage.setItem("role", data.role);

      navigate("/select-quiz", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Mock login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRealOAuthRedirect = () => {
    const provider = demoModal.provider;
    setDemoModal({ isOpen: false, provider: "" });

    const baseAppUrl = `${window.location.origin}${import.meta.env.BASE_URL || "/"}`;

    if (provider === "google") {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";
      const redirectUri = encodeURIComponent(baseAppUrl);
      const scope = encodeURIComponent("email profile openid");
      const state = "google";
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    } else if (provider === "github") {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID";
      const redirectUri = encodeURIComponent(baseAppUrl);
      const state = "github";
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email&state=${state}`;
    }
  };

  const [otpTimeLeft, setOtpTimeLeft] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, "0");
    const secs = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  useEffect(() => {
    if (otpTimeLeft <= 0) return;

    const timerId = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [otpTimeLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timerId = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [resendCooldown]);

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

    if (!/^\d{6}$/.test(trimmedOtp)) {
      setError("Enter a valid 6-digit OTP.");
      return false;
    }

    if (otpTimeLeft <= 0) {
      setError("OTP has expired. Please resend a new OTP.");
      return false;
    }

    return true;
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();

    if (!validateEmail()) return;

    const normalizedEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      await api.post("/auth/send-student-signup-otp", {
        email: normalizedEmail,
      });

      setOtpSent(true);
      setStep(2);
      setOtp("");
      setOtpTimeLeft(OTP_VALIDITY_SECONDS);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      setSuccessMessage("OTP sent successfully to your Gmail.");
    } catch (err) {
      const backendMessage = err?.response?.data?.message;

      setError(
        backendMessage ||
          "Unable to send OTP right now. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!validateOtp()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

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
    setOtpTimeLeft(0);
    setResendCooldown(0);
    setError("");
    setSuccessMessage("");
  };

  const isOtpExpired = step === 2 && otpTimeLeft === 0;

  return (
    <>
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
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                  setSuccessMessage("");
                }}
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={isOtpExpired}
              />
            </label>

            <div className="auth-helper">
              <p>
                OTP valid for: <strong>{formatTime(otpTimeLeft)}</strong>
              </p>
              <p>
                {isOtpExpired
                  ? "Your OTP has expired. Please resend a new OTP."
                  : "Enter the OTP sent to your Gmail to continue to the student details page."}
              </p>
            </div>

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
                disabled={loading || isOtpExpired}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>

            {otpSent && (
              <button
                className="secondary-btn auth-resend-btn"
                type="button"
                onClick={handleSendOtp}
                disabled={loading || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend OTP in ${formatTime(resendCooldown)}`
                  : "Resend OTP"}
              </button>
            )}
          </form>
        )}

        {/* Social signup buttons */}
        <div className="social-divider">
          <div></div>
          <span>or continue with</span>
          <div></div>
        </div>

        <div className="social-buttons">
          <button
            type="button"
            onClick={() => handleSocialLoginClick("google")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.99-6c1.65 0 3.13.67 4.2 1.76l3.1-3.1A10.37 10.37 0 0 0 13.99 2C8.47 2 4 6.48 4 12s4.47 10 9.99 10c5.8 0 9.8-4.08 9.8-9.97 0-.67-.06-1.32-.18-1.745H12.24Z"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLoginClick("github")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </button>
        </div>

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

    {/* Demo simulation modal */}
    {demoModal.isOpen && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '12px',
          maxWidth: '450px',
          width: '90%',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.4rem', color: '#01696f', marginBottom: '15px' }}>
            Connect to {demoModal.provider.charAt(0).toUpperCase() + demoModal.provider.slice(1)}
          </h3>
          <p style={{ color: '#666', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.5' }}>
            Social OAuth requires registering Developer Credentials (Client ID) in your environment. 
            To test the flow immediately, select <strong>Simulate Success</strong>. To connect via real OAuth, select <strong>Real Connection</strong>.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              type="button"
              onClick={handleSimulateLogin}
              style={{
                padding: '12px',
                backgroundColor: '#01696f',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              🚀 Simulate Success (Student)
            </button>
            <button
              type="button"
              onClick={handleRealOAuthRedirect}
              style={{
                padding: '12px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              🔗 Real Connection
            </button>
            <button
              type="button"
              onClick={() => setDemoModal({ isOpen: false, provider: "" })}
              style={{
                padding: '10px',
                backgroundColor: 'transparent',
                color: '#888',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  );
}