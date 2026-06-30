import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import api, { googleLogin, githubLogin, socialLoginMock } from "../quizApi";

export default function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    loginAs: "",
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (code && state) {
        try {
          setLoading(true);
          setError("");
          let response;

          if (state === "google") {
            const redirectUri = `${window.location.origin}${import.meta.env.BASE_URL || "/"}`;
            response = await googleLogin(code, redirectUri);
          } else if (state === "github") {
            response = await githubLogin(code);
          }

          if (response?.data) {
            const data = response.data;
            if (data.token) localStorage.setItem("token", data.token);
            if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
            if (data.role) localStorage.setItem("role", data.role);

            navigate("/", { replace: true });

            if (data.role === "ADMIN" || data.role === "ROLE_ADMIN") {
              navigate("/admin", { replace: true });
            } else {
              navigate("/select-quiz", { replace: true });
            }
          }
        } catch (err) {
          setError(
            err?.response?.data?.message ||
              "Social authentication failed. Please try again."
          );
          navigate("/", { replace: true });
        } finally {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  const handleSocialLoginClick = (provider) => {
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

          {/* Social login buttons */}
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

          <div className="auth-links" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', marginTop: '15px' }}>
            {formData.loginAs === "student" && (
              <p>
                Don&apos;t have a student account?{" "}
                <Link to="/signup" className="auth-link">
                  Sign up
                </Link>
              </p>
            )}
            <p>
              Forgot your credentials?{" "}
              <Link to="/forgot-password" className="auth-link" style={{ color: "#01696f", fontWeight: "bold" }}>
                Recover here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}