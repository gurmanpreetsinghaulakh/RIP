import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLayout from '../components/UserLayout';

export default function UserReviews() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState('');

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.isAdmin) { navigate('/admin-dashboard'); return; }

        const loadReviews = async () => {
            try {
                const res = await fetch('/api/user/reviews');
                const data = await res.json();
                if (data.success) {
                    setReviews(data.reviews || []);
                } else {
                    console.error(data.error);
                    setReviews([]);
                }
            } catch (err) {
                console.error('Review load failed:', err);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        loadReviews();
    }, [user, navigate]);

    const startEdit = (review) => {
        setEditingId(review._id);
        setEditRating(review.rating || 5);
        setEditComment(review.comment || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditRating(5);
        setEditComment('');
    };

    const saveReview = async (review) => {
        try {
            const res = await fetch(`/api/listings/${review.listing._id}/reviews/${review._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ review: { rating: editRating, comment: editComment } })
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Unable to update review');
            }
            setReviews(prev => prev.map(r => r._id === review._id ? { ...r, rating: editRating, comment: editComment } : r));
            cancelEdit();
        } catch (err) {
            console.error('Review update failed:', err);
        }
    };

    const deleteReview = async (review) => {
        try {
            const res = await fetch(`/api/listings/${review.listing._id}/reviews/${review._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Unable to delete review');
            }
            setReviews(prev => prev.filter(r => r._id !== review._id));
        } catch (err) {
            console.error('Review delete failed:', err);
        }
    };

    if (!user) return null;

    return (
        <UserLayout title="My Reviews" subtitle={`${reviews.length} total reviews given`}>
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Loading your reviews…</p>
                </div>
            ) : (
                <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review._id} className="admin-stat-card" style={{
                            '--card-accent': '#ffc107',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            gap: '1.2rem',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                                <div style={{ minWidth: '220px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.4rem' }}>{review.listing?.title || 'Property Review'}</h3>
                                    <div style={{ color: 'var(--db-muted)', fontSize: '0.9rem' }}>
                                        {review.listing?.location || 'Location unavailable'}{review.listing?.country ? `, ${review.listing.country}` : ''}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1rem', fontWeight: '700' }}>{'⭐'.repeat(review.rating || 0)}{'☆'.repeat(5 - (review.rating || 0))}</div>
                            </div>

                            {editingId === review._id ? (
                                <div style={{ marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Rating</label>
                                        <select value={editRating} onChange={(e) => setEditRating(Number(e.target.value))} style={{ minWidth: '88px', padding: '0.5rem' }}>
                                            {[5, 4, 3, 2, 1].map(value => (
                                                <option key={value} value={value}>{value} star{value > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea
                                        value={editComment}
                                        onChange={(e) => setEditComment(e.target.value)}
                                        rows={4}
                                        style={{ width: '100%', padding: '0.85rem', marginTop: '1rem', borderRadius: '0.75rem', border: '1px solid #d1d5db' }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                                        <button className="tbl-btn tbl-btn-edit" style={{ fontSize: '0.75rem' }} onClick={() => saveReview(review)}>Save</button>
                                        <button className="tbl-btn tbl-btn-delete" style={{ fontSize: '0.75rem' }} onClick={cancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <p style={{
                                        fontSize: '0.9rem', color: 'var(--db-text)', fontStyle: 'italic',
                                        lineHeight: '1.6', background: 'rgba(255,255,255,0.03)',
                                        padding: '1rem', borderRadius: '0.6rem', border: '1px solid rgba(255,255,255,0.05)'
                                    }}>
                                        "{review.comment}"
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        {(user.isAdmin || String(review.author?._id || review.author) === String(user._id)) && (
                                            <button className="tbl-btn tbl-btn-delete" style={{ fontSize: '0.75rem' }} onClick={() => deleteReview(review)}>Delete Review</button>
                                        )}
                                        {String(review.author?._id || review.author) === String(user._id) && (
                                            <button className="tbl-btn tbl-btn-edit" style={{ fontSize: '0.75rem' }} onClick={() => startEdit(review)}>Edit Review</button>
                                        )}
                                        <Link to={`/listings/${review.listing?._id || ''}`} className="tbl-btn tbl-btn-view" style={{ fontSize: '0.75rem', textDecoration: 'none' }}>View Property</Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )) : (
                        <div className="table-empty" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
                            <h2>No reviews written yet</h2>
                            <p style={{ color: 'var(--db-muted)', marginTop: '0.5rem' }}>Your feedback helps the community find the best stays!</p>
                            <Link to="/user/bookings" className="admin-add-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
                                Review Your Stays
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </UserLayout>
    );
}
