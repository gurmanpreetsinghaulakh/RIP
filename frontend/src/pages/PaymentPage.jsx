import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useGlobalModal } from '../context/ModalContext';
import { usePreferences } from '../context/PreferencesContext';
import '../styles/showListing.css';

export default function PaymentPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { showModal, setModalLoading, closeModal } = useGlobalModal();
    const { formatPrice } = usePreferences();
    
    // Extract info from state or fallback
    const { listing, nights, totalCost } = location.state || {};
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!listing) {
            // If refreshed or accessed directly, go back
            navigate(`/listings/${id}`);
        }
    }, [listing, id, navigate]);

    const handlePay = async (e) => {
        e.preventDefault();

        // Validate Expiry Date
        const expiryRegex = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/;
        if (!expiryRegex.test(cardData.expiry)) {
            showModal({ title: 'Invalid Card', message: 'Please enter a valid expiry date in MM/YY format.', type: 'error', confirmText: 'Okay' });
            return;
        }

        const [month, year] = cardData.expiry.split('/').map(v => parseInt(v));
        const fullYear = 2000 + year;
        const expiryDate = new Date(fullYear, month, 0); // Last day of the month
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (expiryDate < today) {
            showModal({ 
                title: 'Card Expired', 
                message: 'Your credit card has expired. Please use a different card.', 
                type: 'error', 
                confirmText: 'Okay' 
            });
            return;
        }

        setProcessing(true);
        
        // Mock payment processing time
        setTimeout(async () => {
            try {
                // Execute the actual booking on the backend
                const res = await fetch(`/api/listings/${id}/book`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        nights: nights,
                        amount: totalCost
                    })
                });
                const data = await res.json();
                
                if (data.success) {
                    navigate('/confirmation', { state: { listingTitle: listing.title, totalCost, nights } });
                } else {
                    showModal({
                        title: 'Payment Failed',
                        message: data.error || 'The payment could not be processed.',
                        type: 'error',
                        confirmText: 'Try Again'
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setProcessing(false);
            }
        }, 2000);
    };

    if (!listing) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#0f0f14', color: 'white', padding: '2rem' }}>
            <div style={{ maxWidth: '500px', margin: '0 auto', background: '#18181f', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>Secure Payment</h1>
                    <p style={{ color: '#7c7c8a', fontSize: '0.9rem' }}>Complete your booking for <strong>{listing.title}</strong></p>
                </header>

                <div style={{ background: 'rgba(255,56,92,0.1)', padding: '1rem', borderRadius: '0.8rem', marginBottom: '2rem', border: '1px solid rgba(255,56,92,0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Amount to Pay:</span>
                        <span style={{ fontWeight: '800', color: '#ff385c' }}>{formatPrice(totalCost)}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7c7c8a' }}>
                        Stay Duration: {nights} night{nights > 1 ? 's' : ''}
                    </div>
                </div>

                <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#7c7c8a', marginBottom: '0.4rem' }}>Cardholder Name</label>
                        <input 
                            required 
                            type="text" 
                            placeholder="Full Name" 
                            style={{ width: '100%', padding: '0.9rem', borderRadius: '0.6rem', background: '#0f0f14', border: '1px solid #2a2a35', color: 'white' }}
                            value={cardData.name}
                            onChange={e => setCardData({...cardData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#7c7c8a', marginBottom: '0.4rem' }}>Card Number</label>
                        <input 
                            required 
                            type="text" 
                            placeholder="0000 0000 0000 0000" 
                            style={{ width: '100%', padding: '0.9rem', borderRadius: '0.6rem', background: '#0f0f14', border: '1px solid #2a2a35', color: 'white' }}
                            value={cardData.number}
                            onChange={e => setCardData({...cardData, number: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#7c7c8a', marginBottom: '0.4rem' }}>Expiry Date</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="MM/YY" 
                                style={{ width: '100%', padding: '0.9rem', borderRadius: '0.6rem', background: '#0f0f14', border: '1px solid #2a2a35', color: 'white' }}
                                value={cardData.expiry}
                                onChange={e => setCardData({...cardData, expiry: e.target.value})}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#7c7c8a', marginBottom: '0.4rem' }}>CVC</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="123" 
                                style={{ width: '100%', padding: '0.9rem', borderRadius: '0.6rem', background: '#0f0f14', border: '1px solid #2a2a35', color: 'white' }}
                                value={cardData.cvc}
                                onChange={e => setCardData({...cardData, cvc: e.target.value})}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={processing}
                        className="book-btn-primary" 
                        style={{ marginTop: '1rem', background: processing ? '#333' : 'linear-gradient(135deg, #ff385c, #e61e4d)', cursor: processing ? 'not-allowed' : 'pointer' }}
                    >
                        {processing ? 'Processing Payment...' : `Complete Payment - ${formatPrice(totalCost)}`}
                    </button>
                    
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#7c7c8a' }}>
                        🔒 Your payment is secured with 256-bit encryption
                    </p>
                </form>
            </div>
        </div>
    );
}
