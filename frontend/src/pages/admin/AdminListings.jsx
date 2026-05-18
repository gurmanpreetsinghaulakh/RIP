import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGlobalModal } from '../../context/ModalContext';
import { usePreferences } from '../../context/PreferencesContext';
import AdminLayout from '../../components/AdminLayout';

export default function AdminListings() {
    const { user } = useAuth();
    const { showModal, setModalLoading, closeModal } = useGlobalModal();
    const navigate = useNavigate();
    const { formatPrice } = usePreferences();
    const [listings, setListings] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [page, setPage] = useState(1);
    const PER_PAGE = 10;

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (!user.isAdmin) { navigate('/dashboard'); return; }
        fetchListings();
    }, [user, navigate]);

    const fetchListings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/listings');
            const data = await res.json();
            const list = data.listings || (Array.isArray(data) ? data : []);
            setListings(list);
        } catch { showToast('Failed to load listings', 'error'); }
        finally { setLoading(false); }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Filter + sort
    useEffect(() => {
        let result = [...listings];
        if (search) result = result.filter(l =>
            l.title?.toLowerCase().includes(search.toLowerCase()) ||
            l.location?.toLowerCase().includes(search.toLowerCase()) ||
            l.country?.toLowerCase().includes(search.toLowerCase())
        );
        if (categoryFilter !== 'all') result = result.filter(l => (l.category || 'Stay') === categoryFilter);
        if (sortBy === 'price-asc') result.sort((a, b) => (a.price || 0) - (b.price || 0));
        else if (sortBy === 'price-desc') result.sort((a, b) => (b.price || 0) - (a.price || 0));
        else if (sortBy === 'alpha') result.sort((a, b) => a.title?.localeCompare(b.title));
        setFiltered(result);
        setPage(1);
    }, [listings, search, categoryFilter, sortBy]);

    const categories = ['all', ...new Set(listings.map(l => l.category || 'Stay'))];

    const handleDelete = (id, title) => {
        showModal({
            title: 'Confirm Deletion',
            message: `Are you sure you want to permanently delete "${title}"? This action cannot be undone.`,
            type: 'delete',
            confirmText: 'Delete Property',
            cancelText: 'Keep it',
            onConfirm: async () => {
                setModalLoading(true);
                try {
                    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success || res.ok) {
                        setListings(prev => prev.filter(l => l._id !== id));
                        showToast(`"${title}" deleted successfully`);
                        closeModal();
                    } else {
                        showToast(data.error || 'Delete failed', 'error');
                    }
                } catch {
                    showToast('Network error during delete', 'error');
                } finally {
                    setModalLoading(false);
                }
            },
            onCancel: () => console.log('Delete cancelled')
        });
    };

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
    const totalPages = Math.ceil(filtered.length / PER_PAGE);

    const actions = (
        <Link to="/admin/listings/new" className="admin-add-btn" id="admin-new-listing-btn">
            + New Listing
        </Link>
    );

    if (!user) return null;

    return (
        <AdminLayout title="Listings" subtitle={`${filtered.length} of ${listings.length} listings`} actions={actions}>
            {/* Toast */}
            {toast && (
                <div className={`admin-toast ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
                    {toast.type === 'error' ? '⚠' : '✓'} {toast.msg}
                </div>
            )}

            {/* Filters */}
            <div className="admin-filter-bar">
                <div className="admin-search-wrap">
                    <span className="search-icon-prefix">🔍</span>
                    <input
                        id="listings-search-input"
                        className="admin-search-input"
                        type="text"
                        placeholder="Search by title, location, country…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
                    )}
                </div>
                <div className="admin-filter-group">
                    <select
                        id="category-filter"
                        className="admin-select"
                        value={categoryFilter}
                        onChange={e => setCategoryFilter(e.target.value)}
                    >
                        {categories.map(c => (
                            <option key={c} value={c}>{c === 'all' ? '📁 All Categories' : c}</option>
                        ))}
                    </select>
                    <select
                        id="sort-select"
                        className="admin-select"
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                    >
                        <option value="newest">↕ Default</option>
                        <option value="alpha">A → Z</option>
                        <option value="price-asc">Price ↑</option>
                        <option value="price-desc">Price ↓</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="admin-table-wrap">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-spinner" />
                        <p>Loading listings…</p>
                    </div>
                ) : (
                    <table className="admin-table" id="admin-listings-full-table">
                        <thead>
                            <tr>
                                <th style={{ width: '35%' }}>Property</th>
                                <th>Location</th>
                                <th>Price/Night</th>
                                <th>Category</th>
                                <th style={{ width: '160px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map(l => (
                                <tr key={l._id}>
                                    <td>
                                        <div className="table-listing-cell">
                                            <img
                                                src={l.Image?.url || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=80&auto=format&fit=crop'}
                                                alt={l.title}
                                                className="table-listing-img"
                                            />
                                            <div>
                                                <span className="table-listing-title">{l.title}</span>
                                                <span className="table-listing-id">ID: {l._id?.slice(-6)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-muted">{l.location}, {l.country}</td>
                                    <td><strong className="price-text">{formatPrice(l.price)}</strong></td>
                                    <td><span className="table-category-badge">{l.category || 'Stay'}</span></td>
                                    <td>
                                        <div className="table-actions">
                                            <Link to={`/listings/${l._id}`} className="tbl-btn tbl-btn-view">View</Link>
                                            <Link to={`/admin/listings/${l._id}/edit`} className="tbl-btn tbl-btn-edit">Edit</Link>
                                            <button
                                                className="tbl-btn tbl-btn-delete"
                                                onClick={() => handleDelete(l._id, l.title)}
                                                disabled={deletingId === l._id}
                                                id={`delete-listing-${l._id}`}
                                            >
                                                {deletingId === l._id ? '…' : 'Del'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginated.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="table-empty">
                                        {search ? `No listings match "${search}"` : 'No listings yet.'}
                                        {!search && <> <Link to="/admin/listings/new">Create one →</Link></>}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="admin-pagination">
                    <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                    <div className="page-numbers">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                className={`page-num ${p === page ? 'active' : ''}`}
                                onClick={() => setPage(p)}
                            >{p}</button>
                        ))}
                    </div>
                    <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
            )}

            {/* Summary bar */}
            <div className="admin-summary-bar">
                <span>Showing {Math.min(paginated.length, PER_PAGE)} of {filtered.length} results</span>
                <span className="summary-dot" />
                <span>Total value: <strong>{formatPrice(listings.reduce((a, l) => a + (l.price || 0), 0))}</strong></span>
                <span className="summary-dot" />
                <span>Avg price: <strong>{formatPrice(listings.length ? Math.round(listings.reduce((a, l) => a + (l.price || 0), 0) / listings.length) : 0)}</strong></span>
            </div>
        </AdminLayout>
    );
}
