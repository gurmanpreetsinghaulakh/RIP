import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobalModal } from '../context/ModalContext';
import { usePreferences } from '../context/PreferencesContext';
import '../styles/showListing.css';

export default function ShowListing() {
    const { id } = useParams();
    const { user } = useAuth();
    const { showModal, setModalLoading, closeModal } = useGlobalModal();
    const { formatPrice, adminSettings } = usePreferences();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [nights, setNights] = useState(1);

    const minNights = adminSettings?.minNights || 1;
    const maxNights = adminSettings?.maxNights || 30;
    const isBookingsEnabled = adminSettings?.enableBookings !== false;
    const isReviewsEnabled = adminSettings?.enableReviews !== false;

    useEffect(() => {
        if (adminSettings?.minNights) {
            setNights(adminSettings.minNights);
        }
    }, [adminSettings]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/listings/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setListing(data.listings);
                } else {
                    console.error(data.error);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleDelete = () => {
        showModal({
            title: 'Delete Listing',
            message: `Are you sure you want to permanently delete "${listing.title}"? This cannot be undone.`,
            type: 'delete',
            confirmText: 'Delete Property',
            onConfirm: async () => {
                setModalLoading(true);
                try {
                    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        navigate('/admin/listings');
                        closeModal();
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setModalLoading(false);
                }
            }
        });
    };

    if (loading) return (
        <div className="show-page-container">
            <div className="admin-loading">
                <div className="admin-spinner" />
                <p>Loading property details...</p>
            </div>
        </div>
    );

    if (!listing) return (
        <div className="show-page-container">
            <div className="empty-stays">
                <h2>Listing not found</h2>
                <p>The property you're looking for doesn't exist or has been removed.</p>
                <Link to="/listings" className="clear-search-btn" style={{ textDecoration: 'none' }}>
                    Browse other stays
                </Link>
            </div>
        </div>
    );

    const isOwnerOrAdmin = user && (user.isAdmin || user._id === listing.owner?._id);

    return (
        <div className="show-page-container">
            {/* Header */}
            <header className="show-header">
                <h1 className="show-title">{listing.title}</h1>
                <div className="show-meta">
                    <span className="show-meta-item">📍 {listing.location}, {listing.country}</span>
                    <div className="meta-dot"></div>
                    <span className="show-meta-item">🏠 {listing.category || 'Stay'}</span>
                    <div className="meta-dot"></div>
                    <span className="show-meta-item">👤 Host: {listing.owner?.username || 'Verified Partner'}</span>
                </div>
            </header>

            {/* Dynamic Gallery */}
            <div className={`show-gallery-container ${listing.images?.length > 1 ? 'is-grid' : 'is-single'}`}>
                {listing.images && listing.images.length > 0 ? (
                    listing.images.map((img, idx) => (
                        <div 
                            key={idx} 
                            className={`gallery-item item-${idx}`}
                        >
                            <img src={img.url} alt={`${listing.title} - view ${idx + 1}`} className="gallery-img" />
                        </div>
                    ))
                ) : (
                    <div className="gallery-item item-0">
                        <img 
                            src={listing.Image?.url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&auto=format&fit=crop'} 
                            alt={listing.title} 
                            className="gallery-img" 
                        />
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="show-content-grid">
                <div className="show-description-section">
                    <div className="host-info">
                        <div className="host-avatar">
                            {listing.owner?.username ? listing.owner.username[0].toUpperCase() : 'H'}
                        </div>
                        <div className="host-details">
                            <h3>Hosted by {listing.owner?.username || 'Partner'}</h3>
                            <p className="host-stats">12 bookings &bull; Highly rated for hospitality</p>
                        </div>
                    </div>

                    <div className="description-text">
                        <p style={{ whiteSpace: 'pre-line' }}>{listing.description}</p>
                    </div>

                    {/* Admin Actions */}
                    {isOwnerOrAdmin && (
                        <div className="admin-action-btns">
                            <Link to={`/admin/listings/${listing._id}/edit`} className="tbl-btn tbl-btn-edit" style={{ textDecoration: 'none', padding: '0.8rem 1.5rem' }}>
                                Edit Property
                            </Link>
                            <button onClick={handleDelete} className="tbl-btn tbl-btn-delete" style={{ padding: '0.8rem 1.5rem' }}>
                                Delete Property
                            </button>
                        </div>
                    )}
                </div>

                {/* Booking Sticky Card */}
                <aside className="booking-sticky-card">
                    <div className="booking-prices">
                        <div className="booking-price-value">
                            {formatPrice(listing.price)} <span className="price-unit">/ night</span>
                        </div>
                        {isReviewsEnabled && (
                            <div className="booking-rating">
                                ⭐ 4.9 &bull; <span style={{ textDecoration: 'underline' }}>12 reviews</span>
                            </div>
                        )}
                    </div>

                    {(!user || !user.isAdmin) ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                    <label style={{ fontSize: '0.8rem', color: 'var(--db-muted)' }}>Stay Duration (Nights)</label>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--db-muted)' }}>Min: {minNights}, Max: {maxNights}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', border: '1px solid var(--db-border)', padding: '0.4rem 0.8rem' }}>
                                    <button 
                                        onClick={() => setNights(prev => Math.max(minNights, prev - 1))}
                                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', fontSize: '1.2rem' }}
                                    >-</button>
                                    <input 
                                        type="number" 
                                        value={nights}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || minNights;
                                            setNights(Math.max(minNights, Math.min(maxNights, val)));
                                        }}
                                        style={{ flex: 1, background: 'none', border: 'none', color: 'white', textAlign: 'center', fontSize: '1rem', fontWeight: 'bold', width: '40px' }}
                                    />
                                    <button 
                                        onClick={() => setNights(prev => Math.min(maxNights, prev + 1))}
                                        style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.5rem', fontSize: '1.2rem' }}
                                    >+</button>
                                </div>
                            </div>

                            <div style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '0.8rem', background: listing.availableRooms > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: '0.5rem', border: `1px solid ${listing.availableRooms > 0 ? '#10b981' : '#ef4444'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: listing.availableRooms > 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                                    <span>{listing.availableRooms > 0 ? '✅' : '❌'}</span>
                                    <span>{listing.availableRooms > 0 ? `${listing.availableRooms} Room${listing.availableRooms > 1 ? 's' : ''} Available` : 'Sold Out'}</span>
                                </div>
                            </div>

                            {!isBookingsEnabled && (
                                <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.5rem', border: '1px solid #f59e0b', fontSize: '0.8rem', color: '#f59e0b', lineHeight: 1.4 }}>
                                    ⚠️ Bookings are temporarily disabled by the platform administrator.
                                </div>
                            )}

                            <button 
                                className="book-btn-primary" 
                                disabled={listing.availableRooms <= 0 || !isBookingsEnabled} 
                                style={{ opacity: (listing.availableRooms <= 0 || !isBookingsEnabled) ? 0.5 : 1, cursor: (listing.availableRooms <= 0 || !isBookingsEnabled) ? 'not-allowed' : 'pointer' }} 
                                onClick={() => {
                                    if (!user) {
                                        navigate('/login');
                                    } else {
                                        const totalCost = listing.price * nights + Math.round(listing.price * 0.01);
                                        navigate(`/payment/${id}`, { 
                                            state: { 
                                                listing, 
                                                nights, 
                                                totalCost 
                                            } 
                                        });
                                    }
                                }}
                            >
                                {!isBookingsEnabled ? "Booking Disabled" : (listing.availableRooms > 0 ? "Book Room" : "No Rooms Available")}
                            </button>

                            <div className="booking-footer">
                                <p className="booking-note">You won't be charged yet</p>

                                <div className="booking-calc-row">
                                    <span style={{ textDecoration: 'underline' }}>{formatPrice(listing.price)} x {nights} night{nights > 1 ? 's' : ''}</span>
                                    <span>{formatPrice(listing.price * nights)}</span>
                                </div>
                                <div className="booking-calc-row">
                                    <span style={{ textDecoration: 'underline' }}>Cleaning fee</span>
                                    <span>{formatPrice(Math.round(listing.price * 0.01))}</span>
                                </div>
                                <div className="booking-calc-row total">
                                    <span>Total cost</span>
                                    <span>{formatPrice(listing.price * nights + Math.round(listing.price * 0.01))}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.8rem', border: '1px solid var(--db-border)', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>🛡️</div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.4rem' }}>Admin View</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--db-muted)', marginBottom: '1.2rem' }}>You are viewing this property as an administrator. Booking is disabled for admin accounts.</p>
                            <Link to="/admin-dashboard" className="tbl-btn tbl-btn-view" style={{ display: 'block', textDecoration: 'none' }}>Back to Dashboard</Link>
                        </div>
                    )}
                </aside>
            </div>
        </div>
    );
}
