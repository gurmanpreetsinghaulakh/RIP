import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import '../styles/showListing.css';

export default function BookingConfirmation() {
    const location = useLocation();
    const navigate = useNavigate();
    const { formatPrice } = usePreferences();
    const { listingTitle, totalCost, nights } = location.state || {};

    useEffect(() => {
        if (!listingTitle) {
            navigate('/dashboard');
        }
    }, [listingTitle, navigate]);

    if (!listingTitle) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ maxWidth: '500px', width: '100%', background: '#18181f', borderRadius: '2rem', padding: '3.5rem 2rem', border: '1px solid rgba(16,185,129,0.1)', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
                <div style={{ width: '80px', height: '80px', background: 'rgba(16,185,129,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                    <span style={{ fontSize: '3rem', color: '#10b981' }}>✅</span>
                </div>

                <h1 style={{ color: '#f5f5f7', fontSize: '2rem', fontWeight: '900', marginBottom: '1rem' }}>Booking Successful!</h1>
                <p style={{ color: '#7c7c8a', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                    Congratulations! Your stay at <strong>{listingTitle}</strong> for <strong>{nights} night{nights > 1 ? 's' : ''}</strong> has been confirmed.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#7c7c8a' }}>Order Status:</span>
                        <span style={{ color: '#f59e0b', fontWeight: '800' }}>PAID - PENDING APPROVAL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: '#7c7c8a' }}>Transaction ID:</span>
                        <span style={{ color: '#f5f5f7' }}>#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#7c7c8a' }}>Total Paid:</span>
                        <span style={{ color: '#f5f5f7', fontWeight: '800' }}>{formatPrice(totalCost)}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Link to="/user/bookings" className="book-btn-primary" style={{ textDecoration: 'none', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        Go to My Bookings
                    </Link>
                    <Link to="/listings" style={{ color: '#7c7c8a', fontSize: '0.9rem', textDecoration: 'none', padding: '0.8rem' }}>
                        Browse more properties
                    </Link>
                </div>
            </div>
        </div>
    );
}
