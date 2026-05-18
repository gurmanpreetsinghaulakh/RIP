import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
            const result = await res.json();

            if (result.success) {
                login(result.user);
                // Redirect based on role
                if (result.user?.isAdmin) {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/dashboard');
                }
            } else {
                if (result.redirectUrl) {
                    navigate(result.redirectUrl);
                } else {
                    setError(result.error || 'Invalid username or password.');
                }
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background blobs */}
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />

            <div className="auth-card" id="login-card">
                <Link to="/" className="auth-back-link">← Back to Home</Link>

                <div className="auth-logo">✦ HomiGo</div>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to continue your journey</p>

                {error && (
                    <div className="auth-error" id="login-error">
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" id="login-form">
                    <div className="auth-field">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="Enter your username"
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
                        {loading ? (
                            <span className="btn-spinner" />
                        ) : (
                            'Log In →'
                        )}
                    </button>
                </form>

                <div className="auth-divider"><span>or</span></div>

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
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth-link">Sign up for free</Link>
                </p>
            </div>
        </div>
    );
}
