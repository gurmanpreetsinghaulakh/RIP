import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';
import { usePreferences } from '../../context/PreferencesContext';

const STATUS_STYLES = {
    confirmed: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', border: 'rgba(16,185,129,0.25)', label: '✓ Confirmed' },
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.25)', label: '⏳ Pending' },
    cancelled: { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: 'rgba(239,68,68,0.25)', label: '✕ Cancelled' },
};

export default function AdminBookings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formatPrice } = usePreferences();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/dashboard'); return; }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/listings/admin/bookings');
            const data = await res.json();
            if (data.success) {
                setBookings(data.bookings);
            }
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await fetch(`/api/listings/admin/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b));
                if (selected && selected._id === id) {
                    setSelected(prev => ({ ...prev, status: newStatus }));
                }
            }
        } catch (err) {
            console.error("Failed to update status:", err);
        }
    };

    const filtered = bookings.filter(b => {
        const matchStatus = statusFilter === 'all' || b.status === statusFilter;
        const q = search.toLowerCase();
        const guestName = b.user?.username || 'Unknown';
        const listingTitle = b.listing?.title || 'Unknown';
        const matchSearch = !q || guestName.toLowerCase().includes(q) || listingTitle.toLowerCase().includes(q) || b._id.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const totalRevenue = bookings.filter(b => b.status === 'confirmed').reduce((a, b) => a + (b.amount || 0), 0);

    if (!user) return null;

    return (
        <AdminLayout title="Bookings" subtitle={`${filtered.length} bookings shown`}>
            {/* Stats row */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                {[
                    { icon: '📋', label: 'Total', value: bookings.length, accent: '#7c3aed' },
                    { icon: '✅', label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, accent: '#10b981' },
                    { icon: '⏳', label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, accent: '#f59e0b' },
                    { icon: '💰', label: 'Revenue', value: formatPrice(totalRevenue), accent: '#ff385c' },
                ].map(c => (
                    <div key={c.label} className="admin-stat-card" style={{ '--card-accent': c.accent }}>
                        <div className="admin-stat-icon">{c.icon}</div>
                        <div>
                            <div className="admin-stat-value">{c.value}</div>
                            <div className="admin-stat-label">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="admin-filter-bar">
                <div className="admin-search-wrap">
                    <span className="search-icon-prefix">🔍</span>
                    <input className="admin-search-input" placeholder="Search guest, listing, booking ID…" value={search} onChange={e => setSearch(e.target.value)} />
                    {search && <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>}
                </div>
                <div className="admin-filter-group">
                    {['all', 'confirmed', 'pending', 'cancelled'].map(s => (
                        <button
                            key={s}
                            className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
                            onClick={() => setStatusFilter(s)}
                            id={`booking-filter-${s}`}
                        >
                            {s === 'all' ? 'All' : STATUS_STYLES[s]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-wrap">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="admin-spinner" style={{ margin: '0 auto 1rem' }} />
                        <p style={{ color: 'var(--db-muted)' }}>Loading bookings...</p>
                    </div>
                ) : (
                    <table className="admin-table" id="admin-bookings-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Guest</th>
                                <th>Property</th>
                                <th>Check-In</th>
                                <th>Nights</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(b => {
                                const s = STATUS_STYLES[b.status] || STATUS_STYLES.pending;
                                return (
                                    <tr key={b._id}>
                                        <td><code className="booking-id" style={{ fontSize: '0.7rem' }}>{b._id}</code></td>
                                        <td className="booking-guest">
                                            <div className="guest-avatar">{b.user?.username ? b.user.username[0].toUpperCase() : '?'}</div>
                                            <span>{b.user?.username || 'Unknown'}</span>
                                        </td>
                                        <td className="table-muted" style={{ maxWidth: '180px' }}>
                                            <span className="truncate-text">{b.listing?.title || 'Unknown'}</span>
                                        </td>
                                        <td className="table-muted">{new Date(b.checkIn).toLocaleDateString()}</td>
                                        <td className="table-center">{b.nights}n</td>
                                        <td><strong>{formatPrice(b.amount)}</strong></td>
                                        <td>
                                            <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                                                {s.label}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="tbl-btn tbl-btn-view" onClick={() => setSelected(b)} id={`view-booking-${b._id}`}>
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={8} className="table-empty">No bookings found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail modal */}
            {selected && (
                <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Booking Detail — <code>{selected._id}</code></h3>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="modal-row"><span>Guest</span><strong>{selected.user?.username}</strong></div>
                            <div className="modal-row"><span>Property</span><strong>{selected.listing?.title}</strong></div>
                            <div className="modal-row"><span>Check-In</span><strong>{new Date(selected.checkIn).toLocaleDateString()}</strong></div>
                            <div className="modal-row"><span>Nights</span><strong>{selected.nights}</strong></div>
                            <div className="modal-row"><span>Amount</span><strong>{formatPrice(selected.amount)}</strong></div>
                            <div className="modal-row"><span>Status</span>
                                <span className="status-badge" style={{ background: STATUS_STYLES[selected.status].bg, color: STATUS_STYLES[selected.status].color, border: `1px solid ${STATUS_STYLES[selected.status].border}` }}>
                                    {STATUS_STYLES[selected.status].label}
                                </span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            {selected.status !== 'confirmed' && (
                                <button className="modal-btn modal-btn-confirm" onClick={() => updateStatus(selected._id, 'confirmed')}>
                                    ✓ Approve Booking
                                </button>
                            )}
                            {selected.status !== 'cancelled' && (
                                <button className="modal-btn modal-btn-cancel" onClick={() => updateStatus(selected._id, 'cancelled')}>
                                    ✕ Cancel Booking
                                </button>
                            )}
                            <button className="modal-btn modal-btn-close" onClick={() => setSelected(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
