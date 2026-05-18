import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import '../styles/dashboard.css';
import '../styles/admin.css';

const NAV_ITEMS = [
    { icon: '📊', label: 'Overview', path: '/admin-dashboard' },
    { icon: '🏠', label: 'Listings', path: '/admin/listings' },
    { icon: '📋', label: 'Bookings', path: '/admin/bookings' },
    { icon: '👥', label: 'Users', path: '/admin/users' },
    { icon: '📈', label: 'Analytics', path: '/admin/analytics' },
    { icon: '⚙️', label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children, title, subtitle, actions }) {
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
            <aside className="db-sidebar db-sidebar-admin">
                <div className="db-sidebar-top">
                    <Link to="/" className="db-logo">✦ {siteName}</Link>
                    <div className="admin-badge-strip">
                        <span className="admin-badge-pill">🛡 Admin Panel</span>
                    </div>
                    <nav className="db-nav">
                        {NAV_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`db-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                                id={`admin-nav-${item.label.toLowerCase()}`}
                            >
                                <span>{item.icon}</span> {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="db-sidebar-bottom">
                    <div className="db-admin-info">
                        <div className="db-avatar db-avatar-admin" style={{
                            background: user?.avatarUrl ? `url(${user.avatarUrl}) center/cover` : 'linear-gradient(135deg, var(--db-brand), #7c3aed)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontWeight: 'bold',
                            border: '1px solid var(--db-border)'
                        }}>
                            {!user?.avatarUrl && (user?.username || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                            <p className="admin-uname">{user?.username}</p>
                            <p className="admin-role-label">Administrator</p>
                        </div>
                    </div>
                    <button className="db-logout-btn" onClick={handleLogout} id="admin-logout-btn">
                        <span>🚪</span> Log Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <main className="db-main">
                <header className="db-header db-header-admin">
                    <div>
                        <p className="db-greeting">Admin Workspace</p>
                        <h1 className="db-username">
                            {title} <span className="admin-live-dot" />
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
