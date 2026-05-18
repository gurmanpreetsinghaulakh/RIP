import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobalModal } from '../context/ModalContext';
import { usePreferences } from '../context/PreferencesContext';
import UserLayout from '../components/UserLayout';

const STATUS_MAP = {
    confirmed: { label: '✓ Confirmed', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    pending: { label: '⏳ Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    cancelled: { label: '✕ Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

export default function UserBookings() {
    const { user } = useAuth();
    const { showModal, closeModal, setModalLoading } = useGlobalModal();
    const navigate = useNavigate();
    const { formatPrice } = usePreferences();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.isAdmin) { navigate('/admin-dashboard'); return; }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/bookings');
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

    const handleCancel = (id, title) => {
        showModal({
            title: 'Cancel Booking',
            message: `Are you sure you want to cancel your stay at "${title}"?`,
            type: 'delete',
            confirmText: 'Yes, Cancel Stay',
            onConfirm: () => {
                // In a real app, you'd call a DELETE /api/bookings/:id endpoint
                setBookings(prev => prev.map(bk =>
                    bk._id === id ? { ...bk, status: 'cancelled' } : bk
                ));
                closeModal();
            }
        });
    };

    if (!user) return null;

    return (
        <UserLayout title="My Bookings" subtitle={`${bookings.length} reservations found`}>
            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="admin-spinner" style={{ margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--db-muted)' }}>Fetching your reservations...</p>
                </div>
            ) : (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {bookings.map(bh => (
                        <div key={bh._id} className="admin-stat-card" style={{
                            '--card-accent': '#10b981',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: '1.5rem',
                            padding: '1.2rem'
                        }}>
                            <img
                                src={bh.listing?.Image?.url || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&auto=format&fit=crop'}
                                alt={bh.listing?.title}
                                style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '0.6rem' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{bh.listing?.title || 'Unknown Property'}</h3>
                                    <span style={{
                                        fontSize: '0.72rem', fontWeight: '700', padding: '0.25rem 0.65rem',
                                        borderRadius: '2rem', background: STATUS_MAP[bh.status]?.bg || STATUS_MAP.pending.bg,
                                        color: STATUS_MAP[bh.status]?.color || STATUS_MAP.pending.color, border: `1px solid ${STATUS_MAP[bh.status]?.color || STATUS_MAP.pending.color}44`
                                    }}>
                                        {STATUS_MAP[bh.status]?.label || '⏳ Status'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.8rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--db-muted)', marginBottom: '0.2rem' }}>Check-In</p>
                                        <p style={{ fontSize: '0.88rem', fontWeight: '600' }}>{new Date(bh.checkIn).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--db-muted)', marginBottom: '0.2rem' }}>Nights</p>
                                        <p style={{ fontSize: '0.88rem', fontWeight: '600' }}>{bh.nights}</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--db-muted)', marginBottom: '0.2rem' }}>Total Amount</p>
                                        <p style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--show-brand)' }}>{formatPrice(bh.amount)}</p>
                                    </div>
                                </div>
                            </div>
<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setSelected(bh)}
                                    className="tbl-btn tbl-btn-view"
                                    style={{ fontSize: '0.75rem', textAlign: 'center', cursor: 'pointer' }}
                                >
                                    Details
                                </button>
                                {bh.status === 'pending' && (
                                    <button
                                        onClick={() => handleCancel(bh._id, bh.listing?.title)}
                                        className="tbl-btn tbl-btn-delete"
                                        style={{ fontSize: '0.75rem', cursor: 'pointer', border: 'none' }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
{!loading && bookings.length === 0 && (
                <div className="table-empty" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                    <h2>No bookings yet</h2>
                    <p style={{ color: 'var(--db-muted)', marginTop: '0.5rem' }}>Your next adventure is just a click away!</p>
                    <Link to="/listings" className="admin-add-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
                        Find Your Stay
                    </Link>
                </div>
            )}

            {/* Booking Detail Modal */}
            {selected && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setSelected(null)}>
                    <div style={{ background: '#18181f', borderRadius: '1rem', padding: '2rem', maxWidth: '450px', width: '100%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Booking Details</h3>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#7c7c8a', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                        </div>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <img src={selected.listing?.Image?.url || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&auto=format&fit=crop'} alt={selected.listing?.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '0.6rem' }} />
                        </div>

                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Property:</span>
                                <span style={{ fontWeight: '600', textAlign: 'right', maxWidth: '200px' }}>{selected.listing?.title || 'Unknown'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Check-In:</span>
                                <span style={{ fontWeight: '600' }}>{new Date(selected.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Check-Out:</span>
                                <span style={{ fontWeight: '600' }}>{new Date(selected.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Nights:</span>
                                <span style={{ fontWeight: '600' }}>{selected.nights}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Rooms:</span>
                                <span style={{ fontWeight: '600' }}>{selected.rooms || 1}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Total Amount:</span>
                                <span style={{ fontWeight: '700', color: '#ff385c' }}>₹{selected.amount?.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Status:</span>
                                <span style={{ fontWeight: '600', color: STATUS_MAP[selected.status]?.color || '#f59e0b' }}>{STATUS_MAP[selected.status]?.label || selected.status}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#7c7c8a' }}>Booking ID:</span>
                                <span style={{ fontSize: '0.75rem', color: '#7c7c8a' }}>{selected._id}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
                            <Link to={`/listings/${selected.listing?._id}`} className="tbl-btn tbl-btn-view" style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}>
                                View Property
                            </Link>
                            <button onClick={() => setSelected(null)} className="tbl-btn tbl-btn-edit" style={{ flex: 1 }}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </UserLayout>
    );
}
