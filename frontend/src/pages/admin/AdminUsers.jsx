import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout';

// No mock data needed anymore

export default function AdminUsers() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selected, setSelected] = useState(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/users', {
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/dashboard'); return; }
        fetchUsers();
    }, [user, navigate]);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
        const matchRole = roleFilter === 'all' || (roleFilter === 'admin' ? u.isAdmin : !u.isAdmin);
        const status = u.isSuspended ? 'suspended' : 'active';
        const matchStatus = statusFilter === 'all' || status === statusFilter;
        return matchSearch && matchRole && matchStatus;
    });

    const toggleStatus = async (id) => {
        try {
            const res = await fetch(`/api/admin/users/${id}/suspend`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });
            const data = await res.json();
            if (data.success) {
                setUsers(prev => prev.map(u => u._id === id ? { ...u, isSuspended: !u.isSuspended } : u));
                if (selected?._id === id) {
                    setSelected(prev => ({ ...prev, isSuspended: !prev.isSuspended }));
                }
            }
        } catch (err) {
            console.error("Error toggling status:", err);
        }
    };

    if (!user) return null;
    if (loading) return (
        <AdminLayout title="Users" subtitle="Loading users...">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                <span className="spinner" />
            </div>
        </AdminLayout>
    );

    return (
        <AdminLayout title="Users" subtitle={`${filtered.length} of ${users.length} users`}>
            {/* Stats */}
            <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                {[
                    { icon: '👥', label: 'Total Users', value: users.length, accent: '#7c3aed' },
                    { icon: '✅', label: 'Active', value: users.filter(u => !u.isSuspended).length, accent: '#10b981' },
                    { icon: '🛡', label: 'Admins', value: users.filter(u => u.isAdmin).length, accent: '#f59e0b' },
                    { icon: '⛔', label: 'Suspended', value: users.filter(u => u.isSuspended).length, accent: '#ff385c' },
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
                    <input className="admin-search-input" placeholder="Search by username or email…" value={search} onChange={e => setSearch(e.target.value)} />
                    {search && <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>}
                </div>
                <div className="admin-filter-group">
                    {[{ v: 'all', l: 'All' }, { v: 'admin', l: '🛡 Admin' }, { v: 'user', l: '👤 Users' }].map(o => (
                        <button key={o.v} className={`filter-pill ${roleFilter === o.v ? 'active' : ''}`} onClick={() => setRoleFilter(o.v)} id={`role-filter-${o.v}`}>{o.l}</button>
                    ))}
                    <div className="filter-divider" />
                    {[{ v: 'all', l: 'All Status' }, { v: 'active', l: 'Active' }, { v: 'suspended', l: 'Suspended' }].map(o => (
                        <button key={o.v} className={`filter-pill ${statusFilter === o.v ? 'active' : ''}`} onClick={() => setStatusFilter(o.v)} id={`status-filter-${o.v}`}>{o.l}</button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-wrap">
                <table className="admin-table" id="admin-users-table">
                    <thead>
                        <tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th><th>Listings</th><th>Bookings</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u._id || u.id}>
                                <td>
                                    <div className="table-listing-cell">
                                        {u.avatarUrl ? (
                                            <img src={u.avatarUrl} alt={u.username} className="user-avatar-sm" style={{ objectFit: 'cover', borderRadius: '50%', width: '32px', height: '32px' }} />
                                        ) : (
                                            <div className="user-avatar-sm">{u.username[0].toUpperCase()}</div>
                                        )}
                                        <strong>{u.username}</strong>
                                    </div>
                                </td>
                                <td className="table-muted">{u.email}</td>
                                <td>
                                    <span className={`role-pill ${u.isAdmin ? 'role-admin' : 'role-user'}`}>
                                        {u.isAdmin ? '🛡 Admin' : '👤 User'}
                                    </span>
                                </td>
                                <td className="table-muted">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-CA') : 'N/A'}
                                </td>
                                <td className="table-center">{u.listingsCount || 0}</td>
                                <td className="table-center">{u.bookingsCount || 0}</td>
                                <td>
                                    <span className={`status-dot-badge ${!u.isSuspended ? 'status-active' : 'status-suspended'}`}>
                                        {!u.isSuspended ? '● Active' : '● Suspended'}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button className="tbl-btn tbl-btn-view" onClick={() => setSelected(u)} id={`view-user-${u._id}`}>Detail</button>
                                        {!u.isAdmin && (
                                            <button
                                                className={`tbl-btn ${!u.isSuspended ? 'tbl-btn-suspend' : 'tbl-btn-activate'}`}
                                                onClick={() => toggleStatus(u._id)}
                                                id={`toggle-user-${u._id}`}
                                            >
                                                {!u.isSuspended ? 'Suspend' : 'Activate'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={8} className="table-empty">No users match your filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* User Detail Modal */}
            {selected && (
                <div className="admin-modal-overlay" onClick={() => setSelected(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} id="user-detail-modal">
                        <div className="modal-header">
                            <h3>User Profile</h3>
                            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="modal-profile-header">
                            {selected.avatarUrl ? (
                                <img src={selected.avatarUrl} alt={selected.username} className="modal-user-avatar" style={{ objectFit: 'cover', borderRadius: '50%', width: '64px', height: '64px' }} />
                            ) : (
                                <div className="modal-user-avatar">{selected.username[0].toUpperCase()}</div>
                            )}
                            <div>
                                <div className="modal-user-name">{selected.username}</div>
                                <span className={`role-pill ${selected.isAdmin ? 'role-admin' : 'role-user'}`}>
                                    {selected.isAdmin ? '🛡 Admin' : '👤 User'}
                                </span>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className="modal-row"><span>Email</span><strong>{selected.email}</strong></div>
                            <div className="modal-row"><span>Joined</span><strong>{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString('en-CA') : 'N/A'}</strong></div>
                            <div className="modal-row"><span>Listings</span><strong>{selected.listingsCount || 0}</strong></div>
                            <div className="modal-row"><span>Bookings</span><strong>{selected.bookingsCount || 0}</strong></div>
                            <div className="modal-row"><span>Status</span>
                                <span className={`status-dot-badge ${!selected.isSuspended ? 'status-active' : 'status-suspended'}`}>
                                    {!selected.isSuspended ? '● Active' : '● Suspended'}
                                </span>
                            </div>
                        </div>
                        <div className="modal-actions">
                            {!selected.isAdmin && (
                                <button
                                    className={`modal-btn ${!selected.isSuspended ? 'modal-btn-cancel' : 'modal-btn-confirm'}`}
                                    onClick={() => toggleStatus(selected._id)}
                                    id="modal-toggle-user"
                                >
                                    {!selected.isSuspended ? '⛔ Suspend User' : '✓ Activate User'}
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
