import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import '../styles/dashboard.css';
import '../styles/admin.css'; // Reuse some of the admin utility styles

const USER_NAV = [
    { icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    { icon: '🔍', label: 'Browse Stays', path: '/listings' },
    { icon: '❤️', label: 'Wishlist', path: '/user/wishlist' },
    { icon: '📋', label: 'My Bookings', path: '/user/bookings' },
    { icon: '⭐', label: 'My Reviews', path: '/user/reviews' },
    { icon: '👤', label: 'Profile', path: '/user/profile' },
];

export default function UserLayout({ children, title, subtitle, actions }) {
    const { user, logout } = useAuth();
    const { adminSettings } = usePreferences();
    const navigate = useNavigate();
    const location = useLocation();

    const siteName = adminSettings?.siteName || 'HomiGo';

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="db-page">
            {/* ── SIDEBAR ── */}
            <aside className="db-sidebar">
                <div className="db-sidebar-top">
                    <Link to="/" className="db-logo">✦ {siteName}</Link>
                    <nav className="db-nav">
                        {USER_NAV.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`db-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span>{item.icon}</span> {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="db-sidebar-bottom">
                    <div className="db-user-info">
                        <div className="db-avatar" style={{
                            background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover` : 'linear-gradient(135deg, var(--db-brand), #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            border: '1px solid var(--db-border)'
                        }}>
                            {!user?.avatarUrl && (user?.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="db-uname">{user?.username}</p>
                            <p className="db-role">{siteName} Member</p>
                        </div>
                    </div>
                    <button className="db-logout-btn" onClick={handleLogout}>
                        <span>🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <main className="db-main">
                <header className="db-header">
                    <div>
                        <p className="db-greeting">Personal Workspace</p>
                        <h1 className="db-username">
                            {title}
                        </h1>
                        {subtitle && <p className="db-header-sub">{subtitle}</p>}
                    </div>
                    {actions && <div className="db-header-actions">{actions}</div>}
                </header>
                {children}
            </main>
        </div>
    );
}
