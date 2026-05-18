import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import '../styles/landing.css';

const features = [
    {
        icon: '🏡',
        title: 'Unique Stays',
        desc: 'Discover handpicked properties from beachside villas to mountain cabins.',
    },
    {
        icon: '🔒',
        title: 'Secure Booking',
        desc: 'Your payments and data are always protected with enterprise-grade security.',
    },
    {
        icon: '⚡',
        title: 'Instant Confirmation',
        desc: 'Book in seconds and get your confirmation instantly — no waiting.',
    },
    {
        icon: '🌍',
        title: 'Global Reach',
        desc: 'Explore destinations across 120+ countries with local experiences.',
    },
    {
        icon: '💬',
        title: 'Real Reviews',
        desc: 'Authentic reviews from verified travellers you can trust.',
    },
    {
        icon: '🎯',
        title: 'Smart Filters',
        desc: 'Find exactly what you need with powerful search and filter tools.',
    },
];

const testimonials = [
    {
        name: 'Priya Sharma',
        location: 'Mumbai, India',
        text: 'HomiGo made our Goa trip absolutely magical. Found a beachfront villa that wasn\'t on any other platform!',
        avatar: 'PS',
        rating: 5,
    },
    {
        name: 'Rahul Verma',
        location: 'Delhi, India',
        text: 'The booking process was seamless and the host was incredibly welcoming. Will definitely use HomiGo again.',
        avatar: 'RV',
        rating: 5,
    },
    {
        name: 'Ananya Patel',
        location: 'Bangalore, India',
        text: 'Discovered a hidden Himalayan retreat through HomiGo. The experience was beyond words.',
        avatar: 'AP',
        rating: 5,
    },
];

const stats = [
    { value: '50K+', label: 'Active Listings' },
    { value: '120+', label: 'Countries' },
    { value: '2M+', label: 'Happy Travellers' },
    { value: '4.9★', label: 'Average Rating' },
];

export default function LandingPage() {
    const { user } = useAuth();
    const { adminSettings } = usePreferences();
    const navigate = useNavigate();
    const heroRef = useRef(null);

    const siteName = adminSettings?.siteName || 'HomiGo';
    const tagline = adminSettings?.tagline || 'Your home away from home.';

    useEffect(() => {
        // If already logged in, redirect to appropriate dashboard
        if (user) {
            navigate(user.isAdmin ? '/admin-dashboard' : '/dashboard');
        }
    }, [user, navigate]);

    // Parallax effect on hero
    useEffect(() => {
        const handleScroll = () => {
            if (heroRef.current) {
                const scrollY = window.scrollY;
                heroRef.current.style.backgroundPositionY = `${scrollY * 0.4}px`;
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* ─── NAVBAR ─── */}
            <nav className="landing-nav">
                <div className="landing-nav-inner">
                    <Link to="/" className="landing-logo">
                        <span className="logo-icon">✦</span> {siteName}
                    </Link>
                    <div className="landing-nav-links">
                        <a href="#features" className="nav-pill">Features</a>
                        <a href="#testimonials" className="nav-pill">Reviews</a>
                        <Link to="/login" className="nav-btn-outline">Log In</Link>
                        <Link to="/signup" className="nav-btn-solid">Sign Up</Link>
                    </div>
                </div>
            </nav>

            {/* ─── HERO ─── */}
            <section className="hero-section" ref={heroRef}>
                <div className="hero-overlay" />
                <div className="hero-content">
                    <div className="hero-badge">✨ Over 2 Million Happy Travellers</div>
                    <h1 className="hero-title">
                        Your Dream Stay,<br />
                        <span className="hero-gradient-text">One Click Away</span>
                    </h1>
                    <p className="hero-subtitle">
                        {tagline || 'Discover unique homes, villas, and experiences across the globe.'}
                    </p>
                    <div className="hero-cta-group">
                        <Link to="/signup" className="hero-cta-primary" id="hero-login-btn">
                            Get Started &rarr;
                        </Link>
                        <Link to="/listings" className="hero-cta-secondary">
                            Browse Listings
                        </Link>
                    </div>
                    <div className="hero-stats">
                        {stats.map((s) => (
                            <div key={s.label} className="hero-stat">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hero-scroll-hint">
                    <div className="scroll-mouse" />
                    <span>Scroll to explore</span>
                </div>
            </section>

            {/* ─── FEATURES ─── */}
            <section className="features-section" id="features">
                <div className="section-label">Why Choose HomiGo</div>
                <h2 className="section-title">Everything you need for a perfect trip</h2>
                <p className="section-subtitle">
                    We've built HomiGo around what travellers actually need — simplicity, safety, and spectacular stays.
                </p>
                <div className="features-grid">
                    {features.map((f) => (
                        <div key={f.title} className="feature-card">
                            <div className="feature-icon">{f.icon}</div>
                            <h3 className="feature-title">{f.title}</h3>
                            <p className="feature-desc">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="how-section">
                <div className="section-label">Simple Process</div>
                <h2 className="section-title">Book your stay in 3 easy steps</h2>
                <div className="steps-row">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <h3>Search & Discover</h3>
                        <p>Browse thousands of unique properties across 120+ countries with smart filters.</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-card">
                        <div className="step-number">02</div>
                        <h3>Book Instantly</h3>
                        <p>Secure your chosen stay with our lightning-fast, safe checkout process.</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="step-card">
                        <div className="step-number">03</div>
                        <h3>Experience & Enjoy</h3>
                        <p>Arrive, settle in, and make memories that last a lifetime.</p>
                    </div>
                </div>
            </section>

            {/* ─── TESTIMONIALS ─── */}
            <section className="testimonials-section" id="testimonials">
                <div className="section-label">Real Stories</div>
                <h2 className="section-title">Loved by travellers worldwide</h2>
                <div className="testimonials-grid">
                    {testimonials.map((t) => (
                        <div key={t.name} className="testimonial-card">
                            <div className="testimonial-stars">
                                {'★'.repeat(t.rating)}
                            </div>
                            <p className="testimonial-text">"{t.text}"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">{t.avatar}</div>
                                <div>
                                    <div className="author-name">{t.name}</div>
                                    <div className="author-location">{t.location}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─── CTA BANNER ─── */}
            <section className="cta-banner">
                <div className="cta-banner-content">
                    <h2>Ready to start your journey?</h2>
                    <p>Join millions of travellers already discovering the world with {siteName}.</p>
                    <div className="cta-banner-btns">
                        <Link to="/signup" className="hero-cta-primary" id="cta-signup-btn">
                            Create Free Account
                        </Link>
                        <Link to="/login" className="hero-cta-secondary" id="cta-login-btn">
                            Log In
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── FOOTER ─── */}
            <footer className="landing-footer">
                <div className="footer-inner">
                    <div className="footer-brand">
                        <span className="logo-icon">✦</span> {siteName}
                        <p>{tagline}</p>
                    </div>
                    <div className="footer-links-col">
                        <strong>Product</strong>
                        <Link to="/listings">Browse Listings</Link>
                        <Link to="/listings/new">List Your Property</Link>
                        <a href="#features">Features</a>
                    </div>
                    <div className="footer-links-col">
                        <strong>Account</strong>
                        <Link to="/login">Log In</Link>
                        <Link to="/signup">Sign Up</Link>
                        <Link to="/dashboard">Dashboard</Link>
                    </div>
                    <div className="footer-links-col">
                        <strong>Company</strong>
                        <a href="#">About Us</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms of Service</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    © {new Date().getFullYear()} {siteName}. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
