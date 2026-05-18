import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLayout from '../components/UserLayout';

export default function UserDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ bookings: 0, saved: 0, reviews: 0 });

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.isAdmin) { navigate('/admin-dashboard'); return; }

        const loadStats = async () => {
            try {
                const [bookingsRes, wishlistRes, reviewsRes] = await Promise.all([
                    fetch('/api/user/bookings'),
                    fetch('/api/user/wishlist'),
                    fetch('/api/user/reviews')
                ]);

                const [bookingsData, wishlistData, reviewsData] = await Promise.all([
                    bookingsRes.json().catch(() => ({})),
                    wishlistRes.json().catch(() => ({})),
                    reviewsRes.json().catch(() => ({}))
                ]);

                setStats({
                    bookings: Array.isArray(bookingsData.bookings) ? bookingsData.bookings.length : 0,
                    saved: Array.isArray(wishlistData.wishlist) ? wishlistData.wishlist.length : 0,
                    reviews: Array.isArray(reviewsData.reviews) ? reviewsData.reviews.length : 0
                });
            } catch (err) {
                console.error('Dashboard stat load failed:', err);
            }
        };

        loadStats();
    }, [user, navigate]);

    if (!user) return null;

    return (
        <UserLayout title={`Welcome back, ${user.username || 'User'}!`} subtitle="Here is what's happening with your account today.">
            {/* ── KPI CARDS ── */}
            <div className="admin-stats-grid">
                {[
                    { icon: '📅', label: 'Bookings', value: stats.bookings, accent: '#7c3aed', path: '/user/bookings' },
                    { icon: '❤️', label: 'Saved', value: stats.saved, accent: '#ff385c', path: '/user/wishlist' },
                    { icon: '⭐', label: 'Reviews', value: stats.reviews, accent: '#f59e0b', path: '/user/reviews' },
                ].map(c => (
                    <Link to={c.path} key={c.label} className="admin-stat-card" style={{ '--card-accent': c.accent, textDecoration: 'none', color: 'inherit' }}>
                        <div className="admin-stat-icon">{c.icon}</div>
                        <div>
                            <div className="admin-stat-value">{c.value}</div>
                            <div className="admin-stat-label">{c.label}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* ── QUICK ACTIONS ── */}
            <h3 style={{ marginTop: '2.5rem', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '800' }}>Quick Actions</h3>
            <div className="admin-quick-nav">
                {[
                    { icon: '🏠', label: 'Browse Stays', desc: 'Explore unique homes worldwide', path: '/listings' },
                    { icon: '❤️', label: 'View Wishlist', desc: 'Check your saved favorites', path: '/user/wishlist' },
                    { icon: '📅', label: 'My Bookings', desc: 'Track your upcoming trips', path: '/user/bookings' },
                    { icon: '👤', label: 'Profile Settings', desc: 'Update account preferences', path: '/user/profile' },
                ].map(q => (
                    <Link to={q.path} key={q.label} className="admin-quick-card">
                        <span className="aqc-icon">{q.icon}</span>
                        <div>
                            <div className="aqc-label">{q.label}</div>
                            <div className="aqc-desc">{q.desc}</div>
                        </div>
                        <span className="aqc-arrow">→</span>
                    </Link>
                ))}
            </div>

            {/* ── RECENT ACTIVITY ── */}
            <div className="admin-chart-card" style={{ marginTop: '1.2rem', padding: '1.5rem', background: 'var(--db-surface)', border: '1px solid var(--db-border)', borderRadius: '0.9rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.2rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#10b981' }}>●</span>
                        <span style={{ color: 'var(--db-text)' }}>Your booking for <strong>Beachfront Villa Goa</strong> was confirmed.</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--db-muted)' }}>2 hours ago</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.85rem' }}>
                        <span style={{ color: '#7c3aed' }}>●</span>
                        <span style={{ color: 'var(--db-text)' }}>You added <strong>Heritage Haveli Jaipur</strong> to your wishlist.</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--db-muted)' }}>1 day ago</span>
                    </div>
                </div>
            </div>
        </UserLayout>
    );
}
