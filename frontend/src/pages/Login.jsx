import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePreferences } from "../context/PreferencesContext";
import "../styles/auth.css";

export default function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { adminSettings } = usePreferences();

  const maintenanceActive = adminSettings?.maintenanceMode;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success && result.requireTwoFactor) {
        setTwoFactorPending(true);
        setInfo(result.message || "OTP has been sent to your email.");
        return;
      }

      if (result.success) {
        login(result.user);
        navigate(result.user?.isAdmin ? "/admin-dashboard" : "/dashboard");
        return;
      }

      if (result.redirectUrl) {
        navigate(result.redirectUrl);
        return;
      }

      if (maintenanceActive) {
        setError(
          "Site is under maintenance. Only administrators can sign in at this time.",
        );
      } else {
        setError(result.error || "Invalid username or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/login/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ otp: otp.trim() }),
      });
      const result = await res.json();

      if (result.success) {
        login(result.user);
        navigate(
          result.RedirectUrl ||
            (result.user?.isAdmin ? "/admin-dashboard" : "/dashboard"),
        );
        return;
      }

      setError(result.error || "OTP verification failed.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong verifying the OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await fetch("/api/login/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await res.json();
      if (result.success) {
        setInfo(result.message || "A new OTP was sent.");
        return;
      }
      setError(result.error || "Unable to resend OTP.");
    } catch (err) {
      console.error(err);
      setError("Unable to resend OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />

      <div className="auth-card" id="login-card">
        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>

        <div className="auth-logo">✦ HomiGo</div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to continue your journey</p>

        {maintenanceActive && (
          <div className="auth-info" style={{ marginBottom: "1rem" }}>
            ⚠️ Site is under maintenance. Only administrators can log in right
            now.
          </div>
        )}

        {error && (
          <div className="auth-error" id="login-error">
            <span>⚠</span> {error}
          </div>
        )}
        {info && (
          <div className="auth-success" style={{ marginBottom: "1rem" }}>
            {info}
          </div>
        )}

        {!twoFactorPending ? (
          <form onSubmit={handleSubmit} className="auth-form" id="login-form">
            <div className="auth-field">
              <label htmlFor="username">Username or Email</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username or email"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoComplete="username"
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              id="login-submit-btn"
              disabled={loading}
            >
              {loading ? <span className="btn-spinner" /> : "Log In →"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="auth-form" id="otp-form">
            <div className="auth-field">
              <label htmlFor="otp">OTP Code</label>
              <input
                id="otp"
                name="otp"
                type="text"
                placeholder="Enter the OTP from your email"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                  setInfo("");
                }}
                required
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={otpLoading}
            >
              {otpLoading ? <span className="btn-spinner" /> : "Verify OTP →"}
            </button>
            <button
              type="button"
              className="auth-submit-btn"
              style={{
                marginTop: "0.75rem",
                background: "#e2e8f0",
                color: "#111",
              }}
              onClick={handleResendOtp}
              disabled={otpLoading}
            >
              Resend OTP
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div className="auth-role-hint">
          <div className="role-hint-item">
            <span className="role-badge admin">🛡 Admin</span>
            <span>Full platform management access</span>
          </div>
          <div className="role-hint-item">
            <span className="role-badge user">👤 User</span>
            <span>Browse listings and manage bookings</span>
          </div>
        </div>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
