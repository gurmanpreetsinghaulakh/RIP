import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobalModal } from '../context/ModalContext';
import { usePreferences } from '../context/PreferencesContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { differenceInDays, addDays, format, isWithinInterval, startOfDay } from 'date-fns';
import '../styles/showListing.css';

export default function ShowListing() {
    const { id } = useParams();
    const { user } = useAuth();
    const { showModal, setModalLoading, closeModal } = useGlobalModal();
    const { formatPrice, adminSettings } = usePreferences();
    const navigate = useNavigate();
const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [checkIn, setCheckIn] = useState(addDays(new Date(), 1));
    const [checkOut, setCheckOut] = useState(addDays(new Date(), 2));
    const [dateAvailability, setDateAvailability] = useState({});
    const [totalRooms, setTotalRooms] = useState(1);
    const [nights, setNights] = useState(1);
    const [rooms, setRooms] = useState(1);
    const [currentAvailable, setCurrentAvailable] = useState(1);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    // Helper: get fully booked dates from dateAvailability
    const getFullyBookedDates = () => {
        const dates = [];
        for (const [dateStr, data] of Object.entries(dateAvailability)) {
            if (data.isFullyBooked) {
                const [year, month, day] = dateStr.split('-').map(Number);
                dates.push(new Date(year, month - 1, day));
            }
        }
        return dates;
    };

    // Helper: check if selected dates have availability
    const checkDateAvailability = () => {
        let minAvail = totalRooms;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        while (start < end) {
            const dateStr = format(start, 'yyyy-MM-dd');
            if (!dateAvailability[dateStr]) {
                minAvail = 0;
                break;
            }
            minAvail = Math.min(minAvail, dateAvailability[dateStr].availableRooms);
            start.setDate(start.getDate() + 1);
        }
        setCurrentAvailable(minAvail);
    };

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
        if (checkIn && checkOut && Object.keys(dateAvailability).length > 0) {
            checkDateAvailability();
        }
    }, [checkIn, checkOut, dateAvailability, totalRooms]);

    useEffect(() => {
        if (currentAvailable > 0 && rooms > currentAvailable) {
            setRooms(currentAvailable);
        }
        if (currentAvailable === 0 && rooms !== 1) {
            setRooms(1);
        }
    }, [currentAvailable, rooms]);

    // Real-time refetch availability for selected dates
    useEffect(() => {
        if (checkIn && checkOut) {
            const fetchAvailability = async () => {
                setAvailabilityLoading(true);
                try {
                    const res = await fetch(`/api/listings/${id}/availability?checkIn=${format(checkIn, 'yyyy-MM-dd')}&checkOut=${format(checkOut, 'yyyy-MM-dd')}`);
                    const data = await res.json();
                    if (data.success) {
                        setDateAvailability(data.dateAvailability || {});
                        setTotalRooms(data.totalRooms || 1);
                    }
                } catch (err) {
                    console.error('Availability fetch error:', err);
                } finally {
                    setAvailabilityLoading(false);
                }
            };
            fetchAvailability();
        }
    }, [checkIn, checkOut, id]);

    // Update nights when dates change
    useEffect(() => {
        if (checkIn && checkOut) {
            setNights(differenceInDays(checkOut, checkIn) || 1);
        }
    }, [checkIn, checkOut]);

