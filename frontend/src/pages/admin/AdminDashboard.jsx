import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { usePreferences } from '../../context/PreferencesContext';
import '../../styles/dashboard.css';



export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formatPrice } = usePreferences();
    const [listings, setListings] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [usersCount, setUsersCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/dashboard'); return; }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Listings
                const resL = await fetch('/api/listings');
                const dataL = await resL.json();
                const list = dataL.listings || (Array.isArray(dataL) ? dataL : []);
                setListings(list);

                // Fetch Bookings
                const resB = await fetch('/api/listings/admin/bookings');
                const dataB = await resB.json();
                if (dataB.success) setBookings(dataB.bookings);

                // Fetch Users Count
                const resU = await fetch('/api/admin/users', { credentials: 'include' });
                const dataU = await resU.json();
                if (dataU.success) setUsersCount(dataU.users.length);
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    if (!user) return null;

    const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + (b.amount || 0), 0);
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    const actions = (
        <Link to="/admin/listings/new" className="admin-add-btn" id="admin-add-listing">
            + Add Listing
        </Link>
    );

    return (
        <AdminLayout title="Platform Overview" actions={actions}>
            {/* Stats Cards */}
            <div className="admin-stats-grid">
                {[
                    { icon: '🏠', label: 'Total Listings', value: listings.length, accent: '#7c3aed', trend: 'Properties online' },
                    { icon: '👥', label: 'Platform Users', value: usersCount, accent: '#ff385c', trend: 'Verified' },
                    { icon: '📋', label: 'Bookings', value: bookings.length, accent: '#10b981', trend: `${pendingCount} pending` },
                    {
                        icon: '💰', label: 'Total Revenue',
                        value: formatPrice(totalRevenue),
                        accent: '#f59e0b', trend: 'Confirmed stays'
                    },
                ].map(c => (
                    <div key={c.label} className="admin-stat-card" style={{ '--card-accent': c.accent }}>
                        <div className="admin-stat-icon">{c.icon}</div>
                        <div>
                            <div className="admin-stat-value">{loading ? '...' : c.value}</div>
                            <div className="admin-stat-label">{c.label}</div>
                        </div>
                        <div className="admin-stat-trend">{c.trend}</div>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="admin-quick-nav">
                {[
                    { to: '/admin/listings', icon: '🏠', label: 'Manage Listings', desc: 'View, edit & delete all listings' },
                    { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: 'View registered users & roles' },
                    { to: '/admin/bookings', icon: '📋', label: 'Manage Bookings', desc: 'View and track all bookings' },
                    { to: '/admin/analytics', icon: '📈', label: 'Analytics', desc: 'Platform statistics & charts' },
                    { to: '/admin/settings', icon: '⚙️', label: 'Settings', desc: 'Configure platform preferences' },
                    { to: '/admin/listings/new', icon: '➕', label: 'Add Listing', desc: 'Create a new property listing' },
                ].map(q => (
                    <Link key={q.to} to={q.to} className="admin-quick-card">
                        <span className="aqc-icon">{q.icon}</span>
                        <div>
                            <div className="aqc-label">{q.label}</div>
                            <div className="aqc-desc">{q.desc}</div>
                        </div>
                        <span className="aqc-arrow">→</span>
                    </Link>
                ))}
            </div>

            {/* Recent Listings */}
            <section className="db-section">
                <div className="db-section-header">
                    <h2 className="db-section-title">Recent Listings</h2>
                    <Link to="/admin/listings" className="db-see-all">Manage all →</Link>
                </div>
                <div className="admin-table-wrap">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}><div className="admin-spinner" style={{ margin: 'auto' }} /></div>
                    ) : (
                        <table className="admin-table">
                            <thead><tr><th>Property</th><th>Location</th><th>Price/night</th><th>Category</th><th>Actions</th></tr></thead>
                            <tbody>
                                {listings.slice(0, 5).map(l => (
                                    <tr key={l._id}>
                                        <td>
                                            <div className="table-listing-cell">
                                                <img src={l.Image?.url || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=80&auto=format&fit=crop'} alt={l.title} className="table-listing-img" />
                                                <span className="table-listing-title">{l.title}</span>
                                            </div>
                                        </td>
                                        <td className="table-muted">{l.location}, {l.country}</td>
                                        <td><strong>{formatPrice(l.price)}</strong></td>
                                        <td><span className="table-category-badge">{l.category || 'Stay'}</span></td>
                                        <td>
                                            <div className="table-actions">
                                                <Link to={`/listings/${l._id}`} className="tbl-btn tbl-btn-view">View</Link>
                                                <Link to={`/admin/listings/${l._id}/edit`} className="tbl-btn tbl-btn-edit">Edit</Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {listings.length === 0 && (
                                    <tr><td colSpan={5} className="table-empty">No listings yet. <Link to="/admin/listings/new">Create one →</Link></td></tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Activity Feed */}
            <section className="db-section">
                <h2 className="db-section-title">Platform Summary</h2>
                <div className="admin-activity-feed">
                    <div className="activity-item"><span className="activity-dot dot-green" /><span>Database connectivity is active</span><span className="activity-time">StitchDB</span></div>
                    <div className="activity-item"><span className="activity-dot dot-purple" /><span>{listings.length} properties currently listed on the marketplace</span><span className="activity-time">Live</span></div>
                    <div className="activity-item"><span className="activity-dot dot-amber" /><span>{bookings.length} reservations have been initialized</span><span className="activity-time">History</span></div>
                </div>
            </section>
        </AdminLayout>
    );
}
