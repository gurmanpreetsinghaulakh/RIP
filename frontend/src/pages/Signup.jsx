import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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

        const adminStored = localStorage.getItem('homigo_admin_settings');
        let requireEmailVerification = false;
        if (adminStored) {
            try {
                const parsed = JSON.parse(adminStored);
                if (parsed.requireEmailVerification !== undefined) {
                    requireEmailVerification = parsed.requireEmailVerification;
                }
            } catch {}
        }

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...formData,
                    requireEmailVerification
                }),
            });
            const result = await res.json();
            if (result.success) {
                if (result.requireVerification === false) {
                    login(result.user);
                    navigate(result.user.isAdmin ? '/admin-dashboard' : '/dashboard');
                } else {
                    navigate('/signup/verify');
                }
            } else {
                setError(result.error || 'Signup failed. Please try again.');
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
            <div className="auth-blob auth-blob-1" />
            <div className="auth-blob auth-blob-2" />

            <div className="auth-card" id="signup-card">
                <Link to="/" className="auth-back-link">← Back to Home</Link>

                <div className="auth-logo">✦ HomiGo</div>
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Join millions of travellers on HomiGo</p>

                {error && (
                    <div className="auth-error" id="signup-error">
                        <span>⚠</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" id="signup-form">
                    <div className="auth-field">
                        <label htmlFor="su-username">Username</label>
                        <input
                            id="su-username"
                            name="username"
                            type="text"
                            placeholder="Choose a username"
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="su-email">Email</label>
                        <input
                            id="su-email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            autoComplete="email"
                        />
                    </div>
                    <div className="auth-field">
                        <label htmlFor="su-password">Password</label>
                        <input
                            id="su-password"
                            name="password"
                            type="password"
                            placeholder="Create a strong password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-submit-btn"
                        id="signup-submit-btn"
                        disabled={loading}
                    >
                        {loading ? <span className="btn-spinner" /> : 'Create Account →'}
                    </button>
                </form>

                <p className="auth-footer-text" style={{ marginTop: '1.5rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Log in</Link>
                </p>
            </div>
        </div>
    );
}