useEffect(() => {
        setLoading(true);
        
        Promise.all([
            fetch(`/api/listings/${id}`).then(res => res.json()),
            fetch(`/api/listings/${id}/availability?checkIn=${format(new Date(), 'yyyy-MM-dd')}&checkOut=${format(addDays(new Date(), 90), 'yyyy-MM-dd')}`).then(res => res.json())
        ])
            .then(([listingData, availData]) => {
                if (listingData.success) {
                    setListing(listingData.listings);
                } else {
                    console.error(listingData.error);
                }
                
                if (availData.success) {
                    setDateAvailability(availData.dateAvailability || {});
                    setTotalRooms(availData.totalRooms || 1);
                } else {
                    console.error(availData.error);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const handleReviewSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }
        setSubmittingReview(true);
        setReviewError('');

        try {
            const res = await fetch(`/api/listings/${id}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review: reviewForm })
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Could not submit review');
            }
            setListing(prev => ({
                ...prev,
                reviews: [...(prev.reviews || []), { ...data.review, author: user }]
            }));
            setReviewForm({ rating: 5, comment: '' });
        } catch (err) {
            setReviewError(err.message || 'Could not submit review');
            console.error(err);
        } finally {
            setSubmittingReview(false);
        }
    };

    const userHasReviewed = !!listing?.reviews?.find(rev => rev.author?._id === user?._id || rev.author === user?._id);

    const handleReviewInput = (field, value) => {
        setReviewForm(prev => ({ ...prev, [field]: value }));
    };

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

    const isOwnerOrAdmin = user && (user.isAdmin || listing.owner?._id?.toString() === user._id?.toString());

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

                    {isReviewsEnabled && (
                        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Guest Reviews</h3>
                                    <p style={{ margin: '0.4rem 0 0', color: 'var(--db-muted)' }}>{listing.reviews?.length || 0} review{listing.reviews?.length === 1 ? '' : 's'}</p>
                                </div>
                                {user && !user.isAdmin && !userHasReviewed && (
                                    <span style={{ color: '#10b981', fontWeight: 700 }}>Write a review for this home</span>
                                )}
                            </div>

                            <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.25rem' }}>
                                {listing.reviews?.map((review) => (
                                    <div key={review._id} style={{ padding: '1.2rem', borderRadius: '0.9rem', background: 'rgba(255,255,255,0.03)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                            <div>
                                                <strong>{review.author?.username || 'Guest'}</strong>
                                                <div style={{ marginTop: '0.35rem', color: 'var(--db-muted)', fontSize: '0.95rem' }}>
                                                    {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{'⭐'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</div>
                                        </div>
                                        <p style={{ marginTop: '1rem', lineHeight: 1.7, color: 'var(--db-text)' }}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>

                            {user && !user.isAdmin && (
                                <form onSubmit={handleReviewSubmit} style={{ marginTop: '1.75rem' }}>
                                    <h4 style={{ marginBottom: '0.75rem' }}>{userHasReviewed ? 'You already left a review for this property.' : 'Leave your review'}</h4>
                                    <div style={{ display: 'grid', gap: '0.85rem' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Rating</label>
                                        <select
                                            value={reviewForm.rating}
                                            onChange={(e) => handleReviewInput('rating', Number(e.target.value))}
                                            disabled={userHasReviewed}
                                            style={{ width: '100px', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid #d1d5db' }}
                                        >
                                            {[5, 4, 3, 2, 1].map((value) => (
                                                <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                        <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Comment</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => handleReviewInput('comment', e.target.value)}
                                            rows={4}
                                            disabled={userHasReviewed}
                                            style={{ width: '100%', padding: '1rem', borderRadius: '0.9rem', border: '1px solid #d1d5db' }}
                                        />
                                        {reviewError && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{reviewError}</div>}
                                        <button
                                            type="submit"
                                            className="tbl-btn tbl-btn-edit"
                                            disabled={userHasReviewed || submittingReview}
                                            style={{ width: 'fit-content', fontSize: '0.95rem' }}
                                        >
                                            {submittingReview ? 'Submitting…' : userHasReviewed ? 'Review already submitted' : 'Submit Review'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

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
                                <label style={{ fontSize: '0.8rem', color: 'var(--db-muted)', display: 'block', marginBottom: '0.4rem' }}>Select Dates</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#aaa' }}>Check-in</label>
                                        <DatePicker
                                            selected={checkIn}
                                            onChange={(date) => {
                                                setCheckIn(date);
                                                if (date >= checkOut) setCheckOut(addDays(date, 1));
                                            }}
                                            selectsStart
                                            startDate={checkIn}
                                            endDate={checkOut}
                                            minDate={addDays(new Date(), 1)}
                                            maxDate={addDays(new Date(), 90)}
                                            excludeDates={getFullyBookedDates()}
                                            className="date-picker-input"
                                            dateFormat="MMM dd, yyyy"
                                            placeholderText="Check-in"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: '#aaa' }}>Check-out</label>
                                        <DatePicker
                                            selected={checkOut}
                                            onChange={(date) => setCheckOut(date)}
                                            selectsEnd
                                            startDate={checkIn}
                                            endDate={checkOut}
                                            minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 2)}
                                            maxDate={addDays(new Date(), 90)}
                                            excludeDates={getFullyBookedDates()}
                                            className="date-picker-input"
                                            dateFormat="MMM dd, yyyy"
                                            placeholderText="Check-out"
                                        />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#ff385c', marginTop: '0.4rem' }}>
                                    {differenceInDays(checkOut, checkIn)} nights selected
                                </p>
                            </div>

                            <div className={`availability-summary ${currentAvailable > 0 ? 'available' : 'sold-out'}`}>
                                <div className={`availability-status ${currentAvailable > 0 ? 'available' : 'sold-out'}`}>
                                    <span className="availability-icon">{currentAvailable > 0 ? '✅' : '❌'}</span>
                                    <span>{currentAvailable > 0 ? `${currentAvailable} Room${currentAvailable > 1 ? 's' : ''} Available` : 'Sold Out'}</span>
                                </div>

                                {totalRooms > 1 && (
                                    <div className="rooms-counter">
                                        <div className="rooms-counter-header">
                                            <span className="rooms-counter-title">Selected rooms</span>
                                            <span className="rooms-counter-subtitle">Match this stay with your group size</span>
                                        </div>
                                        <div className="availability-progress">
                                            <div className="progress-fill" style={{ '--progress': `${Math.max(0, 100 - (currentAvailable / totalRooms) * 100)}%` }}></div>
                                        </div>
                                        <div className="rooms-controls">
                                            <button 
                                                className="room-btn room-btn-minus" 
                                                onClick={() => setRooms(Math.max(1, rooms - 1))}
                                                disabled={rooms <= 1 || availabilityLoading}
                                            >−</button>
                                            <div className="rooms-display">{rooms}</div>
                                            <button 
                                                className="room-btn room-btn-plus" 
                                                onClick={() => setRooms(Math.min(rooms + 1, currentAvailable))}
                                                disabled={rooms >= currentAvailable || availabilityLoading}
                                            >+</button>
                                        </div>
                                        <small className="rooms-counter-note">
                                            Max: {currentAvailable} / Total: {totalRooms}
                                        </small>
                                    </div>
                                )}
                                {availabilityLoading && <div className="availability-loading">🔄 Checking real-time availability...</div>}
                            </div>

                            {!isBookingsEnabled && (
                                <div style={{ marginBottom: '1rem', padding: '0.8rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.5rem', border: '1px solid #f59e0b', fontSize: '0.8rem', color: '#f59e0b', lineHeight: 1.4 }}>
                                    ⚠️ Bookings are temporarily disabled by the platform administrator.
                                </div>
                            )}

                            {(() => {
                                const totalCost = listing.price * nights * rooms + Math.round(listing.price * 0.01 * rooms);
                                return (
                                    <>
                                        <button 
                                            className="book-btn-primary" 
                                            disabled={currentAvailable <= 0 || availabilityLoading || !isBookingsEnabled} 
                                            style={{ opacity: (currentAvailable <= 0 || availabilityLoading || !isBookingsEnabled) ? 0.5 : 1, cursor: (currentAvailable <= 0 || availabilityLoading || !isBookingsEnabled) ? 'not-allowed' : 'pointer' }} 
                                            onClick={() => {
                                                if (!user) {
                                                    navigate('/login');
                                                } else {
                                                    navigate(`/payment/${id}`, { 
                                                        state: { 
                                                            listing, 
                                                            nights,
                                                            checkIn: format(checkIn, 'yyyy-MM-dd'),
                                                            checkOut: format(checkOut, 'yyyy-MM-dd'),
                                                            totalCost,
                                                            rooms
                                                        } 
                                                    });
                                                }
                                            }}
                                        >
                                            {!isBookingsEnabled ? "Booking Disabled" : (availabilityLoading ? '🔄 Checking...' : currentAvailable > 0 ? `Book ${rooms > 1 ? `${rooms} Rooms` : 'Room'} (${nights} nights)` : "No Rooms Available")}
                                        </button>

                                        <div className="booking-footer">
                                            <p className="booking-note">You won't be charged yet</p>

                                            <div className="booking-calc-row">
                                                <span style={{ textDecoration: 'underline' }}>{formatPrice(listing.price)} x {nights} night{nights > 1 ? 's' : ''} x {rooms} room{rooms > 1 ? 's' : ''}</span>
                                                <span>{formatPrice(listing.price * nights * rooms)}</span>
                                            </div>
                                            <div className="booking-calc-row">
                                                <span style={{ textDecoration: 'underline' }}>Cleaning fee</span>
                                                <span>{formatPrice(Math.round(listing.price * 0.01 * rooms))}</span>
                                            </div>
                                            <div className="booking-calc-row total">
                                                <span>Total cost</span>
                                                <span>{formatPrice(totalCost)}</span>
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}
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
