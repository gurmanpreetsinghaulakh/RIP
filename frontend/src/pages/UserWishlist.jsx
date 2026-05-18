import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import UserLayout from '../components/UserLayout';

export default function UserWishlist() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { formatPrice } = usePreferences();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.isAdmin) { navigate('/admin-dashboard'); return; }

        const savedIds = localStorage.getItem(`homigo_wishlist_${user.email}`);
        let ids = [];
        if (savedIds) {
            try {
                ids = JSON.parse(savedIds);
            } catch (e) {
                console.error(e);
            }
        }

        fetch('/api/listings')
            .then(r => r.json())
            .then(data => {
                const list = data.listings || (Array.isArray(data) ? data : []);
                const filtered = list.filter(item => ids.includes(item._id));
                setWishlist(filtered);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user, navigate]);

    const removeFromWishlist = (id) => {
        setWishlist(prev => prev.filter(l => l._id !== id));
        const savedIds = localStorage.getItem(`homigo_wishlist_${user.email}`);
        if (savedIds) {
            try {
                const ids = JSON.parse(savedIds);
                const updated = ids.filter(item => item !== id);
                localStorage.setItem(`homigo_wishlist_${user.email}`, JSON.stringify(updated));
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (!user) return null;

    return (
        <UserLayout title="My Wishlist" subtitle={`${wishlist.length} properties saved`}>
            {loading ? (
                <div className="admin-loading">
                    <div className="admin-spinner" />
                    <p>Loading your saved stays…</p>
                </div>
            ) : (
                <div className="wishlist-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginTop: '1.5rem'
                }}>
                    {wishlist.map(l => (
                        <div key={l._id} className="admin-stat-card" style={{
                            '--card-accent': '#ff385c',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            padding: '0',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'relative' }}>
                                <img
                                    src={l.image?.url || 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&auto=format&fit=crop'}
                                    alt={l.title}
                                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                />
                                <button
                                    onClick={() => removeFromWishlist(l._id)}
                                    style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: 'rgba(0,0,0,0.5)', border: 'none',
                                        borderRadius: '50%', color: '#fff', width: '32px', height: '32px',
                                        cursor: 'pointer', fontSize: '1rem'
                                    }}
                                >
                                    ❤️
                                </button>
                            </div>
                            <div style={{ padding: '1.2rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.4rem' }}>{l.title}</h3>
                                <p style={{ fontSize: '0.82rem', color: 'var(--db-muted)', marginBottom: '0.8rem' }}>{l.location}, {l.country}</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <strong>{formatPrice(l.price)}<span style={{ fontWeight: 'normal', fontSize: '0.8rem' }}> /night</span></strong>
                                    <Link to={`/listings/${l._id}`} className="tbl-btn tbl-btn-view" style={{ fontSize: '0.75rem' }}>View Details</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {wishlist.length === 0 && (
                        <div className="table-empty" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
                            <h2>Your wishlist is empty</h2>
                            <p style={{ color: 'var(--db-muted)', marginTop: '0.5rem' }}>Start exploring and save your favorite stays!</p>
                            <Link to="/listings" className="admin-add-btn" style={{ display: 'inline-block', marginTop: '1.5rem' }}>
                                Browse All Listings
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </UserLayout>
    );
}
