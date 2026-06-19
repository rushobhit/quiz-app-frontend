import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../quizApi";

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
    fatherName: "",
    motherName: "",
    dob: "",
    institute: "",
    currentAddressLine1: "",
    currentAddressLine2: "",
    currentCity: "",
    currentState: "",
    currentPincode: "",
    permanentAddressLine1: "",
    permanentAddressLine2: "",
    permanentCity: "",
    permanentState: "",
    permanentPincode: "",
    sameAsCurrent: false,
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
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (name === "sameAsCurrent") {
        const next = {
          ...prev,
          sameAsCurrent: checked,
        };

        if (checked) {
          next.permanentAddressLine1 = prev.currentAddressLine1;
          next.permanentAddressLine2 = prev.currentAddressLine2;
          next.permanentCity = prev.currentCity;
          next.permanentState = prev.currentState;
          next.permanentPincode = prev.currentPincode;
        }

        return next;
      }

      let nextValue = type === "checkbox" ? checked : value;

      if (name === "username") {
        nextValue = value.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20);
      }

      const next = {
        ...prev,
        [name]: nextValue,
      };

      if (prev.sameAsCurrent) {
        if (name.startsWith("current")) {
          const fieldSuffix = name.replace("current", "");
          next["permanent" + fieldSuffix] = value;
        }
      }

      return next;
    });

    setError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const {
      firstName,
      username,
      email,
      password,
      confirmPassword,
      fatherName,
      motherName,
      dob,
      institute,
      currentAddressLine1,
      currentCity,
      currentState,
      currentPincode,
      permanentAddressLine1,
      permanentCity,
      permanentState,
      permanentPincode,
    } = formData;

    if (
      !firstName.trim() ||
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !fatherName.trim() ||
      !motherName.trim() ||
      !dob.trim() ||
      !institute.trim() ||
      !currentAddressLine1.trim() ||
      !currentCity.trim() ||
      !currentState.trim() ||
      !currentPincode.trim() ||
      !permanentAddressLine1.trim() ||
      !permanentCity.trim() ||
      !permanentState.trim() ||
      !permanentPincode.trim()
    ) {
      setError("Please fill in all required fields.");
      return false;
    }

    const usernamePattern = /^[A-Za-z0-9_]{4,20}$/;
    if (!usernamePattern.test(username.trim())) {
      setError(
        "Username must be 4 to 20 characters long and can contain only letters, numbers, and underscore."
      );
      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (email.trim() !== verifiedEmail.trim()) {
      setError("Email cannot be changed after verification.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }

    if (password !== confirmPassword) {
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

      await api.post("/auth/student/signup-details", {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        dob: formData.dob,
        institute: formData.institute.trim(),
        currentAddress: {
          line1: formData.currentAddressLine1.trim(),
          line2: formData.currentAddressLine2.trim(),
          city: formData.currentCity.trim(),
          state: formData.currentState.trim(),
          pincode: formData.currentPincode.trim(),
        },
        permanentAddress: {
          line1: formData.permanentAddressLine1.trim(),
          line2: formData.permanentAddressLine2.trim(),
          city: formData.permanentCity.trim(),
          state: formData.permanentState.trim(),
          pincode: formData.permanentPincode.trim(),
        },
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
              minLength={4}
              maxLength={20}
              pattern="[A-Za-z0-9_]{4,20}"
              title="Username must be 4 to 20 characters long and can contain only letters, numbers, and underscore."
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
            <span>Father&apos;s name</span>
            <input
              type="text"
              name="fatherName"
              placeholder="Enter your father's name"
              value={formData.fatherName}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Mother&apos;s name</span>
            <input
              type="text"
              name="motherName"
              placeholder="Enter your mother's name"
              value={formData.motherName}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Date of birth</span>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Institute / College</span>
            <input
              type="text"
              name="institute"
              placeholder="Enter your institute or college name"
              value={formData.institute}
              onChange={handleChange}
            />
          </label>

          <h3 style={{ marginTop: "12px", marginBottom: "6px" }}>Current address</h3>

          <label className="field">
            <span>Address line 1</span>
            <input
              type="text"
              name="currentAddressLine1"
              placeholder="House no., street"
              value={formData.currentAddressLine1}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Address line 2 (optional)</span>
            <input
              type="text"
              name="currentAddressLine2"
              placeholder="Area, landmark"
              value={formData.currentAddressLine2}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>City</span>
            <input
              type="text"
              name="currentCity"
              value={formData.currentCity}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>State</span>
            <input
              type="text"
              name="currentState"
              value={formData.currentState}
              onChange={handleChange}
            />
          </label>

          <label className="field">
            <span>Pincode</span>
            <input
              type="text"
              name="currentPincode"
              value={formData.currentPincode}
              onChange={handleChange}
            />
          </label>

          <div className="field" style={{ marginTop: "10px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                name="sameAsCurrent"
                checked={formData.sameAsCurrent}
                onChange={handleChange}
              />
              <span>Permanent address same as current</span>
            </label>
          </div>

          <h3 style={{ marginTop: "6px", marginBottom: "6px" }}>Permanent address</h3>

          <label className="field">
            <span>Address line 1</span>
            <input
              type="text"
              name="permanentAddressLine1"
              placeholder="House no., street"
              value={formData.permanentAddressLine1}
              onChange={handleChange}
              disabled={formData.sameAsCurrent}
            />
          </label>

          <label className="field">
            <span>Address line 2 (optional)</span>
            <input
              type="text"
              name="permanentAddressLine2"
              placeholder="Area, landmark"
              value={formData.permanentAddressLine2}
              onChange={handleChange}
              disabled={formData.sameAsCurrent}
            />
          </label>

          <label className="field">
            <span>City</span>
            <input
              type="text"
              name="permanentCity"
              value={formData.permanentCity}
              onChange={handleChange}
              disabled={formData.sameAsCurrent}
            />
          </label>

          <label className="field">
            <span>State</span>
            <input
              type="text"
              name="permanentState"
              value={formData.permanentState}
              onChange={handleChange}
              disabled={formData.sameAsCurrent}
            />
          </label>

          <label className="field">
            <span>Pincode</span>
            <input
              type="text"
              name="permanentPincode"
              value={formData.permanentPincode}
              onChange={handleChange}
              disabled={formData.sameAsCurrent}
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